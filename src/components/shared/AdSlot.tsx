// src/components/shared/AdSlot.tsx
'use client';

import React, { useEffect } from 'react';

interface AdSlotProps {
  id: string;
  position: 'book-header' | 'book-footer' | 'entity-header' | 'between-sections';
}

/**
 * Minimal ad placeholder. Replace with real ad script when available.
 */
const AdSlot: React.FC<AdSlotProps> = ({ id, position }) => {
  useEffect(() => {
    // Hook for future ad SDKs
  }, [id, position]);

  return (
    <div
      className="no-print rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-600"
      data-ad-slot={id}
      data-position={position}
    >
      <div className="font-semibold text-gray-700">광고 영역</div>
      <div className="text-xs text-gray-500">{position}</div>
    </div>
  );
};

export default AdSlot;
