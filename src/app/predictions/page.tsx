/**
 * Predictions Page
 *
 * 오늘의 경주 예측 대시보드
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { getTodayYYYYMMDD, getFormattedKoreanDate } from '@/lib/utils/date';
import { PredictionsClient } from './PredictionsClient';

export const metadata: Metadata = {
  title: '오늘의 예측 | RaceLab',
  description: '경마 경주 승률 예측 및 분석을 확인하세요. AI 기반 예측 모델이 제공하는 승률, 신뢰도, 추천을 한눈에 볼 수 있습니다.',
};

export default function PredictionsPage() {
  const today = getTodayYYYYMMDD();
  const todayFormatted = getFormattedKoreanDate();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                오늘의 예측
              </h1>
              <p className="mt-1 text-gray-500">{todayFormatted}</p>
            </div>
            <Link
              href="/analytics"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <span>분석 대시보드</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 안내 배너 */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-horse to-green-600 p-6 text-white shadow-lg">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
            <span>AI 예측 시스템</span>
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-white/90">
            13개 요소를 분석하여 승률을 예측합니다. 레이팅, 최근 폼, 기수/조교사 성적,
            주로상태, 혈통 적성 등을 종합 분석합니다.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/20 px-2 py-1">레이팅 15%</span>
            <span className="rounded-full bg-white/20 px-2 py-1">주로상태 12%</span>
            <span className="rounded-full bg-white/20 px-2 py-1">거리 적합도 10%</span>
            <span className="rounded-full bg-white/20 px-2 py-1">기수 8%</span>
            <span className="rounded-full bg-white/20 px-2 py-1">콤보 7%</span>
          </div>
        </div>

        {/* 경주 목록 (클라이언트 컴포넌트) */}
        <PredictionsClient date={today} />

        {/* 면책 */}
        <div className="mt-8 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          <h4 className="font-medium">안내</h4>
          <p className="mt-1">
            본 예측은 통계적 모델에 기반한 참고 자료입니다. 실제 경주 결과는 다양한 변수에 의해
            달라질 수 있으며, 베팅에 대한 책임은 본인에게 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
