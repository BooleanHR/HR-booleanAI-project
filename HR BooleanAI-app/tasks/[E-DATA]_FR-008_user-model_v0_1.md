---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-008: User 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-002
---

## :dart: Summary
- **기능명:** [FR-008] User 모델 정의
- **Epic:** DB Schema
- **목적:** 시스템 사용자(채용 담당자 OPERATOR, 관리자 ADMIN, 감사자 AUDITOR) 정보를 저장할 **User 모델**을 Prisma Schema에 정의한다. 이후 Batch 생성자, VerificationJob 리뷰어, Report 생성자와의 관계를 설정한다.
- **설계 원칙:** SRS §3.8 Prisma Schema (L518 ~ 533) User 모델 정의를 그대로 따른다.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — User 모델`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.14 REQ-NF-023`](../SRS-HR-AI-Verification-v1.1.md) — 개인정보 마스킹 원칙
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic B`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `prisma/schema.prisma`에 User 모델 추가
  ```prisma
  model User {
    userId       String     @id @default(uuid()) @map("user_id")
    email        String     @unique
    nameMasked   String     @map("name_masked")
    role         UserRole
    passwordHash String     @map("password_hash")
    mfaEnabled   Boolean    @default(false) @map("mfa_enabled")
    status       UserStatus
    createdAt    DateTime   @default(now()) @map("created_at")

    createdBatches    Batch[]           @relation("creator")
    reviewedJobs      VerificationJob[] @relation("reviewer")
    generatedReports  Report[]          @relation("generator")

    @@map("users")
  }
  ```
- [ ] **TB-2:** `npx prisma generate` 실행 → 에러 0건 확인
  > ⚠️ Batch, VerificationJob, Report 모델이 아직 없으므로 관계 정의는 주석 처리하거나 B-009까지 완료 후 일괄 generate.
- [ ] **TB-3:** 필드 매핑 확인 — `@@map("users")`로 DB 테이블명 소문자 복수형

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: User 모델 정의**
- **Given:** Enum이 정의된 Prisma 스키마 (FR-007 완료)
- **When:** User 모델을 추가
- **Then:** 8개 필드(userId, email, nameMasked, role, passwordHash, mfaEnabled, status, createdAt)가 올바른 타입으로 존재해야 한다.

**Scenario 2: 관계 정의**
- **Given:** User 모델이 정의된 상태
- **When:** 관계 필드 확인
- **Then:** createdBatches(Batch[]), reviewedJobs(VerificationJob[]), generatedReports(Report[]) 3개 관계가 정의되어야 한다.

## :gear: Technical & Non-Functional Constraints
- **개인정보:** `nameMasked` 필드는 마스킹된 이름(예: 홍○○)만 저장. 원본 이름 저장 금지 (REQ-NF-023).
- **비밀번호:** `passwordHash` — 평문 저장 절대 금지. Supabase Auth 사용 시 이 필드는 참조용.
- **email:** `@unique` 제약 — 동일 이메일 중복 가입 불가.

## :checkered_flag: Definition of Done (DoD)
- [ ] User 모델이 `schema.prisma`에 8개 필드 + 3개 관계로 정의되어 있는가?
- [ ] `@@map("users")`로 테이블명이 매핑되어 있는가?
- [ ] role 필드가 UserRole enum 타입인가?
- [ ] status 필드가 UserStatus enum 타입인가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-007 (B-001: Enum 정의 완료)
- **Blocks:** B-003 (Batch 모델), B-009 (Report 모델)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-002 | SRS: v1.1*
