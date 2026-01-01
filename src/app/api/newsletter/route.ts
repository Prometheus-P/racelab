import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getWelcomeEmailHtml, getWelcomeEmailText } from '@/lib/email';

interface NewsletterRequest {
  email: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterRequest = await request.json();
    const { email, source = 'lead-magnet' } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Log subscription
    console.log(`[Newsletter] New subscription: ${email} (source: ${source})`);

    // Send welcome email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: '🏇 RaceLab 가입을 환영합니다! 무료 전략 가이드가 곧 도착합니다',
      html: getWelcomeEmailHtml(email),
      text: getWelcomeEmailText(email),
    });

    if (!emailResult.success) {
      console.error('[Newsletter] Failed to send welcome email:', emailResult.error);
      // Still return success to user - email sending failure shouldn't block subscription
    }

    return NextResponse.json({
      success: true,
      message: '구독이 완료되었습니다! 가이드를 이메일로 보내드렸어요.',
    });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
