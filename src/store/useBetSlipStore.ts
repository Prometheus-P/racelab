'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RaceType } from '@/types';

export type BetType = 'win' | 'place';

export interface BetSelection {
  raceId: string;
  entrantId: string;
  entrantName: string;
  raceType: RaceType;
  odds: number;
  betType: BetType;
  amount: number;
}

export interface PlacedBet {
  selections: BetSelection[];
  betType: BetType;
  totalAmount: number;
  estimatedReturn: number;
  placedAt: string;
}

interface BetSlipState {
  selections: BetSelection[];
  betType: BetType;
  addSelection: (selection: Omit<BetSelection, 'betType' | 'amount'>, amount: number) => void;
  removeSelection: (entrantId: string) => void;
  setAmount: (entrantId: string, amount: number) => void;
  setBetType: (betType: BetType) => void;
  placeBet: () => PlacedBet | null;
  clear: () => void;
}

export function calculateEstimatedReturn(odds: number, amount: number): number {
  const safeOdds = Number.isFinite(odds) ? odds : 0;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return Math.max(0, Number((safeOdds * safeAmount).toFixed(2)));
}

function normalizeAmount(value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.max(safe, 0);
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set, get) => ({
      selections: [],
      betType: 'win',
      addSelection: (selection, amount) => {
        // 동일 마번/선수는 한 번만 추가
        const existing = get().selections.find((item) => item.entrantId === selection.entrantId);
        if (existing) {
          set({
            selections: get().selections.map((item) =>
              item.entrantId === selection.entrantId ? { ...item, amount: normalizeAmount(amount) } : item,
            ),
          });
          return;
        }

        set((state) => ({
          selections: [
            ...state.selections,
            { ...selection, amount: normalizeAmount(amount), betType: state.betType },
          ],
        }));
      },
      removeSelection: (entrantId) => {
        set((state) => ({ selections: state.selections.filter((item) => item.entrantId !== entrantId) }));
      },
      setAmount: (entrantId, amount) => {
        const normalizedAmount = normalizeAmount(amount);
        set((state) => ({
          selections: state.selections.map((item) =>
            item.entrantId === entrantId ? { ...item, amount: normalizedAmount } : item,
          ),
        }));
      },
      setBetType: (betType) => {
        set((state) => ({
          betType,
          selections: state.selections.map((item) => ({ ...item, betType })),
        }));
      },
      placeBet: () => {
        const { selections, betType } = get();

        if (selections.length === 0) {
          return null;
        }

        const totalAmount = selections.reduce(
          (sum, item) => sum + (Number.isFinite(item.amount) ? Math.max(item.amount, 0) : 0),
          0,
        );
        const estimatedReturn = selections.reduce(
          (sum, item) => sum + calculateEstimatedReturn(item.odds, item.amount),
          0,
        );

        const record: PlacedBet = {
          selections: selections.map((item) => ({ ...item, amount: normalizeAmount(item.amount) })),
          betType,
          totalAmount,
          estimatedReturn,
          placedAt: new Date().toISOString(),
        };

        const history: PlacedBet[] = (() => {
          try {
            const existingRaw = localStorage.getItem('bet-slip-history');
            if (!existingRaw) return [];
            const parsed = JSON.parse(existingRaw);
            if (Array.isArray(parsed)) {
              return parsed.filter((entry) => Boolean(entry && typeof entry === 'object')) as PlacedBet[];
            }
            console.warn('베팅 내역 파싱 실패: 배열이 아닙니다. 새로 저장합니다.');
            return [];
          } catch (parseError) {
            console.error('베팅 내역 파싱 중 오류 발생', parseError);
            return [];
          }
        })();

        history.push(record);

        try {
          localStorage.setItem('bet-slip-history', JSON.stringify(history));
        } catch (error) {
          const isQuotaError =
            error instanceof DOMException &&
            (error.code === 22 || error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
          const label = isQuotaError ? '저장소 용량 부족으로 베팅 내역을 저장할 수 없습니다.' : '베팅 내역 저장 실패';
          console.error(label, error);
        }

        set({ selections: [] });
        return record;
      },
      clear: () => set({ selections: [] }),
    }),
    {
      name: 'bet-slip-v1',
      // 로컬스토리지 직렬화 오류를 예방하기 위해 JSON stringify 사용
      partialize: (state) => ({
        selections: state.selections,
        betType: state.betType,
      }),
    },
  ),
);
