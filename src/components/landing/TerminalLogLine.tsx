'use client';

import { useEffect, useState } from 'react';

export interface TerminalLogLineProps {
  text: string;
  isVisible: boolean;
  variant?: 'default' | 'success' | 'progress' | 'error';
  typewriter?: boolean;
  onComplete?: () => void;
}

const variantStyles = {
  default: 'text-neutral-300',
  success: 'text-horse',
  progress: 'text-boat',
  error: 'text-cycle',
};

export function TerminalLogLine({
  text,
  isVisible,
  variant = 'default',
  typewriter = false,
  onComplete,
}: TerminalLogLineProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    if (!typewriter) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isVisible, text, typewriter, onComplete]);

  if (!isVisible) return null;

  const prefix = variant === 'success' ? '\u2713 ' : '';

  return (
    <div
      className={`font-mono text-sm leading-relaxed transition-opacity duration-200 ${variantStyles[variant]} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="mr-2 select-none text-neutral-400">
        [{new Date().toLocaleTimeString('ko-KR', { hour12: false })}]
      </span>
      <span>
        {prefix}
        {displayedText}
        {typewriter && !isComplete && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-horse" />
        )}
      </span>
    </div>
  );
}
