# 모니터링 가이드

> KRace 프로젝트의 모니터링 전략, 메트릭, 알림 설정을 정의합니다.

## 목차

1. [모니터링 개요](#모니터링-개요)
2. [핵심 메트릭](#핵심-메트릭)
3. [로깅 전략](#로깅-전략)
4. [알림 설정](#알림-설정)
5. [대시보드](#대시보드)
6. [성능 모니터링](#성능-모니터링)
7. [외부 API 모니터링](#외부-api-모니터링)

---

## 모니터링 개요

### 모니터링 스택

```
┌─────────────────────────────────────────────────────────────┐
│                      KRace Application                       │
├─────────────────────────────────────────────────────────────┤
│  Vercel Analytics  │  Vercel Logs  │  Custom Metrics        │
├─────────────────────────────────────────────────────────────┤
│                    Vercel Platform                           │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │  Sentry  │        │ Datadog  │        │  Slack   │
   │ (Errors) │        │(Metrics) │        │ (Alerts) │
   └──────────┘        └──────────┘        └──────────┘
```

### 모니터링 레벨

| 레벨 | 대상 | 도구 |
|------|------|------|
| Application | 에러, 성능, 사용자 경험 | Sentry, Vercel Analytics |
| Infrastructure | 서버 리소스, 네트워크 | Vercel Monitoring |
| Business | KPI, 사용자 행동 | Custom Metrics, Analytics |
| External | KSPO/KRA API 상태 | Custom Health Checks |

---

## 핵심 메트릭

### 1. 가용성 메트릭 (Availability)

```typescript
// 핵심 SLI (Service Level Indicators)
interface AvailabilityMetrics {
  // 업타임: 목표 99.9%
  uptime: number;

  // 성공률: 목표 99.5%
  successRate: number;

  // 에러율: 목표 < 0.5%
  errorRate: number;
}
```

**수집 방법:**

```typescript
// src/lib/monitoring/availability.ts

export async function trackAvailability(
  endpoint: string,
  success: boolean,
  duration: number
) {
  const metric = {
    name: 'api.availability',
    tags: {
      endpoint,
      status: success ? 'success' : 'failure',
    },
    value: success ? 1 : 0,
    timestamp: Date.now(),
  };

  await sendMetric(metric);
}

// API 라우트에서 사용
export async function GET(request: NextRequest) {
  const start = performance.now();
  let success = true;

  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    success = false;
    throw error;
  } finally {
    await trackAvailability('/api/races', success, performance.now() - start);
  }
}
```

### 2. 성능 메트릭 (Latency)

```typescript
interface LatencyMetrics {
  // 응답 시간 백분위수
  p50: number;  // 목표: < 200ms
  p95: number;  // 목표: < 500ms
  p99: number;  // 목표: < 1000ms

  // TTFB (Time To First Byte)
  ttfb: number; // 목표: < 100ms
}
```

**Core Web Vitals:**

| 메트릭 | 설명 | 목표 |
|--------|------|------|
| LCP (Largest Contentful Paint) | 최대 콘텐츠 렌더링 | < 2.5s |
| FID (First Input Delay) | 첫 입력 지연 | < 100ms |
| CLS (Cumulative Layout Shift) | 레이아웃 변화 | < 0.1 |
| INP (Interaction to Next Paint) | 상호작용 응답 | < 200ms |

```typescript
// src/lib/monitoring/web-vitals.ts

import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Beacon API 사용 (페이지 이탈 시에도 전송 보장)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
    });
  }
}
```

### 3. 트래픽 메트릭 (Traffic)

```typescript
interface TrafficMetrics {
  // 요청량
  requestsPerSecond: number;
  requestsPerMinute: number;

  // 동시 사용자
  concurrentUsers: number;

  // 페이지뷰
  pageViews: number;
  uniqueVisitors: number;
}
```

### 4. 에러 메트릭 (Errors)

```typescript
interface ErrorMetrics {
  // HTTP 에러
  http4xxRate: number;  // 클라이언트 에러율
  http5xxRate: number;  // 서버 에러율

  // 애플리케이션 에러
  unhandledExceptions: number;
  handledErrors: number;

  // 외부 서비스 에러
  externalApiErrors: number;
}
```

### 5. 포화도 메트릭 (Saturation)

```typescript
interface SaturationMetrics {
  // Vercel 함수 리소스
  functionMemoryUsage: number;   // 목표: < 80%
  functionCpuUsage: number;      // 목표: < 70%
  functionConcurrency: number;   // 목표: < 동시 실행 제한의 80%

  // 캐시
  cacheHitRate: number;          // 목표: > 80%
  cacheMissRate: number;
}
```

---

## 로깅 전략

### 로그 레벨

| 레벨 | 용도 | 예시 |
|------|------|------|
| `error` | 시스템 오류, 즉시 대응 필요 | API 실패, 예외 |
| `warn` | 잠재적 문제, 주의 필요 | 느린 응답, 재시도 |
| `info` | 중요 비즈니스 이벤트 | 사용자 행동, 배포 |
| `debug` | 개발/디버깅용 | 변수 값, 흐름 추적 |

### 구조화된 로깅

```typescript
// src/lib/logger/index.ts

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  service: string;
  traceId?: string;
  userId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private service = 'krace';

  private formatEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      traceId: this.getTraceId(),
      ...context,
    };
  }

  private getTraceId(): string | undefined {
    // Vercel Edge에서 제공하는 request ID 활용
    if (typeof globalThis !== 'undefined') {
      return (globalThis as any).__VERCEL_REQUEST_ID__;
    }
    return undefined;
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    const entry = this.formatEntry('error', message, {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });

    console.error(JSON.stringify(entry));

    // Sentry로 에러 전송
    this.sendToSentry(entry, error);
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = this.formatEntry('warn', message, context);
    console.warn(JSON.stringify(entry));
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = this.formatEntry('info', message, context);
    console.info(JSON.stringify(entry));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatEntry('debug', message, context);
      console.debug(JSON.stringify(entry));
    }
  }

  private sendToSentry(entry: LogEntry, error?: Error) {
    // Sentry 통합
    if (typeof window !== 'undefined' && (window as any).Sentry && error) {
      (window as any).Sentry.captureException(error, {
        extra: entry.context,
        tags: {
          service: entry.service,
          traceId: entry.traceId,
        },
      });
    }
  }
}

export const logger = new Logger();
```

### 로그 예시

```typescript
// API 요청 로깅
logger.info('API request received', {
  endpoint: '/api/races/today',
  method: 'GET',
  userAgent: request.headers.get('user-agent'),
});

// 외부 API 호출 로깅
logger.info('External API call', {
  service: 'KSPO',
  endpoint: '/races',
  duration: 245,
  status: 'success',
});

// 에러 로깅
logger.error('Failed to fetch races', error, {
  endpoint: '/api/races/today',
  retryCount: 3,
});

// 경고 로깅
logger.warn('Slow API response', {
  endpoint: '/api/races/today',
  duration: 2500,
  threshold: 1000,
});
```

---

## 알림 설정

### 알림 우선순위

| 우선순위 | 응답 시간 | 알림 채널 | 예시 |
|----------|-----------|-----------|------|
| P1 (Critical) | 15분 이내 | Slack + PagerDuty + 전화 | 서비스 다운, 데이터 손실 |
| P2 (High) | 1시간 이내 | Slack + PagerDuty | 기능 장애, 높은 에러율 |
| P3 (Medium) | 4시간 이내 | Slack | 성능 저하, 경고 임계치 |
| P4 (Low) | 24시간 이내 | Email | 정보성 알림, 트렌드 |

### 알림 규칙

```yaml
# 알림 규칙 예시 (Datadog 형식)

alerts:
  # P1: 서비스 다운
  - name: "Service Down"
    priority: P1
    condition: |
      avg(last_5m):avg:http.status_code{service:krace} >= 500
      AND count(last_5m):sum:http.requests{service:krace} > 10
    message: |
      🚨 [P1] KRace 서비스 장애 감지
      - 5xx 에러 발생
      - 즉시 확인 필요
    notify:
      - slack-critical
      - pagerduty

  # P1: 외부 API 전면 장애
  - name: "External API Total Failure"
    priority: P1
    condition: |
      avg(last_5m):avg:external.api.success_rate{service:kspo} < 10
    message: |
      🚨 [P1] KSPO API 전면 장애
      - 성공률: {{value}}%
      - 폴백 데이터 사용 중
    notify:
      - slack-critical
      - pagerduty

  # P2: 높은 에러율
  - name: "High Error Rate"
    priority: P2
    condition: |
      avg(last_10m):avg:http.error_rate{service:krace} > 5
    message: |
      ⚠️ [P2] 에러율 증가 감지
      - 현재 에러율: {{value}}%
      - 임계치: 5%
    notify:
      - slack-alerts

  # P2: 응답 시간 급증
  - name: "High Latency"
    priority: P2
    condition: |
      avg(last_10m):avg:http.response_time.p95{service:krace} > 2000
    message: |
      ⚠️ [P2] 응답 시간 증가
      - P95 응답 시간: {{value}}ms
      - 임계치: 2000ms
    notify:
      - slack-alerts

  # P3: 캐시 히트율 저하
  - name: "Low Cache Hit Rate"
    priority: P3
    condition: |
      avg(last_30m):avg:cache.hit_rate{service:krace} < 70
    message: |
      📊 [P3] 캐시 효율 저하
      - 현재 히트율: {{value}}%
      - 목표: 80%+
    notify:
      - slack-monitoring

  # P3: Core Web Vitals 저하
  - name: "Poor Core Web Vitals"
    priority: P3
    condition: |
      avg(last_1h):avg:web_vitals.lcp{service:krace} > 2500
    message: |
      📊 [P3] LCP 성능 저하
      - 현재 LCP: {{value}}ms
      - 목표: < 2500ms
    notify:
      - slack-monitoring
```

### Slack 알림 포맷

```typescript
// src/lib/monitoring/slack-alert.ts

interface SlackAlert {
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  metrics?: Record<string, string | number>;
  actions?: Array<{
    text: string;
    url: string;
  }>;
}

export async function sendSlackAlert(alert: SlackAlert) {
  const color = {
    P1: '#FF0000', // Red
    P2: '#FFA500', // Orange
    P3: '#FFFF00', // Yellow
    P4: '#00FF00', // Green
  }[alert.priority];

  const payload = {
    attachments: [
      {
        color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `[${alert.priority}] ${alert.title}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: alert.description,
            },
          },
          ...(alert.metrics
            ? [
                {
                  type: 'section',
                  fields: Object.entries(alert.metrics).map(([key, value]) => ({
                    type: 'mrkdwn',
                    text: `*${key}:*\n${value}`,
                  })),
                },
              ]
            : []),
          ...(alert.actions
            ? [
                {
                  type: 'actions',
                  elements: alert.actions.map((action) => ({
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: action.text,
                    },
                    url: action.url,
                  })),
                },
              ]
            : []),
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Triggered at ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      },
    ],
  };

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

---

## 대시보드

### 운영 대시보드 구성

```
┌─────────────────────────────────────────────────────────────────┐
│                    KRace Operations Dashboard                    │
├─────────────────────────────────────────────────────────────────┤
│  [상태 요약]                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Uptime   │ │ Error %  │ │ P95 Lat  │ │ Requests │           │
│  │  99.9%   │ │   0.3%   │ │  245ms   │ │  1.2K/m  │           │
│  │    🟢    │ │    🟢    │ │    🟢    │ │    🟢    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  [트래픽]                         [에러율]                       │
│  ┌─────────────────────────┐     ┌─────────────────────────┐   │
│  │     ▃▅▆▇█▇▆▅▃▂▁        │     │     ▁▁▂▁▁▁▂▃▂▁▁        │   │
│  │  Requests over time     │     │  Errors over time       │   │
│  └─────────────────────────┘     └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  [응답 시간 분포]                 [외부 API 상태]                 │
│  ┌─────────────────────────┐     ┌─────────────────────────┐   │
│  │  P50: 120ms            │     │  KSPO API    🟢 OK      │   │
│  │  P95: 245ms            │     │  KRA API     🟢 OK      │   │
│  │  P99: 890ms            │     │                         │   │
│  └─────────────────────────┘     └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  [Core Web Vitals]                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LCP: 1.8s 🟢  │  FID: 45ms 🟢  │  CLS: 0.05 🟢        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 핵심 위젯

1. **서비스 상태 표시기**
   - 업타임 퍼센트
   - 현재 에러율
   - 응답 시간 (P95)
   - 요청량 (RPM)

2. **시계열 차트**
   - 트래픽 추이 (24시간)
   - 에러율 추이
   - 응답 시간 분포

3. **외부 의존성 상태**
   - KSPO API 상태
   - KRA API 상태
   - CDN 상태

4. **Core Web Vitals**
   - LCP, FID, CLS 현황
   - 트렌드 비교

---

## 성능 모니터링

### API 성능 추적

```typescript
// src/lib/monitoring/performance.ts

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  cacheHit: boolean;
}

