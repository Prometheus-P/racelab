'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Brain, BarChart3 } from 'lucide-react';

interface ComparisonItem {
  label: string;
  before: string;
  after: string;
  beforeNegative?: boolean;
  afterPositive?: boolean;
}

const comparisons: ComparisonItem[] = [
  {
    label: '평균 승률',
    before: '32%',
    after: '67%',
    afterPositive: true,
  },
  {
    label: '6개월 수익률',
    before: '-45%',
    after: '+18.7%',
    beforeNegative: true,
    afterPositive: true,
  },
  {
    label: '의사결정 방식',
    before: '감에 의존',
    after: '데이터 기반',
  },
  {
    label: '리스크 관리',
    before: '없음',
    after: '손실 제한 설정',
  },
];

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
    },
  },
};

export function BeforeAfterSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-headline-medium font-bold text-neutral-text-primary">
            감 vs 데이터, 결과가 다릅니다
          </h2>
          <p className="mt-2 text-body-large text-neutral-text-secondary">
            같은 경주, 다른 접근 방식의 6개월 성과 비교
          </p>
        </div>

        {/* Comparison Table */}
        <motion.div
          className="mx-auto max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Header Row */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div />
            <div className="flex items-center justify-center gap-2 rounded-lg bg-cycle-container p-3">
              <Brain className="h-5 w-5 text-cycle-bold" />
              <span className="text-title-small font-semibold text-cycle-bold">감으로 베팅</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-horse-container p-3">
              <BarChart3 className="h-5 w-5 text-horse-bold" />
              <span className="text-title-small font-semibold text-horse-bold">데이터 베팅</span>
            </div>
          </div>

          {/* Comparison Rows */}
          {comparisons.map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className={`grid grid-cols-3 gap-4 py-4 ${
                index < comparisons.length - 1 ? 'border-b border-neutral-divider' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-body-medium font-medium text-neutral-text-primary">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span
                  className={`flex items-center gap-1 font-mono text-title-medium font-bold ${
                    item.beforeNegative ? 'text-bearish' : 'text-neutral-text-secondary'
                  }`}
                >
                  {item.beforeNegative && <TrendingDown className="h-4 w-4" />}
                  {item.before}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span
                  className={`flex items-center gap-1 font-mono text-title-medium font-bold ${
                    item.afterPositive ? 'text-bullish' : 'text-neutral-text-primary'
                  }`}
                >
                  {item.afterPositive && <TrendingUp className="h-4 w-4" />}
                  {item.after}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-label-small text-neutral-text-secondary">
          * 위 데이터는 &apos;배당률 급등 추적&apos; 전략의 2024년 상반기 백테스트 결과입니다.
          실제 수익은 다를 수 있습니다.
        </p>
      </div>
    </section>
  );
}
