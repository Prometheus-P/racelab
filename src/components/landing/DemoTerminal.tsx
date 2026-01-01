'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Terminal } from 'lucide-react';
import { TerminalLogLine } from './TerminalLogLine';
import { TerminalMetrics } from './TerminalMetrics';
import { DEMO_LOGS, DEMO_METRICS } from '@/lib/landing/demoData';

type TerminalPhase = 'idle' | 'running' | 'complete';

export function DemoTerminal() {
  const [phase, setPhase] = useState<TerminalPhase>('idle');
  const [currentLogIndex, setCurrentLogIndex] = useState(-1);
  const [showMetrics, setShowMetrics] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const runSimulation = useCallback(() => {
    setPhase('running');
    setCurrentLogIndex(-1);
    setShowMetrics(false);
    isCancelledRef.current = false;

    // Sequential timeout chain (one timer at a time, not O(n))
    const showLogAtIndex = (index: number) => {
      if (isCancelledRef.current) return;

      if (index < DEMO_LOGS.length) {
        setCurrentLogIndex(index);
        timeoutRef.current = setTimeout(() => {
          showLogAtIndex(index + 1);
        }, DEMO_LOGS[index].delay);
      } else {
        // Show metrics after all logs
        timeoutRef.current = setTimeout(() => {
          if (!isCancelledRef.current) {
            setShowMetrics(true);
            setPhase('complete');
          }
        }, 500);
      }
    };

    // Start with first log after initial delay
    timeoutRef.current = setTimeout(() => {
      showLogAtIndex(0);
    }, DEMO_LOGS[0]?.delay || 100);
  }, []);

  const reset = useCallback(() => {
    isCancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPhase('idle');
    setCurrentLogIndex(-1);
    setShowMetrics(false);
  }, []);

  // Auto-start when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 1000);
    return () => clearTimeout(timer);
  }, [runSimulation]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-headline-medium font-bold text-neutral-text-primary">
          Engine Performance
        </h2>
        <p className="mt-2 text-body-medium text-neutral-text-secondary">
          30초 단위 시계열 데이터를 실시간으로 백테스팅합니다.
        </p>
      </div>

      {/* Terminal window */}
      <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
        {/* Terminal header (macOS style) */}
        <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-800/50 px-4 py-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex items-center gap-2 text-label-small text-neutral-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>racelab-cli -- backtest</span>
          </div>
        </div>

        {/* Terminal body */}
        <div className="relative min-h-[400px] p-6">
          {/* Log lines */}
          <div className="space-y-1.5">
            {DEMO_LOGS.map((log, index) => (
              <TerminalLogLine
                key={index}
                text={log.text}
                variant={log.variant}
                isVisible={index <= currentLogIndex}
                typewriter={index === currentLogIndex}
              />
            ))}

            {/* Cursor when running */}
            {phase === 'running' && currentLogIndex < DEMO_LOGS.length - 1 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="h-4 w-2 animate-pulse bg-horse" />
              </div>
            )}
          </div>

          {/* Metrics panel */}
          <TerminalMetrics metrics={DEMO_METRICS} isVisible={showMetrics} />

          {/* Action button */}
          <div className="absolute bottom-6 right-6">
            {phase === 'idle' && (
              <button
                onClick={runSimulation}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-label-medium font-semibold text-neutral-900 shadow-lg transition-all hover:bg-neutral-100 hover:shadow-xl"
              >
                <Play className="h-4 w-4" />
                Run Simulation
              </button>
            )}

            {phase === 'complete' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-full border border-neutral-600 bg-neutral-800 px-4 py-2 text-label-medium text-neutral-300 transition-all hover:border-neutral-500 hover:bg-neutral-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Replay
                </button>
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full bg-horse px-5 py-2.5 text-label-medium font-semibold text-white shadow-lg transition-all hover:bg-horse-dark hover:shadow-xl"
                >
                  Try It Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
