// src/app/guide/page.tsx
import { Metadata } from 'next';
import FAQJsonLd from '@/components/seo/FAQJsonLd';

export const metadata: Metadata = {
  title: '경마/경륜/경정 가이드 - RaceLab',
  description:
    '경마, 경륜, 경정의 배당률, 단승식, 복승식 등 배팅 용어와 방법을 알아보세요. 초보자를 위한 완벽 가이드.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr'}/guide`,
  },
};

// FAQ data for structured data and display
const faqItems = [
  {
    question: '배당률이란 무엇인가요?',
    answer:
      '배당률은 마권을 구매했을 때 결과 매칭 시 받을 수 있는 배수를 의미합니다. 예를 들어 배당률이 3.5배이면, 1,000원 구매 시 결과 매칭되면 3,500원을 받게 됩니다. 배당률은 경주 시작 전까지 실시간으로 변동됩니다.',
  },
  {
    question: '단승식과 복승식의 차이는 무엇인가요?',
    answer:
      '단승식은 1등을 정확히 맞추는 방식이고, 복승식은 1등과 2등을 순서와 관계없이 맞추는 방식입니다. 복승식이 결과 매칭 확률이 높아 배당률이 낮고, 단승식은 어려워 배당률이 높습니다.',
  },
  {
    question: '경주 결과는 언제 업데이트되나요?',
    answer:
      '경주 결과는 공식 확정 후 5분 이내에 업데이트됩니다. 실시간 배당률은 30초마다 자동으로 갱신됩니다. 데이터는 한국마사회(KRA)와 국민체육진흥공단(KSPO)의 공식 API를 통해 제공됩니다.',
  },
  {
    question: '경마, 경륜, 경정의 차이점은 무엇인가요?',
    answer:
      '경마는 말이 달리는 경주, 경륜은 자전거 경주, 경정은 모터보트 경주입니다. 경마는 한국마사회(KRA)에서, 경륜과 경정은 국민체육진흥공단(KSPO)에서 운영합니다.',
  },
  {
    question: '출주표에서 어떤 정보를 확인할 수 있나요?',
    answer:
      '출주표에서는 출전하는 말/선수의 이름, 번호, 기수/선수 정보, 최근 성적, 배당률 등을 확인할 수 있습니다. 이 정보를 바탕으로 배팅 결정을 내릴 수 있습니다.',
  },
];

export default function GuidePage() {
  return (
    <>
      <FAQJsonLd items={faqItems} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          경마/경륜/경정 가이드
        </h1>
        <p className="text-gray-600 mb-8">
          초보자를 위한 배팅 기초 지식과 자주 묻는 질문
        </p>

        {/* FAQ Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            자주 묻는 질문
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="group border border-gray-200 rounded-lg"
              >
                <summary className="flex justify-between items-center cursor-pointer px-4 py-3 bg-gray-50 rounded-t-lg group-open:rounded-t-lg group-open:rounded-b-none">
                  <span className="font-medium text-gray-900">
                    {item.question}
                  </span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-4 py-3 text-gray-700 bg-white rounded-b-lg">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            바로가기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/?tab=horse"
              className="block p-4 border border-horse rounded-lg hover:bg-horse/5 transition-colors"
            >
              <h3 className="font-bold text-horse">경마</h3>
              <p className="text-sm text-gray-600">오늘의 경마 일정 보기</p>
            </a>
            <a
              href="/?tab=cycle"
              className="block p-4 border border-cycle rounded-lg hover:bg-cycle/5 transition-colors"
            >
              <h3 className="font-bold text-cycle">경륜</h3>
              <p className="text-sm text-gray-600">오늘의 경륜 일정 보기</p>
            </a>
            <a
              href="/?tab=boat"
              className="block p-4 border border-boat rounded-lg hover:bg-boat/5 transition-colors"
            >
              <h3 className="font-bold text-boat">경정</h3>
              <p className="text-sm text-gray-600">오늘의 경정 일정 보기</p>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
