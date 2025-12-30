/**
 * Jockey Detail Page
 *
 * 기수 상세 프로필 (실제 KRA API 연동)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchJockeyById } from '@/lib/analytics/api';
import type { JockeyStats } from '@/lib/analytics/types';
import { FormIndicator, StatsCard } from '@/components/analytics';

export default function JockeyDetailPage() {
  const params = useParams();
  const jockeyId = params.id as string;

  const [jockey, setJockey] = useState<JockeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchJockeyById(jockeyId);
        setJockey(data);
      } catch (err) {
        console.error('[JockeyDetailPage] Error:', err);
        setError('기수 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jockeyId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-horse border-t-transparent" />
            <span className="ml-3 text-gray-600">데이터 로딩 중...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
          <Link href="/analytics/jockeys" className="mt-4 inline-block text-horse hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!jockey) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-6xl">&#128269;</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">기수를 찾을 수 없습니다</h1>
          <Link href="/analytics/jockeys" className="mt-4 inline-block text-horse hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const roiColor =
    jockey.roi > 0 ? 'green' : jockey.roi < 0 ? 'red' : ('default' as const);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* 브레드크럼 */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/analytics" className="hover:text-horse">
            분석
          </Link>
          <span>/</span>
          <Link href="/analytics/jockeys" className="hover:text-horse">
            기수 랭킹
          </Link>
          <span>/</span>
          <span>{jockey.name}</span>
        </div>

        {/* 프로필 헤더 */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{jockey.name}</h1>
              {jockey.nameEn && <p className="mt-1 text-gray-500">{jockey.nameEn}</p>}
              <p className="mt-2 text-gray-600">소속: {jockey.track}경마공원</p>
            </div>
            <FormIndicator score={jockey.formScore} showLabel />
          </div>
        </div>

        {/* 성적 요약 */}
        <div className="mb-6">
          <StatsCard
            title="성적 요약"
            columns={4}
            stats={[
              { label: '출전', value: jockey.totalStarts },
              { label: '1착', value: jockey.wins },
              { label: '승률', value: `${jockey.winRate.toFixed(1)}%`, color: 'green' },
              { label: 'ROI', value: `${jockey.roi > 0 ? '+' : ''}${jockey.roi.toFixed(1)}%`, color: roiColor },
            ]}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 거리별 성적 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">거리별 성적</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.keys(jockey.byDistance).length > 0 ? (
                Object.values(jockey.byDistance).map((stat) => (
                  <div key={stat.distance} className="flex items-center justify-between p-4">
                    <span className="font-medium text-gray-900">{stat.distance}</span>
                    <div className="text-right">
                      <span className="font-semibold text-horse">{stat.rate.toFixed(1)}%</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({stat.wins}/{stat.starts})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">데이터 없음</div>
              )}
            </div>
          </div>

          {/* 경주장별 성적 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">경주장별 성적</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.keys(jockey.byTrack).length > 0 ? (
                Object.values(jockey.byTrack).map((stat) => (
                  <div key={stat.track} className="flex items-center justify-between p-4">
                    <span className="font-medium text-gray-900">{stat.track}</span>
                    <div className="text-right">
                      <span className="font-semibold text-horse">{stat.rate.toFixed(1)}%</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({stat.wins}/{stat.starts})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">데이터 없음</div>
              )}
            </div>
          </div>
        </div>

        {/* 베스트 콤보 조교사 */}
        {jockey.topTrainers.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">베스트 콤보 조교사</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {jockey.topTrainers.map((trainer, index) => (
                <Link
                  key={trainer.id}
                  href={`/analytics/trainers/${trainer.id}`}
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
                    <div className="font-medium text-gray-900">{trainer.name}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-horse">{trainer.rate.toFixed(1)}%</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({trainer.wins}/{trainer.starts})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 최근 폼 */}
        {jockey.recentForm.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">최근 {jockey.recentForm.length}경주 순위</h3>
            <div className="flex flex-wrap gap-2">
              {jockey.recentForm.map((position, index) => (
                <span
                  key={index}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    position === 1
                      ? 'bg-yellow-100 text-yellow-700'
                      : position <= 3
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {position}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
