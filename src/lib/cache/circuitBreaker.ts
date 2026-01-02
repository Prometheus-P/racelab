/**
 * Circuit Breaker Pattern Implementation
 *
 * Redis 등 외부 서비스 장애 시 graceful degradation을 위한 circuit breaker
 *
 * 상태:
 * - CLOSED: 정상 동작, 모든 요청이 서비스로 전달
 * - OPEN: 서비스 장애 감지, 요청을 바로 실패/우회 처리
 * - HALF_OPEN: 복구 시도 중, 일부 요청으로 서비스 상태 확인
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** 실패 임계값 - 이 횟수만큼 실패하면 OPEN 상태로 전환 (기본: 5) */
  failureThreshold: number;
  /** OPEN 상태 유지 시간 (ms) - 이 시간 후 HALF_OPEN으로 전환 (기본: 30초) */
  resetTimeout: number;
  /** HALF_OPEN 상태에서 성공해야 CLOSED로 전환되는 횟수 (기본: 2) */
  successThreshold: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastStateChange: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
};

/**
 * Circuit Breaker 인스턴스 저장소
 */
const circuits = new Map<string, CircuitBreakerState>();

/**
 * Circuit Breaker 상태 조회
 */
export function getCircuitState(name: string): CircuitBreakerState {
  const existing = circuits.get(name);
  if (existing) return existing;

  const initial: CircuitBreakerState = {
    state: 'CLOSED',
    failures: 0,
    successes: 0,
    lastFailureTime: 0,
    lastStateChange: Date.now(),
  };
  circuits.set(name, initial);
  return initial;
}

/**
 * Circuit이 요청을 허용하는지 확인
 *
 * @param name - circuit breaker 이름 (예: 'redis', 'kra-api')
 * @param config - circuit breaker 설정
 * @returns true면 요청 허용, false면 요청 차단 (서비스 우회 필요)
 */
export function isCircuitAllowed(name: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): boolean {
  const circuit = getCircuitState(name);
  const now = Date.now();

  switch (circuit.state) {
    case 'CLOSED':
      return true;

    case 'OPEN':
      // resetTimeout이 지났으면 HALF_OPEN으로 전환
      if (now - circuit.lastFailureTime >= config.resetTimeout) {
        circuit.state = 'HALF_OPEN';
        circuit.successes = 0;
        circuit.lastStateChange = now;
        return true; // 테스트 요청 허용
      }
      return false;

    case 'HALF_OPEN':
      return true; // 복구 테스트를 위해 허용

    default:
      return true;
  }
}

/**
 * 요청 성공 기록
 */
export function recordSuccess(name: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): void {
  const circuit = getCircuitState(name);
  const now = Date.now();

  if (circuit.state === 'HALF_OPEN') {
    circuit.successes++;
    if (circuit.successes >= config.successThreshold) {
      // 충분히 성공했으면 CLOSED로 전환
      circuit.state = 'CLOSED';
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.lastStateChange = now;
    }
  } else if (circuit.state === 'CLOSED') {
    // CLOSED 상태에서 성공하면 실패 카운터 감소
    if (circuit.failures > 0) {
      circuit.failures--;
    }
  }
}

/**
 * 요청 실패 기록
 */
export function recordFailure(name: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): void {
  const circuit = getCircuitState(name);
  const now = Date.now();

  circuit.failures++;
  circuit.lastFailureTime = now;

  if (circuit.state === 'HALF_OPEN') {
    // HALF_OPEN에서 실패하면 바로 OPEN으로
    circuit.state = 'OPEN';
    circuit.successes = 0;
    circuit.lastStateChange = now;
  } else if (circuit.state === 'CLOSED' && circuit.failures >= config.failureThreshold) {
    // 임계값 도달 시 OPEN으로 전환
    circuit.state = 'OPEN';
    circuit.lastStateChange = now;
  }
}

/**
 * Circuit 상태 초기화 (테스트용)
 */
export function resetCircuit(name: string): void {
  circuits.delete(name);
}

/**
 * 모든 circuit 상태 초기화 (테스트용)
 */
export function resetAllCircuits(): void {
  circuits.clear();
}

/**
 * Circuit 상태 정보 조회 (모니터링용)
 */
export function getCircuitInfo(name: string): {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  timeSinceLastFailure: number | null;
} {
  const circuit = getCircuitState(name);
  const now = Date.now();

  return {
    state: circuit.state,
    failures: circuit.failures,
    successes: circuit.successes,
    lastFailureTime: circuit.lastFailureTime || null,
    timeSinceLastFailure: circuit.lastFailureTime ? now - circuit.lastFailureTime : null,
  };
}
