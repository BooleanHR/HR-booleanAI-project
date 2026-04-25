---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-014: Notification 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-008
---

## :dart: Summary
- **기능명:** [FR-014] Notification 모델 정의
- **Epic:** DB Schema
- **목적:** 불일치 알림의 DRAFT 생성 → 선택 발송 → 발송 결과 기록까지의 전체 생애주기를 저장하는 **Notification 모델**을 정의한다. v1.1에서 **선택적 발송** 관련 필드(discrepancyItems, requiredDocuments, customMessage, isSelected)가 대폭 추가되었다.
- **설계 원칙:** SRS §3.8 (L634 ~ 654). Applicant + VerificationJob 양방향 FK. ADR-009 선택 발송.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — Notification`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ADR-009`](../SRS-HR-AI-Verification-v1.1.md) — 선택 발송 원칙
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-100 ~ 105`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Notification 모델 추가
  ```prisma
  model Notification {
    notiId            String    @id @default(uuid()) @map("noti_id")
    applicantId       String    @map("applicant_id")
    jobId             String    @map("job_id")
    channel           String
    status            String
    resubmitLink      String?   @map("resubmit_link")
    resubmitToken     String?   @unique @map("resubmit_token")
    discrepancyItems  String?   @map("discrepancy_items")
    requiredDocuments String?   @map("required_documents")
    customMessage     String?   @map("custom_message")
    isSelected        Boolean   @default(false) @map("is_selected")
    sentAt            DateTime? @map("sent_at")
    expiredAt         DateTime  @map("expired_at")
    createdAt         DateTime  @default(now()) @map("created_at")

    applicant       Applicant       @relation(fields: [applicantId], references: [applicantId])
    verificationJob VerificationJob @relation(fields: [jobId], references: [jobId])

    @@map("notifications")
  }
  ```
- [ ] **TB-2:** `resubmitToken @unique` — 재제출 토큰 고유성 확인
- [ ] **TB-3:** v1.1 신규 필드 4개(discrepancyItems, requiredDocuments, customMessage, isSelected) 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** Notification 모델 14개 필드 + 2개 관계 → generate 성공
**Scenario 2:** resubmitToken @unique 설정 확인
**Scenario 3:** isSelected default(false) — DRAFT 생성 시 미선택 상태
**Scenario 4:** discrepancyItems, requiredDocuments가 String? (JSON as Text)

## :gear: Technical & Non-Functional Constraints
- **channel:** EMAIL | KAKAO_TALK | SMS | DASHBOARD (PoC에서는 EMAIL만 사용)
- **status:** DRAFT → PENDING → SENT/FAILED (선택 발송 흐름)
- **discrepancyItems:** JSON 배열. 예: `[{"field":"발급일자","expected":"2025-03-01","actual":"2025-03-15"}]`
- **requiredDocuments:** JSON 배열. 예: `["졸업증명서 원본 재발급"]`
- **isSelected:** 담당자가 체크박스로 선택한 건만 true. default false.

## :checkered_flag: Definition of Done (DoD)
- [ ] Notification 모델 14개 필드 + 2개 관계 정의
- [ ] v1.1 신규 4개 필드 포함
- [ ] resubmitToken @unique 설정

## :construction: Dependencies & Blockers
- **Depends on:** FR-010 (B-004: Applicant), FR-012 (B-006: VerificationJob)
- **Blocks:** B-010 (일괄 마이그레이션)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-008 | SRS: v1.1*
