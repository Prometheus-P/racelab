// src/lib/utils/ui.ts
import { Race } from '@/types';

export function getRaceTypeEmoji(type: Race['type']): string {
  switch (type) {
    case 'horse':
      return '🐎';
    case 'cycle':
      return '🚴';
    case 'boat':
      return '🚤';
  }
}
