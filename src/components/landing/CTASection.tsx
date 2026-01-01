import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function CTASection() {
  return (
    <section className="bg-neutral-text-primary py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
            <Zap className="h-4 w-4 text-horse" />
            <span className="text-label-medium text-white/80">무료로 시작하세요</span>
          </div>

          <h2 className="text-display-small font-bold text-white md:text-display-medium">
            데이터로 승부하세요
          </h2>

          <p className="mt-4 text-body-large text-white/70">
            API 키 없이도 데모 전략을 체험할 수 있습니다.
            <br className="hidden sm:block" />
            지금 바로 첫 번째 백테스트를 실행해보세요.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-horse-bold px-8 py-3 text-label-large font-semibold text-white shadow-lg transition-all hover:bg-green-900 hover:shadow-xl"
            >
              무료로 시작하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/30 px-8 py-3 text-label-large font-medium text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              요금제 보기
            </Link>
          </div>

          <p className="mt-6 text-label-medium text-white/50">
            신용카드 없이 시작 - 언제든 취소 가능
          </p>
        </div>
      </div>
    </section>
  );
}
