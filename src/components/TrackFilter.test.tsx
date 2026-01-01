// src/components/TrackFilter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackFilter } from './TrackFilter';

describe('TrackFilter', () => {
  it('renders track filter with "전체" button', () => {
    render(<TrackFilter />);
    expect(screen.getByRole('button', { name: /전체/ })).toBeInTheDocument();
  });

  it('shows all tracks when no race types selected', () => {
    render(<TrackFilter />);

    // Should include tracks from all types
    expect(screen.getByRole('button', { name: '서울' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '광명' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '미사리' })).toBeInTheDocument();
  });

  it('filters tracks based on selected race types', () => {
    render(<TrackFilter selectedRaceTypes={['horse']} />);

    // Should show horse tracks
    expect(screen.getByRole('button', { name: '서울' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '부산경남' })).toBeInTheDocument();

    // Should not show cycle or boat tracks
    expect(screen.queryByRole('button', { name: '광명' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '미사리' })).not.toBeInTheDocument();
  });

  it('shows cycle tracks when cycle type selected', () => {
    render(<TrackFilter selectedRaceTypes={['cycle']} />);

    expect(screen.getByRole('button', { name: '광명' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '창원' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '서울' })).not.toBeInTheDocument();
  });

  it('shows boat tracks when boat type selected', () => {
    render(<TrackFilter selectedRaceTypes={['boat']} />);

    expect(screen.getByRole('button', { name: '미사리' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '서울' })).not.toBeInTheDocument();
  });

  it('shows tracks from multiple types when multiple selected', () => {
    render(<TrackFilter selectedRaceTypes={['horse', 'cycle']} />);

    // Should show both horse and cycle tracks
    expect(screen.getByRole('button', { name: '서울' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '광명' })).toBeInTheDocument();

    // Should not show boat tracks
    expect(screen.queryByRole('button', { name: '미사리' })).not.toBeInTheDocument();
  });

  it('displays selected track with aria-pressed', () => {
    render(<TrackFilter selectedTrack="서울" />);
    const selectedButton = screen.getByRole('button', { name: '서울' });
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange when track button is clicked', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<TrackFilter onChange={handleChange} />);

    const seoulButton = screen.getByRole('button', { name: '서울' });
    await user.click(seoulButton);

    expect(handleChange).toHaveBeenCalledWith('서울');
  });

  it('"전체" button clears selection', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<TrackFilter selectedTrack="서울" onChange={handleChange} />);

    const allButton = screen.getByRole('button', { name: /전체/ });
    await user.click(allButton);

    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it('"전체" is pressed when no track selected', () => {
    render(<TrackFilter />);
    const allButton = screen.getByRole('button', { name: /전체/ });
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('groups tracks by race type with labels', () => {
    render(<TrackFilter />);

    // Should have group labels
    expect(screen.getByText('경마')).toBeInTheDocument();
    expect(screen.getByText('경륜')).toBeInTheDocument();
    expect(screen.getByText('경정')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TrackFilter className="custom-class" data-testid="track-filter" />);
    expect(screen.getByTestId('track-filter')).toHaveClass('custom-class');
  });

  it('clears selection when race type changes and track not in new types', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <TrackFilter selectedTrack="서울" selectedRaceTypes={['horse']} onChange={handleChange} />
    );

    // Change to cycle only - 서울 is not a cycle track
    rerender(
      <TrackFilter selectedTrack="서울" selectedRaceTypes={['cycle']} onChange={handleChange} />
    );

    // Should call onChange to clear the invalid track
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });
});
