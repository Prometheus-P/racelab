import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, TrendingUp } from 'lucide-react';

// Lazy load MiniChart - heavy component with Recharts
const MiniChart = dynamic(
  () => import('./MiniChart').then((mod) => mod.MiniChart),
  {
    loading: () => (
      <div className="rounded-2xl border border-neutral-divider bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
            <div className="mt-2 h-8 w-20 bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
            <div className="mt-1 h-5 w-12 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-32 bg-neutral-100 rounded animate-pulse" />
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-neutral-divider pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-3 w-8 mx-auto bg-neutral-200 rounded animate-pulse" />
              <div className="mt-1 h-5 w-10 mx-auto bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false, // Recharts doesn't work well with SSR
  }
);

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-horse-container/20 to-neutral-background py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-horse/30 bg-horse-container px-4 py-2">
              <TrendingUp className="h-4 w-4 text-horse-bold" />
              <span className="text-label-medium font-medium text-horse-bold">
                Quant Engine v2.0 Live
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display-medium font-bold tracking-tight text-neutral-text-primary md:text-display-large lg:text-[40px] lg:leading-[48px]">
              운에 맡기지 마세요.
              <br />
              <span className="text-primary">백테스트</span>하세요.
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-body-large text-neutral-text-secondary">
              국내 유일 30초 단위 초고빈도(HFT) 경마 데이터 파이프라인.
              <br className="hidden sm:block" />
              당신의 &apos;감&apos;을 지난 3년간의 &apos;데이터&apos;로 검증하세요.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/dashboard"
                className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-cycle-bold px-8 py-3 text-label-large font-semibold text-white shadow-lg shadow-cycle-bold/20 transition-all hover:bg-red-900 hover:shadow-xl hover:shadow-cycle-bold/30"
              >
                무료로 전략 검증하기
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-neutral-border px-8 py-3 text-label-large font-medium text-neutral-text-primary transition-all hover:border-primary hover:text-primary"
              >
                이용 가이드
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label-medium text-neutral-text-secondary lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-horse">3년+</span>
                <span>과거 데이터</span>
              </div>
              <div className="h-4 w-px bg-neutral-divider" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-cycle">30초</span>
                <span>단위 시계열</span>
              </div>
              <div className="h-4 w-px bg-neutral-divider" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-boat">14+</span>
                <span>금융 지표</span>
              </div>
            </div>
          </div>

          {/* Right: Mini Chart */}
          <div className="hidden lg:block">
            <MiniChart strategyName="배당률 급등 전략" roi={18.7} />
          </div>
        </div>
      </div>
    </section>
  );
}
