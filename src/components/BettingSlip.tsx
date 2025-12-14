'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import { calculateEstimatedReturn, useBetSlipStore } from '@/store/useBetSlipStore';

function formatCurrency(amount: number) {
  return amount.toLocaleString('ko-KR');
}

export default function BettingSlip() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const { selections, betType, setBetType, setAmount, removeSelection, placeBet, clear } = useBetSlipStore();

  useEffect(() => {
    // SSR/CSR 불일치 방지를 위해 클라이언트 마운트 이후 렌더링
    setMounted(true);
  }, []);

  const totals = useMemo(() => {
    const totalAmount = selections.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);
    const estimated = selections.reduce(
      (sum, item) => sum + calculateEstimatedReturn(item.odds, item.amount),
      0,
    );
    return { totalAmount, estimated };
  }, [selections]);

  useEffect(() => {
    if (confirmation) {
      const timer = setTimeout(() => setConfirmation(null), 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [confirmation]);

  if (!mounted) return null;

  const handlePlaceBet = () => {
    const record = placeBet();
    if (!record) {
      setConfirmation('선택된 베팅이 없습니다.');
      return;
    }

    setConfirmation('모의 베팅이 저장되었습니다.');
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-30 mx-auto w-full max-w-xl px-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          aria-expanded={open}
        >
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">총 베팅 금액</span>
            <span className="text-lg font-semibold text-white">₩ {formatCurrency(totals.totalAmount)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-emerald-200">
            <span>예상 적중 금액: ₩ {formatCurrency(totals.estimated)}</span>
            {open ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </div>
        </button>

        {open ? (
          <div className="space-y-3 border-t border-slate-800 px-4 py-3" data-testid="betting-slip-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <label htmlFor="betType">베팅 유형</label>
                <select
                  id="betType"
                  value={betType}
                  onChange={(e) => setBetType(e.target.value as typeof betType)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-white"
                >
                  <option value="win">승</option>
                  <option value="place">연승</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  전체 비우기
                </button>
                <button
                  type="button"
                  onClick={handlePlaceBet}
                  disabled={selections.length === 0}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  모의 베팅하기
                </button>
              </div>
            </div>

            {selections.length === 0 ? (
              <p className="text-sm text-slate-400">선택된 말/선수가 없습니다. 카드를 탭해 베팅 슬립에 추가하세요.</p>
            ) : (
              <ul className="space-y-2">
                {selections.map((item) => (
                  <li
                    key={item.entrantId}
                    className="rounded-xl border border-slate-800 bg-slate-800/70 p-3 shadow-inner"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase text-slate-400">{item.raceType}</p>
                        <p className="text-sm font-semibold text-white">{item.entrantName}</p>
                        <p className="text-xs text-emerald-200">배당률 {item.odds.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        aria-label="선택 제거"
                        onClick={() => removeSelection(item.entrantId)}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <label className="text-xs text-slate-400" htmlFor={`amount-${item.entrantId}`}>
                        금액
                      </label>
                      <input
                        id={`amount-${item.entrantId}`}
                        type="number"
                        min={0}
                        value={item.amount}
                        onChange={(e) => {
                          const nextAmount = Number(e.target.value);
                          if (!Number.isFinite(nextAmount)) return;
                          setAmount(item.entrantId, nextAmount);
                        }}
                        className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                      <div className="ml-auto text-right text-xs text-slate-300">
                        <p>예상 수익</p>
                        <p className="font-semibold text-emerald-200">
                          ₩ {formatCurrency(calculateEstimatedReturn(item.odds, item.amount))}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {confirmation ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>{confirmation}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
