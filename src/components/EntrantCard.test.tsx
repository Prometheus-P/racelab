import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EntrantCard from './EntrantCard';
import type { EntrantData } from '@/types';

jest.mock(
  'lucide-react',
  () => ({
    ChevronDown: () => <svg data-testid="chevron-down" />,
    ChevronUp: () => <svg data-testid="chevron-up" />,
    Star: () => <svg data-testid="star" />,
    StarOff: () => <svg data-testid="star-off" />,
  }),
  { virtual: true },
);

jest.mock(
  'recharts',
  () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: () => <div data-testid="polar-angle" />,
    PolarRadiusAxis: () => <div data-testid="polar-radius" />,
    Radar: () => <div data-testid="radar" />,
    Tooltip: () => <div data-testid="tooltip" />,
  }),
  { virtual: true },
);

const entrant: EntrantData = {
  id: 'entrant-1',
  number: 3,
  name: '스피드 퀸',
  raceType: 'horse',
  odds: 2.5,
  stats: { speed: 75, stamina: 60, recentWinRate: 55, condition: 70 },
  history: [
    { date: '2024-01-01', track: '서울', result: '1위' },
    { date: '2023-12-24', track: '부산', result: '2위' },
  ],
};

describe('EntrantCard', () => {
  it('expands details from the primary header control', async () => {
    const user = userEvent.setup();
    render(<EntrantCard entrant={entrant} />);

    expect(screen.queryByTestId('entrant-history')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /스피드 퀸/i }));

    const history = screen.getByTestId('entrant-history');
    expect(history).toBeInTheDocument();
    expect(history).toHaveAttribute('role', 'region');
    expect(history.getAttribute('aria-labelledby')).toContain('entrant-1-title');
  });

  it('hides secondary toggle from accessibility tree', () => {
    const { container } = render(<EntrantCard entrant={entrant} />);
    const iconButton = container.querySelector('button[aria-hidden="true"]');
    expect(iconButton).toHaveAttribute('tabindex', '-1');
  });
});
