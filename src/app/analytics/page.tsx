/**
 * Analytics Main Page
 *
 * 분석 대시보드 메인
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { getJockeyRanking, getTrainerRanking } from '@/lib/analytics';

export default function AnalyticsPage() {
  const topJockeys = getJockeyRanking({ limit: 5 });
  const topTrainers = getTrainerRanking({ limit: 5 });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 분석 대시보드</h1>
          <p className="mt-2 text-gray-600">기수와 조교사의 성적을 분석하고 비교합니다.</p>
        </div>

        {/* 퀵 링크 */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/analytics/jockeys"
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-4xl">🏇</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">기수 랭킹</h2>
              <p className="text-sm text-gray-500">기수별 승률, ROI, 폼 분석</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </Link>

          <Link
            href="/analytics/trainers"
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-4xl">👨‍🏫</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">조교사 랭킹</h2>
              <p className="text-sm text-gray-500">조교사별 성적, 관리마 분석</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </Link>
        </div>

        {/* 탑 기수/조교사 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 탑 기수 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">🔥 TOP 5 기수</h3>
              <Link href="/analytics/jockeys" className="text-sm text-horse hover:underline">
                전체 보기
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {topJockeys.items.map((jockey, index) => (
                <Link
                  key={jockey.id}
                  href={`/analytics/jockeys/${jockey.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50"
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
                    <div className="text-xs text-gray-500">{jockey.track}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-horse">{jockey.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{jockey.wins}승</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 탑 조교사 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">🔥 TOP 5 조교사</h3>
              <Link href="/analytics/trainers" className="text-sm text-horse hover:underline">
                전체 보기
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {topTrainers.items.map((trainer, index) => (
                <Link
                  key={trainer.id}
                  href={`/analytics/trainers/${trainer.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{trainer.name}</div>
                    <div className="text-xs text-gray-500">
                      {trainer.track} · {trainer.activeHorses}두 관리
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-horse">{trainer.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{trainer.wins}승</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h4 className="font-medium text-blue-800">💡 분석 데이터 안내</h4>
          <p className="mt-1 text-sm text-blue-700">
            현재는 샘플 데이터로 제공됩니다. 실제 서비스에서는 KRA API와 연동된 실시간 데이터가 제공됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
