'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EquityPoint } from '@/lib/dashboard/mockResults';
import { TrendingUp } from 'lucide-react';

interface EquityCurveChartProps {
  data: EquityPoint[] | null;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const capital = payload.find((p) => p.dataKey === 'capital')?.value ?? 0;
  const drawdown = payload.find((p) => p.dataKey === 'drawdown')?.value ?? 0;

  return (
    <div className="rounded-lg border border-neutral-divider bg-white p-3 shadow-lg">
      <p className="text-label-small text-neutral-text-secondary">{label}</p>
      <p className="font-mono text-body-medium font-semibold text-neutral-text-primary">
        {(capital / 10000).toFixed(1)}만원
      </p>
      {drawdown > 0 && (
        <p className="text-label-small text-bearish">손실: -{drawdown.toFixed(1)}%</p>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-neutral-divider bg-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-horse border-t-transparent" />
        <p className="mt-2 text-body-small text-neutral-text-secondary">차트 로딩 중...</p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-neutral-divider bg-surface-dim">
      <div className="text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-neutral-text-secondary opacity-50" />
        <p className="mt-3 text-body-medium text-neutral-text-secondary">
          백테스트 결과가 여기에 표시됩니다
        </p>
      </div>
    </div>
  );
}

export function EquityCurveChart({ data, isLoading }: EquityCurveChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!data || data.length === 0) return <EmptyChart />;

  // X축 레이블 간격 조정
  const tickInterval = Math.ceil(data.length / 6);

  return (
    <div className="rounded-xl border border-neutral-divider bg-white p-4">
      <h3 className="mb-4 text-title-small font-semibold text-neutral-text-primary">수익 곡선</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2d5a27" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value: string) => value.slice(5)} // MM-DD 형식
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value: number) => `${(value / 10000).toFixed(0)}만`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="capital"
              stroke="#2d5a27"
              strokeWidth={2}
              fill="url(#capitalGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
