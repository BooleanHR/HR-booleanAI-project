---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-012: VerificationJob 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-006
---

## :dart: Summary
- **기능명:** [FR-012] VerificationJob 모델 정의
- **Epic:** DB Schema
- **목적:** 서류 검증 작업의 전체 생애주기(Triple Check 결과, 승인/반려 상태, 리뷰어 정보)를 저장하는 **VerificationJob 모델**을 정의한다. v1.1에서 `verificationMethod`(확인 방법)과 `finalResult`(완료/확인필요) 필드가 추가되었다.
- **설계 원칙:** SRS §3.8 (L591 ~ 614). Document → VerificationJob 1:N 관계.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — VerificationJob`](../SRS-HR-AI-Verification-v1.1.md)
  - v1.1 신규: verificationMethod(문서확인번호/자격번호/내용일치), finalResult(완료/확인필요)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-015`](../SRS-HR-AI-Verification-v1.1.md)
  - 다중 검증 완료 기준: 내용 일치 AND 공적 식별자 API 확인 → "완료"

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** VerificationJob 모델 추가
  ```prisma
  model VerificationJob {
    jobId              String      @id @default(uuid()) @map("job_id")
    docId              String      @map("doc_id")
    checkLayer         CheckLayer  @map("check_layer")
    status             JobStatus
    agencyApiResponse  String?     @map("agency_api_response")
    discrepancyDetail  String?     @map("discrepancy_detail")
    confidenceScore    Float?      @map("confidence_score")
    verificationMethod String?     @map("verification_method")
    finalResult        String?     @map("final_result")
    rpaUsed            Boolean     @default(false) @map("rpa_used")
    mockUsed           Boolean     @default(false) @map("mock_used")
    verifiedAt         DateTime?   @map("verified_at")
    reviewerId         String?     @map("reviewer_id")
    reviewedAt         DateTime?   @map("reviewed_at")
    decisionReason     String?     @map("decision_reason")

    document      Document       @relation(fields: [docId], references: [docId])
    reviewer      User?          @relation("reviewer", fields: [reviewerId], references: [userId])
    auditTrail    AuditTrail?
    notifications Notification[]

    @@map("verification_jobs")
  }
  ```
- [ ] **TB-2:** JSON 필드(agencyApiResponse, discrepancyDetail)가 String? 타입 확인
- [ ] **TB-3:** reviewer Optional 관계 확인 — 승인 전에는 null

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** VerificationJob 모델 16개 필드 + 4개 관계 → generate 성공
**Scenario 2:** v1.1 필드(verificationMethod, finalResult) 존재 확인
**Scenario 3:** mockUsed 필드 default(false) 설정 확인

## :gear: Technical & Non-Functional Constraints
- agencyApiResponse, discrepancyDetail: JSON as String (C-TEC-003)
- reviewer: Optional — 승인 전 null. User? 타입.
- mockUsed: PoC에서 Mock 데이터 사용 건을 투명하게 추적 (REQ-NF-012)
- status: JobStatus enum — PENDING→IN_PROGRESS→PASS/FAIL/MANUAL_REVIEW→APPROVED/REJECTED

## :checkered_flag: Definition of Done (DoD)
- [ ] VerificationJob 모델 16개 필드 + 4개 관계 정의
- [ ] v1.1 신규 2개 필드(verificationMethod, finalResult) 포함
- [ ] mockUsed 필드 default(false) 설정

## :construction: Dependencies & Blockers
- **Depends on:** FR-011 (B-005: Document 모델)
- **Blocks:** B-007 (AuditTrail), B-008 (Notification)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-006 | SRS: v1.1*
