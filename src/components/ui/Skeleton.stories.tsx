import type { Meta, StoryObj } from '@storybook/nextjs';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
로딩 상태를 표시하는 스켈레톤 컴포넌트.

### 특징
- 3가지 variants: text, circular, rectangular
- 애니메이션 shimmer 효과
- 복합 컴포넌트: Skeleton.Text, Skeleton.Avatar, Skeleton.Card
- 접근성 최적화 (role="status", aria-busy)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: '스켈레톤 타입',
    },
    animation: {
      control: 'boolean',
      description: '애니메이션 활성화',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// 기본
export const Default: Story = {
  args: {
    variant: 'text',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// Variants
export const Text: Story = {
  args: {
    variant: 'text',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 48,
    height: 48,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100,
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <div>
        <h3 className="text-label-large font-medium text-neutral-text-secondary mb-2">Text</h3>
        <Skeleton variant="text" />
      </div>
      <div>
        <h3 className="text-label-large font-medium text-neutral-text-secondary mb-2">Circular</h3>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <div>
        <h3 className="text-label-large font-medium text-neutral-text-secondary mb-2">Rectangular</h3>
        <Skeleton variant="rectangular" height={80} />
      </div>
    </div>
  ),
};

// Compound Components
export const TextLines: Story = {
  render: () => (
    <div className="w-80">
      <h3 className="text-label-large font-medium text-neutral-text-secondary mb-2">여러 줄 텍스트</h3>
      <Skeleton.Text lines={3} />
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Skeleton.Avatar size={32} />
      <Skeleton.Avatar size={48} />
      <Skeleton.Avatar size={64} />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="w-80">
      <Skeleton.Card />
    </div>
  ),
};

// Custom Sizes
export const CustomSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={16} width="75%" />
      <Skeleton variant="text" height={12} width="50%" />
    </div>
  ),
};

// No Animation
export const NoAnimation: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">애니메이션 없음</h3>
      <Skeleton variant="text" animation={false} />
      <Skeleton variant="rectangular" height={80} animation={false} />
    </div>
  ),
};

// Profile Card Skeleton
export const ProfileCardSkeleton: Story = {
  render: () => (
    <div className="w-80 p-4 border border-outline rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton.Avatar size={56} />
        <div className="flex-1">
          <Skeleton variant="text" height={20} width="60%" className="mb-2" />
          <Skeleton variant="text" height={14} width="40%" />
        </div>
      </div>
      <Skeleton.Text lines={2} />
    </div>
  ),
};

// Race Card Skeleton
export const RaceCardSkeleton: Story = {
  render: () => (
    <div className="w-80 p-4 border border-outline rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="flex-1">
          <Skeleton variant="text" height={18} width="50%" className="mb-1" />
          <Skeleton variant="text" height={14} width="30%" />
        </div>
      </div>
      <div className="flex justify-between mb-2">
        <Skeleton variant="text" height={14} width="40%" />
        <Skeleton variant="text" height={14} width="20%" />
      </div>
      <div className="flex justify-between">
        <Skeleton variant="text" height={14} width="35%" />
        <Skeleton variant="text" height={14} width="25%" />
      </div>
    </div>
  ),
};

// Data Table Skeleton
export const DataTableSkeleton: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-surface-dim rounded-t-lg">
        <Skeleton variant="text" height={16} width="20%" />
        <Skeleton variant="text" height={16} width="30%" />
        <Skeleton variant="text" height={16} width="25%" />
        <Skeleton variant="text" height={16} width="15%" />
      </div>
      {/* Rows */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`flex gap-4 p-3 ${i % 2 === 0 ? 'bg-white' : 'bg-surface-dim'}`}
        >
          <Skeleton variant="text" height={14} width="20%" />
          <Skeleton variant="text" height={14} width="30%" />
          <Skeleton variant="text" height={14} width="25%" />
          <Skeleton variant="text" height={14} width="15%" />
        </div>
      ))}
    </div>
  ),
};

// Multiple Cards
export const MultipleCards: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="w-64">
        <Skeleton.Card />
      </div>
      <div className="w-64">
        <Skeleton.Card />
      </div>
      <div className="w-64">
        <Skeleton.Card />
      </div>
    </div>
  ),
};
