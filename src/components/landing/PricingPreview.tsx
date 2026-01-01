import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: '무료',
    price: '0',
    period: '원/월',
    description: '백테스트를 처음 시작하는 분',
    features: [
      { text: '월 10회 백테스트', included: true },
      { text: '6개월 과거 데이터', included: true },
      { text: '기본 전략 템플릿', included: true },
      { text: '30초 단위 데이터', included: false },
      { text: '상세 분석 지표', included: false },
    ],
    cta: '무료로 시작',
    href: '/dashboard',
  },
  {
    name: 'Pro',
    price: '29,000',
    period: '원/월',
    description: '본격적인 전략 분석을 원하는 분',
    features: [
      { text: '무제한 백테스트', included: true },
      { text: '3년 과거 데이터', included: true },
      { text: '모든 전략 템플릿', included: true },
      { text: '30초 단위 데이터', included: true },
      { text: '14가지 분석 지표', included: true },
    ],
    cta: 'Pro 시작하기',
    href: '/dashboard?plan=pro',
    highlighted: true,
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        plan.highlighted
          ? 'border-horse bg-horse-container/30 shadow-lg'
          : 'border-neutral-divider bg-white'
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-horse px-3 py-1 text-label-small font-medium text-white">
            <Sparkles className="h-3 w-3" />
            인기
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-title-medium font-semibold text-neutral-text-primary">{plan.name}</h3>
        <p className="text-body-small text-neutral-text-secondary">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="font-mono text-display-small font-bold text-neutral-text-primary">
          {plan.price}
        </span>
        <span className="text-body-medium text-neutral-text-secondary">{plan.period}</span>
      </div>

      <ul className="mb-6 space-y-2">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check
              className={`h-4 w-4 ${
                feature.included ? 'text-horse' : 'text-neutral-border'
              }`}
            />
            <span
              className={`text-body-small ${
                feature.included ? 'text-neutral-text-primary' : 'text-neutral-text-secondary line-through'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={`block w-full rounded-xl py-3 text-center text-label-large font-semibold transition-all ${
          plan.highlighted
            ? 'bg-horse text-white hover:bg-horse-dark'
            : 'border border-neutral-border bg-white text-neutral-text-primary hover:bg-surface-dim'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export function PricingPreview() {
  return (
    <section className="bg-surface-dim py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-headline-medium font-bold text-neutral-text-primary">
            간단한 요금제
          </h2>
          <p className="mt-2 text-body-large text-neutral-text-secondary">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>

        {/* Plans Grid */}
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* More Info Link */}
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-2 text-body-medium font-medium text-primary hover:underline"
          >
            Enterprise 요금제 및 상세 정보 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
