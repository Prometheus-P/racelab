# RaceLab 디자인 시스템 가이드 (V 1.0)

## 1. 핵심 디자인 원칙 (Core Principles)

| 원칙 | 설명 | UX 목표 |
|------|------|---------|
| **CLARITY (명확성)** | 데이터의 위계를 굵은 폰트와 높은 대비로 명확히 구분하여, 정보 탐색 시간을 최소화합니다. | 쉬운 가독성 |
| **BALANCE (균형)** | 로고처럼 모든 레이아웃과 컴포넌트를 중앙 기준, 대칭적으로 배치하여 심리적 안정감을 제공합니다. | 견고한 신뢰감 |
| **COMFORT (편안함)** | 자극적인 원색 대신 채도를 낮춘 컬러와 부드러운 애니메이션을 사용해 눈의 피로도를 낮춥니다. | 장시간 이용 가능 |

## 2. 컬러 시스템 (Color System)

로고의 3가지 색상과 배경색을 기반으로, 데이터 플랫폼에 필요한 컬러 팔레트를 정의합니다. 흰색 배경에 최적화된 높은 대비를 사용합니다.

### A. Primary Colors (핵심/데이터 컬러)

이 세 가지 색상은 로고의 3개 레이어(지붕/누각/기단)와 3개 종목을 상징하며, 데이터 시각화에 활용됩니다. (채도를 낮춰 눈의 피로도를 줄였습니다.)

| 역할 | 색상 이름 | HEX Code | Tailwind Class | 사용 용도 |
|------|----------|----------|----------------|----------|
| 경마 / 안정 | Sage Green | `#81C784` | `horse` | 긍정적 지표, 그래프 상승, 경마 데이터 하이라이트 |
| 경륜 / 핵심 | Soft Coral | `#E57373` | `cycle` | 승부/적중 하이라이트, 주 액션 버튼 (CTA) |
| 경정 / 흐름 | Steel Blue | `#64B5F6` | `boat` | 차트 배경, 경정 데이터, 링크 및 아이콘 |

### B. Neutral Colors (배경 및 텍스트)

| 역할 | HEX Code | Tailwind Class | 설명 |
|------|----------|----------------|------|
| Background | `#FFFFFF` | `bg-white` | 가장 깨끗하고 명확한 정보 전달을 위한 배경 (필수) |
| Text Primary | `#27272A` | `text-on-surface` | 헤드라인 및 주요 텍스트 (가장 높은 대비) |
| Text Secondary | `#71717A` | `text-on-surface-variant` | 부제목, 보조 정보, 설명 텍스트 |
| Border/Divider | `#D4D4D8` | `border-neutral-border` | UI 컴포넌트 경계선, 낮은 대비로 시선 방해 최소화 |
| Table Row Alt | `#F4F4F5` | `bg-surface-dim` | Zebra Stripes 행 배경 |

## 3. 타이포그래피 (Typography)

로고의 두께감과 가독성을 통일합니다. **50-60대 사용자**를 위해 폰트 크기(Size)를 일반 웹사이트보다 **1~2단계 높게** 설정합니다.

| 구분 | 폰트 스타일 | 크기 예시 (Desktop) | Tailwind Class | 역할 및 특징 |
|------|-------------|---------------------|----------------|-------------|
| 로고/브랜드 | Exo 2 Bold 900 | 32pt (SVG 두께감 통일) | `font-brand` | 무게감, 속도감, 브랜드 아이덴티티 |
| 헤드라인 (H1/H2) | Noto Sans KR Bold | 24pt ~ 28pt | `text-headline-large` | 주요 섹션 제목, 직관적인 정보 전달 |
| 데이터 값 | Noto Sans KR ExtraBold | 18pt ~ 22pt | `text-data-large` | 배당률, 적중률 등 핵심 숫자 (가장 두꺼워야 함) |
| 본문/리스트 | Noto Sans KR Regular | 16pt ~ 18pt | `text-body-medium` | 일반 설명, 데이터 테이블 내용 (가장 높은 가독성) |

### Typography Classes

```css
/* Display - 대형 타이틀 */
.rl-display-large    /* 32px, Bold */
.rl-display-medium   /* 28px, Bold */
.rl-display-small    /* 24px, Bold */

/* Headline - H1/H2 */
.rl-headline-large   /* 28px, Bold */
.rl-headline-medium  /* 24px, Bold */
.rl-headline-small   /* 22px, SemiBold */

/* Title */
.rl-title-large      /* 20px, SemiBold */
.rl-title-medium     /* 18px, SemiBold */
.rl-title-small      /* 16px, SemiBold */

/* Body - 본문 */
.rl-body-large       /* 18px, Regular */
.rl-body-medium      /* 16px, Regular */
.rl-body-small       /* 14px, Regular */

/* Data - 배당률, 적중률 등 핵심 숫자 */
.rl-data-large       /* 22px, ExtraBold, tabular-nums */
.rl-data-medium      /* 20px, ExtraBold, tabular-nums */
.rl-data-small       /* 18px, ExtraBold, tabular-nums */

/* Label */
.rl-label-large      /* 16px, Medium */
.rl-label-medium     /* 14px, Medium */
.rl-label-small      /* 12px, Medium */
```

## 4. UI 컴포넌트 및 UX (Component & UX)

