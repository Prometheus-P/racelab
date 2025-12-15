// src/components/QuickStats.test.tsx
import { render, screen } from '@testing-library/react';
import QuickStats from './QuickStats';
import { TodayRacesData, Race } from '@/types';

describe('QuickStats Component', () => {
  // Helper to create mock races
  const createMockRaces = (count: number, type: 'horse' | 'cycle' | 'boat'): Race[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${type}-${i + 1}`,
      type,
      raceNo: i + 1,
      track: type === 'horse' ? '서울' : type === 'cycle' ? '광명' : '미사리',
      startTime: '11:00',
      status: 'upcoming' as const,
      entries: [],
    }));
  };

  const mockData: TodayRacesData = {
    horse: createMockRaces(5, 'horse'),
    cycle: createMockRaces(3, 'cycle'),
    boat: createMockRaces(2, 'boat'),
    status: { horse: 'OK', cycle: 'OK', boat: 'OK' },
  };

  const emptyData: TodayRacesData = {
    horse: [],
    cycle: [],
    boat: [],
    status: { horse: 'OK', cycle: 'OK', boat: 'OK' },
  };

  describe('Basic Rendering', () => {
    it('should_render_total_and_individual_race_counts', () => {
      render(<QuickStats data={mockData} />);

      // Check for the labels and corresponding numbers
      expect(screen.getByText('총 경주')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // 5 + 3 + 2

      expect(screen.getByText('경마')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      expect(screen.getByText('경륜')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      expect(screen.getByText('경정')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should_render_four_stat_cards', () => {
      render(<QuickStats data={mockData} />);

      // Check for 4 stat cards (total + 3 race types)
      const statLabels = ['총 경주', '경마', '경륜', '경정'];
      statLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should_render_icons_for_each_race_type', () => {
      render(<QuickStats data={mockData} />);

      expect(screen.getByText('🏁')).toBeInTheDocument();
      expect(screen.getByText('🐎')).toBeInTheDocument();
      expect(screen.getByText('🚴')).toBeInTheDocument();
      expect(screen.getByText('🚤')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should_have_section_with_aria_label', () => {
      render(<QuickStats data={mockData} />);

      const section = screen.getByRole('region', { name: '오늘의 경주 통계' });
      expect(section).toBeInTheDocument();
    });

    it('should_have_aria_labelledby_on_stat_cards', () => {
      render(<QuickStats data={mockData} />);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(4);

      // Check that each article has aria-labelledby
      articles.forEach((article) => {
        expect(article).toHaveAttribute('aria-labelledby');
      });
    });

    it('should_have_screen_reader_only_text_for_context', () => {
      render(<QuickStats data={mockData} />);

      // Check for sr-only text
      const srOnlyTexts = screen.getAllByText('개 경주 예정');
      expect(srOnlyTexts).toHaveLength(4);
    });
  });

  describe('Styling', () => {
    it('should_apply_race_type_colors_to_values', () => {
      render(<QuickStats data={mockData} />);

      const horseValue = screen.getByText('5');
      expect(horseValue.className).toContain('text-horse');

      const cycleValue = screen.getByText('3');
      expect(cycleValue.className).toContain('text-cycle');

      const boatValue = screen.getByText('2');
      expect(boatValue.className).toContain('text-boat');
    });

    it('should_use_tabular_nums_for_number_alignment', () => {
      render(<QuickStats data={mockData} />);

      const totalValue = screen.getByText('10');
      expect(totalValue.className).toContain('tabular-nums');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      render(<QuickStats data={mockData} />);

      const section = screen.getByRole('region', { name: '오늘의 경주 통계' });
      expect(section.className).toContain('grid-cols-2');
      expect(section.className).toContain('md:grid-cols-4');
    });

    it('should have responsive font sizes for values', () => {
      render(<QuickStats data={mockData} />);

      const totalValue = screen.getByText('10');
      expect(totalValue.className).toContain('text-2xl');
      expect(totalValue.className).toContain('md:text-3xl');
    });

    it('should have minimum touch target on stat cards', () => {
      render(<QuickStats data={mockData} />);

      const articles = screen.getAllByRole('article');
      articles.forEach((article) => {
        expect(article.className).toContain('min-h-[80px]');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should_render_zero_when_no_races_available', () => {
      render(<QuickStats data={emptyData} />);

      // All counts should be 0
      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(4); // total + horse + cycle + boat
    });

    it('should_render_correctly_when_only_horse_races_exist', () => {
      const horseOnlyData: TodayRacesData = {
        horse: createMockRaces(10, 'horse'),
        cycle: [],
        boat: [],
        status: { horse: 'OK', cycle: 'OK', boat: 'OK' },
      };

      render(<QuickStats data={horseOnlyData} />);

      // Both total and horse should show '10', cycle/boat show '0'
      const tens = screen.getAllByText('10');
      expect(tens).toHaveLength(2); // total + horse both equal 10
      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(2); // cycle + boat
    });

    it('should_handle_large_numbers_with_locale_formatting', () => {
      const largeData: TodayRacesData = {
        horse: createMockRaces(1000, 'horse'),
        cycle: createMockRaces(500, 'cycle'),
        boat: createMockRaces(250, 'boat'),
        status: { horse: 'OK', cycle: 'OK', boat: 'OK' },
      };

      render(<QuickStats data={largeData} />);

      // Numbers should be formatted with locale (1,750 for ko-KR)
      expect(screen.getByText('1,750')).toBeInTheDocument(); // total
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });
  });
});
