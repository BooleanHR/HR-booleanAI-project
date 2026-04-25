---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-003: Prisma 초기 설정 (SQLite 로컬 → PostgreSQL 배포 전략)"
labels: 'feature, scaffolding, backend, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: A-003
---

## :dart: Summary
- **기능명:** [FR-003] Prisma 초기 설정 (SQLite 로컬 기준 datasource)
- **Epic:** Scaffolding (프로젝트 초기 셋업)
- **목적:** 시스템의 데이터 영속 계층인 **Prisma ORM**을 설정하고, 로컬 개발 환경에서 **SQLite**로 즉시 실행 가능한 상태를 만든다. 배포 시 환경변수(`DATABASE_URL`)만 교체하여 **Supabase PostgreSQL**로 무중단 전환할 수 있는 듀얼 전략을 확보한다.
- **설계 원칙:** SRS §2.1 C-TEC-003에 따라 JSON 타입 컬럼은 `Text`로 대체하여 SQLite/PostgreSQL 간 호환성을 유지한다. 본 태스크는 Prisma 설정 및 초기 마이그레이션까지만 포함하며, 개별 모델 정의는 별도 태스크(B-001 ~ B-010)에서 수행한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 C-TEC-003`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-003:** DB는 Prisma + 로컬 SQLite(개발) → Prisma + Supabase PostgreSQL(배포). JSON 타입은 Text로 대체.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ASM-05`](../SRS-HR-AI-Verification-v1.1.md)
  - **ASM-05:** 로컬 개발은 SQLite, Vercel 배포 시 Supabase PostgreSQL로 전환한다.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema (MVP v1.1)`](../SRS-HR-AI-Verification-v1.1.md)
  - Prisma 스키마 전체 정의 (8 모델, 7 Enum) — 참조용. 본 태스크에서는 **설정(config)만** 수행.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ADR-001`](../SRS-HR-AI-Verification-v1.1.md)
  - **ADR-001:** 단일 Next.js 풀스택 내에서 Prisma Client 사용
- REF-06: Prisma 공식 문서 — SQLite↔PostgreSQL 마이그레이션
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic A, Epic B`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Prisma CLI 및 클라이언트 설치
  ```bash
  npm install prisma --save-dev
  npm install @prisma/client
  ```
- [ ] **TB-2:** `npx prisma init --datasource-provider sqlite` 실행
  - `prisma/schema.prisma` 파일 생성 확인
  - `prisma/dev.db` SQLite 파일 경로 설정
- [ ] **TB-3:** `prisma/schema.prisma` 듀얼 datasource 주석 설정
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }
  
  datasource db {
    // ===== 로컬 개발: SQLite =====
    provider = "sqlite"
    url      = "file:./dev.db"
  
    // ===== Vercel 배포: Supabase PostgreSQL =====
    // provider  = "postgresql"
    // url       = env("DATABASE_URL")
    // directUrl = env("DIRECT_URL")
  }
  ```
  > ⚠️ **주의:** 로컬 개발 시 SQLite, 배포 시 PostgreSQL로 주석 전환. `env("DATABASE_URL")` 방식으로 환경변수 기반 전환 가능하나, **provider 자체를 바꿔야 하므로** 주석 토글 방식 사용.
- [ ] **TB-4:** Prisma Client 싱글턴 인스턴스 생성
  - `src/lib/prisma.ts` 파일 생성
  ```typescript
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
  > **이유:** Next.js 개발 모드에서 HMR(Hot Module Replacement) 시 Prisma Client가 중복 생성되는 것을 방지하기 위한 공식 권장 패턴.
- [ ] **TB-5:** 초기 마이그레이션 테스트 — 빈 스키마로 `npx prisma migrate dev --name init` 실행
  - `prisma/migrations/` 디렉토리 생성 확인
  - `prisma/dev.db` SQLite 파일 생성 확인
- [ ] **TB-6:** Prisma Studio 접속 테스트
  ```bash
  npx prisma studio
  ```
  - `http://localhost:5555`에서 Prisma Studio가 정상 실행되는지 확인
- [ ] **TB-7:** `.gitignore`에 Prisma 관련 항목 추가 확인
  ```
  prisma/dev.db
  prisma/dev.db-journal
  ```
