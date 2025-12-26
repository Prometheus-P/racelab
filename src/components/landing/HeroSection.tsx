import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-background py-16 md:py-24 lg:py-32">
      {/* Background gradient effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(129, 199, 132, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(100, 181, 246, 0.2), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-horse/30 bg-horse-container px-4 py-2">
          <TrendingUp className="h-4 w-4 text-horse-bold" />
          <span className="text-label-medium font-medium text-horse-bold">
            Quant Engine v2.0 Live
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-display-medium font-bold tracking-tight text-neutral-text-primary md:text-display-large lg:text-[40px] lg:leading-[48px]">
          운에 맡기지 마세요.
          <br />
          <span className="text-primary">백테스트</span>하세요.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-body-large text-neutral-text-secondary">
          국내 유일 30초 단위 초고빈도(HFT) 경마 데이터 파이프라인.
          <br className="hidden sm:block" />
          당신의 &apos;감&apos;을 지난 3년간의 &apos;데이터&apos;로 검증하세요.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-cycle-bold px-8 py-3 text-label-large font-semibold text-white shadow-lg shadow-cycle-bold/20 transition-all hover:bg-red-900 hover:shadow-xl hover:shadow-cycle-bold/30"
          >
            무료로 전략 검증하기
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/docs/api"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-neutral-border px-8 py-3 text-label-large font-medium text-neutral-text-primary transition-all hover:border-primary hover:text-primary"
          >
            API 문서 보기
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label-medium text-neutral-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-horse">3년+</span>
            <span>과거 데이터</span>
          </div>
          <div className="h-4 w-px bg-neutral-divider" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="text-cycle">30초</span>
            <span>단위 시계열</span>
          </div>
          <div className="h-4 w-px bg-neutral-divider" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="text-boat">14+</span>
            <span>금융 지표</span>
          </div>
        </div>
      </div>
    </section>
  );
}
