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

  // JSON-LD FAQPage schema for common questions (확장된 FAQ - 10개 이상)
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
      {
        '@type': 'Question',
        name: '경마와 경륜의 차이점은 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '경마는 말과 기수가 함께 달리는 경주로 한국마사회(KRA)에서 주관하며, 경륜은 사이클 선수가 트랙에서 경쟁하는 경주로 국민체육진흥공단(KSPO)에서 주관합니다. 경마는 서울, 부산, 제주에서, 경륜은 광명에서 개최됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '경정이란 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '경정은 모터보트를 이용한 수상 경주 스포츠입니다. 국민체육진흥공단(KSPO)에서 주관하며 미사리경정공원에서 개최됩니다. 선수들은 600m 코스를 3바퀴 돌아 순위를 결정합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '단승식과 복승식의 차이는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '단승식은 1위를 정확히 맞추는 방식이고, 복승식은 1~2위를 순서 상관없이 맞추는 방식입니다. 단승식이 더 쉽지만 배당률이 낮고, 복승식은 난이도가 높아 배당률이 더 높습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '배당률은 언제 확정되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '배당률은 경주 시작 직전까지 변동되며, 경주가 종료되면 최종 배당률이 확정됩니다. RaceLab에서는 실시간 배당률과 확정 배당률 모두 확인할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '경주 결과는 얼마나 빨리 업데이트되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RaceLab의 경주 결과는 경주 종료 후 즉시 업데이트됩니다. 공공데이터포털 API를 통해 실시간으로 데이터를 가져오며, 60초 간격으로 캐시를 갱신합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '특정 기수의 성적만 조회할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네, 가능합니다. 경주 결과 페이지에서 기수 이름으로 필터링하여 특정 기수의 모든 경주 기록을 조회할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'RaceLab 데이터의 출처는 어디인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RaceLab의 모든 데이터는 공공데이터포털(data.go.kr)을 통해 제공되는 한국마사회(KRA)와 국민체육진흥공단(KSPO)의 공식 데이터를 사용합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '모바일에서도 경주 결과를 확인할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네, RaceLab은 반응형 웹사이트로 제작되어 스마트폰, 태블릿 등 모든 기기에서 최적화된 화면으로 경주 결과를 확인할 수 있습니다.',
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

      {/* GEO 최적화: 용어 사전 섹션 */}
      <section aria-labelledby="glossary-heading" className="mt-8 rounded-xl border border-outline-variant bg-surface p-6">
        <h2 id="glossary-heading" className="text-title-large font-semibold text-on-surface mb-4">
          경주 용어 사전
        </h2>
        <p className="text-body-medium text-on-surface-variant mb-6">
          경마, 경륜, 경정에서 자주 사용되는 용어를 알아보세요.
        </p>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">단승식 (Win)</dt>
            <dd className="text-sm text-on-surface-variant mt-1">1위를 정확히 맞추는 베팅 방식</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">복승식 (Place)</dt>
            <dd className="text-sm text-on-surface-variant mt-1">1~2위를 순서 상관없이 맞추는 방식</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">쌍승식 (Quinella)</dt>
            <dd className="text-sm text-on-surface-variant mt-1">1~2위를 순서대로 맞추는 방식</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">배당률 (Odds)</dt>
            <dd className="text-sm text-on-surface-variant mt-1">베팅 금액 대비 수익 비율</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">기수 (Jockey)</dt>
            <dd className="text-sm text-on-surface-variant mt-1">경마에서 말을 조종하는 선수</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">출마표</dt>
            <dd className="text-sm text-on-surface-variant mt-1">경주에 출전하는 마필/선수 목록</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">마체중</dt>
            <dd className="text-sm text-on-surface-variant mt-1">경주마의 현재 체중 (kg)</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">부담중량</dt>
            <dd className="text-sm text-on-surface-variant mt-1">기수와 안장 등의 총 무게</dd>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <dt className="font-semibold text-on-surface">착차 (Time Diff)</dt>
            <dd className="text-sm text-on-surface-variant mt-1">1위와의 시간 차이</dd>
          </div>
        </dl>
      </section>

      {/* GEO 최적화: How-to 가이드 */}
      <section aria-labelledby="howto-heading" className="mt-6 rounded-xl border border-outline-variant bg-surface p-6">
        <h2 id="howto-heading" className="text-title-large font-semibold text-on-surface mb-4">
          경주 결과 조회 방법
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary font-semibold">1</span>
            <div>
              <h3 className="font-semibold text-on-surface">날짜 선택</h3>
              <p className="text-sm text-on-surface-variant">조회하고 싶은 경주 날짜를 선택합니다. 기본값은 오늘입니다.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary font-semibold">2</span>
            <div>
              <h3 className="font-semibold text-on-surface">경주 유형 필터</h3>
              <p className="text-sm text-on-surface-variant">경마, 경륜, 경정 중 원하는 경주 유형을 선택합니다.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary font-semibold">3</span>
            <div>
              <h3 className="font-semibold text-on-surface">경기장 선택 (선택사항)</h3>
              <p className="text-sm text-on-surface-variant">서울, 부산경남, 제주, 광명, 미사리 중 특정 경기장을 선택할 수 있습니다.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary font-semibold">4</span>
            <div>
              <h3 className="font-semibold text-on-surface">결과 확인</h3>
              <p className="text-sm text-on-surface-variant">순위, 기록 시간, 배당금 등 상세 결과를 확인합니다.</p>
            </div>
          </li>
        </ol>
      </section>
      </div>
    </>
  );
}
