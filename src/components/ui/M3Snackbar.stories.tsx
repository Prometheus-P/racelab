import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { M3Snackbar } from './M3Snackbar';
import { M3Button } from './M3Button';

const meta: Meta<typeof M3Snackbar> = {
  title: 'UI/M3Snackbar',
  component: M3Snackbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Material Design 3 기반 스낵바 컴포넌트.

### 특징
- 4가지 severity: info, success, warning, error
- 자동 숨김 (기본 4초)
- 상단/하단 위치 지정
- 액션 버튼 지원
- 접근성 최적화 (role="alert", aria-live)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: '스낵바 타입',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom'],
      description: '위치',
    },
    autoHideDuration: {
      control: { type: 'number', min: 0, max: 10000, step: 1000 },
      description: '자동 숨김 시간 (ms)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof M3Snackbar>;

// Interactive wrapper
const SnackbarWrapper = (props: Omit<React.ComponentProps<typeof M3Snackbar>, 'open' | 'onClose'>) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-[300px] flex items-center justify-center">
      <M3Button onClick={() => setOpen(true)}>스낵바 표시</M3Button>
      <M3Snackbar open={open} onClose={() => setOpen(false)} {...props} />
    </div>
  );
};

// 기본
export const Default: Story = {
  render: () => (
    <SnackbarWrapper message="기본 스낵바 메시지입니다." />
  ),
};

// Severity Variants
export const Info: Story = {
  render: () => (
    <SnackbarWrapper message="정보: 새로운 경주 정보가 업데이트되었습니다." severity="info" />
  ),
};

export const Success: Story = {
  render: () => (
    <SnackbarWrapper message="성공: 배팅이 완료되었습니다." severity="success" />
  ),
};

export const Warning: Story = {
  render: () => (
    <SnackbarWrapper message="경고: 배팅 마감 5분 전입니다." severity="warning" />
  ),
};

export const Error: Story = {
  render: () => (
    <SnackbarWrapper message="오류: 네트워크 연결을 확인해주세요." severity="error" />
  ),
};

// All Severities Demo
export const AllSeverities: Story = {
  render: () => {
    const [current, setCurrent] = useState<'info' | 'success' | 'warning' | 'error' | null>(null);
    return (
      <div className="h-[300px] flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <M3Button variant="tonal" onClick={() => setCurrent('info')}>Info</M3Button>
          <M3Button variant="tonal" className="bg-green-100" onClick={() => setCurrent('success')}>Success</M3Button>
          <M3Button variant="tonal" className="bg-amber-100" onClick={() => setCurrent('warning')}>Warning</M3Button>
          <M3Button variant="tonal" className="bg-red-100" onClick={() => setCurrent('error')}>Error</M3Button>
        </div>
        {current && (
          <M3Snackbar
            open={true}
            message={`${current.toUpperCase()}: 스낵바 메시지입니다.`}
            severity={current}
            onClose={() => setCurrent(null)}
          />
        )}
      </div>
    );
  },
};

// Position
export const TopPosition: Story = {
  render: () => (
    <SnackbarWrapper message="상단에 표시되는 스낵바입니다." position="top" />
  ),
};

export const BottomPosition: Story = {
  render: () => (
    <SnackbarWrapper message="하단에 표시되는 스낵바입니다." position="bottom" />
  ),
};

// With Action
export const WithAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="h-[300px] flex items-center justify-center">
        <M3Button onClick={() => setOpen(true)}>스낵바 표시</M3Button>
        <M3Snackbar
          open={open}
          message="항목이 삭제되었습니다."
          severity="info"
          onClose={() => setOpen(false)}
          action={
            <button
              className="text-primary-container font-medium hover:underline"
              onClick={() => {
                alert('실행 취소!');
                setOpen(false);
              }}
            >
              실행 취소
            </button>
          }
        />
      </div>
    );
  },
};

// Long Duration
export const LongDuration: Story = {
  render: () => (
    <SnackbarWrapper
      message="이 스낵바는 10초 후에 사라집니다."
      autoHideDuration={10000}
    />
  ),
};

// No Auto Hide
export const NoAutoHide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="h-[300px] flex items-center justify-center">
        <M3Button onClick={() => setOpen(true)}>스낵바 표시</M3Button>
        <M3Snackbar
          open={open}
          message="자동으로 사라지지 않습니다. 액션을 클릭하세요."
          severity="warning"
          autoHideDuration={0}
          onClose={() => setOpen(false)}
          action={
            <button
              className="font-medium hover:underline"
              onClick={() => setOpen(false)}
            >
              닫기
            </button>
          }
        />
      </div>
    );
  },
};

// Race Notifications
export const RaceNotifications: Story = {
  render: () => {
    const [notification, setNotification] = useState<{
      message: string;
      severity: 'info' | 'success' | 'warning' | 'error';
    } | null>(null);

    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
        <h3 className="text-title-medium font-semibold">경주 알림 시뮬레이션</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <M3Button
            variant="outlined"
            onClick={() => setNotification({
              message: '서울 3경주가 곧 시작됩니다.',
              severity: 'info',
            })}
          >
            경주 시작 알림
          </M3Button>
          <M3Button
            variant="outlined"
            onClick={() => setNotification({
              message: '배팅이 성공적으로 완료되었습니다.',
              severity: 'success',
            })}
          >
            배팅 완료
          </M3Button>
          <M3Button
            variant="outlined"
            onClick={() => setNotification({
              message: '배팅 마감까지 3분 남았습니다!',
              severity: 'warning',
            })}
          >
            마감 임박
          </M3Button>
          <M3Button
            variant="outlined"
            onClick={() => setNotification({
              message: '서버 연결이 끊어졌습니다.',
              severity: 'error',
            })}
          >
            연결 오류
          </M3Button>
        </div>
        {notification && (
          <M3Snackbar
            open={true}
            message={notification.message}
            severity={notification.severity}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    );
  },
};
