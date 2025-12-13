// src/components/shared/ProGate.tsx
'use client';

import React from 'react';

interface ProGateProps {
  feature: 'pdf' | 'csv' | 'history' | 'alerts';
}

const featureCopy: Record<ProGateProps['feature'], string> = {
  pdf: 'PDF/인쇄 고급 서식은 구독 후 이용 가능합니다.',
  csv: 'CSV 다운로드는 프로 구독자 전용 기능입니다.',
  history: '전체 히스토리는 구독 후 확인할 수 있습니다.',
  alerts: '즐겨찾기/알림은 프로에서 제공됩니다.',
};

const ProGate: React.FC<ProGateProps> = ({ feature }) => (
  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
    <div className="font-semibold">PRO 전용</div>
    <p className="mt-1 leading-6">{featureCopy[feature]}</p>
    <p className="mt-2 text-xs text-indigo-800">“종이 정보집 한 달치 가격으로 전부 제공합니다.”</p>
  </div>
);

export default ProGate;
