import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { HeroSection, SocialProofSection, FeaturesSection, LeadMagnetSection, CTASection, LiveTicker } from '@/components/landing';

// Lazy load DemoTerminal - heavy component with Framer Motion animations
const DemoTerminal = dynamic(
  () => import('@/components/landing/DemoTerminal').then((mod) => mod.DemoTerminal),
  {
    loading: () => (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <div className="h-8 w-48 mx-auto bg-neutral-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-72 mx-auto bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="h-[450px] rounded-xl bg-neutral-800 animate-pulse" />
      </div>
    ),
    ssr: true,
  }
);

export const metadata: Metadata = {
  title: 'RaceLab | 데이터 기반 경주 전략 백테스팅 플랫폼',
  description:
    '국내 유일 30초 단위 초고빈도 경마/경륜/경정 데이터 파이프라인. 과거 3년간의 데이터로 전략을 검증하세요. ROI, Sharpe Ratio, MDD 등 14가지 금융 지표 분석.',
  openGraph: {
    title: 'RaceLab | 데이터 기반 경주 전략 백테스팅',
    description: '당신의 감을 데이터로 검증하세요. 무료로 전략 백테스트 시작하기.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RaceLab | 경주 전략 백테스팅',
    description: '데이터 기반 경마/경륜/경정 전략 검증 플랫폼',
  },
};

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <HeroSection />

      <LiveTicker />

      <section id="demo" className="bg-neutral-background py-16 md:py-24">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 text-center">
                <div className="h-8 w-48 mx-auto bg-neutral-200 rounded animate-pulse" />
                <div className="mt-2 h-5 w-72 mx-auto bg-neutral-100 rounded animate-pulse" />
              </div>
              <div className="h-[450px] rounded-xl bg-neutral-800 animate-pulse" />
            </div>
          }
        >
          <DemoTerminal />
        </Suspense>
      </section>

      <SocialProofSection />

      <FeaturesSection />

      <LeadMagnetSection />

      <CTASection />
    </main>
  );
}
