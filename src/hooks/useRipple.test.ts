// src/hooks/useRipple.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRipple } from './useRipple';

// Mock useReducedMotion to return false by default
jest.mock('./useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

import { useReducedMotion } from './useReducedMotion';

const mockUseReducedMotion = useReducedMotion as jest.Mock;

describe('useRipple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('return value', () => {
    it('returns rippleProps object with event handlers', () => {
      const { result } = renderHook(() => useRipple());

      expect(result.current.rippleProps).toBeDefined();
      expect(typeof result.current.rippleProps.onMouseDown).toBe('function');
      expect(typeof result.current.rippleProps.onKeyDown).toBe('function');
    });

    it('returns ripples as null initially', () => {
      const { result } = renderHook(() => useRipple());

      expect(result.current.ripples).toBeNull();
    });
  });

  describe('mouse interaction', () => {
    it('creates ripple on mouse down', () => {
      const { result } = renderHook(() => useRipple());

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        clientX: 50,
        clientY: 25,
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.MouseEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onMouseDown(mockEvent);
      });

      expect(result.current.ripples).not.toBeNull();
    });

    it('removes ripple after duration', () => {
      const duration = 300;
      const { result } = renderHook(() => useRipple({ duration }));

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        clientX: 50,
        clientY: 25,
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.MouseEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onMouseDown(mockEvent);
      });

      expect(result.current.ripples).not.toBeNull();

      act(() => {
        jest.advanceTimersByTime(duration + 50);
      });

      expect(result.current.ripples).toBeNull();
    });
  });

  describe('keyboard interaction', () => {
    it('creates ripple on Enter key', () => {
      const { result } = renderHook(() => useRipple());

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        key: 'Enter',
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.KeyboardEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onKeyDown(mockEvent);
      });

      expect(result.current.ripples).not.toBeNull();
    });

    it('creates ripple on Space key', () => {
      const { result } = renderHook(() => useRipple());

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        key: ' ',
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.KeyboardEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onKeyDown(mockEvent);
      });

      expect(result.current.ripples).not.toBeNull();
    });

    it('does not create ripple on other keys', () => {
      const { result } = renderHook(() => useRipple());

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        key: 'Tab',
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.KeyboardEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onKeyDown(mockEvent);
      });

      expect(result.current.ripples).toBeNull();
    });
  });

  describe('configuration', () => {
    it('accepts custom color', () => {
      const { result } = renderHook(() => useRipple({ color: 'rgba(255,0,0,0.5)' }));

      // The hook should accept the color config without errors
      expect(result.current.rippleProps).toBeDefined();
    });

    it('accepts custom duration', () => {
      const duration = 500;
      const { result } = renderHook(() => useRipple({ duration }));

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        clientX: 50,
        clientY: 25,
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.MouseEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onMouseDown(mockEvent);
      });

      // Ripple should still exist before custom duration
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current.ripples).not.toBeNull();

      // Ripple should be gone after custom duration
      act(() => {
        jest.advanceTimersByTime(250);
      });
      expect(result.current.ripples).toBeNull();
    });

    it('does not create ripple when disabled', () => {
      const { result } = renderHook(() => useRipple({ disabled: true }));

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        clientX: 50,
        clientY: 25,
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.MouseEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onMouseDown(mockEvent);
      });

      expect(result.current.ripples).toBeNull();
    });
  });

  describe('reduced motion', () => {
    it('does not create ripple when user prefers reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(true);

      const { result } = renderHook(() => useRipple());

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const mockEvent = {
        clientX: 50,
        clientY: 25,
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.MouseEvent<HTMLElement>;

      act(() => {
        result.current.rippleProps.onMouseDown(mockEvent);
      });

      expect(result.current.ripples).toBeNull();
    });
  });

  describe('multiple ripples', () => {
    it('can have multiple ripples at once', () => {
      const { result } = renderHook(() => useRipple({ duration: 1000 }));

      const mockRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 50,
      } as DOMRect;

      const createMockEvent = (x: number, y: number) => ({
        clientX: x,
        clientY: y,
        currentTarget: {
          getBoundingClientRect: () => mockRect,
        },
      } as unknown as React.MouseEvent<HTMLElement>);

      act(() => {
        result.current.rippleProps.onMouseDown(createMockEvent(25, 25));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.rippleProps.onMouseDown(createMockEvent(75, 25));
      });

      // Both ripples should exist
      expect(result.current.ripples).not.toBeNull();
    });
  });
});
