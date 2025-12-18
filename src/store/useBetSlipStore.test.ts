import { act } from 'react-dom/test-utils';

import { useBetSlipStore } from './useBetSlipStore';

describe('useBetSlipStore', () => {
  const baseSelection = {
    raceId: 'race-1',
    entrantId: 'entrant-1',
    entrantName: '테스트',
    raceType: 'horse' as const,
    odds: 2.5,
  };

  beforeEach(() => {
    useBetSlipStore.setState({ selections: [], betType: 'win' });
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  });

  it('normalizes non-finite amounts to zero', () => {
    act(() => useBetSlipStore.getState().addSelection(baseSelection, 100));
    act(() => useBetSlipStore.getState().setAmount('entrant-1', Number.NaN));

    const state = useBetSlipStore.getState();
    expect(state.selections[0]?.amount).toBe(0);
  });

  it('recovers from corrupted history payloads when placing a bet', () => {
    localStorage.setItem('bet-slip-history', 'not-json');
    act(() => useBetSlipStore.getState().addSelection(baseSelection, 50));

    const record = useBetSlipStore.getState().placeBet();

    expect(record).not.toBeNull();
    const saved = JSON.parse(localStorage.getItem('bet-slip-history') ?? '[]');
    expect(Array.isArray(saved)).toBe(true);
    expect(saved).toHaveLength(1);
  });

  it('logs quota errors without throwing during persistence', () => {
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    jest.spyOn(localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    act(() => useBetSlipStore.getState().addSelection(baseSelection, 25));
    const record = useBetSlipStore.getState().placeBet();

    expect(record).not.toBeNull();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('용량 부족'), quotaError);

    (localStorage.setItem as jest.Mock).mockRestore();
  });
});
