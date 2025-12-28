import type { Meta, StoryObj } from '@storybook/nextjs';
import DataTable from './DataTable';
import Badge from './Badge';

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
데이터 테이블 컴포넌트.

### 특징
- 고대비, Zebra Stripes
- 숫자 컬럼 우측 정렬 + tabular-nums
- 최소 48px 행 높이 (터치 타겟)
- 커스텀 렌더러 지원
- 행 클릭 핸들러
- 로딩 상태 스켈레톤
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: '로딩 상태',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// Sample data types
interface RaceEntry {
  id: number;
  rank: number;
  horseName: string;
  jockey: string;
  odds: number;
  status: 'win' | 'place' | 'show' | 'none';
}

interface RaceResult {
  race: string;
  winner: string;
  time: string;
  payout: number;
}

// Sample data
const raceEntries: RaceEntry[] = [
  { id: 1, rank: 1, horseName: '천하무적', jockey: '김기수', odds: 2.3, status: 'win' },
  { id: 2, rank: 2, horseName: '질풍노도', jockey: '이철수', odds: 4.5, status: 'place' },
  { id: 3, rank: 3, horseName: '번개호', jockey: '박영희', odds: 6.8, status: 'show' },
  { id: 4, rank: 4, horseName: '청풍명월', jockey: '최민수', odds: 12.5, status: 'none' },
  { id: 5, rank: 5, horseName: '태양의후예', jockey: '정대현', odds: 15.2, status: 'none' },
];

const raceResults: RaceResult[] = [
  { race: '서울 1경주', winner: '천하무적', time: '1:24.5', payout: 4600 },
  { race: '서울 2경주', winner: '질풍노도', time: '1:26.2', payout: 9200 },
  { race: '부산 1경주', winner: '번개호', time: '1:23.8', payout: 13600 },
  { race: '부산 2경주', winner: '청풍명월', time: '1:25.1', payout: 25000 },
];

// 기본
export const Default: Story = {
  args: {
    data: raceEntries,
    columns: [
      { key: 'rank', header: '순위', numeric: true, width: 'w-16' },
      { key: 'horseName', header: '마명' },
      { key: 'jockey', header: '기수' },
      { key: 'odds', header: '배당률', numeric: true },
    ],
    ariaLabel: '경주 출전마 목록',
  },
};

// With Custom Render
export const WithCustomRender: Story = {
  args: {
    data: raceEntries,
    columns: [
      { key: 'rank', header: '순위', numeric: true, width: 'w-16' },
      { key: 'horseName', header: '마명' },
      { key: 'jockey', header: '기수' },
      { key: 'odds', header: '배당률', numeric: true },
      {
        key: 'status',
        header: '결과',
        align: 'center',
        render: (value) => {
          if (value === 'win') return <Badge variant="secondary">1착</Badge>;
          if (value === 'place') return <Badge variant="default">2착</Badge>;
          if (value === 'show') return <Badge variant="default">3착</Badge>;
          return <span className="text-neutral-text-tertiary">-</span>;
        },
      },
    ],
  },
};

// Race Results Table
export const RaceResultsTable: Story = {
  args: {
    data: raceResults,
    columns: [
      { key: 'race', header: '경주', width: 'w-32' },
      { key: 'winner', header: '우승마' },
      { key: 'time', header: '기록', align: 'center' },
      {
        key: 'payout',
        header: '배당금',
        numeric: true,
        render: (value) => (
          <span className="text-semantic-positive font-bold">
            {(value as number).toLocaleString()}원
          </span>
        ),
      },
    ],
    ariaLabel: '경주 결과',
  },
};

// Empty State
export const EmptyState: Story = {
  args: {
    data: [],
    columns: [
      { key: 'rank', header: '순위' },
      { key: 'horseName', header: '마명' },
      { key: 'jockey', header: '기수' },
    ],
    emptyMessage: '등록된 출전마가 없습니다.',
  },
};

// Loading State
export const Loading: Story = {
  args: {
    data: [],
    columns: [
      { key: 'rank', header: '순위' },
      { key: 'horseName', header: '마명' },
      { key: 'jockey', header: '기수' },
    ],
    loading: true,
  },
};

// Clickable Rows
export const ClickableRows: Story = {
  args: {
    data: raceEntries,
    columns: [
      { key: 'rank', header: '순위', numeric: true, width: 'w-16' },
      { key: 'horseName', header: '마명' },
      { key: 'jockey', header: '기수' },
      { key: 'odds', header: '배당률', numeric: true },
    ],
    onRowClick: (row) => alert(`${row.horseName} 선택!`),
  },
};

// Odds Comparison Table
export const OddsComparisonTable: Story = {
  render: () => {
    const oddsData = [
      { horse: '천하무적', win: 2.3, place: 1.5, show: 1.2 },
      { horse: '질풍노도', win: 4.5, place: 2.1, show: 1.6 },
      { horse: '번개호', win: 6.8, place: 3.2, show: 2.1 },
      { horse: '청풍명월', win: 12.5, place: 5.4, show: 3.5 },
    ];

    return (
      <DataTable
        data={oddsData}
        columns={[
          { key: 'horse', header: '마명', width: 'w-40' },
          {
            key: 'win',
            header: '단승',
            numeric: true,
            render: (v) => <span className="text-horse">{v as number}</span>,
          },
          {
            key: 'place',
            header: '연승',
            numeric: true,
            render: (v) => <span className="text-cycle">{v as number}</span>,
          },
          {
            key: 'show',
            header: '복승',
            numeric: true,
            render: (v) => <span className="text-boat">{v as number}</span>,
          },
        ]}
        ariaLabel="배당률 비교"
      />
    );
  },
};

// Full Featured Table
export const FullFeatured: Story = {
  render: () => {
    const fullData = [
      { no: 1, horse: '천하무적', weight: 57, jockey: '김기수', trainer: '박훈련', record: '5-2-1', odds: 2.3 },
      { no: 2, horse: '질풍노도', weight: 56, jockey: '이철수', trainer: '최훈련', record: '4-3-2', odds: 4.5 },
      { no: 3, horse: '번개호', weight: 55, jockey: '박영희', trainer: '정훈련', record: '3-2-3', odds: 6.8 },
      { no: 4, horse: '청풍명월', weight: 54, jockey: '최민수', trainer: '김훈련', record: '2-1-4', odds: 12.5 },
      { no: 5, horse: '태양의후예', weight: 53, jockey: '정대현', trainer: '이훈련', record: '1-2-2', odds: 15.2 },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-title-medium font-semibold">서울 1경주 출전마</h3>
        <DataTable
          data={fullData}
          columns={[
            { key: 'no', header: '번호', numeric: true, width: 'w-16' },
            { key: 'horse', header: '마명', width: 'w-32' },
            { key: 'weight', header: '부담중량', numeric: true, width: 'w-24' },
            { key: 'jockey', header: '기수', width: 'w-24' },
            { key: 'trainer', header: '조교사', width: 'w-24' },
            { key: 'record', header: '최근전적', align: 'center', width: 'w-24' },
            {
              key: 'odds',
              header: '배당률',
              numeric: true,
              width: 'w-24',
              render: (v) => (
                <span className={`font-bold ${(v as number) < 5 ? 'text-semantic-positive' : ''}`}>
                  {v as number}
                </span>
              ),
            },
          ]}
          ariaLabel="서울 1경주 출전마 상세 정보"
          onRowClick={(row) => console.log('Selected:', row)}
        />
      </div>
    );
  },
};
