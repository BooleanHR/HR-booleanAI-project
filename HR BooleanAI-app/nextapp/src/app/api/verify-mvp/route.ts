/**
 * MVP 비즈니스 파이프라인 API 라우터 (11주차 구현)
 * POST /api/verify-mvp
 *
 * 파이프라인:
 * 1. Claude 에이전트 멀티모달 진위확인 루프 실행
 * 2. Prisma DB 상태 동기화 (VerificationJob + Applicant)
 * 3. REJECT → Resend API로 보완 이메일 자동 발송
 *    ESCALATE → 관리자 알림 + 대시보드 ESCALATE 배너 표시
 *
 * ⚠️ 메모 코드 교정:
 *   - agentResult.choices[0].message.content (OpenAI형) → ClaudeReviewResult 인터페이스 사용
 *   - prisma.applicant.update({ verificationStatus, reviewedAt, errorMessage })
 *     → 실제 스키마 필드(status, rejectReason)로 교정
 *   - 별도의 VerificationJob 레코드에 Claude 판정 결과 적재
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWithClaudeOrFallback, mockClaudeVerify } from '@/lib/ai/claudeReviewerAgent';
import { prisma } from '@/lib/db';
import { sendRejectEmailViaResend, sendEscalationNotification } from '@/lib/resendHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicantId,
      documentType,
      originalDocumentBase64,
      rpaScreenshotBase64,
      insuranceHistoryJson,
      verificationJobId, // 기존 VerificationJob ID (있으면 업데이트, 없으면 신규 생성)
    } = body;

    // 입력 검증
    if (!applicantId || !documentType) {
      return NextResponse.json(
        { success: false, error: 'applicantId, documentType은 필수입니다.' },
        { status: 400 }
      );
    }

    // 지원자 정보 조회
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: '지원자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // ── 1. Claude 에이전틱 검증 루프 실행 ──
    const isMockMode =
      !process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY.startsWith('your-');

    const agentResult = isMockMode
      ? mockClaudeVerify({
          applicantId,
          documentType,
          applicantName: applicant.name,
          applicantBirthDate: applicant.birthDate,
          originalDocumentBase64: originalDocumentBase64 ?? '',
          rpaScreenshotBase64,
          insuranceHistoryJson,
          applicationData: {},
        })
      : await verifyWithClaudeOrFallback({
          applicantId,
          documentType,
          applicantName: applicant.name,
          applicantBirthDate: applicant.birthDate,
          originalDocumentBase64: originalDocumentBase64 ?? '',
          rpaScreenshotBase64,
          insuranceHistoryJson,
          applicationData: {},
        });

    const { verdict, score, reason, discrepancies, usedFallback, toolCallTriggered } = agentResult;

    // ── 2. VerificationJob DB 동기화 ──
    const verificationJobData = {
      applicantId,
      documentType,
      siteCode: 'CLAUDE_MVP',
      claudeVerdict: verdict,
      claudeScore: score,
      claudeReason: reason,
      finalVerdict: verdict,
      discrepancies: JSON.stringify(discrepancies),
      mockUsed: isMockMode || usedFallback,
      status: verdict === 'ESCALATE' ? 'MANUAL' : 'COMPLETED',
      completedAt: new Date(),
    };

    let verificationJob;
    if (verificationJobId) {
      verificationJob = await prisma.verificationJob.update({
        where: { id: verificationJobId },
        data: verificationJobData,
      });
    } else {
      verificationJob = await prisma.verificationJob.create({
        data: {
          ...verificationJobData,
          startedAt: new Date(),
        },
      });
    }

    // Applicant 상태 동기화
    const applicantStatus =
      verdict === 'APPROVE'
        ? 'COMPLETED'
        : verdict === 'REJECT'
          ? 'COMPLETED'
          : 'ESCALATE'; // ESCALATE → 수동검토 상태

    const rejectReason = verdict === 'REJECT' ? reason : null;

    const updatedApplicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: {
        status: applicantStatus,
        rejectReason,
      },
    });

    // Batch 통계 업데이트
    const batch = await prisma.batch.findFirst({
      where: { id: updatedApplicant.batchId },
    });
    if (batch) {
      await prisma.batch.update({
        where: { id: batch.id },
        data: {
          ...(verdict === 'APPROVE' && { passCount: { increment: 1 } }),
          ...(verdict === 'REJECT' && { failCount: { increment: 1 } }),
          ...(verdict === 'ESCALATE' && { escalateCount: { increment: 1 } }),
        },
      });
    }

    // ── 3. 비즈니스 파이프라인 종단: 자동 이메일 발송 ──
    let emailResult = null;

    if (verdict === 'REJECT' && updatedApplicant.email) {
      // REJECT: 지원자에게 보완 서류 제출 링크 발송 (Resend)
      emailResult = await sendRejectEmailViaResend({
        to: updatedApplicant.email,
        applicantName: updatedApplicant.name,
        documentType,
        reason: reason ?? '제출 서류의 정보가 공공기관 데이터와 일치하지 않습니다.',
        applicantId,
      });
    } else if (verdict === 'ESCALATE' || toolCallTriggered) {
      // ESCALATE: 관리자 알림 이메일 + 도구 호출 로그
      await sendEscalationNotification({
        applicantId,
        applicantName: applicant.name,
        documentType,
        reason: reason ?? '자동 판정 불가, 수동 검토가 필요합니다.',
      });
    }

    return NextResponse.json({
      success: true,
      decision: verdict,
      score,
      reason,
      discrepancies,
      isMockMode,
      usedFallback,
      toolCallTriggered: toolCallTriggered ?? false,
      verificationJobId: verificationJob.id,
      applicant: {
        id: updatedApplicant.id,
        name: updatedApplicant.name,
        status: updatedApplicant.status,
      },
      emailResult,
    });
  } catch (error: any) {
    console.error('[verify-mvp] MVP 파이프라인 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message ?? 'MVP 파이프라인 내부 검증 실패',
      },
      { status: 500 }
    );
  }
}

// ── GET: 단일 지원자의 최신 Claude 판정 결과 조회 ──
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const applicantId = searchParams.get('applicantId');

  if (!applicantId) {
    return NextResponse.json(
      { success: false, error: 'applicantId 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  const jobs = await prisma.verificationJob.findMany({
    where: {
      applicantId,
      siteCode: 'CLAUDE_MVP',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return NextResponse.json({ success: true, jobs });
}
