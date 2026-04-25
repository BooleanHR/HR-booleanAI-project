---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-007: Prisma Enum 정의 (UserRole, UserStatus, BatchStatus, DocType, CheckLayer, ReportType, JobStatus)"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-001
---

## :dart: Summary
- **기능명:** [FR-007] Prisma Enum 정의
- **Epic:** DB Schema (데이터베이스 스키마 & 마이그레이션)
- **목적:** 시스템 전체에서 사용될 **7개 Prisma Enum**(UserRole, UserStatus, BatchStatus, DocType, CheckLayer, ReportType, JobStatus)을 정의하여, 모든 모델에서 참조할 타입 안전 상수 체계를 확립한다.
- **설계 원칙:** SRS §3.8 Prisma Schema에 정의된 Enum 값을 **그대로** 구현한다. 임의 Enum 추가·변경 금지.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema`](../SRS-HR-AI-Verification-v1.1.md)
  - Enum 정의 (L673 ~ 688): UserRole, UserStatus, BatchStatus, DocType, CheckLayer, ReportType, JobStatus
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 ERD`](../SRS-HR-AI-Verification-v1.1.md)
  - 각 모델에서 참조하는 Enum 관계
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic B`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `prisma/schema.prisma`에 UserRole enum 정의
  ```prisma
  enum UserRole { OPERATOR ADMIN AUDITOR }
  ```
  > OPERATOR: 채용 담당자(업로드, 조회). ADMIN: 관리자(승인/반려, 리포트). AUDITOR: 감사자(Audit Trail 열람).
- [ ] **TB-2:** UserStatus enum 정의
  ```prisma
  enum UserStatus { ACTIVE LOCKED DEACTIVATED }
  ```
- [ ] **TB-3:** BatchStatus enum 정의
  ```prisma
  enum BatchStatus { OPEN IN_PROGRESS COMPLETED }
  ```
- [ ] **TB-4:** DocType enum 정의
  ```prisma
  enum DocType { DEGREE CERTIFICATE CAREER }
  ```
  > DEGREE: 학위/졸업증명서. CERTIFICATE: 자격증. CAREER: 경력증명서.
- [ ] **TB-5:** CheckLayer enum 정의
  ```prisma
  enum CheckLayer { INPUT OCR AGENCY }
  ```
  > Triple Check 3단계: INPUT(입력값), OCR(추출값), AGENCY(공공 API 조회값).
- [ ] **TB-6:** ReportType enum 정의 (v1.1 신규)
  ```prisma
  enum ReportType { PDF EXCEL }
  ```
- [ ] **TB-7:** JobStatus enum 정의
  ```prisma
  enum JobStatus {
    PENDING
    IN_PROGRESS
    PASS
    FAIL
    MANUAL_REVIEW
    API_UNAVAILABLE
    APPROVED
    REJECTED
  }
  ```
- [ ] **TB-8:** `npx prisma generate` 실행 → 에러 0건 확인
- [ ] **TB-9:** TypeScript에서 `import { UserRole, JobStatus } from '@prisma/client'` 가능 여부 확인

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Enum 정의 및 생성 성공**
- **Given:** FR-003이 완료된 Prisma 프로젝트
- **When:** 7개 Enum을 `schema.prisma`에 추가하고 `npx prisma generate` 실행
- **Then:** 에러 없이 완료. `node_modules/.prisma/client`에 타입 생성.

**Scenario 2: TypeScript 타입 안전성**
- **Given:** Enum이 생성된 상태
- **When:** TypeScript 파일에서 `UserRole.OPERATOR` 접근
- **Then:** 자동완성(IntelliSense) 지원. 잘못된 값(예: `UserRole.SUPERADMIN`) 입력 시 컴파일 에러.

**Scenario 3: SQLite 호환성**
- **Given:** SQLite datasource 기준
- **When:** Enum이 포함된 스키마로 마이그레이션
- **Then:** SQLite에서 Enum이 문자열로 저장됨. 에러 없음.

## :gear: Technical & Non-Functional Constraints
- **SQLite 호환:** SQLite는 네이티브 Enum을 지원하지 않음. Prisma가 내부적으로 문자열로 처리.
- **PostgreSQL 전환:** 배포 시 PostgreSQL로 전환하면 네이티브 Enum 타입 사용. Prisma가 자동 처리.
- **Enum 변경 주의:** 마이그레이션 후 Enum 값을 삭제/변경하면 기존 데이터와 충돌 가능. 추가만 안전.

## :checkered_flag: Definition of Done (DoD)
- [ ] 7개 Enum(UserRole, UserStatus, BatchStatus, DocType, CheckLayer, ReportType, JobStatus)이 `schema.prisma`에 정의되어 있는가?
- [ ] `npx prisma generate`가 에러 없이 완료되는가?
- [ ] TypeScript에서 Enum 타입을 import하여 사용 가능한가?
- [ ] JobStatus에 8개 값(PENDING ~ REJECTED)이 모두 포함되어 있는가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-003 (A-003: Prisma 초기 설정 완료)
- **Blocks:**
  - B-002 ~ B-009 (전체 모델 정의 — Enum 참조)
  - C-001 (TypeScript 공통 타입 정의 — Enum 기반)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-001 | SRS: v1.1*
