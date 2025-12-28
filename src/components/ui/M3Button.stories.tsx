import type { Meta, StoryObj } from '@storybook/nextjs';
import { M3Button } from './M3Button';
import { Heart, ArrowRight, Plus } from 'lucide-react';

const meta: Meta<typeof M3Button> = {
  title: 'UI/M3Button',
  component: M3Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Material Design 3 기반 버튼 컴포넌트.

### 특징
- 5가지 variants: filled, outlined, text, elevated, tonal
- 3가지 sizes: sm, md, lg
- 50-60대 사용자 최적화 (min 48px 터치 타겟)
- 아이콘 지원 (leading/trailing)
- 로딩 상태 지원
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text', 'elevated', 'tonal'],
      description: '버튼 스타일 variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '버튼 크기',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    loading: {
      control: 'boolean',
      description: '로딩 상태',
    },
    fullWidth: {
      control: 'boolean',
      description: '전체 너비 사용',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3Button>;

// 기본 버튼
export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'filled',
    size: 'md',
  },
};

// Variants
export const Filled: Story = {
  args: {
    children: 'Filled Button',
    variant: 'filled',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined Button',
    variant: 'outlined',
  },
};

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

export const Elevated: Story = {
  args: {
    children: 'Elevated Button',
    variant: 'elevated',
  },
};

export const Tonal: Story = {
  args: {
    children: 'Tonal Button',
    variant: 'tonal',
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <M3Button variant="filled">Filled</M3Button>
      <M3Button variant="outlined">Outlined</M3Button>
      <M3Button variant="text">Text</M3Button>
      <M3Button variant="elevated">Elevated</M3Button>
      <M3Button variant="tonal">Tonal</M3Button>
    </div>
  ),
};

// Sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <M3Button size="sm">Small</M3Button>
      <M3Button size="md">Medium</M3Button>
      <M3Button size="lg">Large</M3Button>
    </div>
  ),
};

// With Icons
export const WithLeadingIcon: Story = {
  args: {
    children: '좋아요',
    variant: 'filled',
    leadingIcon: <Heart size={18} />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    children: '다음',
    variant: 'filled',
    trailingIcon: <ArrowRight size={18} />,
  },
};

export const IconOnly: Story = {
  args: {
    children: <Plus size={20} />,
    variant: 'filled',
    iconOnly: true,
    'aria-label': '추가',
  },
};

// States
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'filled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    variant: 'filled',
    loading: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    variant: 'filled',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// Race Type Themed (using Tailwind classes)
export const RaceTypeButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">경주 타입별 버튼</h3>
      <div className="flex gap-4">
        <M3Button variant="filled" className="bg-horse text-white hover:bg-horse/90">
          경마
        </M3Button>
        <M3Button variant="filled" className="bg-cycle text-white hover:bg-cycle/90">
          경륜
        </M3Button>
        <M3Button variant="filled" className="bg-boat text-white hover:bg-boat/90">
          경정
        </M3Button>
      </div>
    </div>
  ),
};
