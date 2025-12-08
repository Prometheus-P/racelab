// src/app/results/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { ResultFiltersClient } from '@/components/ResultFiltersClient';
import { ResultsSkeleton } from '@/components/Skeletons';
import { ResultsListClient } from '@/components/ResultsListClient';
import { HistoricalRace, PaginatedResults } from '@/types';
import { ApiResponse } from '@/lib/utils/apiResponse';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

export const metadata: Metadata = {
  title: '경주 결과 - 경마 경륜 경정 과거 기록 조회',
  description: '경마, 경륜, 경정 과거 경주 결과를 검색하고 분석하세요. 날짜별, 경기장별, 기수별 필터링과 배당금, 순위, 기록 시간 정보를 제공합니다. 공공데이터포털 KRA·KSPO 공식 데이터.',
  keywords: [
    '경마 결과', '경륜 결과', '경정 결과',
    '경마 배당금', '경륜 배당금', '경정 배당금',
    '과거 경주 결과', '경주 기록 조회',
    '서울경마 결과', '부산경마 결과', '제주경마 결과',
  ],
  openGraph: {
    title: '경주 결과 - RaceLab',
    description: '경마, 경륜, 경정 과거 경주 결과를 검색하고 분석하세요.',
    url: `${baseUrl}/results`,
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/results`,
  },
};

interface SearchParams {
  dateFrom?: string;
  dateTo?: string;
  types?: string;
  track?: string;
  jockey?: string;
  page?: string;
}

interface ResultsPageProps {
  searchParams: Promise<SearchParams>;
}

async function fetchResults(searchParams: SearchParams): Promise<PaginatedResults<HistoricalRace>> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';
  const params = new URLSearchParams();

  if (searchParams.dateFrom) params.set('dateFrom', searchParams.dateFrom);
  if (searchParams.dateTo) params.set('dateTo', searchParams.dateTo);
  if (searchParams.types) params.set('types', searchParams.types);
  if (searchParams.track) params.set('track', searchParams.track);
  if (searchParams.jockey) params.set('jockey', searchParams.jockey);
  if (searchParams.page) params.set('page', searchParams.page);

  const url = `${baseUrl}/api/results?${params.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 300 }, // 5 minutes
  });

  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }

  const data: ApiResponse<PaginatedResults<HistoricalRace>> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to fetch results');
  }

  return data.data;
}

async function ResultsContent({ searchParams }: { searchParams: SearchParams }) {
  const results = await fetchResults(searchParams);

  return (
    <ResultsListClient results={results} />
  );
}

function FiltersSkeleton() {
  return (
    <div
      className="h-[240px] rounded-xl bg-surface-container animate-pulse"
      aria-hidden="true"
    />
  );
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;

  // JSON-LD BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '경주 결과',
        item: `${baseUrl}/results`,
      },
    ],
  };

  // JSON-LD CollectionPage schema for search results
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '경주 결과 - 경마 경륜 경정 과거 기록 조회',
    description: '경마, 경륜, 경정 과거 경주 결과를 검색하고 분석하세요.',
    url: `${baseUrl}/results`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'RaceLab',
      url: baseUrl,
    },
    about: [
      { '@type': 'Thing', name: '경마' },
      { '@type': 'Thing', name: '경륜' },
      { '@type': 'Thing', name: '경정' },
    ],
    provider: {
      '@type': 'Organization',
      name: 'RaceLab',
      url: baseUrl,
    },
  };

  // JSON-LD FAQPage schema for common questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '경마 결과는 어디서 확인할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RaceLab에서 경마, 경륜, 경정의 모든 경주 결과를 무료로 확인할 수 있습니다. 날짜별, 경기장별로 필터링하여 원하는 경주 결과를 쉽게 찾을 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '과거 경주 배당금은 어떻게 조회하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '경주 결과 페이지에서 날짜 필터를 사용하여 과거 경주를 검색하면 각 경주의 배당금 정보를 확인할 수 있습니다. 단승, 복승, 쌍승 등 다양한 베팅 유형별 배당금이 제공됩니다.',
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="collection-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="py-6 lg:py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-4">
        <div>
          <p className="text-label-large text-primary uppercase tracking-wide">racelab.kr 데이터 플랫폼</p>
          <h1 className="text-headline-large font-semibold text-on-surface">
            경주 결과
          </h1>
          <p className="text-body-large text-on-surface-variant max-w-3xl">
            경마 · 경륜 · 경정 팬들이 한눈에 결과를 확인하고 분석할 수 있도록 racelab.kr API를 그대로 노출합니다.
            필터를 조합해 입문자도 원하는 데이터 뷰를 쉽게 만들 수 있어요.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-outline-variant bg-surface p-4">
            <p className="text-label-medium text-on-surface-variant">데이터 출처</p>
            <p className="text-title-medium text-on-surface">공공데이터포털 KRA · KSPO</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface p-4">
            <p className="text-label-medium text-on-surface-variant">엔드포인트</p>
            <p className="text-title-medium text-on-surface font-mono">GET /api/results</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface p-4">
            <p className="text-label-medium text-on-surface-variant">갱신 주기</p>
            <p className="text-title-medium text-on-surface">60초 캐시 · CI 안정화용 Mock</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <Suspense fallback={<FiltersSkeleton />}>
            <ResultFiltersClient />
          </Suspense>
        </aside>

        {/* Results */}
        <section className="min-h-[320px]">
          <Suspense fallback={<ResultsSkeleton />}>
            <ResultsContent searchParams={params} />
          </Suspense>
        </section>
      </div>
      </div>
    </>
  );
}
