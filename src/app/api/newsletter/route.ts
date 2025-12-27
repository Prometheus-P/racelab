import { NextRequest, NextResponse } from 'next/server';

// In production, integrate with email service (Mailchimp, ConvertKit, Resend, etc.)
// For now, we'll log and return success

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

    // TODO: Integrate with email service
    // Example: await mailchimp.lists.addListMember(listId, { email_address: email });

    // For now, log the subscription
    console.log(`[Newsletter] New subscription: ${email} (source: ${source})`);

    return NextResponse.json({
      success: true,
      message: '구독이 완료되었습니다! 곧 가이드를 보내드릴게요.',
    });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
