// src/config/raceTypes.ts
// Central configuration for race types (006-production-hardening)

import { RaceType } from '@/types';

/**
 * Race type별 UI 설정
 */
export interface RaceTypeConfig {
  /** 전체 라벨 (경마, 경륜, 경정) */
  label: string;
  /** 축약 라벨 (마, 륜, 정) */
  shortLabel: string;
  /** 이모지 아이콘 */
  icon: string;
  /** Tailwind 색상 클래스 */
  color: {
    primary: string; // 텍스트 색상 (text-horse 등)
    bg: string; // 배경 색상 (bg-horse/5 등)
    border: string; // 테두리 색상 (border-horse 등)
    badge: string; // 배지 배경 (bg-horse/10 등)
  };
}

/**
 * 모든 race type의 UI 설정
 * 단일 소스로 모든 UI 컴포넌트에서 사용
 */
export const RACE_TYPES: Record<RaceType, RaceTypeConfig> = {
  horse: {
    label: '경마',
    shortLabel: '마',
    icon: '🐎',
    color: {
      primary: 'text-horse',
      bg: 'bg-horse/5',
      border: 'border-horse',
      badge: 'bg-horse/10',
    },
  },
  cycle: {
    label: '경륜',
    shortLabel: '륜',
    icon: '🚴',
    color: {
      primary: 'text-cycle',
      bg: 'bg-cycle/5',
      border: 'border-cycle',
      badge: 'bg-cycle/10',
    },
  },
  boat: {
    label: '경정',
    shortLabel: '정',
    icon: '🚤',
    color: {
      primary: 'text-boat',
      bg: 'bg-boat/5',
      border: 'border-boat',
      badge: 'bg-boat/10',
    },
  },
};

/**
 * race type 라벨 가져오기 (안전한 조회)
 */
export function getRaceTypeLabel(type: RaceType): string {
  return RACE_TYPES[type]?.label ?? type;
}

/**
 * race type 아이콘 가져오기 (안전한 조회)
 */
export function getRaceTypeIcon(type: RaceType): string {
  return RACE_TYPES[type]?.icon ?? '';
}
