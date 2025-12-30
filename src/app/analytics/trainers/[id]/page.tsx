/**
 * Trainer Detail Page
 *
 * 조교사 상세 프로필
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTrainerById } from '@/lib/analytics';
import { FormIndicator, StatsCard } from '@/components/analytics';

export default function TrainerDetailPage() {
  const params = useParams();
  const trainerId = params.id as string;
  const trainer = getTrainerById(trainerId);

  if (!trainer) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-6xl">🔍</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">조교사를 찾을 수 없습니다</h1>
          <Link href="/analytics/trainers" className="mt-4 inline-block text-horse hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const roiColor =
    trainer.roi > 0 ? 'green' : trainer.roi < 0 ? 'red' : ('default' as const);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* 브레드크럼 */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/analytics" className="hover:text-horse">
            분석
          </Link>
          <span>/</span>
          <Link href="/analytics/trainers" className="hover:text-horse">
            조교사 랭킹
          </Link>
          <span>/</span>
          <span>{trainer.name}</span>
        </div>

        {/* 프로필 헤더 */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trainer.name}</h1>
              <p className="mt-2 text-gray-600">소속: {trainer.track}경마공원</p>
              <p className="mt-1 text-gray-500">관리마: {trainer.activeHorses}두</p>
            </div>
            <FormIndicator score={trainer.formScore} showLabel />
          </div>
        </div>

        {/* 성적 요약 */}
        <div className="mb-6">
          <StatsCard
            title="📊 2024년 성적"
            columns={4}
            stats={[
              { label: '출전', value: trainer.totalStarts },
              { label: '1착', value: trainer.wins },
              { label: '승률', value: `${trainer.winRate.toFixed(1)}%`, color: 'green' },
              { label: 'ROI', value: `${trainer.roi > 0 ? '+' : ''}${trainer.roi.toFixed(1)}%`, color: roiColor },
            ]}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 거리별 성적 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">📏 거리별 성적</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.values(trainer.byDistance).map((stat) => (
                <div key={stat.distance} className="flex items-center justify-between p-4">
                  <span className="font-medium text-gray-900">{stat.distance}</span>
                  <div className="text-right">
                    <span className="font-semibold text-horse">{stat.rate.toFixed(1)}%</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({stat.wins}/{stat.starts})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 등급별 성적 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">🏆 등급별 성적</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.values(trainer.byClass).map((stat) => (
                <div key={stat.class} className="flex items-center justify-between p-4">
                  <span className="font-medium text-gray-900">{stat.class}</span>
                  <div className="text-right">
                    <span className="font-semibold text-horse">{stat.rate.toFixed(1)}%</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({stat.wins}/{stat.starts})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 베스트 콤보 기수 */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900">🤝 베스트 콤보 기수</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {trainer.topJockeys.map((jockey, index) => (
              <Link
                key={jockey.id}
                href={`/analytics/jockeys/${jockey.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{jockey.name}</div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-horse">{jockey.rate.toFixed(1)}%</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({jockey.wins}/{jockey.starts})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
