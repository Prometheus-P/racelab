// src/app/results/components/AnalysisGuideSection.tsx
import React from 'react';

const analysisItems = [
  { item: '기록 시간', point: '동일 거리 대비 기록 비교' },
  { item: '착차', point: '1위와의 시간 차이 추세' },
  { item: '연속 성적', point: '최근 5경주 순위 패턴' },
  { item: '경기장별 성적', point: '트랙 적성 확인' },
];

const oddsTips = [
  { title: '인기마 분석:', description: '낮은 배당률 = 대중의 높은 기대' },
  { title: '이변 가능성:', description: '높은 배당률 마필의 최근 상승세 체크' },
  { title: '배당 변동:', description: '급격한 배당 변화는 내부 정보 가능성' },
  { title: '결과 매칭률 vs 회수율:', description: '장기적 수익을 위한 밸런스 고려' },
];

function AnalysisTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">경주 결과 분석 요소</caption>
        <thead>
          <tr className="border-b border-outline-variant">
            <th scope="col" className="px-3 py-2 text-left font-semibold text-on-surface">
              분석 항목
            </th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-on-surface">
              확인 포인트
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {analysisItems.map((row) => (
            <tr key={row.item}>
              <td className="px-3 py-2 font-medium text-on-surface">{row.item}</td>
              <td className="px-3 py-2 text-on-surface-variant">{row.point}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OddsTipsList() {
  return (
    <ul className="space-y-3">
      {oddsTips.map((tip) => (
        <li key={tip.title} className="flex items-start gap-2 text-sm">
          <span aria-hidden="true" className="mt-0.5 text-primary">
            ●
          </span>
          <div>
            <strong className="text-on-surface">{tip.title}</strong>
            <span className="text-on-surface-variant"> {tip.description}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalysisGuideSection() {
  return (
    <section
      aria-labelledby="analysis-guide-heading"
      className="mt-6 rounded-xl border border-outline-variant bg-surface p-6"
    >
      <h2
        id="analysis-guide-heading"
        className="mb-4 text-title-large font-semibold text-on-surface"
      >
        경주 결과 분석 가이드
      </h2>
      <p className="mb-6 text-body-medium text-on-surface-variant">
        과거 경주 결과를 활용하여 다음 경주를 분석하는 방법을 알아보세요.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-title-medium font-semibold text-on-surface">주요 분석 요소</h3>
          <AnalysisTable />
        </div>

        <div>
          <h3 className="mb-3 text-title-medium font-semibold text-on-surface">배당률 활용 팁</h3>
          <OddsTipsList />
        </div>
      </div>
    </section>
  );
}
