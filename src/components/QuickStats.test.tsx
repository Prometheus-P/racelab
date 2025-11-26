// src/components/QuickStats.test.tsx
import { render, screen } from '@testing-library/react';
import QuickStats from './QuickStats';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
  fetchCycleRaceSchedules: jest.fn(),
  fetchBoatRaceSchedules: jest.fn(),
}));

// Mock the date utility
jest.mock('@/lib/utils/date', () => ({
  getTodayYYYYMMDD: jest.fn(() => '20240115'),
}));

describe('QuickStats Component', () => {
  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(5));
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(new Array(3));
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(new Array(2));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should_render_total_and_individual_race_counts', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

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

    it('should_call_all_api_functions_with_today_date', async () => {
      await QuickStats();

      expect(fetchHorseRaceSchedules).toHaveBeenCalledWith('20240115');
      expect(fetchCycleRaceSchedules).toHaveBeenCalledWith('20240115');
      expect(fetchBoatRaceSchedules).toHaveBeenCalledWith('20240115');
    });

    it('should_render_four_stat_cards', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // Check for 4 stat cards (total + 3 race types)
      const statLabels = ['총 경주', '경마', '경륜', '경정'];
      statLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should_render_icons_for_each_race_type', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      expect(screen.getByText('🏁')).toBeInTheDocument();
      expect(screen.getByText('🐎')).toBeInTheDocument();
      expect(screen.getByText('🚴')).toBeInTheDocument();
      expect(screen.getByText('🚤')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should_have_section_with_aria_label', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const section = screen.getByRole('region', { name: '오늘의 경주 통계' });
      expect(section).toBeInTheDocument();
    });

    it('should_have_aria_labelledby_on_stat_cards', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(4);

      // Check that each article has aria-labelledby
      articles.forEach(article => {
        expect(article).toHaveAttribute('aria-labelledby');
      });
    });

    it('should_have_screen_reader_only_text_for_context', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // Check for sr-only text
      const srOnlyTexts = screen.getAllByText('개 경주 예정');
      expect(srOnlyTexts).toHaveLength(4);
    });
  });

  describe('Styling', () => {
    it('should_apply_race_type_colors_to_values', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const horseValue = screen.getByText('5');
      expect(horseValue.className).toContain('text-horse');

      const cycleValue = screen.getByText('3');
      expect(cycleValue.className).toContain('text-cycle');

      const boatValue = screen.getByText('2');
      expect(boatValue.className).toContain('text-boat');
    });

    it('should_use_tabular_nums_for_number_alignment', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const totalValue = screen.getByText('10');
      expect(totalValue.className).toContain('tabular-nums');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const section = screen.getByRole('region', { name: '오늘의 경주 통계' });
      expect(section.className).toContain('grid-cols-2');
      expect(section.className).toContain('md:grid-cols-4');
    });

    it('should have responsive font sizes for values', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const totalValue = screen.getByText('10');
      expect(totalValue.className).toContain('text-2xl');
      expect(totalValue.className).toContain('md:text-3xl');
    });

    it('should have minimum touch target on stat cards', async () => {
      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      const articles = screen.getAllByRole('article');
      articles.forEach(article => {
        expect(article.className).toContain('min-h-[80px]');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should_render_zero_when_no_races_available', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);

      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // All counts should be 0
      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(4); // total + horse + cycle + boat
    });

    it('should_render_correctly_when_only_horse_races_exist', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(10));
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);

      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // Both total and horse should show '10', cycle/boat show '0'
      const tens = screen.getAllByText('10');
      expect(tens).toHaveLength(2); // total + horse both equal 10
      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(2); // cycle + boat
    });

    it('should_handle_large_numbers_with_locale_formatting', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(1000));
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(new Array(500));
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(new Array(250));

      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // Numbers should be formatted with locale (1,750 for ko-KR)
      expect(screen.getByText('1,750')).toBeInTheDocument(); // total
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });
  });
});
