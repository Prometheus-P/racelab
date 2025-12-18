/**
 * Streaming Response Utilities
 *
 * Utilities for creating streaming responses for large data sets.
 * Supports JSONL (newline-delimited JSON) and CSV formats.
 */

import type { OddsSnapshot } from '@/lib/db/schema';

/**
 * Flat odds record format for data analysts (Pandas-friendly)
 */
export interface FlatOddsRecord {
  timestamp: string;
  race_id: string;
  entry_no: number;
  odds_win: number;
  odds_place: number | null;
  pool_total: number | null;
  pool_win: number | null;
  pool_place: number | null;
  popularity_rank: number | null;
}

/**
 * Stream output format options
 */
export type StreamFormat = 'json' | 'jsonl' | 'csv';

/**
 * Stream options
 */
export interface StreamOptions {
  format: StreamFormat;
  includeHeaders?: boolean; // For CSV
}

/**
 * Content-Type headers for each format
 */
export const STREAM_CONTENT_TYPES: Record<StreamFormat, string> = {
  json: 'application/json',
  jsonl: 'application/x-ndjson',
  csv: 'text/csv',
};

/**
 * Convert OddsSnapshot to flat record format
 *
 * @param snapshot - Database odds snapshot
 * @returns Flat record for data analysts
 */
export function flattenOddsSnapshot(snapshot: OddsSnapshot): FlatOddsRecord {
  return {
    timestamp: snapshot.time instanceof Date ? snapshot.time.toISOString() : String(snapshot.time),
    race_id: snapshot.raceId,
    entry_no: snapshot.entryNo,
    odds_win: Number(snapshot.oddsWin),
    odds_place: snapshot.oddsPlace ? Number(snapshot.oddsPlace) : null,
    pool_total: snapshot.poolTotal ? Number(snapshot.poolTotal) : null,
    pool_win: snapshot.poolWin ? Number(snapshot.poolWin) : null,
    pool_place: snapshot.poolPlace ? Number(snapshot.poolPlace) : null,
    popularity_rank: snapshot.popularityRank,
  };
}

/**
 * CSV column headers for odds data
 */
const CSV_HEADERS = [
  'timestamp',
  'race_id',
  'entry_no',
  'odds_win',
  'odds_place',
  'pool_total',
  'pool_win',
  'pool_place',
  'popularity_rank',
];

/**
 * Convert flat record to CSV row
 *
 * @param record - Flat odds record
 * @returns CSV row string
 */
export function flatRecordToCsvRow(record: FlatOddsRecord): string {
  return [
    record.timestamp,
    record.race_id,
    record.entry_no,
    record.odds_win,
    record.odds_place ?? '',
    record.pool_total ?? '',
    record.pool_win ?? '',
    record.pool_place ?? '',
    record.popularity_rank ?? '',
  ].join(',');
}

/**
 * Get CSV header row
 *
 * @returns CSV header string
 */
export function getCsvHeader(): string {
  return CSV_HEADERS.join(',');
}

/**
 * Generator for CSV rows from odds snapshots
 *
 * @param snapshots - Array of odds snapshots
 * @param includeHeader - Whether to include header row
 * @yields CSV row strings
 */
export function* generateCsvRows(
  snapshots: OddsSnapshot[],
  includeHeader: boolean = true
): Generator<string> {
  if (includeHeader) {
    yield getCsvHeader() + '\n';
  }

  for (let i = 0; i < snapshots.length; i++) {
    const flat = flattenOddsSnapshot(snapshots[i]);
    yield flatRecordToCsvRow(flat) + '\n';
  }
}

/**
 * Generator for JSONL rows from odds snapshots
 *
 * @param snapshots - Array of odds snapshots
 * @yields JSONL row strings
 */
export function* generateJsonlRows(snapshots: OddsSnapshot[]): Generator<string> {
  for (let i = 0; i < snapshots.length; i++) {
    const flat = flattenOddsSnapshot(snapshots[i]);
    yield JSON.stringify(flat) + '\n';
  }
}

/**
 * Create a ReadableStream from an async generator
 *
 * @param generator - Async generator producing chunks
 * @returns ReadableStream
 */
export function createStreamFromGenerator<T>(
  generator: AsyncGenerator<T, void, unknown>
): ReadableStream<T> {
  return new ReadableStream<T>({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

/**
 * Create a text ReadableStream from an async string generator
 *
 * @param generator - Async generator producing strings
 * @returns ReadableStream<Uint8Array>
 */
export function createTextStream(
  generator: AsyncGenerator<string, void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(encoder.encode(value));
      }
    },
  });
}

/**
 * Create streaming response with appropriate headers
 *
 * @param stream - ReadableStream to send
 * @param format - Output format
 * @param filename - Optional filename for Content-Disposition
 * @returns Response object
 */
export function createStreamResponse(
  stream: ReadableStream<Uint8Array>,
  format: StreamFormat,
  filename?: string
): Response {
  const headers: HeadersInit = {
    'Content-Type': STREAM_CONTENT_TYPES[format],
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };

  if (filename) {
    headers['Content-Disposition'] = `attachment; filename="${filename}"`;
  }

  return new Response(stream, { headers });
}

/**
 * Async generator that yields odds snapshots in the specified format
 *
 * @param snapshotGenerator - Async generator of OddsSnapshot
 * @param format - Output format
 * @param includeHeader - Include CSV header (only for csv format)
 * @yields Formatted strings
 */
export async function* formatOddsStream(
  snapshotGenerator: AsyncGenerator<OddsSnapshot, void, unknown>,
  format: StreamFormat,
  includeHeader: boolean = true
): AsyncGenerator<string, void, unknown> {
  let isFirst = true;

  if (format === 'csv' && includeHeader) {
    yield getCsvHeader() + '\n';
  }

  if (format === 'json') {
    yield '[\n';
  }

  for await (const snapshot of snapshotGenerator) {
    const flat = flattenOddsSnapshot(snapshot);

    switch (format) {
      case 'json':
        if (!isFirst) {
          yield ',\n';
        }
        yield JSON.stringify(flat);
        isFirst = false;
        break;

      case 'jsonl':
        yield JSON.stringify(flat) + '\n';
        break;

      case 'csv':
        yield flatRecordToCsvRow(flat) + '\n';
        break;
    }
  }

  if (format === 'json') {
    yield '\n]';
  }
}

/**
 * Create a streaming response for odds data
 *
 * @param snapshotGenerator - Async generator of OddsSnapshot
 * @param options - Stream options
 * @param filename - Optional filename for download
 * @returns Response object
 */
export function createOddsStreamResponse(
  snapshotGenerator: AsyncGenerator<OddsSnapshot, void, unknown>,
  options: StreamOptions,
  filename?: string
): Response {
  const formattedStream = formatOddsStream(
    snapshotGenerator,
    options.format,
    options.includeHeaders ?? true
  );

  const stream = createTextStream(formattedStream);

  return createStreamResponse(stream, options.format, filename);
}

/**
 * Estimate file extension for format
 */
export function getFileExtension(format: StreamFormat): string {
  switch (format) {
    case 'csv':
      return 'csv';
    case 'jsonl':
      return 'jsonl';
    case 'json':
    default:
      return 'json';
  }
}

/**
 * Generate filename for odds export
 *
 * @param raceId - Race ID
 * @param format - Output format
 * @returns Filename string
 */
export function generateOddsFilename(raceId: string, format: StreamFormat): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const extension = getFileExtension(format);
  return `odds-${raceId}-${timestamp}.${extension}`;
}
