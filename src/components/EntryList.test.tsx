// src/components/EntryList.test.tsx
import { render, screen } from '@testing-library/react';
import EntryList from './EntryList';

describe('EntryList', () => {
  const mockEntries = [
    { no: 1, name: '번개', jockey: '김철수', trainer: '이영희', age: 4, weight: 54, recentRecord: '1-2-3' },
    { no: 2, name: '태풍', jockey: '박민수', trainer: '최지현', age: 5, weight: 55, recentRecord: '4-5-6' },
  ];

  it('should render all entries', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('번개')).toBeInTheDocument();
    expect(screen.getByText('태풍')).toBeInTheDocument();
  });

  it('should display jockey name for each entry', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('박민수')).toBeInTheDocument();
  });

  it('should display trainer name for each entry', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('이영희')).toBeInTheDocument();
    expect(screen.getByText('최지현')).toBeInTheDocument();
  });

  it('should display entry number for each entry', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display empty state when no entries', () => {
    render(<EntryList entries={[]} />);

    expect(screen.getByText('출주마 정보가 없습니다')).toBeInTheDocument();
  });

  it('should display weight with kg unit', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('54kg')).toBeInTheDocument();
    expect(screen.getByText('55kg')).toBeInTheDocument();
  });

  it('should display recent record for each entry', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('1-2-3')).toBeInTheDocument();
    expect(screen.getByText('4-5-6')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<EntryList entries={mockEntries} />);

    expect(screen.getByText('번호')).toBeInTheDocument();
    expect(screen.getByText('마명/선수명')).toBeInTheDocument();
    expect(screen.getByText('기수')).toBeInTheDocument();
    expect(screen.getByText('조교사')).toBeInTheDocument();
  });

  it('should handle entries without optional fields', () => {
    const simpleEntries = [
      { no: 1, name: '선수1' },
      { no: 2, name: '선수2' },
    ];

    render(<EntryList entries={simpleEntries} />);

    expect(screen.getByText('선수1')).toBeInTheDocument();
    expect(screen.getByText('선수2')).toBeInTheDocument();
    // Optional columns should not be displayed
    expect(screen.queryByText('기수')).not.toBeInTheDocument();
    expect(screen.queryByText('조교사')).not.toBeInTheDocument();
  });

  describe('loading state', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<EntryList entries={[]} isLoading={true} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('출주마 정보가 없습니다')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when error is provided', () => {
      const error = new Error('데이터를 불러올 수 없습니다');
      render(<EntryList entries={[]} error={error} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('오류: 데이터를 불러올 수 없습니다')).toBeInTheDocument();
    });

    it('should not display entries when error is provided', () => {
      const error = new Error('Error');
      const entries = [{ no: 1, name: '번개' }];
      render(<EntryList entries={entries} error={error} />);

      expect(screen.queryByText('번개')).not.toBeInTheDocument();
    });
  });
});
