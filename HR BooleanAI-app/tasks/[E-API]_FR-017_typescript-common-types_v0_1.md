---
name: Feature Task
title: "[Feature] FR-017: TypeScript 공통 타입 정의"
labels: 'feature, api-contract, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: C-001
---

## :dart: Summary
- **기능명:** [FR-017] TypeScript 공통 타입 정의
- **Epic:** API Contract (Request/Response DTO & 에러 코드 정의)
- **목적:** OcrResult, StructuredFields, CompareResult, AgencyResult, VerificationResult, JobResult 등 시스템 전체에서 공유되는 TypeScript 인터페이스를 정의하여, 모든 Server Action과 Route Handler에서 일관된 타입을 사용할 수 있도록 한다.
- **설계 원칙:** SRS §3.12 Class Diagram에 정의된 서비스 인터페이스를 TypeScript 타입으로 변환한다.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.12 Class Diagram`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.7 API Overview`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/types/ocr.ts` — OCR 관련 타입
  ```typescript
  export interface StructuredFields {
    name: string;           // 성명
    issueNumber: string;    // 발급번호
    issueDate: string;      // 발급일자
    issuerName: string;     // 발급기관명
  }
  export interface OcrResult {
    fields: StructuredFields;
    confidenceScore: number;
    docCategory: string;    // v1.1: 서류종류 분류
    rawJson: string;
  }
  export interface CompareResult {
    isMatch: boolean;
    mismatches: { field: string; expected: string; actual: string }[];
  }
  ```
- [ ] **TB-2:** `src/types/verification.ts` — 검증 관련 타입
  ```typescript
  export interface AgencyResult {
    verified: boolean;
    issuerInfo: Record<string, string>;
    mockUsed: boolean;
    responseSnapshot?: string;
    capturedAt?: Date;
  }
  export interface VerificationResult {
    jobId: string;
    status: string;
    confidenceScore: number;
    discrepancyDetail: string | null;
    verificationMethod: string | null;  // v1.1
    finalResult: string | null;         // v1.1
  }
  export type JobResult = VerificationResult & {
    ocrResult: OcrResult;
    agencyResult: AgencyResult;
    layer1: CompareResult;
    layer2: CompareResult;
  }
  ```
- [ ] **TB-3:** `src/types/notification.ts` — 알림 관련 타입
  ```typescript
  export interface DiscrepancyItem {
    field: string;
    expected: string;
    actual: string;
  }
  export interface NotificationPreview {
    notiId: string;
    applicantName: string;
    docType: string;
    discrepancyItems: DiscrepancyItem[];
    requiredDocuments: string[];
    customMessage: string | null;
    resubmitLink: string;
  }
  export interface SendResult {
    total: number;
    sent: number;
    failed: number;
    details: { notiId: string; status: 'SENT' | 'FAILED'; error?: string }[];
  }
  ```
- [ ] **TB-4:** `src/types/report.ts` — 리포트 관련 타입
- [ ] **TB-5:** `src/types/api.ts` — API Request/Response DTO 공통 타입
- [ ] **TB-6:** `src/types/index.ts` — barrel export
  ```typescript
  export * from './ocr'
  export * from './verification'
  export * from './notification'
  export * from './report'
  export * from './api'
  ```

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 모든 타입 파일이 `src/types/`에 존재하고 `npm run build` 성공
**Scenario 2:** `index.ts` barrel export로 `import { OcrResult, VerificationResult } from '@/types'` 가능
**Scenario 3:** SRS §3.12 Class Diagram의 9개 서비스 반환 타입이 모두 매핑

## :gear: Technical & Non-Functional Constraints
- Prisma 생성 타입과 별도 — 비즈니스 로직용 인터페이스
- JSON 필드는 파싱 후 타입으로 변환하여 사용

## :checkered_flag: Definition of Done (DoD)
- [ ] src/types/ 5개 파일 + index.ts barrel export 존재
- [ ] OcrResult, VerificationResult, NotificationPreview 등 핵심 타입 정의
- [ ] `npm run build` 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** FR-007 (B-001: Enum 정의)
- **Blocks:** C-002 ~ C-009 (API DTO 정의), D-001 (Agency API 클라이언트)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST C-001 | SRS: v1.1*
