import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Zap, TrendingUp, Building2 } from 'lucide-react';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export const metadata: Metadata = {
  title: '요금제 - RaceLab',
  description:
    'RaceLab 요금제를 확인하세요. 무료 플랜부터 프로, 엔터프라이즈까지 다양한 옵션을 제공합니다.',
  alternates: {
    canonical: `${getSiteUrl()}/pricing`,
  },
};

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  ctaLink: string;
  highlight?: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '0',
    period: '원/월',
    description: '백테스팅을 처음 시작하는 분께',
    icon: <Zap className="h-6 w-6" />,
    features: [
      '월 10회 백테스트 실행',
      '최근 6개월 데이터',
      '기본 전략 템플릿 3개',
      '기본 메트릭 (ROI, 승률)',
      '커뮤니티 서포트',
    ],
    cta: '무료로 시작하기',
    ctaLink: '/dashboard',
  },
  {
    name: 'Pro',
    price: '29,000',
    period: '원/월',
    description: '본격적인 전략 검증이 필요한 분께',
    icon: <TrendingUp className="h-6 w-6" />,
    features: [
      '무제한 백테스트 실행',
      '3년 전체 히스토리 데이터',
      '30초 단위 고빈도 데이터',
      '전략 DSL 에디터',
      '14가지 금융 지표 분석',
      'Sharpe Ratio, MDD, Profit Factor',
      '전략 저장 및 버전 관리',
      '이메일 서포트',
    ],
    cta: '프로 시작하기',
    ctaLink: '/dashboard?plan=pro',
    highlight: true,
    badge: '인기',
  },
  {
    name: 'Enterprise',
    price: '문의',
    period: '',
    description: '기업 및 대규모 팀을 위한 맞춤형',
    icon: <Building2 className="h-6 w-6" />,
    features: [
      'Pro 플랜의 모든 기능',
      '실시간 API 액세스',
      '커스텀 데이터 파이프라인',
      '전용 인프라 (SLA 99.9%)',
      '화이트라벨 솔루션',
      '전담 어카운트 매니저',
      '온보딩 및 교육 지원',
    ],
    cta: '문의하기',
    ctaLink: 'mailto:contact@racelab.kr',
  },
];

function PricingCard({ tier }: { tier: PricingTier }) {
  const isHighlighted = tier.highlight;

  return (
    <div
      className={`relative rounded-2xl p-8 ${
        isHighlighted
          ? 'bg-neutral-text-primary text-white ring-4 ring-horse shadow-2xl scale-105'
          : 'bg-white border border-neutral-divider shadow-lg'
      }`}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-horse px-4 py-1 text-label-small font-semibold text-white">
          {tier.badge}
        </span>
      )}

      <div className={`inline-flex rounded-lg p-3 ${isHighlighted ? 'bg-white/10' : 'bg-horse-container'}`}>
        <span className={isHighlighted ? 'text-horse' : 'text-horse-bold'}>{tier.icon}</span>
      </div>

      <h3 className={`mt-4 text-title-large font-bold ${isHighlighted ? 'text-white' : 'text-neutral-text-primary'}`}>
        {tier.name}
      </h3>

      <p className={`mt-2 text-body-medium ${isHighlighted ? 'text-white/70' : 'text-zinc-600'}`}>
        {tier.description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className={`text-display-small font-bold ${isHighlighted ? 'text-white' : 'text-neutral-text-primary'}`}>
          {tier.price === '문의' ? '' : '₩'}
          {tier.price}
        </span>
        <span className={isHighlighted ? 'text-white/70' : 'text-zinc-500'}>{tier.period}</span>
      </div>

      <ul className="mt-8 space-y-4">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className={`h-5 w-5 flex-shrink-0 ${isHighlighted ? 'text-horse' : 'text-horse-bold'}`} />
            <span className={`text-body-medium ${isHighlighted ? 'text-white/90' : 'text-zinc-700'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={tier.ctaLink}
        className={`mt-8 block w-full rounded-full py-3 text-center text-label-large font-semibold transition-all ${
          isHighlighted
            ? 'bg-horse text-white hover:bg-horse-bold'
            : 'bg-neutral-text-primary text-white hover:bg-zinc-800'
        }`}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-background">
      {/* Header */}
      <section className="py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-horse/30 bg-horse-container px-4 py-2 text-label-medium font-medium text-horse-bold">
          <Zap className="h-4 w-4" />
          베타 기간 특별 혜택
        </span>

        <h1 className="mt-6 text-display-medium font-bold text-neutral-text-primary">
          당신에게 맞는 플랜을 선택하세요
        </h1>

        <p className="mt-4 text-body-large text-zinc-600">
          모든 플랜은 14일 무료 체험을 제공합니다. 언제든 취소 가능.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-neutral-divider bg-surface-dim py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-headline-large font-bold text-neutral-text-primary">자주 묻는 질문</h2>

          <div className="mt-10 space-y-6">
            <details className="group rounded-xl border border-neutral-divider bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4">
                <span className="font-medium text-neutral-text-primary">무료 플랜으로 무엇을 할 수 있나요?</span>
                <span className="text-zinc-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="px-6 pb-4 text-zinc-600">
                무료 플랜에서는 월 10회 백테스트를 실행할 수 있으며, 최근 6개월 데이터로 기본적인 전략 검증이
                가능합니다. 데이터 기반 베팅의 가치를 경험해보세요.
              </div>
            </details>

            <details className="group rounded-xl border border-neutral-divider bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4">
                <span className="font-medium text-neutral-text-primary">Pro 플랜의 30초 단위 데이터란?</span>
                <span className="text-zinc-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="px-6 pb-4 text-zinc-600">
                배당률은 경주 시작 전까지 실시간으로 변동됩니다. Pro 플랜에서는 30초 간격으로 기록된 배당률 변화
                데이터를 활용해 더 정밀한 전략을 수립할 수 있습니다.
              </div>
            </details>

            <details className="group rounded-xl border border-neutral-divider bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4">
                <span className="font-medium text-neutral-text-primary">결제는 어떻게 하나요?</span>
                <span className="text-zinc-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="px-6 pb-4 text-zinc-600">
                신용카드, 체크카드, 카카오페이, 네이버페이로 결제 가능합니다. 연간 결제 시 2개월 무료 혜택이
                적용됩니다.
              </div>
            </details>

            <details className="group rounded-xl border border-neutral-divider bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4">
                <span className="font-medium text-neutral-text-primary">환불 정책은 어떻게 되나요?</span>
                <span className="text-zinc-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="px-6 pb-4 text-zinc-600">
                구독 시작 후 7일 이내 요청 시 전액 환불됩니다. 이후에는 남은 기간에 대해 일할 계산하여 환불해 드립니다.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-text-primary py-16 text-center">
        <h2 className="text-display-small font-bold text-white">아직 고민되시나요?</h2>
        <p className="mt-4 text-body-large text-white/70">무료로 시작해서 직접 경험해보세요.</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-horse px-8 py-3 text-label-large font-semibold text-white transition-all hover:bg-horse-bold"
        >
          무료로 시작하기
        </Link>
      </section>
    </div>
  );
}
