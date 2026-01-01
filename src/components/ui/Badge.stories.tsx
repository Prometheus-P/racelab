import type { Meta, StoryObj } from '@storybook/nextjs';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
상태 표시용 Badge 컴포넌트.

### 특징
- 3가지 variants: default, secondary, destructive
- 경주 상태, 결과 표시에 사용
- 작은 크기로 라벨링에 적합
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive'],
      description: 'Badge 스타일',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// 기본
export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Success',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Error',
    variant: 'destructive',
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

// Race Status Badges
export const RaceStatus: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">경주 상태 Badge</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">진행중</Badge>
        <Badge variant="default">대기중</Badge>
        <Badge variant="destructive">취소</Badge>
      </div>
    </div>
  ),
};

// Result Badges
export const ResultBadges: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">결과 Badge</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">1착</Badge>
        <Badge variant="default">2착</Badge>
        <Badge variant="default">3착</Badge>
        <Badge variant="destructive">실격</Badge>
      </div>
    </div>
  ),
};

// With Icons
export const WithContent: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="secondary">
        <span className="mr-1">●</span> Live
      </Badge>
      <Badge variant="default">
        NEW
      </Badge>
      <Badge variant="destructive">
        -15%
      </Badge>
    </div>
  ),
};
