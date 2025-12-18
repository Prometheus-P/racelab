import { abbreviations } from '@/lib/dictionaries/abbreviations';

interface AbbrevTooltipProps {
  abbr: string;
  children?: React.ReactNode;
  className?: string;
}

export function AbbrevTooltip({ abbr, children, className }: AbbrevTooltipProps) {
  const explanation = abbreviations[abbr] ?? undefined;

  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`} title={explanation}>
      <span className="font-semibold uppercase tracking-tight">{abbr}</span>
      {children && <span className="text-xs text-gray-600">{children}</span>}
    </span>
  );
}

export default AbbrevTooltip;
