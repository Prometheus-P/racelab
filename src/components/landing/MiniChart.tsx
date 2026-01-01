'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Sample P&L data - simulates strategy performance over 30 days
const generateChartData = () => {
  const data = [];
  let value = 100;

  for (let i = 0; i < 30; i++) {
    // Simulate slightly positive trend with volatility
    const change = (Math.random() - 0.4) * 3;
    value = Math.max(90, value + change);
    data.push({
      day: i + 1,
      value: Number(value.toFixed(2)),
    });
  }

  return data;
};

interface MiniChartProps {
  strategyName?: string;
  roi?: number;
}

export function MiniChart({ strategyName = '샘플 전략', roi = 18.7 }: MiniChartProps) {
  const chartData = useMemo(() => generateChartData(), []);
  const isPositive = roi >= 0;
  const lastValue = chartData[chartData.length - 1]?.value ?? 100;
  const firstValue = chartData[0]?.value ?? 100;
  const actualRoi = ((lastValue - firstValue) / firstValue) * 100;

  return (
    <div className="rounded-2xl border border-neutral-divider bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-label-medium text-neutral-text-secondary">{strategyName}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`font-mono text-display-small font-bold ${
                isPositive ? 'text-bullish' : 'text-bearish'
              }`}
            >
              {isPositive ? '+' : ''}
              {roi.toFixed(1)}%
            </span>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-bullish" />
            ) : (
              <TrendingDown className="h-5 w-5 text-bearish" />
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-label-small text-neutral-text-secondary">30일 수익률</p>
          <p
            className={`font-mono text-title-medium font-semibold ${
              actualRoi >= 0 ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {actualRoi >= 0 ? '+' : ''}
            {actualRoi.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00897B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00897B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#27272A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return [`${numValue.toFixed(2)}`, '자산'];
              }}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00897B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-neutral-divider pt-4">
        <div className="text-center">
          <p className="text-label-small text-neutral-text-secondary">승률</p>
          <p className="font-mono text-title-small font-semibold text-neutral-text-primary">
            67.3%
          </p>
        </div>
        <div className="text-center">
          <p className="text-label-small text-neutral-text-secondary">Sharpe</p>
          <p className="font-mono text-title-small font-semibold text-neutral-text-primary">
            1.85
          </p>
        </div>
        <div className="text-center">
          <p className="text-label-small text-neutral-text-secondary">MDD</p>
          <p className="font-mono text-title-small font-semibold text-bearish">-8.2%</p>
        </div>
      </div>
    </div>
  );
}
