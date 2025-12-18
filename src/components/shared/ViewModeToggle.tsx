'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookViewMode } from '@/lib/view-models/bookVM';

interface ViewModeToggleProps {
  viewMode?: BookViewMode;
  className?: string;
}

const modes: { value: BookViewMode; label: string; description: string }[] = [
  { value: 'compact', label: '압축', description: '빠른 확인용' },
  { value: 'expert', label: '전문', description: '상세 정보' },
];

export function ViewModeToggle({ viewMode = 'compact', className }: ViewModeToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (mode: BookViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white shadow-sm ${className ?? ''}`} role="group">
      {modes.map((mode) => {
        const isActive = viewMode === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => handleChange(mode.value)}
            aria-pressed={isActive}
            className={`flex min-w-[110px] flex-col px-3 py-2 text-left text-sm font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-base leading-tight">{mode.label}</span>
            <span className="text-xs font-normal opacity-80">{mode.description}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
