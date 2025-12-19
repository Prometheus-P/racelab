import type { Metadata } from 'next';
import { HeroSection, DemoTerminal, FeaturesSection, CTASection } from '@/components/landing';

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

      <section id="demo" className="bg-neutral-background py-16 md:py-24">
        <DemoTerminal />
      </section>

      <FeaturesSection />

      <CTASection />
    </main>
  );
}
