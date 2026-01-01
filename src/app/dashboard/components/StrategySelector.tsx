'use client';

import { PRESET_STRATEGIES, type PresetStrategy } from '@/lib/dashboard/presetStrategies';
import { TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface StrategySelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function getDifficultyBadge(difficulty: PresetStrategy['difficulty']) {
  const configs = {
    easy: { label: '쉬움', className: 'bg-bullish/10 text-bullish' },
    medium: { label: '보통', className: 'bg-amber-500/10 text-amber-600' },
    hard: { label: '어려움', className: 'bg-bearish/10 text-bearish' },
  };
  return configs[difficulty];
}

function getRiskIcon(riskLevel: PresetStrategy['riskLevel']) {
  switch (riskLevel) {
    case 'low':
      return <CheckCircle className="h-4 w-4 text-bullish" />;
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'high':
      return <TrendingDown className="h-4 w-4 text-bearish" />;
  }
}

export function StrategySelector({ selectedId, onSelect }: StrategySelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-title-small font-semibold text-neutral-text-primary">전략 선택</h3>
      <div className="space-y-2">
        {PRESET_STRATEGIES.map((strategy) => {
          const isSelected = selectedId === strategy.id;
          const difficultyBadge = getDifficultyBadge(strategy.difficulty);

          return (
            <button
              key={strategy.id}
              onClick={() => onSelect(strategy.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-horse bg-horse-container/30 ring-1 ring-horse'
                  : 'border-neutral-divider bg-white hover:border-horse/50 hover:bg-horse-container/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-medium font-semibold text-neutral-text-primary">
                      {strategy.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-label-small font-medium ${difficultyBadge.className}`}
                    >
                      {difficultyBadge.label}
                    </span>
                  </div>
                  <p className="mt-1 text-body-small text-neutral-text-secondary">
                    {strategy.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {getRiskIcon(strategy.riskLevel)}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {strategy.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-surface-dim px-2 py-0.5 text-label-small text-neutral-text-secondary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
