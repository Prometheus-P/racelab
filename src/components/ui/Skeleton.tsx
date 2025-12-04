// src/components/ui/Skeleton.tsx
'use client';

import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  animation?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface SkeletonTextProps {
  lines?: number;
  'data-testid'?: string;
}

interface SkeletonAvatarProps {
  size?: number;
  'data-testid'?: string;
}

interface SkeletonCardProps {
  'data-testid'?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded-m3-xs',
  circular: 'rounded-full',
  rectangular: 'rounded-m3-sm',
};

function SkeletonBase({
  variant = 'text',
  width,
  height,
  animation = true,
  className = '',
  'data-testid': testId,
}: SkeletonProps) {
  const baseClasses = [
    'block',
    'bg-surface-container',
    animation ? 'animate-shimmer' : '',
    animation ? 'bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container' : '',
    animation ? 'bg-[length:200%_100%]' : '',
    !width ? 'w-full' : '',
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className={baseClasses}
      style={style}
      data-testid={testId}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function SkeletonText({ lines = 1, 'data-testid': testId }: SkeletonTextProps) {
  if (lines === 1) {
    return <SkeletonBase variant="text" data-testid={testId} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          variant="text"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = 40, 'data-testid': testId }: SkeletonAvatarProps) {
  return (
    <SkeletonBase
      variant="circular"
      width={size}
      height={size}
      data-testid={testId}
    />
  );
}

function SkeletonCard({ 'data-testid': testId }: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="p-4 rounded-m3-md shadow-m3-1 bg-surface-container animate-shimmer bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container bg-[length:200%_100%]"
      data-testid={testId}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-high" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container-high rounded-m3-xs w-3/4" />
          <div className="h-3 bg-surface-container-high rounded-m3-xs w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-surface-container-high rounded-m3-xs" />
        <div className="h-4 bg-surface-container-high rounded-m3-xs" />
        <div className="h-4 bg-surface-container-high rounded-m3-xs w-2/3" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Export as compound component
export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
});

export default Skeleton;
