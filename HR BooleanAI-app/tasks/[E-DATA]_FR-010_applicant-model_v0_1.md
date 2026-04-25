---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-010: Applicant 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-004
---

## :dart: Summary
- **기능명:** [FR-010] Applicant 모델 정의
- **Epic:** DB Schema
- **목적:** 지원자 정보를 관리할 **Applicant 모델**을 정의한다. v1.1에서 `exam_number`(수험번호) 필드가 추가되어 공공기관의 수험번호 기반 파일 명명을 지원한다.
- **설계 원칙:** SRS §3.8 (L551 ~ 565). Batch → Applicant 1:N 관계.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — Applicant`](../SRS-HR-AI-Verification-v1.1.md)
  - exam_number: 수험번호 (v1.1 신규). 공공기관 필수, 사기업 선택.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ASM-07`](../SRS-HR-AI-Verification-v1.1.md)
  - 공공기관은 수험번호, 사기업은 지원자 이름을 주 식별자로 사용.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Applicant 모델 추가
  ```prisma
  model Applicant {
    applicantId  String    @id @default(uuid()) @map("applicant_id")
    batchId      String    @map("batch_id")
    examNumber   String?   @map("exam_number")
    nameMasked   String    @map("name_masked")
    phoneMasked  String?   @map("phone_masked")
    email        String?
    createdAt    DateTime  @default(now()) @map("created_at")

    batch          Batch           @relation(fields: [batchId], references: [batchId])
    documents      Document[]
    notifications  Notification[]

    @@map("applicants")
  }
  ```

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** Applicant 모델 7개 필드 정의 → generate 성공
**Scenario 2:** examNumber이 Optional(nullable) — 사기업은 수험번호 없음

## :gear: Technical & Non-Functional Constraints
- nameMasked, phoneMasked: 마스킹된 값만 저장 (REQ-NF-023)
- examNumber: 공공기관은 필수, 사기업은 선택(nullable). 파일 자동 명명(H-001)에서 사용.

## :checkered_flag: Definition of Done (DoD)
- [ ] Applicant 모델 7개 필드 + 3개 관계 정의 완료
- [ ] examNumber 필드가 nullable로 설정

## :construction: Dependencies & Blockers
- **Depends on:** FR-009 (B-003: Batch 모델)
- **Blocks:** B-005 (Document 모델), B-008 (Notification 모델)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-004 | SRS: v1.1*
