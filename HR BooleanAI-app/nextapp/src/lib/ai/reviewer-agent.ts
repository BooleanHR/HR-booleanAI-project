/**
 * Gemini AI Reviewer Agent
 * 원본 서류 이미지 + RPA 조회 결과 캡처본 + 지원서 기재 정보를 멀티모달로 전달하여
 * 최종 승인(APPROVE) / 반려(REJECT) / 수동검토(ESCALATE) 결정을 내립니다.
 */

import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export type AIVerdict = 'APPROVE' | 'REJECT' | 'ESCALATE';

export interface ReviewRequest {
  documentType: string;           // TOEIC | OPIC | QNET | GRADUATION | CAREER
  applicantName: string;
  applicantBirthDate: string;     // YYYYMMDD
  documentImagePath: string;      // 원본 서류 이미지 경로
  rpaCapturePath?: string;        // RPA 조회 결과 스크린샷 경로
  applicationData: Record<string, string>; // 지원서 기재 데이터
  rpaExtractedData?: Record<string, string>; // RPA가 추출한 데이터
}

export interface ReviewResult {
  verdict: AIVerdict;
  score: number;            // 0.0 ~ 1.0 신뢰도
  reason: string;           // 판정 근거
  discrepancies: string[];  // 불일치 항목 목록
  rawResponse: string;      // Gemini 원본 응답
}

// ─────────────────────────────────────────────
// Gemini 클라이언트 초기화
// ─────────────────────────────────────────────

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function imageToBase64Part(imagePath: string): Part {
  const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };
  return {
    inlineData: {
      data: base64,
      mimeType: mimeTypes[ext] ?? 'image/png',
    },
  };
}

// ─────────────────────────────────────────────
// 프롬프트 구성
// ─────────────────────────────────────────────

export function buildPrompt(req: ReviewRequest): string {
  const docTypeNames: Record<string, string> = {
    TOEIC: 'TOEIC 성적표',
    OPIC: 'OPIc 성적표',
    TOEIC_SPEAKING: 'TOEIC Speaking 성적표',
    QNET: '국가기술자격증 (Q-Net)',
    GRADUATION: '졸업증명서',
    CAREER: '경력증명서/재직증명서',
    INSURANCE_4: '건강보험 득실확인서 (4대보험)',
  };

  const docTypeName = docTypeNames[req.documentType] ?? req.documentType;

  const applicationDataStr = Object.entries(req.applicationData)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join('\n');

  const rpaDataStr = req.rpaExtractedData
    ? Object.entries(req.rpaExtractedData)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n')
    : '  - RPA 조회 데이터 없음';

  let pre2001Section = '';
  if (req.documentType === 'QNET' || req.documentType === 'CERTIFICATE') {
    const passDateStr = req.applicationData.passDate || '';
    const match = passDateStr.match(/(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year < 2001) {
        pre2001Section = `
        
## ⚠️ 2001년 이전 발급 자격증 검토 지침 (수첩형 자격증 실인 검증)
본 자격증은 2001년 이전에 발급된 수첩형 자격증입니다. Q-Net 전산망에 등록되지 않았을 가능성이 높습니다.
따라서 다음 시각 요소를 비전으로 반드시 상세 분석해 주십시오:
1. 첫 번째 자격증 실물 이미지 하단(또는 중간)에 **한국산업인력공단(또는 한국산업인력관리공단) 이사장 또는 지청장의 붉은색 관인/인장/도장 날인**이 실제 육안으로 선명히 존재하는지 확인하세요.
2. 도장의 날인이 아예 없거나, 모양이 찌그러지거나 인쇄된 그래픽처럼 보이는 등 위변조 의심 징후가 있을 경우 강력하게 REJECT를 주어야 합니다.
3. 도장이 선명하고 정교하게 찍혀 있는 경우 APPROVE 판정을 내리되, 해상도가 낮아 도장의 존재만 보이고 세부 텍스트 확인이 불가한 경우 안전하게 ESCALATE 판정을 내리십시오.
`;
      }
    }
  }

  return `당신은 HR 채용 서류 진위확인 전문 AI입니다.

## 검토 대상 서류
- 서류 유형: ${docTypeName}
- 지원자 성명: ${req.applicantName}
- 지원자 생년월일: ${req.applicantBirthDate}

## 지원서 기재 정보
${applicationDataStr}

## RPA 공식 기관 조회 결과
${rpaDataStr}
${pre2001Section}

## 판정 기준
1. 원본 서류 이미지(첫 번째 이미지)와 RPA 조회 스크린샷(두 번째 이미지, 있는 경우)을 비교하세요.
2. 다음 항목들의 일치 여부를 확인하세요:
   - 성명/수험자명
   - 생년월일
   - 점수/등급/자격 내용
   - 발급일/유효기간
   - 발급기관 인증 표시 (위변조 여부)
3. 위변조 징후 (폰트 불일치, 픽셀 변조, 인장 위조 등)를 탐지하세요.

## 응답 형식 (반드시 아래 JSON 형식으로만 응답하세요)
{
  "verdict": "APPROVE" | "REJECT" | "ESCALATE",
  "score": 0.0 ~ 1.0,
  "reason": "판정 근거 요약 (한국어 2~3문장)",
  "discrepancies": ["불일치 항목1", "불일치 항목2"]
}

- APPROVE: 모든 항목 일치, 위변조 없음 (score >= 0.85)
- REJECT: 명확한 위변조 또는 정보 불일치 (score < 0.4)
- ESCALATE: 불확실하거나 부분 일치, 수동 검토 필요 (score 0.4 ~ 0.85)`;
}