### A. 데이터 테이블 (Data Tables)

- **높은 대비**: 행(Row) 배경에 `#F4F4F5` (Light Gray)와 `#FFFFFF`를 교차하여 사용합니다. (Zebra Stripes)
- **클릭 영역**: 각 행(Row)의 높이를 충분히 확보하여 (최소 48px) 터치 및 마우스 클릭 실수를 방지합니다.
- **숫자 정렬**: 모든 숫자 데이터(배당, 기록, 확률)는 **우측 정렬**을 기본으로 하여 분석적 시각화를 돕습니다.

```tsx
// DataTable 사용 예시
import DataTable from '@/components/ui/DataTable';

<DataTable
  data={raceData}
  columns={[
    { key: 'rank', header: '순위', numeric: true },
    { key: 'name', header: '마명' },
    { key: 'odds', header: '배당률', numeric: true },
  ]}
/>
```

### B. 버튼 및 CTA (Call to Action)

- **Primary Button** (Soft Coral): 가장 중요한 "베팅/예측 시작" 버튼에 사용합니다. (둥근 모서리 필수)
- **Secondary Button** (Steel Blue): "기록 보기" 또는 "분석 필터" 등에 사용합니다.
- **크기**: 50-60대 사용자에게 명확하도록 최소 **48px 높이**를 유지합니다.

```tsx
// 버튼 사용 예시
<button className="btn btn-primary">예측 시작</button>
<button className="btn btn-secondary">기록 보기</button>
<button className="btn btn-outlined">취소</button>
```

### C. 인터랙션 및 애니메이션

- **로고 애니메이션**: 현재 구현된 'Pulse' (중앙 Red Core) 및 'Flow' (Blue Base) 애니메이션을 메인 페이지와 로딩 화면에 사용하여, 시스템이 항상 살아있고 작동 중이라는 인상을 줍니다.
- **차트 애니메이션**: 데이터가 로딩될 때 차트가 아래에서 위로 부드럽게 채워지는(Fade-in / Grow up) 애니메이션을 사용하여, 데이터의 '우상향(상승)' 메시지를 강조합니다.
- **에러 메시지**: 팝업이나 모달을 사용할 때도, 중앙에 배치하고 굵은 경고 폰트를 사용하여 명확하게 인지되도록 합니다 (미국식 `alert()` 사용 금지).

```css
/* 애니메이션 클래스 */
.animate-fade-in-up   /* 아래에서 위로 페이드인 */
.animate-grow-up      /* 아래에서 위로 채워지는 효과 */
.animate-pulse        /* 펄스 효과 */
```

## 5. Tailwind CSS 토큰 참조

### Colors

```typescript
// src/styles/tokens.ts 참조
colors: {
  horse: '#81C784',      // Sage Green - 경마
  cycle: '#E57373',      // Soft Coral - 경륜, CTA
  boat: '#64B5F6',       // Steel Blue - 경정, 링크

  // Neutral
  'on-surface': '#27272A',
  'on-surface-variant': '#71717A',
  'neutral-border': '#D4D4D8',
  'neutral-divider': '#E4E4E7',
  'surface-dim': '#F4F4F5',
}
```

### Spacing & Sizing

```typescript
// 터치 타겟
minHeight: {
  'touch': '48px',      // 최소 터치 영역
  'touch-lg': '56px',   // 큰 터치 영역
}

// Border Radius
borderRadius: {
  'rl-xs': '4px',
  'rl-sm': '8px',
  'rl-md': '12px',
  'rl-lg': '16px',
  'rl-xl': '24px',
}
```

### Shadows

```typescript
boxShadow: {
  'rl-1': '0 1px 3px 0 rgb(0 0 0 / 0.08)',
  'rl-2': '0 2px 6px 0 rgb(0 0 0 / 0.1)',
  'rl-3': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
  'rl-4': '0 8px 24px 0 rgb(0 0 0 / 0.14)',
  'rl-5': '0 16px 32px 0 rgb(0 0 0 / 0.16)',
}
```

### Transitions

```typescript
transitionDuration: {
  'rl-instant': '50ms',
  'rl-fast': '150ms',
  'rl-normal': '250ms',
  'rl-slow': '400ms',
}

transitionTimingFunction: {
  'rl-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'rl-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
  'rl-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
}
```

## 6. 접근성 (Accessibility)

- **최소 터치 영역**: 48px x 48px
- **Focus Ring**: `focus:ring-2 focus:ring-offset-2`
- **Reduced Motion**: `prefers-reduced-motion` 미디어 쿼리 지원
- **Skip Link**: 헤더에 "본문으로 건너뛰기" 링크 포함
- **ARIA Labels**: 모든 인터랙티브 요소에 적절한 aria-label 제공

## 7. 파일 구조

```
src/
├── styles/
│   ├── tokens.ts          # 디자인 토큰 정의
│   └── typography.css     # 타이포그래피 클래스
├── app/
│   └── globals.css        # 글로벌 스타일
├── components/
│   ├── ui/
│   │   ├── DataTable.tsx  # 데이터 테이블 컴포넌트
│   │   ├── M3Button.tsx   # 버튼 컴포넌트
│   │   └── ...
│   ├── Header.tsx         # 헤더
│   └── Footer.tsx         # 푸터
└── tailwind.config.ts     # Tailwind 설정
```
