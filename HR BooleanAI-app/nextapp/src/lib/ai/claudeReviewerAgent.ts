/**
 * Claude Reviewer Agent (10주차 구현)
 *
 * 10주차 패러다임: 마이크로 매니지먼트 대신 명확한 제약 조건(Boundaries)과 맥락(Context) 부여
 * - 모델: claude-opus-4-5 (자율 워크플로우 최적화, 실제 존재하는 최신 Opus)
 * - 폴백: Gemini (기존 reviewer-agent.ts 재활용)
 *
 * ⚠️ 메모 코드 교정 사항:
 *   - claude-fable-5 → claude-opus-4-5 (실제 존재하는 모델명)
 *   - thinking: { type: 'adaptive' } → { type: 'enabled', budget_tokens: 10000 }
 *   - effort: 'max', display: 'omitted' → SDK 미지원 파라미터 제거
 *   - agentResult.choices[0].message.content → Anthropic SDK 실제 응답 형식으로 수정
 */

import Anthropic from '@anthropic-ai/sdk';
import { reviewDocument } from './reviewer-agent'; // Gemini 폴백용

export type AIVerdict = 'APPROVE' | 'REJECT' | 'ESCALATE';

export interface ClaudeVerificationPayload {
  applicantId: string;
  documentType: string;
  applicantName: string;
  applicantBirthDate: string;
  /** 원본 서류 이미지: 파일시스템 절대경로 또는 base64 문자열 */
  originalDocumentBase64: string;
  /** RPA 공공기관 캡처본 base64 (선택) */
  rpaScreenshotBase64?: string;
  /** 4대보험 득실내역 JSON 문자열 (선택) */
  insuranceHistoryJson?: string;
  /** 지원서 기재 데이터 */
  applicationData: Record<string, string>;
  /** RPA가 추출한 데이터 */
  rpaExtractedData?: Record<string, string>;
}

export interface ClaudeReviewResult {
  verdict: AIVerdict;
  score: number;
  reason: string;
  discrepancies: string[];
  usedFallback: boolean;
  rawResponse: string;
  toolCallTriggered?: boolean; // ESCALATE 시 도구 호출 여부
}

// ─────────────────────────────────────────────────────────────
// Claude 클라이언트 초기화
// ─────────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey || apiKey.startsWith('your-')) {
    throw new Error('CLAUDE_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.');
  }
  return new Anthropic({ apiKey });
}

// ─────────────────────────────────────────────────────────────
// 10주차 핵심: Boundaries + Context 시스템 프롬프트
// (안티패턴: "Show your work" 내부 추론 노출 금지)
// ─────────────────────────────────────────────────────────────

