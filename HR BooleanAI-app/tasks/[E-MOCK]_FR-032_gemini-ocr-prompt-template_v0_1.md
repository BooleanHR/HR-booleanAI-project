---
name: Feature Task
title: "[Feature] FR-032: Gemini Vision OCR 프롬프트 템플릿 정의"
labels: 'feature, mock-external, ai, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-006
---

## :dart: Summary
- **기능명:** [FR-032] Gemini Vision OCR 프롬프트 템플릿 정의
- **Epic:** Mock/External
- **목적:** doc_type별 OCR 추출 필드와 doc_category 분류 지시를 포함하는 Gemini Vision API 프롬프트 템플릿을 정의한다. Vercel AI SDK의 `generateObject()`에 전달할 **Zod 스키마**도 함께 정의하여 구조화 JSON 응답을 강제한다.
- **설계 원칙:** SRS §3.12 GeminiOcrService. C-TEC-005 Vercel AI SDK. C-TEC-006 Gemini API.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.12 Class Diagram — GeminiOcrService`](../SRS-HR-AI-Verification-v1.1.md)
  - extractFields(imageFile) → OcrResult
  - classifyDocCategory(ocrResult) → String
  - buildPrompt(docType) → String
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-002, 006`](../SRS-HR-AI-Verification-v1.1.md)
  - REQ-FUNC-002: generateObject()로 4개 필드 + confidence_score 구조화 JSON 추출
  - REQ-FUNC-006: doc_category 자동 분류

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/gemini.ts` 파일 생성 — Vercel AI SDK + Google Provider 설정
  ```typescript
  import { google } from '@ai-sdk/google';
  import { generateObject } from 'ai';
  import { z } from 'zod';

  export const geminiModel = google('gemini-1.5-flash');
  ```
- [ ] **TB-2:** OCR 결과 Zod 스키마 정의
  ```typescript
  export const ocrResultSchema = z.object({
    name: z.string().describe('서류에 기재된 성명'),
    issueNumber: z.string().describe('발급번호 또는 문서확인번호'),
    issueDate: z.string().describe('발급일자 (YYYY-MM-DD)'),
    issuerName: z.string().describe('발급기관명'),
    confidenceScore: z.number().min(0).max(100).describe('OCR 신뢰도 (0 ~ 100)'),
    docCategory: z.string().describe('서류 종류: 졸업증명서, 자격증, 경력증명서 등'),
  });
  ```
- [ ] **TB-3:** doc_type별 프롬프트 빌더 함수
  ```typescript
  export function buildOcrPrompt(docType: string): string {
    const basePrompt = `이 서류 이미지에서 다음 정보를 추출해주세요:
    1. 성명 (name)
    2. 발급번호/문서확인번호 (issueNumber)
    3. 발급일자 (issueDate) — YYYY-MM-DD 형식
    4. 발급기관명 (issuerName)
    5. 이 서류의 종류를 분류해주세요 (docCategory)
    6. 추출 신뢰도를 0 ~ 100 사이로 평가해주세요 (confidenceScore)`;
    // doc_type별 추가 지시
    return basePrompt;
  }
  ```
- [ ] **TB-4:** `zod` 패키지 설치 확인 (Vercel AI SDK 의존성으로 이미 포함될 수 있음)

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** `buildOcrPrompt('DEGREE')` 호출 → 4개 필드 + confidence_score + docCategory 추출 지시 포함
**Scenario 2:** Zod 스키마가 Vercel AI SDK `generateObject()`와 호환

## :construction: Dependencies & Blockers
- **Depends on:** FR-006 (A-006: npm 패키지 — ai, @ai-sdk/google)
- **Blocks:** G-001 (Gemini Vision API 호출 Server Action)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-006 | SRS: v1.1*
