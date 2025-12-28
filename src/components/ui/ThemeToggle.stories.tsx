import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeToggle } from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
다크 모드 토글 컴포넌트.

### 특징
- 라이트/다크/시스템 3가지 모드 지원
- 시스템 설정 자동 감지 (prefers-color-scheme)
- localStorage 저장으로 설정 유지
- 최소 48px 터치 타겟 (접근성)
- 부드러운 전환 애니메이션

### 사용법
\`\`\`tsx
// 기본 사용 (3가지 모드 순환)
<ThemeToggle />

// 라이트/다크만 토글
<ThemeToggle showSystem={false} />
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showSystem: {
      control: 'boolean',
      description: '시스템 설정 옵션 표시 여부',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-4 rounded-rl-lg border border-[var(--rl-border)] bg-[var(--rl-surface)]">
        <Story />
        <span className="text-body-medium text-[var(--rl-text-secondary)]">
          클릭하여 테마 변경
        </span>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

// 기본 (3가지 모드)
export const Default: Story = {
  args: {
    showSystem: true,
  },
};

// 라이트/다크만
export const SimpleTwoWay: Story = {
  args: {
    showSystem: false,
  },
};

// 다크 배경에서
export const OnDarkBackground: Story = {
  args: {
    showSystem: true,
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-6 rounded-rl-lg bg-[#121212]">
        <Story />
        <span className="text-body-medium text-[#a1a1aa]">다크 배경에서의 토글</span>
      </div>
    ),
  ],
};

// 헤더 내 배치 예시
export const InHeader: Story = {
  args: {
    showSystem: true,
  },
  decorators: [
    (Story) => (
      <header className="flex items-center justify-between w-full max-w-md p-4 rounded-rl-lg border border-[var(--rl-border)] bg-[var(--rl-surface)]">
        <span className="text-title-medium font-semibold text-[var(--rl-text-primary)]">
          RaceLab
        </span>
        <Story />
      </header>
    ),
  ],
};