function buildSystemPrompt(payload: ClaudeVerificationPayload): string {
  const docTypeNames: Record<string, string> = {
    TOEIC: 'TOEIC 성적표',
    OPIC: 'OPIc 성적표',
    QNET: '국가기술자격증 (Q-Net)',
    GRADUATION: '졸업증명서',
    CAREER: '경력증명서/재직증명서',
    INSURANCE_4: '건강보험 득실확인서 (4대보험)',
  };
  const docTypeName = docTypeNames[payload.documentType] ?? payload.documentType;

  const applicationDataStr = Object.entries(payload.applicationData)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join('\n');

  const rpaDataStr = payload.rpaExtractedData
    ? Object.entries(payload.rpaExtractedData)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n')
    : '  - RPA 조회 데이터 없음';

  // 2001년 이전 구버전 자격증 특수 처리 (메모 Boundary 조항 2 반영)
  let pre2001Boundary = '';
  if (payload.documentType === 'QNET') {
    const passDate = payload.applicationData.passDate ?? '';
    const match = passDate.match(/(\d{4})/);
    if (match && parseInt(match[1], 10) < 2001) {
      pre2001Boundary = `
[SPECIAL BOUNDARY - 2001년 이전 구버전 자격증]
Q-Net 전산 미등록 가능성이 높습니다. 서류 이미지에서 한국산업인력공단 이사장의
붉은색 관인(도장) 날인 여부를 반드시 시각적으로 확인하십시오.
- 도장 선명 + 정교 → APPROVE 가능
- 도장 없음 또는 위변조 의심 → REJECT
- 도장 존재하나 세부 텍스트 불확실 → ESCALATE (수동검토 도구 호출)`;
    }
  }

  return `[CONTEXT]
당신은 채용 증빙 서류의 진위 여부를 최종 판정하는 'HR 자율형 리뷰어 워커'입니다.
RPA로 캡처된 공공기관 데이터와 지원자가 제출한 서류 원본의 진위 여부 및 유사도를 대조합니다.

검토 대상:
- 서류 유형: ${docTypeName}
- 지원자 성명: ${payload.applicantName}
- 생년월일: ${payload.applicantBirthDate}
- 지원자 ID: ${payload.applicantId}

지원서 기재 정보:
${applicationDataStr}

RPA 공식 기관 조회 결과:
${rpaDataStr}

4대보험 이력:
${payload.insuranceHistoryJson ? payload.insuranceHistoryJson : '제공되지 않음'}
${pre2001Boundary}

[BOUNDARIES - 제약 조건]
1. 최종 판정은 반드시 'APPROVE', 'REJECT', 'ESCALATE' 중 하나로만 도출하십시오.
2. 이름/생년월일 유사도 0.85 미만이거나 재직 기간 불일치 경력은 REJECT 처리하십시오.
   단, 2001년 이전 구버전 자격증으로 판단 모호 시 반드시 ESCALATE(수동검토 도구 호출)로 전환하십시오.
3. 절대 임의 데이터를 생성하거나 지정되지 않은 API를 호출하지 마십시오.
4. 내부 추론 과정을 텍스트로 노출하지 말고 아래 JSON 결과 포맷만 반환하십시오.
5. ESCALATE 판정 시에는 반드시 'send_to_user_escalation' 도구를 호출하여 담당자에게 수동 검토를 요청하십시오.

[OUTPUT FORMAT - 반드시 이 JSON 형식으로만 응답]
{
  "verdict": "APPROVE" | "REJECT" | "ESCALATE",
  "score": 0.0 ~ 1.0,
  "reason": "판정 근거 요약 (한국어 2~3문장)",
  "discrepancies": ["불일치 항목1", "불일치 항목2"]
}

판정 기준:
- APPROVE: 모든 항목 일치, 위변조 없음 (score >= 0.85)
- REJECT: 명확한 위변조 또는 정보 불일치 (score < 0.4)
- ESCALATE: 불확실하거나 부분 일치, 수동 검토 필요 (score 0.4 ~ 0.85)`;
}

// ─────────────────────────────────────────────────────────────
// 메인: Claude 에이전트 서류 검증 함수
// ─────────────────────────────────────────────────────────────

