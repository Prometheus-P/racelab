import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { M3Dialog } from './M3Dialog';
import { M3Button } from './M3Button';

const meta: Meta<typeof M3Dialog> = {
  title: 'UI/M3Dialog',
  component: M3Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Material Design 3 기반 다이얼로그 컴포넌트.

### 특징
- 4가지 maxWidth: xs, sm, md, lg
- ESC 키 / 배경 클릭으로 닫기
- 접근성 최적화 (role="dialog", aria-modal)
- 애니메이션 효과 (fade-in, zoom-in)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: '최대 너비',
    },
    fullWidth: {
      control: 'boolean',
      description: '전체 너비 사용',
    },
    disableBackdropClose: {
      control: 'boolean',
      description: '배경 클릭 닫기 비활성화',
    },
    disableEscapeClose: {
      control: 'boolean',
      description: 'ESC 키 닫기 비활성화',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3Dialog>;

// Interactive wrapper for stories
const DialogWrapper = ({
  children,
  ...props
}: Omit<React.ComponentProps<typeof M3Dialog>, 'open' | 'onClose'>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <M3Button onClick={() => setOpen(true)}>다이얼로그 열기</M3Button>
      <M3Dialog open={open} onClose={() => setOpen(false)} {...props}>
        {children}
      </M3Dialog>
    </>
  );
};

// 기본
export const Default: Story = {
  render: () => (
    <DialogWrapper title="기본 다이얼로그">
      <p>다이얼로그 내용입니다. 배경을 클릭하거나 ESC 키를 눌러 닫을 수 있습니다.</p>
    </DialogWrapper>
  ),
};

// With Actions
export const WithActions: Story = {
  render: () => (
    <DialogWrapper
      title="작업 확인"
      actions={
        <>
          <M3Button variant="text">취소</M3Button>
          <M3Button variant="filled">확인</M3Button>
        </>
      }
    >
      <p>이 작업을 진행하시겠습니까?</p>
    </DialogWrapper>
  ),
};

// Max Width Variants
export const MaxWidthVariants: Story = {
  render: () => {
    const [openXs, setOpenXs] = useState(false);
    const [openSm, setOpenSm] = useState(false);
    const [openMd, setOpenMd] = useState(false);
    const [openLg, setOpenLg] = useState(false);

    return (
      <div className="flex gap-2">
        <M3Button variant="outlined" onClick={() => setOpenXs(true)}>XS</M3Button>
        <M3Button variant="outlined" onClick={() => setOpenSm(true)}>SM</M3Button>
        <M3Button variant="outlined" onClick={() => setOpenMd(true)}>MD</M3Button>
        <M3Button variant="outlined" onClick={() => setOpenLg(true)}>LG</M3Button>

        <M3Dialog open={openXs} onClose={() => setOpenXs(false)} title="XS Dialog" maxWidth="xs">
          <p>max-width: xs (320px)</p>
        </M3Dialog>
        <M3Dialog open={openSm} onClose={() => setOpenSm(false)} title="SM Dialog" maxWidth="sm">
          <p>max-width: sm (384px)</p>
        </M3Dialog>
        <M3Dialog open={openMd} onClose={() => setOpenMd(false)} title="MD Dialog" maxWidth="md">
          <p>max-width: md (448px)</p>
        </M3Dialog>
        <M3Dialog open={openLg} onClose={() => setOpenLg(false)} title="LG Dialog" maxWidth="lg">
          <p>max-width: lg (512px)</p>
        </M3Dialog>
      </div>
    );
  },
};

// Disable Close Options
export const DisableCloseOptions: Story = {
  render: () => (
    <DialogWrapper
      title="닫기 비활성화"
      disableBackdropClose
      disableEscapeClose
      actions={
        <M3Button variant="filled">확인</M3Button>
      }
    >
      <p>배경 클릭과 ESC 키로 닫을 수 없습니다.</p>
      <p>반드시 확인 버튼을 클릭해야 합니다.</p>
    </DialogWrapper>
  ),
};

// Delete Confirmation
export const DeleteConfirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <M3Button variant="filled" className="bg-semantic-negative" onClick={() => setOpen(true)}>
          삭제
        </M3Button>
        <M3Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="삭제 확인"
          actions={
            <>
              <M3Button variant="text" onClick={() => setOpen(false)}>취소</M3Button>
              <M3Button
                variant="filled"
                className="bg-semantic-negative"
                onClick={() => {
                  alert('삭제되었습니다.');
                  setOpen(false);
                }}
              >
                삭제
              </M3Button>
            </>
          }
        >
          <p>정말 삭제하시겠습니까?</p>
          <p className="mt-2 text-semantic-negative">이 작업은 되돌릴 수 없습니다.</p>
        </M3Dialog>
      </>
    );
  },
};

// Race Info Dialog
export const RaceInfoDialog: Story = {
  render: () => (
    <DialogWrapper
      title="서울 1경주 상세정보"
      maxWidth="md"
      actions={
        <>
          <M3Button variant="text">닫기</M3Button>
          <M3Button variant="filled">배팅하기</M3Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">거리</span>
          <span className="font-semibold">1200m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">출발시간</span>
          <span className="font-semibold">14:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">참가마</span>
          <span className="font-semibold">12두</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">단승 배당</span>
          <span className="font-semibold text-semantic-positive">2.3</span>
        </div>
      </div>
    </DialogWrapper>
  ),
};

// Form Dialog
export const FormDialog: Story = {
  render: () => (
    <DialogWrapper
      title="설정"
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <M3Button variant="text">취소</M3Button>
          <M3Button variant="filled">저장</M3Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-label-medium text-on-surface-variant mb-1">알림 설정</label>
          <select className="w-full rounded-lg border border-outline p-3">
            <option>모든 알림</option>
            <option>중요 알림만</option>
            <option>알림 끄기</option>
          </select>
        </div>
        <div>
          <label className="block text-label-medium text-on-surface-variant mb-1">표시 언어</label>
          <select className="w-full rounded-lg border border-outline p-3">
            <option>한국어</option>
            <option>English</option>
          </select>
        </div>
      </div>
    </DialogWrapper>
  ),
};
