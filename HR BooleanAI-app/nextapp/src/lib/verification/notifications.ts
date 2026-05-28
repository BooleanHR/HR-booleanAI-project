import { Resend } from 'resend';
import crypto from 'crypto';

/**
 * 서류 진위 확인 결과 불일치(REJECT) 또는 보완이 필요한 경우 지원자에게 이메일을 발송합니다.
 */
export async function sendRejectionEmail(
  email: string,
  applicantName: string,
  docCategory: string,
  reason: string
): Promise<{ success: boolean; mockUsed: boolean; id?: string; error?: string; token: string }> {
  
  const token = crypto.randomBytes(16).toString('hex');
  const resubmitUrl = `https://verify.hrboolean.ai/resubmit/${token}`;
  
  const html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #e53e3e; font-size: 20px; border-bottom: 2px solid #e53e3e; padding-bottom: 12px; margin-top: 0;">
        [HR BooleanAI] 제출하신 증빙 서류에 대한 보완 요청
      </h2>
      <p style="font-size: 14px; color: #2d3748; line-height: 1.6;">
        안녕하세요, <strong>${applicantName}</strong> 지원자님.<br>
        귀하가 제출하신 입사지원 증빙 서류 중 일부 항목에서 불일치 사항 또는 보완이 필요한 부분이 발견되어 안내드립니다.
      </p>
      
      <div style="background-color: #f7fafc; border-left: 4px solid #cbd5e0; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="width: 100px; color: #718096; padding: 4px 0; font-weight: bold;">대상 서류</td>
            <td style="color: #2d3748; padding: 4px 0;">${docCategory}</td>
          </tr>
          <tr>
            <td style="color: #718096; padding: 4px 0; font-weight: bold; vertical-align: top;">보완 사유</td>
            <td style="color: #e53e3e; padding: 4px 0; line-height: 1.5;">${reason}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 14px; color: #2d3748; line-height: 1.6;">
        아래의 <strong>[증빙 서류 보완 제출]</strong> 버튼을 클릭하셔서 올바른 양식의 원본 증빙서류(PDF 또는 이미지)를 재업로드해 주시기 바랍니다.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resubmitUrl}" style="background-color: #3182ce; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(49, 130, 206, 0.25);">
          증빙 서류 보완 제출하기
        </a>
      </div>
      
      <div style="font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
        * 본 제출 링크는 발송일시 기준 <strong>72시간 동안만 유효</strong>합니다.<br>
        * 기한 내 보완되지 않을 경우 제출 서류 진위 확인 결과가 '미확인'으로 처리되어 채용 전형에 영향이 있을 수 있습니다.
      </div>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@hrboolean.ai';

  // 실제 API Key가 구성되지 않았거나 예시용 키인 경우 Mock 출력 처리
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your-')) {
    console.log('\n===== [MOCK EMAIL SENT] =====');
    console.log(`To: ${email}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: [HR BooleanAI] 제출하신 증빙 서류에 대한 보완 요청`);
    console.log('Body Preview (HTML):');
    console.log(html);
    console.log('=============================\n');
    
    return { success: true, mockUsed: true, token };
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[HR BooleanAI] 제출하신 증빙 서류에 대한 보완 요청`,
      html: html,
    });
    
    if (data.error) {
      console.error('[sendRejectionEmail] Resend API Error:', data.error);
      return { success: false, mockUsed: false, error: data.error.message || '이메일 발송에 실패했습니다.', token };
    }

    return { success: true, mockUsed: false, id: data.data?.id, token };
  } catch (err: any) {
    console.error('[sendRejectionEmail] Exception:', err);
    return { success: false, mockUsed: false, error: err.message || err, token };
  }
}
