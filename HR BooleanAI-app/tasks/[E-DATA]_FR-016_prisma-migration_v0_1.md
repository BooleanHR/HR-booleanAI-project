---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-016: Prisma DB 마이그레이션 실행"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-010
---

## :dart: Summary
- **기능명:** [FR-016] Prisma DB 마이그레이션 실행
- **Epic:** DB Schema
- **목적:** FR-007 ~ FR-015에서 정의한 **8개 모델과 7개 Enum**에 대해 Prisma 마이그레이션을 실행하여 실제 데이터베이스 테이블을 생성한다. 로컬 SQLite에서 먼저 검증하고, 배포 시 Supabase PostgreSQL로 전환한다.
- **설계 원칙:** SRS §2.1 C-TEC-003 — SQLite(로컬) → PostgreSQL(배포) 듀얼 전략.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 C-TEC-003`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ASM-05`](../SRS-HR-AI-Verification-v1.1.md) — 로컬 SQLite, 배포 PostgreSQL
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 전체 Prisma Schema`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 전체 `schema.prisma` 최종 검증
  - 8개 모델(User, Batch, Applicant, Document, VerificationJob, AuditTrail, Notification, Report) 존재 확인
  - 7개 Enum(UserRole, UserStatus, BatchStatus, DocType, CheckLayer, ReportType, JobStatus) 존재 확인
  - 모든 관계(FK, 1:1, 1:N) 무결성 확인
  - Json 타입 사용 여부 확인 → 모두 String으로 대체되어야 함
- [ ] **TB-2:** SQLite datasource 활성화 상태 확인
  ```prisma
  datasource db {
    provider = "sqlite"
    url      = "file:./dev.db"
  }
  ```
- [ ] **TB-3:** 마이그레이션 실행
  ```bash
  npx prisma migrate dev --name full_schema_v1_1
  ```
  - `prisma/migrations/` 디렉토리에 마이그레이션 파일 생성 확인
  - `prisma/dev.db` SQLite 파일 업데이트 확인
- [ ] **TB-4:** Prisma Studio로 테이블 존재 확인
  ```bash
  npx prisma studio
  ```
  - `http://localhost:5555`에서 8개 테이블 확인
- [ ] **TB-5:** Prisma Client 재생성 확인
  ```bash
  npx prisma generate
  ```
  - TypeScript에서 모든 모델/Enum import 가능 여부 테스트
- [ ] **TB-6:** 간단한 CRUD 동작 테스트
  - User 1건 INSERT → SELECT → 정상 조회 확인
  - Batch 1건 INSERT (User FK 연결) → 관계 조회 확인
- [ ] **TB-7:** `npm run build` 실행 → 빌드 에러 0건

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 마이그레이션 성공**
- **Given:** 8개 모델, 7개 Enum이 정의된 schema.prisma
- **When:** `npx prisma migrate dev --name full_schema_v1_1` 실행
- **Then:** 에러 0건. migrations/ 디렉토리에 SQL 파일 생성.

**Scenario 2: Prisma Studio 확인**
- **Given:** 마이그레이션 완료
- **When:** `npx prisma studio` 실행
- **Then:** 8개 테이블(users, batches, applicants, documents, verification_jobs, audit_trails, notifications, reports)이 모두 존재.

**Scenario 3: CRUD 동작**
- **Given:** 마이그레이션 완료
- **When:** Prisma Client로 User INSERT → SELECT
- **Then:** 해당 레코드 정상 조회. role이 UserRole enum 값.

**Scenario 4: 관계 무결성**
- **Given:** User, Batch가 생성된 상태
- **When:** Batch.createdById에 존재하지 않는 userId 입력
- **Then:** FK 위반 에러 발생.

## :gear: Technical & Non-Functional Constraints
- **Json 타입 금지:** SQLite 호환을 위해 모든 JSON 필드는 String 타입. 마이그레이션 전 최종 확인 필수.
- **마이그레이션 파일 Git 커밋:** `prisma/migrations/` 디렉토리는 Git에 포함. `prisma/dev.db`는 .gitignore.
- **PostgreSQL 전환:** 배포 시 V-001 태스크에서 datasource 전환 + 재마이그레이션.

## :checkered_flag: Definition of Done (DoD)
- [ ] `npx prisma migrate dev` 에러 없이 완료
- [ ] Prisma Studio에서 8개 테이블 확인
- [ ] TypeScript에서 모든 모델/Enum import 가능
- [ ] 간단한 CRUD 테스트 통과
- [ ] `npm run build` 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** FR-007 ~ FR-015 (B-001 ~ B-009: 전체 모델 정의)
- **Blocks:**
  - D-005 (Seed 데이터 생성)
  - E-001 (Supabase Auth 설정)
  - V-001 (PostgreSQL 전환)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-010 | SRS: v1.1*
