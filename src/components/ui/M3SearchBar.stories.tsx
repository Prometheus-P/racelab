import type { Meta, StoryObj } from '@storybook/nextjs';
import { M3SearchBar } from './M3SearchBar';

const meta: Meta<typeof M3SearchBar> = {
  title: 'UI/M3SearchBar',
  component: M3SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Material Design 3 기반 검색 바 컴포넌트.

### 특징
- 디바운스 검색 지원 (기본 300ms)
- 클리어 버튼 내장
- Enter 키로 즉시 검색
- 최소 48px 터치 타겟 보장
- Controlled/Uncontrolled 모드 지원
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    debounceMs: {
      control: { type: 'number', min: 0, max: 1000, step: 100 },
      description: '디바운스 시간 (ms)',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3SearchBar>;

// 기본
export const Default: Story = {
  args: {
    placeholder: '검색...',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// With Default Value
export const WithDefaultValue: Story = {
  args: {
    defaultValue: '서울 경마',
    placeholder: '검색...',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// Custom Placeholder
export const CustomPlaceholder: Story = {
  args: {
    placeholder: '경주마 이름, 기수명 검색',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

// Disabled
export const Disabled: Story = {
  args: {
    placeholder: '검색 비활성화',
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// With Debounce
export const WithDebounce: Story = {
  args: {
    placeholder: '입력 후 500ms 대기...',
    debounceMs: 500,
    onSearch: (value) => console.log('Search:', value),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// Interactive Example
export const Interactive: Story = {
  render: () => (
    <div className="w-96 flex flex-col gap-4">
      <h3 className="text-label-large font-medium text-neutral-text-secondary">
        검색어를 입력하세요 (콘솔에서 결과 확인)
      </h3>
      <M3SearchBar
        placeholder="경주 정보 검색..."
        onSearch={(value) => console.log('검색:', value)}
        onChange={(value) => console.log('입력:', value)}
      />
    </div>
  ),
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-xl">
      <M3SearchBar
        placeholder="전체 너비 검색..."
      />
    </div>
  ),
};

// In Header Context
export const InHeaderContext: Story = {
  render: () => (
    <div className="w-full max-w-2xl bg-surface p-4 rounded-lg shadow">
      <div className="flex items-center gap-4">
        <span className="text-title-medium font-semibold whitespace-nowrap">RaceLab</span>
        <M3SearchBar
          placeholder="경주, 기수, 마필 검색..."
          className="flex-1"
        />
      </div>
    </div>
  ),
};

// Search Filter Example
export const SearchFilterExample: Story = {
  render: () => (
    <div className="w-full max-w-md flex flex-col gap-4 p-4 bg-surface-container rounded-lg">
      <h3 className="text-title-medium font-semibold">검색 필터</h3>
      <M3SearchBar
        placeholder="경주마 이름..."
        onSearch={(value) => alert(`검색: ${value}`)}
      />
      <div className="flex gap-2 text-label-medium text-neutral-text-secondary">
        <span>최근 검색:</span>
        <button className="text-primary hover:underline">서울 1경주</button>
        <button className="text-primary hover:underline">부산 경정</button>
      </div>
    </div>
  ),
};