export function trackApiPerformance(metric: PerformanceMetric) {
  // Vercel Analytics로 전송
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', {
      name: 'api_performance',
      ...metric,
    });
  }

  // 서버 사이드 로깅
  if (typeof window === 'undefined') {
    console.log(
      JSON.stringify({
        type: 'performance',
        ...metric,
        timestamp: Date.now(),
      })
    );
  }
}

// 미들웨어에서 사용
export function withPerformanceTracking(handler: NextHandler) {
  return async (request: NextRequest) => {
    const start = performance.now();

    const response = await handler(request);

    trackApiPerformance({
      endpoint: request.nextUrl.pathname,
      method: request.method,
      duration: performance.now() - start,
      statusCode: response.status,
      cacheHit: response.headers.get('x-vercel-cache') === 'HIT',
    });

    return response;
  };
}
```

### 느린 쿼리 감지

```typescript
// src/lib/monitoring/slow-query.ts

const SLOW_THRESHOLD = 1000; // 1초

export function detectSlowOperation(
  operation: string,
  duration: number,
  context?: Record<string, unknown>
) {
  if (duration > SLOW_THRESHOLD) {
    logger.warn('Slow operation detected', {
      operation,
      duration,
      threshold: SLOW_THRESHOLD,
      ...context,
    });

    // 알림 전송 (임계치 초과 시)
    if (duration > SLOW_THRESHOLD * 3) {
      sendSlackAlert({
        priority: 'P3',
        title: 'Slow Operation Detected',
        description: `Operation \`${operation}\` took ${duration}ms`,
        metrics: {
          Duration: `${duration}ms`,
          Threshold: `${SLOW_THRESHOLD}ms`,
        },
      });
    }
  }
}
```

---

## 외부 API 모니터링

### 헬스 체크 엔드포인트

```typescript
// app/api/health/route.ts

