---
name: Feature Task
title: "[Feature] FR-033: Resend API 이메일 클라이언트 정의"
labels: 'feature, mock-external, priority:medium'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-007
---

## :dart: Summary
- **기능명:** [FR-033] Resend API 이메일 발송 클라이언트
- **Epic:** Mock/External
- **목적:** Resend API를 사용하여 이메일을 발송하는 클라이언트를 구현한다. 카카오 알림톡 대체용 (SRS §1.2).

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/resend.ts` 파일 생성
  ```typescript
  import { Resend } from 'resend';

  const resend = new Resend(process.env.RESEND_API_KEY);

  export async function sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await resend.emails.send({
        from: 'HR AI 검증 <noreply@yourdomain.com>',
        to,
        subject,
        html,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, messageId: data?.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
  ```
- [ ] **TB-2:** `RESEND_API_KEY` 환경변수 확인 (.env.local)

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** `sendEmail('test@test.com', '제목', '<p>내용</p>')` 호출 → success/error 반환

## :construction: Dependencies & Blockers
- **Depends on:** FR-006 (A-006: resend 패키지)
- **Blocks:** L-004 (선택 발송)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-007 | SRS: v1.1*
