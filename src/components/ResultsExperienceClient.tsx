'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PaginatedResults, HistoricalRace } from '@/types';
import type {
  NormalizedResultsQuery,
  ResultsApiResponse,
  ResultsMeta,
} from '@/lib/services/resultsService';
import { ResultsList } from './ResultsList';

interface ResultsExperienceClientProps {
  response: ResultsApiResponse<PaginatedResults<HistoricalRace>>;
  query: NormalizedResultsQuery;
}

function formatDateLabel(value: string): string {
  if (value.length === 8) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value;
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-label-medium text-primary">
      {label}
    </span>
  );
}

function ResultsMetaBar({ meta, query }: { meta: ResultsMeta; query: NormalizedResultsQuery }) {
  const sourceLabel =
    meta.source === 'snapshot'
      ? '최근 데이터(스냅샷)'
      : meta.source === 'mock'
        ? '모의 데이터'
        : meta.cacheHit
          ? '캐시 적중'
          : '라이브 데이터';

  const generated = new Date(meta.generatedAt);
  const generatedLabel = isNaN(generated.getTime())
    ? meta.generatedAt
    : generated.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-medium text-on-surface-variant">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={sourceLabel} />
        {meta.fallbackCode && (
          <span className="text-label-medium text-error" data-testid="results-fallback">
            수집 경고: {meta.fallbackCode}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-label-medium">
        <span>
          적용 기간 {formatDateLabel(query.dateFrom)} ~ {formatDateLabel(query.dateTo)}
        </span>
        <span aria-label="데이터 생성 시각">생성: {generatedLabel}</span>
      </div>
    </div>
  );
}

function ErrorPanel({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-error bg-error-container p-6 text-on-error-container" data-testid="results-error">
      <p className="text-title-medium font-semibold">결과를 불러오지 못했습니다</p>
      <p className="mt-2 text-body-medium">{message}</p>
      {detail && <p className="mt-1 text-body-small text-on-error-container/90">{detail}</p>}
    </div>
  );
}

function EmptyState({ query }: { query: NormalizedResultsQuery }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6 text-center" data-testid="results-empty">
      <p className="text-title-medium text-on-surface">데이터가 없습니다</p>
      <p className="mt-2 text-body-medium text-on-surface-variant">
        최근 7일({formatDateLabel(query.dateFrom)} ~ {formatDateLabel(query.dateTo)})에 집계된 결과가 없습니다.
        날짜 범위를 넓히거나 필터를 완화해 주세요.
      </p>
    </div>
  );
}

export function ResultsExperienceClient({ response, query }: ResultsExperienceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsedResponse = useMemo(() => response, [response]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('dateFrom', query.dateFrom);
    params.set('dateTo', query.dateTo);

    if (query.types?.length) {
      params.set('types', query.types.join(','));
    }

    if (query.track) {
      params.set('track', query.track);
    }

    if (query.jockey) {
      params.set('jockey', query.jockey);
    }

    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    const queryString = params.toString();
    router.push(queryString ? `/results?${queryString}` : '/results');
  };

  if (!parsedResponse.ok && !parsedResponse.data) {
    const code = parsedResponse.error?.code;
    const message =
      code === 'ENV_MISSING'
        ? '데이터베이스 설정이 누락되었습니다. 운영 환경 변수를 확인하세요.'
        : code === 'INVALID_QUERY'
          ? '잘못된 요청입니다. 날짜 또는 필터를 다시 확인해주세요.'
          : '일시적인 문제로 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';

    return <ErrorPanel message={message} detail={parsedResponse.error?.message} />;
  }

  if (!parsedResponse.data) {
    return <ErrorPanel message="데이터 응답이 비어 있습니다." />;
  }

  const { data, meta } = parsedResponse;

  return (
    <div className="space-y-4" data-testid="results-experience">
      <ResultsMetaBar meta={meta} query={query} />
      {data.items.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ResultsList results={data} onPageChange={handlePageChange} />
      )}
    </div>
  );
}