import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    responseTime?: number;
    message?: string;
  }[];
}

export async function GET() {
  const checks = await Promise.all([
    checkKspoApi(),
    checkKraApi(),
    checkCache(),
  ]);

  const hasFailure = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warn');

  const health: HealthStatus = {
    status: hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
    checks,
  };

  const statusCode = hasFailure ? 503 : hasWarning ? 200 : 200;

  return NextResponse.json(health, { status: statusCode });
}

async function checkKspoApi() {
  const start = performance.now();
  try {
    const response = await fetch(`${process.env.KSPO_API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const responseTime = performance.now() - start;

    return {
      name: 'KSPO API',
      status: response.ok ? (responseTime > 2000 ? 'warn' : 'pass') : 'fail',
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    return {
      name: 'KSPO API',
      status: 'fail' as const,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkKraApi() {
  // Similar implementation for KRA API
  return { name: 'KRA API', status: 'pass' as const };
}

async function checkCache() {
  // Cache health check
  return { name: 'Cache', status: 'pass' as const };
}
```

### 외부 API 메트릭

```typescript
// src/lib/monitoring/external-api.ts

interface ExternalApiMetric {
  service: 'kspo' | 'kra';
  endpoint: string;
  duration: number;
  success: boolean;
  statusCode?: number;
  errorType?: string;
}

const metrics: ExternalApiMetric[] = [];
const WINDOW_SIZE = 100;

export function trackExternalApiCall(metric: ExternalApiMetric) {
  metrics.push(metric);

  // 윈도우 크기 유지
  if (metrics.length > WINDOW_SIZE) {
    metrics.shift();
  }

  // 로깅
  logger.info('External API call', {
    ...metric,
    successRate: calculateSuccessRate(metric.service),
    avgDuration: calculateAvgDuration(metric.service),
  });
}

export function calculateSuccessRate(service: string): number {
  const serviceMetrics = metrics.filter((m) => m.service === service);
  if (serviceMetrics.length === 0) return 100;

  const successCount = serviceMetrics.filter((m) => m.success).length;
  return Math.round((successCount / serviceMetrics.length) * 100);
}

export function calculateAvgDuration(service: string): number {
  const serviceMetrics = metrics.filter((m) => m.service === service);
  if (serviceMetrics.length === 0) return 0;

  const totalDuration = serviceMetrics.reduce((sum, m) => sum + m.duration, 0);
  return Math.round(totalDuration / serviceMetrics.length);
}
```

---

## 체크리스트

### 모니터링 설정 체크리스트

- [ ] Vercel Analytics 활성화
- [ ] Sentry 프로젝트 생성 및 연동
- [ ] Slack 웹훅 설정
- [ ] 알림 규칙 설정
- [ ] 대시보드 구성
- [ ] 헬스 체크 엔드포인트 배포
- [ ] Core Web Vitals 추적 설정

### 정기 점검 체크리스트

- [ ] 주간: 에러 트렌드 검토
- [ ] 주간: 성능 메트릭 검토
- [ ] 월간: SLO 달성률 검토
- [ ] 월간: 알림 규칙 최적화
- [ ] 분기: 모니터링 전략 검토

---

## 참고 자료

- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals](https://web.dev/vitals/)
- [The Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/)
