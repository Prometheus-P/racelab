// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend 무료 플랜: onboarding@resend.dev에서만 발송 가능
// 도메인 인증 후 커스텀 발신자 사용 가능
const FROM_EMAIL = 'RaceLab <onboarding@resend.dev>';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

// 환영 이메일 템플릿
export function getWelcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RaceLab 가입을 환영합니다!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
          🏇 RaceLab
        </h1>
        <p style="color: #a0a0a0; margin: 10px 0 0; font-size: 14px;">
          데이터 기반 경마/경륜/경정 분석 플랫폼
        </p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 22px;">
          구독해 주셔서 감사합니다! 🎉
        </h2>

        <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">
          안녕하세요! RaceLab 뉴스레터에 가입해 주셔서 감사합니다.
        </p>

        <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">
          곧 <strong>무료 전략 가이드 PDF</strong>를 보내드릴 예정입니다.
          그동안 RaceLab의 핵심 기능들을 체험해 보세요:
        </p>

        <!-- Feature List -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
              <strong style="color: #1a1a2e;">📊 백테스팅</strong>
              <p style="color: #666; margin: 5px 0 0; font-size: 14px;">
                과거 데이터로 전략 수익률을 검증하세요
              </p>
            </td>
          </tr>
          <tr><td style="height: 10px;"></td></tr>
          <tr>
            <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <strong style="color: #1a1a2e;">🎯 실시간 배당률</strong>
              <p style="color: #666; margin: 5px 0 0; font-size: 14px;">
                경마, 경륜, 경정의 실시간 정보를 확인하세요
              </p>
            </td>
          </tr>
          <tr><td style="height: 10px;"></td></tr>
          <tr>
            <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <strong style="color: #1a1a2e;">📈 성과 분석</strong>
              <p style="color: #666; margin: 5px 0 0; font-size: 14px;">
                14가지 지표로 전략을 평가하세요
              </p>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td style="text-align: center;">
              <a href="https://racelab.kr/dashboard"
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                무료로 전략 검증하기 →
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 20px 0 0; border-top: 1px solid #eee; padding-top: 20px;">
          이 이메일은 ${email} 주소로 발송되었습니다.<br>
          수신을 원하지 않으시면 이 이메일에 답장해 주세요.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">
          © 2024 RaceLab. All rights reserved.
        </p>
        <p style="color: #666; margin: 10px 0 0; font-size: 12px;">
          <a href="https://racelab.kr" style="color: #f59e0b; text-decoration: none;">racelab.kr</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getWelcomeEmailText(email: string): string {
  return `
RaceLab 구독을 환영합니다! 🎉

안녕하세요! RaceLab 뉴스레터에 가입해 주셔서 감사합니다.

곧 무료 전략 가이드 PDF를 보내드릴 예정입니다.
그동안 RaceLab의 핵심 기능들을 체험해 보세요:

📊 백테스팅 - 과거 데이터로 전략 수익률을 검증하세요
🎯 실시간 배당률 - 경마, 경륜, 경정의 실시간 정보를 확인하세요
📈 성과 분석 - 14가지 지표로 전략을 평가하세요

지금 바로 시작하기: https://racelab.kr/dashboard

---
이 이메일은 ${email} 주소로 발송되었습니다.
수신을 원하지 않으시면 이 이메일에 답장해 주세요.

© 2024 RaceLab - https://racelab.kr
  `.trim();
}
