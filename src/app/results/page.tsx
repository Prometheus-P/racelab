// src/app/results/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { ResultFiltersClient } from '@/components/ResultFiltersClient';
import { ResultsSkeleton } from '@/components/Skeletons';
import { HistoricalRace, PaginatedResults, RaceType, ResultsSearchParams } from '@/types';
import { breadcrumbSchema, collectionPageSchema, faqSchema } from './schemas';
import {
  GlossarySection,
  HowToSection,
  AnalysisGuideSection,
  ComparisonSection,
} from './components';
import {
  buildResultsResponse,
  getResultsDefaultRange,
  normalizeResultsQuery,
  type NormalizedResultsQuery,
  type ResultsApiResponse,
} from '@/lib/services/resultsService';
import { ResultsExperienceClient } from '@/components/ResultsExperienceClient';
import { getSiteUrl } from '@/lib/seo/siteUrl';

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: '경주 결과 - 경마 경륜 경정 과거 기록 조회',
  description:
    '경마, 경륜, 경정 과거 경주 결과를 검색하고 분석하세요. 날짜별, 경기장별, 기수별 필터링과 배당금, 순위, 기록 시간 정보를 제공합니다. 공공데이터포털 KRA·KSPO 공식 데이터.',
  keywords: [
    '경마 결과',
    '경륜 결과',
    '경정 결과',
    '경마 배당금',
    '경륜 배당금',
    '경정 배당금',
    '과거 경주 결과',
    '경주 기록 조회',
    '서울경마 결과',
    '부산경마 결과',
    '제주경마 결과',
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
  limit?: string;
}

interface ResultsPageProps {
  searchParams: Promise<SearchParams>;
}

async function getResultsState(searchParams: SearchParams): Promise<{
  response: ResultsApiResponse<PaginatedResults<HistoricalRace>>;
  query: NormalizedResultsQuery;
}> {
  const types = searchParams.types
    ?.split(',')
    .map((type) => type.trim())
    .filter((type): type is RaceType => ['horse', 'cycle', 'boat'].includes(type as RaceType));

  const normalizedParams: Partial<ResultsSearchParams> & { page?: number; limit?: number } = {
    ...searchParams,
    types: types?.length ? types : undefined,
    page: searchParams.page ? Number(searchParams.page) : undefined,
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
  };

  const normalized = normalizeResultsQuery(normalizedParams);

  if (!normalized.ok) {
    const defaults = getResultsDefaultRange();
    return {
      query: {
        ...defaults,
        page: 1,
        limit: 20,
      },
      response: {
        ok: false,
        error: normalized.error,
        meta: {
          cacheHit: false,
          generatedAt: new Date().toISOString(),
          source: 'snapshot',
          queryNormalized: {
            ...defaults,
            page: 1,
            limit: 20,
          },
        },
      },
    };
  }

  const response = await buildResultsResponse(normalized.query);
  return { response, query: normalized.query };
}

async function ResultsContent({ searchParams }: { searchParams: SearchParams }) {
  const { response, query } = await getResultsState(searchParams);
  return <ResultsExperienceClient response={response} query={query} />;
}

function FiltersSkeleton() {
  return (
    <div className="h-[240px] animate-pulse rounded-xl bg-surface-container" aria-hidden="true" />
  );
}

function PageHeader() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-label-large uppercase tracking-wide text-primary">
          racelab.kr 데이터 플랫폼
        </p>
        <h1 className="text-headline-large font-semibold text-on-surface">경주 결과</h1>
        <p className="max-w-3xl text-body-large text-on-surface-variant">
          경마 · 경륜 · 경정 팬들이 한눈에 결과를 확인하고 분석할 수 있도록 racelab.kr API를 그대로
          노출합니다. 필터를 조합해 입문자도 원하는 데이터 뷰를 쉽게 만들 수 있어요.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface p-4">
          <p className="text-label-medium text-on-surface-variant">데이터 출처</p>
          <p className="text-title-medium text-on-surface">공공데이터포털 KRA · KSPO</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface p-4">
          <p className="text-label-medium text-on-surface-variant">엔드포인트</p>
          <p className="font-mono text-title-medium text-on-surface">GET /api/results</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface p-4">
          <p className="text-label-medium text-on-surface-variant">갱신 주기</p>
          <p className="text-title-medium text-on-surface">60초 캐시 · CI 안정화용 Mock</p>
        </div>
      </div>
    </div>
  );
}

function JsonLdScripts() {
  return (
    <>
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
    </>
  );
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;

  return (
    <>
      <JsonLdScripts />

      <div className="space-y-6 py-6 lg:py-8">
        <PageHeader />

        <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-6">
            <Suspense fallback={<FiltersSkeleton />}>
              <ResultFiltersClient />
            </Suspense>
          </aside>

          <section className="min-h-[320px]">
            <Suspense fallback={<ResultsSkeleton />}>
              <ResultsContent searchParams={params} />
            </Suspense>
          </section>
        </div>

        <GlossarySection />
        <HowToSection />
        <AnalysisGuideSection />
        <ComparisonSection />
      </div>
    </>
  );
}
