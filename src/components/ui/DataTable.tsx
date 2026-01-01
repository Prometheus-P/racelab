// src/components/ui/DataTable.tsx
// RaceLab Design System V1.0 - DataTable Component
// 고대비, Zebra Stripes, 우측 정렬 숫자, 최소 48px 행 높이

'use client';

import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  /** 숫자 컬럼 - 우측 정렬 + ExtraBold + tabular-nums */
  numeric?: boolean;
  /** 커스텀 렌더러 */
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  /** 컬럼 너비 (Tailwind 클래스) */
  width?: string;
  /** 헤더 정렬 */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  /** 테이블 데이터 */
  data: T[];
  /** 컬럼 정의 */
  columns: Column<T>[];
  /** 테이블 aria-label */
  ariaLabel?: string;
  /** 빈 데이터 메시지 */
  emptyMessage?: string;
  /** 행 클릭 핸들러 */
  onRowClick?: (row: T, index: number) => void;
  /** 로딩 상태 */
  loading?: boolean;
  /** 추가 className */
  className?: string;
  /** 행 키 생성 함수 */
  getRowKey?: (row: T, index: number) => string | number;
}

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  ariaLabel = '데이터 테이블',
  emptyMessage = '데이터가 없습니다.',
  onRowClick,
  loading = false,
  className = '',
  getRowKey = (_, index) => index,
}: DataTableProps<T>) {
  const getValue = (row: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce<unknown>((obj, k) => {
        if (obj && typeof obj === 'object' && k in obj) {
          return (obj as Record<string, unknown>)[k];
        }
        return undefined;
      }, row);
    }
    return row[key as keyof T];
  };

  const getAlignClass = (column: Column<T>): string => {
    if (column.numeric) return 'text-right';
    if (column.align === 'center') return 'text-center';
    if (column.align === 'right') return 'text-right';
    return 'text-left';
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-12 rounded-t-rl-md bg-surface-dim" />
          {/* Row skeletons */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-14 ${i % 2 === 0 ? 'bg-white' : 'bg-surface-dim'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-rl-lg border border-neutral-divider ${className}`}>
      <table className="w-full text-body-medium" role="table" aria-label={ariaLabel}>
        <thead className="bg-surface-dim">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`px-4 py-4 font-semibold text-on-surface ${getAlignClass(column)} ${column.width || ''} `}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-on-surface-variant"
                role="status"
                aria-live="polite"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={`min-h-touch ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-surface-dim'} ${onRowClick ? 'cursor-pointer transition-colors duration-rl-fast hover:bg-surface-container-high' : ''} `}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? `행 ${rowIndex + 1} 선택` : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row, rowIndex);
                  }
                }}
              >
                {columns.map((column) => {
                  const value = getValue(row, column.key);
                  return (
                    <td
                      key={String(column.key)}
                      className={`border-b border-neutral-divider px-4 py-4 ${getAlignClass(column)} ${column.numeric ? 'font-extrabold tabular-nums' : ''} ${column.width || ''} `}
                    >
                      {column.render
                        ? column.render(value as T[keyof T], row, rowIndex)
                        : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
