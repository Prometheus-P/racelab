import { render, screen } from '@testing-library/react';

import Badge from './Badge';

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge>핵심</Badge>);
    expect(screen.getByText('핵심')).toBeInTheDocument();
  });

  it('applies secondary variant styles', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Hot
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('bg-emerald');
    expect(badge.className).toContain('border-emerald');
  });

  it('applies destructive variant styles', () => {
    render(
      <Badge variant="destructive" data-testid="badge">
        위험
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('bg-rose');
    expect(badge.className).toContain('text-rose');
  });
});