- [ ] **TB-8:** JSON 호환성 가이드 주석 삽입
  - `schema.prisma` 파일 상단에 다음 주석 추가:
  ```
  // ⚠️ JSON 호환성 주의: SQLite는 Json 타입을 지원하지 않으므로
  // 모든 JSON 필드는 String(Text) 타입으로 정의하고,
  // 애플리케이션 레벨에서 JSON.parse/JSON.stringify로 처리한다.
  // 이는 C-TEC-003 규약에 따른 설계 결정이다.
  ```

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Prisma 초기화 성공**
- **Given:** FR-001이 완료된 Next.js 프로젝트가 존재
- **When:** `npx prisma init --datasource-provider sqlite` 실행
- **Then:** `prisma/schema.prisma` 파일이 생성되고, SQLite datasource가 설정되어야 한다.

**Scenario 2: Prisma Client 싱글턴 설정**
- **Given:** Prisma가 초기화된 상태
- **When:** `src/lib/prisma.ts`에서 `prisma`를 import
- **Then:** HMR 시에도 단일 PrismaClient 인스턴스만 생성되어야 한다. (개발 로그에 "PrismaClient already initialized" 경고 없음)

**Scenario 3: 초기 마이그레이션 실행**
- **Given:** 빈 Prisma 스키마가 존재
- **When:** `npx prisma migrate dev --name init` 실행
- **Then:** `prisma/migrations/` 디렉토리와 `prisma/dev.db` 파일이 생성되어야 한다. 에러 0건.

**Scenario 4: Prisma Studio 접속**
- **Given:** 마이그레이션이 완료된 상태
- **When:** `npx prisma studio` 실행
- **Then:** `http://localhost:5555`에서 Prisma Studio UI가 렌더링되어야 한다.

**Scenario 5: 듀얼 datasource 전환 준비**
- **Given:** `schema.prisma`에 SQLite 설정이 활성화된 상태
- **When:** 주석을 토글하여 PostgreSQL datasource를 활성화하고 `DATABASE_URL` 환경변수 설정
- **Then:** `npx prisma generate` 실행 시 PostgreSQL용 Prisma Client가 생성되어야 한다. (실제 DB 연결은 V-001 태스크에서 수행)

## :gear: Technical & Non-Functional Constraints
- **스택 제약:** C-TEC-003 — Prisma ORM 단독 사용. Drizzle, TypeORM, Knex 등 대안 ORM 사용 금지.
- **JSON 호환성:** SQLite는 `Json` Prisma 타입을 지원하지 않음. 모든 JSON 필드는 `String` 타입으로 선언하고, 애플리케이션 코드에서 `JSON.parse()`/`JSON.stringify()`로 직접 처리.
- **provider 전환:** Prisma에서 `provider`는 런타임 환경변수로 변경 불가. 배포 시 `schema.prisma` 파일의 주석을 토글하거나, CI 스크립트로 자동 교체.
- **개발 모드 로깅:** `log: ['query', 'error', 'warn']`으로 설정하여 SQL 쿼리 디버깅 지원.

## :checkered_flag: Definition of Done (DoD)
- [ ] `prisma/schema.prisma` 파일이 SQLite datasource로 정상 설정되어 있는가?
- [ ] `src/lib/prisma.ts` 싱글턴 인스턴스가 구현되어 있는가?
- [ ] `npx prisma migrate dev --name init`이 에러 없이 완료되는가?
- [ ] `prisma/dev.db` 파일이 생성되어 있는가?
- [ ] `npx prisma studio`가 정상 실행되는가?
- [ ] PostgreSQL 전환을 위한 듀얼 datasource 주석이 준비되어 있는가?
- [ ] `.gitignore`에 `prisma/dev.db`, `prisma/dev.db-journal`이 포함되어 있는가?
- [ ] JSON 호환성 가이드 주석이 schema.prisma에 삽입되어 있는가?
- [ ] `npm run build` 에러 없이 완료되는가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-001 (A-001: Next.js 프로젝트 생성 완료)
- **Blocks:**
  - B-001 ~ B-010 (전체 DB 스키마 모델 정의 — Prisma 설정이 선행 조건)
  - D-005 (Seed 데이터 생성 — Prisma 마이그레이션 완료 필요)
  - V-001 (배포 시 PostgreSQL 전환 — datasource 토글)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST A-003 | SRS: v1.1*
