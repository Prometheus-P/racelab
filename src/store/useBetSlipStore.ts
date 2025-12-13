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
              item.entrantId === selection.entrantId ? { ...item, amount: Math.max(amount, 0) } : item,
            ),
          });
          return;
        }

        set((state) => ({
          selections: [
            ...state.selections,
            { ...selection, amount: Math.max(amount, 0), betType: state.betType },
          ],
        }));
      },
      removeSelection: (entrantId) => {
        set((state) => ({ selections: state.selections.filter((item) => item.entrantId !== entrantId) }));
      },
      setAmount: (entrantId, amount) => {
        set((state) => ({
          selections: state.selections.map((item) =>
            item.entrantId === entrantId ? { ...item, amount: Math.max(amount, 0) } : item,
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
          selections: selections.map((item) => ({ ...item, amount: Math.max(item.amount, 0) })),
          betType,
          totalAmount,
          estimatedReturn,
          placedAt: new Date().toISOString(),
        };

        try {
          const existingRaw = localStorage.getItem('bet-slip-history');
          const history: PlacedBet[] = existingRaw ? JSON.parse(existingRaw) : [];
          history.push(record);
          localStorage.setItem('bet-slip-history', JSON.stringify(history));
        } catch (error) {
          console.error('베팅 내역 저장 실패', error);
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
