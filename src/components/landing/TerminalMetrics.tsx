'use client';

import { motion } from 'framer-motion';
import type { DemoMetrics } from '@/lib/landing/demoData';

interface TerminalMetricsProps {
  metrics: DemoMetrics;
  isVisible: boolean;
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  variant: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ label, value, subValue, variant }: MetricCardProps) {
  const valueColors = {
    positive: 'text-horse',
    negative: 'text-cycle',
    neutral: 'text-white',
  };

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
      <div className="text-label-small text-neutral-400">{label}</div>
      <div className={`mt-1 text-data-large font-bold ${valueColors[variant]}`}>{value}</div>
      {subValue && <div className="mt-0.5 text-label-small text-neutral-400">{subValue}</div>}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function TerminalMetrics({ metrics, isVisible }: TerminalMetricsProps) {
  if (!isVisible) return null;

  const formattedMetrics = [
    {
      label: '총 수익률',
      value: `+${metrics.roi.toFixed(1)}%`,
      variant: 'positive' as const,
    },
    {
      label: '승률',
      value: `${metrics.winRate.toFixed(1)}%`,
      subValue: `${metrics.totalBets}회 베팅`,
      variant: 'neutral' as const,
    },
    {
      label: '안정성 지수',
      value: metrics.sharpeRatio.toFixed(2),
      variant: metrics.sharpeRatio >= 1 ? ('positive' as const) : ('neutral' as const),
    },
    {
      label: '최대 손실',
      value: `-${metrics.maxDrawdown.toFixed(1)}%`,
      variant: 'negative' as const,
    },
    {
      label: '수익 배수',
      value: `${metrics.profitFactor.toFixed(2)}x`,
      variant: metrics.profitFactor >= 1.5 ? ('positive' as const) : ('neutral' as const),
    },
    {
      label: '최종 자산',
      value: `${(metrics.finalCapital / 10000).toFixed(0)}만원`,
      subValue: `+${((metrics.finalCapital - 1000000) / 10000).toFixed(0)}만원`,
      variant: 'positive' as const,
    },
  ];

  return (
    <motion.div
      className="mt-6 rounded-lg border border-horse/30 bg-horse/10 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-horse" />
        <span className="text-label-medium font-medium text-horse">성과 요약</span>
      </div>

      <motion.div className="grid grid-cols-2 gap-3 md:grid-cols-3" variants={containerVariants}>
        {formattedMetrics.map((metric) => (
          <motion.div key={metric.label} variants={itemVariants}>
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
