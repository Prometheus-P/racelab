'use client';

interface PrintPdfButtonProps {
  label?: string;
  className?: string;
}

export function PrintPdfButton({ label = '인쇄', className }: PrintPdfButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        className ?? ''
      }`}
    >
      <span aria-hidden="true">🖨️</span>
      <span>{label}</span>
    </button>
  );
}

export default PrintPdfButton;
