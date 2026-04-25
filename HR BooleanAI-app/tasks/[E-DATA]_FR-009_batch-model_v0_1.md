---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-009: Batch 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-003
---

## :dart: Summary
- **기능명:** [FR-009] Batch 모델 정의
- **Epic:** DB Schema
- **목적:** 채용 회차(공채 1차, 2차 등) 정보를 관리할 **Batch 모델**을 정의한다. 한 Batch에 여러 Applicant(지원자)가 소속되며, Batch 단위로 PDF/엑셀 리포트를 생성한다.
- **설계 원칙:** SRS §3.8 (L535 ~ 548) Batch 모델. User → Batch 1:N 관계 (created_by FK).

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — Batch`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 ERD — USER ||--o{ BATCH`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Batch 모델 추가
  ```prisma
  model Batch {
    batchId         String      @id @default(uuid()) @map("batch_id")
    batchName       String      @map("batch_name")
    totalApplicants Int?        @map("total_applicants")
    status          BatchStatus
    startedAt       DateTime?   @map("started_at")
    completedAt     DateTime?   @map("completed_at")
    createdById     String      @map("created_by")

    createdBy   User        @relation("creator", fields: [createdById], references: [userId])
    applicants  Applicant[]
    reports     Report[]

    @@map("batches")
  }
  ```
- [ ] **TB-2:** User ↔ Batch 관계 확인 — `@relation("creator")` 명칭 일치

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1:** Batch 모델 7개 필드 + 3개 관계 정의 → `npx prisma generate` 성공
**Scenario 2:** createdBy FK가 User.userId를 올바르게 참조

## :gear: Technical & Non-Functional Constraints
- totalApplicants: Optional (배치 생성 시 미확정 가능)
- startedAt, completedAt: Optional (배치 상태 변경 시 업데이트)
- status: BatchStatus enum (OPEN → IN_PROGRESS → COMPLETED)

## :checkered_flag: Definition of Done (DoD)
- [ ] Batch 모델 7개 필드 + 3개 관계 정의 완료
- [ ] `@@map("batches")` 테이블명 매핑
- [ ] User FK(created_by) 관계 정확

## :construction: Dependencies & Blockers
- **Depends on:** FR-008 (B-002: User 모델)
- **Blocks:** B-004 (Applicant 모델), B-009 (Report 모델)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-003 | SRS: v1.1*
