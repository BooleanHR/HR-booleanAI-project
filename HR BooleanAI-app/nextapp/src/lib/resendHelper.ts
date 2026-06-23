/**
 * Resend 이메일 헬퍼 (11주차 구현)
 *
 * 비즈니스 파이프라인 자동화:
 * - REJECT 판정 시 지원자에게 보완 서류 재제출 링크 즉시 발송
 * - 기존 notifications.ts의 sendRejectionEmail을 MVP API와 연동하기 쉬운
 *   인터페이스로 래핑
 */

import { sendRejectionEmail } from '@/lib/verification/notifications';

export interface RejectEmailPayload {
  to: string;
  applicantName: string;
  documentType: string;
  reason: string;
  applicantId: string;
}

export interface RejectEmailResult {
  success: boolean;
  mockUsed: boolean;
  token: string;
  id?: string;
  error?: string;
}

/**
 * REJECT 판정 시 자동 이메일 발송
 * - 72시간 유효 보완 제출 링크 포함
 * - RESEND_API_KEY 미설정 시 Mock 로그 출력
 */
export async function sendRejectEmailViaResend(
  payload: RejectEmailPayload
): Promise<RejectEmailResult> {
  const docTypeNames: Record<string, string> = {
    TOEIC: 'TOEIC 성적표',
    OPIC: 'OPIc 성적표',
    QNET: '국가기술자격증 (Q-Net)',
    GRADUATION: '졸업증명서',
    CAREER: '경력증명서/재직증명서',
    INSURANCE_4: '건강보험 득실확인서 (4대보험)',
  };

  const docTypeName = docTypeNames[payload.documentType] ?? payload.documentType;

  const result = await sendRejectionEmail(
    payload.to,
    payload.applicantName,
    docTypeName,
    payload.reason
  );

  return result;
}

/**
 * ESCALATE 판정 시 관리자에게 수동 검토 알림 이메일 발송
 */
export async function sendEscalationNotification(payload: {
  applicantId: string;
  applicantName: string;
  documentType: string;
  reason: string;
}): Promise<void> {
  const adminEmail = process.env.NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn('[resendHelper] NOTIFICATION_EMAIL 미설정 - ESCALATE 알림 스킵');
    return;
  }

  const docTypeNames: Record<string, string> = {
    TOEIC: 'TOEIC 성적표',
    OPIC: 'OPIc 성적표',
    QNET: '국가기술자격증 (Q-Net)',
    GRADUATION: '졸업증명서',
    CAREER: '경력증명서/재직증명서',
    INSURANCE_4: '건강보험 득실확인서 (4대보험)',
  };

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@hrboolean.ai';

  if (!apiKey || apiKey.startsWith('your-')) {
    console.log('[MOCK ESCALATION EMAIL]', {
      to: adminEmail,
      applicantId: payload.applicantId,
      applicantName: payload.applicantName,
      reason: payload.reason,
    });
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `[HR BooleanAI] 수동 검토 필요: ${payload.applicantName} (${docTypeNames[payload.documentType] ?? payload.documentType})`,
    html: `
      <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #d97706; font-size: 18px; margin-top: 0;">⚠️ 수동 검토가 필요한 서류가 있습니다</h2>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #718096; width: 120px;">지원자 ID</td><td>${payload.applicantId}</td></tr>
          <tr><td style="padding: 6px 0; color: #718096;">지원자 성명</td><td>${payload.applicantName}</td></tr>
          <tr><td style="padding: 6px 0; color: #718096;">서류 유형</td><td>${docTypeNames[payload.documentType] ?? payload.documentType}</td></tr>
          <tr><td style="padding: 6px 0; color: #718096; vertical-align: top;">수동 검토 사유</td><td style="color: #d97706;">${payload.reason}</td></tr>
        </table>
        <div style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/dashboard" 
             style="background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            대시보드에서 확인하기
          </a>
        </div>
      </div>
    `,
  });
}