// ─────────────────────────────────────────────
// 메인 리뷰 함수
// ─────────────────────────────────────────────

export async function reviewDocument(req: ReviewRequest): Promise<ReviewResult> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const parts: Part[] = [];

  // 1. 프롬프트 텍스트
  parts.push({ text: buildPrompt(req) });

  // 2. 원본 서류 이미지
  try {
    parts.push(imageToBase64Part(req.documentImagePath));
  } catch (e) {
    console.warn('[Reviewer] 서류 이미지 로드 실패:', e);
  }

  // 3. RPA 캡처 스크린샷 (있는 경우)
  if (req.rpaCapturePath) {
    try {
      parts.push(imageToBase64Part(req.rpaCapturePath));
    } catch (e) {
      console.warn('[Reviewer] RPA 캡처 이미지 로드 실패:', e);
    }
  }

  const result = await model.generateContent(parts);
  const rawResponse = result.response.text();

  // JSON 파싱
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON not found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      verdict: parsed.verdict as AIVerdict,
      score: Number(parsed.score) || 0.5,
      reason: parsed.reason ?? '',
      discrepancies: Array.isArray(parsed.discrepancies) ? parsed.discrepancies : [],
      rawResponse,
    };
  } catch {
    // 파싱 실패 시 ESCALATE로 안전하게 처리
    console.error('[Reviewer] JSON 파싱 실패, ESCALATE 처리:', rawResponse);
    return {
      verdict: 'ESCALATE',
      score: 0.5,
      reason: 'AI 응답 파싱 중 오류가 발생하여 수동 검토로 전환합니다.',
      discrepancies: [],
      rawResponse,
    };
  }
}

/**
 * Gemini API 없이 Mock 결과를 반환합니다 (테스트/개발용)
 */
export function mockReviewDocument(_req: ReviewRequest): ReviewResult {
  console.warn('[Reviewer] Mock 모드: 실제 Gemini API를 호출하지 않습니다.');
  return {
    verdict: 'ESCALATE',
    score: 0.5,
    reason: 'Mock 검토: 개발 환경에서는 실제 AI 검토를 수행하지 않습니다.',
    discrepancies: [],
    rawResponse: '{"verdict":"ESCALATE","score":0.5,"reason":"Mock","discrepancies":[]}',
  };
}
