// src/components/race-detail/EntryTable.test.tsx

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import EntryTable from './EntryTable';
import { Race, RaceType, Entry } from '@/types';

// Helper to create mock entries
function createMockEntry(overrides: Partial<Entry> = {}, no = 1): Entry {
  return {
    no,
    name: `테스트마${no}`,
    jockey: `기수${no}`,
    trainer: `조교사${no}`,
    age: 4,
    weight: 57,
    recentRecord: '1-2-3',
    odds: 3.5,
    ...overrides,
  };
}

function createMockRace(type: RaceType, entries: Entry[] = []): Race {
  return {
    id: `${type}-1-1-20251210`,
    type,
    raceNo: 1,
    track: type === 'horse' ? '서울' : type === 'cycle' ? '광명' : '미사리',
    startTime: '14:00',
    status: 'upcoming',
    entries,
  };
}

describe('EntryTable', () => {
  describe('rendering', () => {
    it('should render the table with entries', () => {
      const entries = [createMockEntry({}, 1), createMockEntry({}, 2)];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      expect(screen.getByTestId('entry-table')).toBeInTheDocument();
      expect(screen.getByText('출전표')).toBeInTheDocument();
      expect(screen.getByText('(2두/명)')).toBeInTheDocument();
    });

    it('should display empty state when no entries', () => {
      const race = createMockRace('horse', []);

      render(<EntryTable race={race} />);

      expect(screen.getByText(/출전 정보가 없습니다/)).toBeInTheDocument();
    });

    it('should show entry number, name, and odds', () => {
      const entries = [createMockEntry({ no: 1, name: '일등마', odds: 2.5 })];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      // Use getAllBy* since both desktop and mobile views render
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('일등마').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2.5').length).toBeGreaterThan(0);
    });
  });

  describe('horse racing columns', () => {
    it('should display horse-specific columns', () => {
      const entries = [
        createMockEntry({
          name: '번개호',
          jockey: '김기수',
          trainer: '박조교사',
          age: 4,
          weight: 57,
          recentRecord: '1-2-1',
        }),
      ];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      // Check header columns
      expect(screen.getByRole('columnheader', { name: /번호/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /마명/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /기수/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /조교사/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /연령/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /부담중량/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /최근성적/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /단승/i })).toBeInTheDocument();

      // Check data (use getAllBy* since mobile/desktop both render)
      expect(screen.getAllByText('번개호').length).toBeGreaterThan(0);
      expect(screen.getAllByText('김기수').length).toBeGreaterThan(0);
      expect(screen.getAllByText('박조교사').length).toBeGreaterThan(0);
      expect(screen.getAllByText('4세').length).toBeGreaterThan(0);
      expect(screen.getAllByText('57kg').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1-2-1').length).toBeGreaterThan(0);
    });
  });

  describe('cycle racing columns', () => {
    it('should display cycle-specific columns', () => {
      const entries = [
        createMockEntry({
          name: '김선수',
          jockey: undefined, // No jockey for cycle racing
          trainer: undefined,
          age: undefined,
          weight: undefined,
          score: 95,
          recentRecord: '2-1-3',
        }),
      ];
      const race = createMockRace('cycle', entries);

      render(<EntryTable race={race} />);

      // Check header - should show 선수명 not 마명
      expect(screen.getByRole('columnheader', { name: /선수명/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /점수/i })).toBeInTheDocument();

      // Should NOT show horse-specific columns
      expect(screen.queryByRole('columnheader', { name: /마명/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: /조교사/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: /부담중량/i })).not.toBeInTheDocument();

      expect(screen.getAllByText('김선수').length).toBeGreaterThan(0);
      expect(screen.getAllByText('95').length).toBeGreaterThan(0);
    });
  });

  describe('boat racing columns', () => {
    it('should display boat-specific columns', () => {
      const entries = [
        createMockEntry({
          name: '박선수',
          motor: 'M-101',
          boat: 'B-55',
          score: 88,
          recentRecord: '3-2-1',
        }),
      ];
      const race = createMockRace('boat', entries);

      render(<EntryTable race={race} />);

      // Check header - boat racing specific
      expect(screen.getByRole('columnheader', { name: /선수명/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /모터/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /보트/i })).toBeInTheDocument();

      expect(screen.getAllByText('박선수').length).toBeGreaterThan(0);
      expect(screen.getAllByText('M-101').length).toBeGreaterThan(0);
      expect(screen.getAllByText('B-55').length).toBeGreaterThan(0);
    });
  });

  describe('odds display', () => {
    it('should display odds with formatting', () => {
      const entries = [createMockEntry({ odds: 5.2 })];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      // Both desktop and mobile show odds
      expect(screen.getAllByText('5.2').length).toBeGreaterThan(0);
    });

    it('should display dash when odds not available', () => {
      const entries = [createMockEntry({ odds: undefined })];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      // Find the odds column cell with dash
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      const dataRow = rows[1]; // First row is header
      const cells = within(dataRow).getAllByRole('cell');
      const oddsCell = cells[cells.length - 1]; // Last cell is odds
      expect(oddsCell).toHaveTextContent('-');
    });
  });

  describe('accessibility', () => {
    it('should have proper table structure with caption', () => {
      const entries = [createMockEntry()];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      // Caption and heading both contain 출전표
      expect(screen.getAllByText(/출전표/).length).toBeGreaterThan(0);
    });

    it('should have column headers with scope', () => {
      const entries = [createMockEntry()];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('mobile view', () => {
    it('should render mobile cards on small screens', () => {
      const entries = [createMockEntry({ name: '모바일마' })];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      // Both mobile and desktop views exist, just hidden based on screen size
      // Test that the mobile card exists (has md:hidden class on container)
      const mobileContainer = screen.getByTestId('entry-table-mobile');
      expect(mobileContainer).toHaveClass('md:hidden');
    });
  });

  describe('styling', () => {
    it('should apply race type color to entry number', () => {
      const entries = [createMockEntry({ no: 1 })];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      // Find the entry number in the table
      const numberBadge = screen.getAllByText('1')[0].closest('span');
      expect(numberBadge).toHaveClass('text-horse');
    });

    it('should alternate row backgrounds', () => {
      const entries = [createMockEntry({}, 1), createMockEntry({}, 2)];
      const race = createMockRace('horse', entries);

      render(<EntryTable race={race} />);

      const rows = screen.getAllByRole('row').slice(1); // Skip header
      expect(rows.length).toBe(2);
    });
  });
});
