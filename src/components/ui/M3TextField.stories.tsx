import type { Meta, StoryObj } from '@storybook/nextjs';
import { M3TextField } from './M3TextField';
import { Mail, Eye, Search } from 'lucide-react';

const meta: Meta<typeof M3TextField> = {
  title: 'UI/M3TextField',
  component: M3TextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Material Design 3 기반 텍스트 필드 컴포넌트.

### 특징
- 2가지 variants: filled, outlined
- 다양한 input types 지원
- Leading/Trailing 아이콘 지원
- 에러 상태 및 헬퍼 텍스트
- 접근성 최적화 (aria-invalid, aria-describedby)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: '텍스트 필드 스타일',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input 타입',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    required: {
      control: 'boolean',
      description: '필수 입력',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3TextField>;

// 기본
export const Default: Story = {
  args: {
    label: '이름',
    variant: 'filled',
    placeholder: '이름을 입력하세요',
  },
};

// Variants
export const Filled: Story = {
  args: {
    label: 'Filled TextField',
    variant: 'filled',
    placeholder: '입력하세요',
  },
};

export const Outlined: Story = {
  args: {
    label: 'Outlined TextField',
    variant: 'outlined',
    placeholder: '입력하세요',
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <M3TextField label="Filled" variant="filled" placeholder="Filled variant" />
      <M3TextField label="Outlined" variant="outlined" placeholder="Outlined variant" />
    </div>
  ),
};

// With Icons
export const WithLeadingIcon: Story = {
  args: {
    label: '이메일',
    variant: 'filled',
    type: 'email',
    placeholder: 'example@email.com',
    leadingIcon: <Mail size={20} />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    label: '비밀번호',
    variant: 'filled',
    type: 'password',
    placeholder: '비밀번호 입력',
    trailingIcon: <Eye size={20} />,
  },
};

// States
export const WithHelperText: Story = {
  args: {
    label: '사용자명',
    variant: 'filled',
    helperText: '영문, 숫자 조합 6-20자',
  },
};

export const WithError: Story = {
  args: {
    label: '이메일',
    variant: 'filled',
    value: 'invalid-email',
    error: '올바른 이메일 형식이 아닙니다',
  },
};

export const Required: Story = {
  args: {
    label: '필수 입력',
    variant: 'filled',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: '비활성화',
    variant: 'filled',
    value: '수정 불가',
    disabled: true,
  },
};

// Input Types
export const InputTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <M3TextField label="텍스트" type="text" variant="outlined" />
      <M3TextField label="이메일" type="email" variant="outlined" leadingIcon={<Mail size={18} />} />
      <M3TextField label="비밀번호" type="password" variant="outlined" />
      <M3TextField label="숫자" type="number" variant="outlined" />
      <M3TextField label="전화번호" type="tel" variant="outlined" placeholder="010-0000-0000" />
      <M3TextField label="검색" type="search" variant="outlined" leadingIcon={<Search size={18} />} />
    </div>
  ),
};

// Form Example
export const FormExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80 p-6 bg-surface rounded-lg">
      <h3 className="text-title-medium font-semibold">회원가입</h3>
      <M3TextField
        label="이름"
        variant="filled"
        required
      />
      <M3TextField
        label="이메일"
        variant="filled"
        type="email"
        required
        leadingIcon={<Mail size={18} />}
      />
      <M3TextField
        label="비밀번호"
        variant="filled"
        type="password"
        required
        helperText="8자 이상, 영문/숫자/특수문자 포함"
      />
    </div>
  ),
};
