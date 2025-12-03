// src/components/TrackFilter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackFilter } from './TrackFilter';

describe('TrackFilter', () => {
  it('renders track dropdown', () => {
    render(<TrackFilter />);
    expect(screen.getByRole('combobox', { name: /경기장/ })).toBeInTheDocument();
  });

  it('shows all tracks when no race types selected', () => {
    render(<TrackFilter />);

    // Should include tracks from all types
    expect(screen.getByRole('option', { name: /서울/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /광명/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /미사리/ })).toBeInTheDocument();
  });

  it('filters tracks based on selected race types', () => {
    render(<TrackFilter selectedRaceTypes={['horse']} />);

    // Should show horse tracks
    expect(screen.getByRole('option', { name: /서울/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /부산경남/ })).toBeInTheDocument();

    // Should not show cycle or boat tracks
    expect(screen.queryByRole('option', { name: /광명/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /미사리/ })).not.toBeInTheDocument();
  });

  it('shows cycle tracks when cycle type selected', () => {
    render(<TrackFilter selectedRaceTypes={['cycle']} />);

    expect(screen.getByRole('option', { name: /광명/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /창원/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /서울/ })).not.toBeInTheDocument();
  });

  it('shows boat tracks when boat type selected', () => {
    render(<TrackFilter selectedRaceTypes={['boat']} />);

    expect(screen.getByRole('option', { name: /미사리/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /서울/ })).not.toBeInTheDocument();
  });

  it('shows tracks from multiple types when multiple selected', () => {
    render(<TrackFilter selectedRaceTypes={['horse', 'cycle']} />);

    // Should show both horse and cycle tracks
    expect(screen.getByRole('option', { name: /서울/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /광명/ })).toBeInTheDocument();

    // Should not show boat tracks
    expect(screen.queryByRole('option', { name: /미사리/ })).not.toBeInTheDocument();
  });

  it('displays selected track value', () => {
    render(<TrackFilter selectedTrack="서울" />);
    const select = screen.getByRole('combobox', { name: /경기장/ });
    expect(select).toHaveValue('서울');
  });

  it('calls onChange when track is selected', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<TrackFilter onChange={handleChange} />);

    const select = screen.getByRole('combobox', { name: /경기장/ });
    await user.selectOptions(select, '서울');

    expect(handleChange).toHaveBeenCalledWith('서울');
  });

  it('has "전체" option to clear selection', () => {
    render(<TrackFilter />);
    expect(screen.getByRole('option', { name: /전체/ })).toBeInTheDocument();
  });

  it('calls onChange with undefined when "전체" selected', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<TrackFilter selectedTrack="서울" onChange={handleChange} />);

    const select = screen.getByRole('combobox', { name: /경기장/ });
    await user.selectOptions(select, '');

    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it('groups tracks by race type', () => {
    render(<TrackFilter />);

    // Should have optgroups
    expect(screen.getByRole('group', { name: /경마/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /경륜/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /경정/ })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TrackFilter className="custom-class" data-testid="track-filter" />);
    expect(screen.getByTestId('track-filter')).toHaveClass('custom-class');
  });

  it('clears selection when race type changes and track not in new types', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <TrackFilter
        selectedTrack="서울"
        selectedRaceTypes={['horse']}
        onChange={handleChange}
      />
    );

    // Change to cycle only - 서울 is not a cycle track
    rerender(
      <TrackFilter
        selectedTrack="서울"
        selectedRaceTypes={['cycle']}
        onChange={handleChange}
      />
    );

    // Should call onChange to clear the invalid track
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });
});
