import type { Meta, StoryObj } from '@storybook/nextjs';
import { M3Chip } from './M3Chip';
import { Check, Star } from 'lucide-react';

const meta: Meta<typeof M3Chip> = {
  title: 'UI/M3Chip',
  component: M3Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Material Design 3 기반 Chip 컴포넌트.

### 특징
- 4가지 colorVariants: default, horse, cycle, boat
- 선택/비선택 상태 지원
- 경주 타입별 시맨틱 컬러 적용
- 최소 48px 터치 타겟 보장
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    colorVariant: {
      control: 'select',
      options: ['default', 'horse', 'cycle', 'boat'],
      description: '칩 색상 variant',
    },
    selected: {
      control: 'boolean',
      description: '선택 상태',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3Chip>;

// 기본
export const Default: Story = {
  args: {
    label: 'Chip',
    colorVariant: 'default',
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    label: 'Selected',
    colorVariant: 'default',
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    colorVariant: 'default',
    disabled: true,
  },
};

// Color Variants
export const AllColorVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">Unselected</h3>
      <div className="flex gap-2">
        <M3Chip label="Default" colorVariant="default" />
        <M3Chip label="경마" colorVariant="horse" />
        <M3Chip label="경륜" colorVariant="cycle" />
        <M3Chip label="경정" colorVariant="boat" />
      </div>
      <h3 className="text-label-large font-medium text-neutral-text-secondary mt-4">Selected</h3>
      <div className="flex gap-2">
        <M3Chip label="Default" colorVariant="default" selected />
        <M3Chip label="경마" colorVariant="horse" selected />
        <M3Chip label="경륜" colorVariant="cycle" selected />
        <M3Chip label="경정" colorVariant="boat" selected />
      </div>
    </div>
  ),
};

// With Leading Icon
export const WithIcon: Story = {
  args: {
    label: 'Favorite',
    colorVariant: 'default',
    selected: true,
    leadingIcon: <Check size={16} />,
  },
};

// Race Type Filter
export const RaceTypeFilter: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">경주 타입 필터</h3>
      <div className="flex flex-wrap gap-2">
        <M3Chip label="전체" colorVariant="default" selected />
        <M3Chip label="경마" colorVariant="horse" leadingIcon={<Star size={14} />} />
        <M3Chip label="경륜" colorVariant="cycle" />
        <M3Chip label="경정" colorVariant="boat" />
      </div>
    </div>
  ),
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-label-large font-medium text-neutral-text-secondary">클릭해서 선택</h3>
        <div className="flex gap-2">
          <M3Chip
            label="서울"
            colorVariant="horse"
            onClick={() => alert('서울 선택!')}
          />
          <M3Chip
            label="부산"
            colorVariant="horse"
            onClick={() => alert('부산 선택!')}
          />
          <M3Chip
            label="제주"
            colorVariant="horse"
            onClick={() => alert('제주 선택!')}
          />
        </div>
      </div>
    );
  },
};
