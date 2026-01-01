import type { Meta, StoryObj } from '@storybook/nextjs';
import { M3Card } from './M3Card';

const meta: Meta<typeof M3Card> = {
  title: 'UI/M3Card',
  component: M3Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Material Design 3 기반 카드 컴포넌트.

### 특징
- 3가지 variants: elevated, filled, outlined
- 6단계 elevation 지원 (0-5)
- 클릭 가능한 인터랙티브 모드
- density 옵션 (default, compact)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'filled', 'outlined'],
      description: '카드 스타일 variant',
    },
    elevation: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5],
      description: 'Elevation 레벨 (elevated variant에서만 적용)',
    },
    density: {
      control: 'select',
      options: ['default', 'compact'],
      description: '패딩 밀도',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3Card>;

// 기본 카드
export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-title-medium font-semibold">카드 제목</h3>
        <p className="text-body-medium text-neutral-text-secondary mt-2">
          카드 내용이 여기에 들어갑니다.
        </p>
      </div>
    ),
    variant: 'elevated',
    elevation: 1,
  },
};

// Variants
export const Elevated: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-title-medium font-semibold">Elevated Card</h3>
        <p className="text-body-medium text-neutral-text-secondary mt-2">
          그림자가 있는 카드입니다.
        </p>
      </div>
    ),
    variant: 'elevated',
    elevation: 2,
  },
};

export const Filled: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-title-medium font-semibold">Filled Card</h3>
        <p className="text-body-medium text-neutral-text-secondary mt-2">
          배경색이 채워진 카드입니다.
        </p>
      </div>
    ),
    variant: 'filled',
  },
};

export const Outlined: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-title-medium font-semibold">Outlined Card</h3>
        <p className="text-body-medium text-neutral-text-secondary mt-2">
          테두리가 있는 카드입니다.
        </p>
      </div>
    ),
    variant: 'outlined',
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <M3Card variant="elevated" elevation={2} className="w-48">
        <h4 className="font-semibold">Elevated</h4>
        <p className="text-sm text-gray-600">그림자</p>
      </M3Card>
      <M3Card variant="filled" className="w-48">
        <h4 className="font-semibold">Filled</h4>
        <p className="text-sm text-gray-600">배경색</p>
      </M3Card>
      <M3Card variant="outlined" className="w-48">
        <h4 className="font-semibold">Outlined</h4>
        <p className="text-sm text-gray-600">테두리</p>
      </M3Card>
    </div>
  ),
};

// Elevation Levels
export const ElevationLevels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {[0, 1, 2, 3, 4, 5].map((level) => (
        <M3Card key={level} variant="elevated" elevation={level as 0|1|2|3|4|5} className="w-32 text-center">
          <span className="text-title-large font-bold">{level}</span>
          <p className="text-label-small text-neutral-text-secondary">elevation</p>
        </M3Card>
      ))}
    </div>
  ),
};

// Interactive Card
export const Interactive: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-title-medium font-semibold">클릭 가능한 카드</h3>
        <p className="text-body-medium text-neutral-text-secondary mt-2">
          이 카드를 클릭해보세요.
        </p>
      </div>
    ),
    variant: 'elevated',
    elevation: 1,
    onClick: () => alert('카드 클릭!'),
  },
};

// Density
export const CompactDensity: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-title-medium font-semibold">Compact Card</h3>
        <p className="text-body-medium text-neutral-text-secondary">패딩이 작습니다.</p>
      </div>
    ),
    variant: 'outlined',
    density: 'compact',
  },
};

// Race Card Example
export const RaceInfoCard: Story = {
  render: () => (
    <M3Card variant="outlined" className="w-80">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center justify-center w-8 h-8 bg-horse text-white rounded-full text-sm font-bold">
          1
        </span>
        <div>
          <h3 className="text-title-medium font-semibold">서울 1경주</h3>
          <p className="text-label-medium text-neutral-text-secondary">14:00 출발</p>
        </div>
      </div>
      <div className="flex justify-between text-body-medium">
        <span>거리: 1200m</span>
        <span className="text-primary font-semibold">단승 2.3</span>
      </div>
    </M3Card>
  ),
};

// Data Card Example
export const DataCard: Story = {
  render: () => (
    <M3Card variant="elevated" elevation={1} className="w-64">
      <div className="text-center">
        <p className="text-label-large text-neutral-text-secondary">총 수익률</p>
        <p className="text-display-small font-bold text-semantic-positive mt-1">+23.5%</p>
        <p className="text-label-medium text-neutral-text-tertiary mt-2">최근 30일</p>
      </div>
    </M3Card>
  ),
};