export async function verifyDocumentWithClaude(
  payload: ClaudeVerificationPayload
): Promise<ClaudeReviewResult> {
  const client = getAnthropicClient();

  const userContent: Anthropic.MessageParam['content'] = [
    {
      type: 'text',
      text: `지원자 ID: ${payload.applicantId} / 서류 유형: ${payload.documentType} 진위확인을 시작하십시오.`,
    },
    // 원본 서류 이미지 (멀티모달)
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: payload.originalDocumentBase64,
      },
    },
  ];

  // RPA 캡처본이 존재할 경우 멀티모달 비교 추가
  if (payload.rpaScreenshotBase64) {
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: payload.rpaScreenshotBase64,
      },
    });
  }

  // 10주차 핵심: ESCALATE 시 담당자에게 실시간 수동 검토 요청하는 전용 도구
  const tools: Anthropic.Tool[] = [
    {
      name: 'send_to_user_escalation',
      description:
        'RPA 자동화가 불가능하거나 판단이 모호한 경우(2001년 이전 자격증 등) 인간 담당자에게 수동 검증을 실시간 요청합니다.',
      input_schema: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: '수동 검토 전환 사유 (한국어)',
          },
          excelExportRequired: {
            type: 'boolean',
            description: '일괄 엑셀 내보내기 포함 여부',
          },
        },
        required: ['reason'],
      },
    },
  ];

  // ── 실제 Anthropic SDK 파라미터 (메모 코드의 비존재 파라미터 교정 완료) ──
  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL ?? 'claude-opus-4-5',
    max_tokens: 16000, // extended thinking 사용 시 충분히 크게 설정
    temperature: 1,    // thinking 활성화 시 temperature는 반드시 1
    system: buildSystemPrompt(payload),
    thinking: {
      type: 'enabled',
      budget_tokens: 10000, // 복잡한 다중 문서 비교를 위한 충분한 사고 예산
    },
    tools,
    messages: [{ role: 'user', content: userContent }],
  });

  // ── Anthropic SDK 실제 응답 파싱 (OpenAI choices 형식이 아님) ──
  let toolCallTriggered = false;
  let jsonText = '';

  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text;
    } else if (block.type === 'tool_use' && block.name === 'send_to_user_escalation') {
      toolCallTriggered = true;
      console.log('[ClaudeAgent] ESCALATE 도구 호출:', block.input);
    }
    // thinking 블록은 내부 추론 (외부 노출 안 함)
  }

  // JSON 파싱
  try {
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON not found in Claude response');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      verdict: parsed.verdict as AIVerdict,
      score: Number(parsed.score) ?? 0.5,
      reason: parsed.reason ?? '',
      discrepancies: Array.isArray(parsed.discrepancies) ? parsed.discrepancies : [],
      usedFallback: false,
      rawResponse: jsonText,
      toolCallTriggered,
    };
  } catch (parseError) {
    console.error('[ClaudeAgent] JSON 파싱 실패, ESCALATE 처리:', parseError);
    return {
      verdict: 'ESCALATE',
      score: 0.5,
      reason: 'Claude 응답 파싱 중 오류가 발생하여 수동 검토로 전환합니다.',
      discrepancies: [],
      usedFallback: false,
      rawResponse: jsonText,
      toolCallTriggered: true,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// 10주차 가이드라인: 가드레일 Refusal 발생 시 Gemini 폴백
// ─────────────────────────────────────────────────────────────

export async function verifyWithClaudeOrFallback(
  payload: ClaudeVerificationPayload
): Promise<ClaudeReviewResult> {
  try {
    return await verifyDocumentWithClaude(payload);
  } catch (error: any) {
    console.error('[ClaudeAgent] 에이전트 루프 에러, Gemini 폴백 가동:', error.message);

    // Gemini 폴백 (기존 reviewer-agent.ts 재활용)
    try {
      const geminiResult = await reviewDocument({
        documentType: payload.documentType,
        applicantName: payload.applicantName,
        applicantBirthDate: payload.applicantBirthDate,
        documentImagePath: payload.originalDocumentBase64, // base64 임시 경로
        applicationData: payload.applicationData,
        rpaExtractedData: payload.rpaExtractedData,
      });

      return {
        verdict: geminiResult.verdict,
        score: geminiResult.score,
        reason: `[Gemini 폴백] ${geminiResult.reason}`,
        discrepancies: geminiResult.discrepancies,
        usedFallback: true,
        rawResponse: geminiResult.rawResponse,
      };
    } catch (geminiError: any) {
      console.error('[ClaudeAgent] Gemini 폴백도 실패:', geminiError.message);
      return {
        verdict: 'ESCALATE',
        score: 0.0,
        reason: '자동 검증 시스템 오류: Claude 및 Gemini 모두 실패. 수동 검토가 필요합니다.',
        discrepancies: [],
        usedFallback: true,
        rawResponse: '',
      };
    }
  }
}

/**
 * 개발/테스트용 Mock (실제 API 키 없이 동작 확인)
 */
export function mockClaudeVerify(payload: ClaudeVerificationPayload): ClaudeReviewResult {
  console.warn('[ClaudeAgent] Mock 모드 - 실제 Claude API를 호출하지 않습니다.');
  return {
    verdict: 'ESCALATE',
    score: 0.5,
    reason: 'Mock 검토: 개발 환경에서는 실제 AI 검토를 수행하지 않습니다.',
    discrepancies: [],
    usedFallback: false,
    rawResponse: '{"verdict":"ESCALATE","score":0.5,"reason":"Mock","discrepancies":[]}',
  };
}
