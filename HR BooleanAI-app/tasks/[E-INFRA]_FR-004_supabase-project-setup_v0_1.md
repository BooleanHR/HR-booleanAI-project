---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-004: Supabase 프로젝트 생성 + 환경변수 설정"
labels: 'feature, scaffolding, infra, backend, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: A-004
---

## :dart: Summary
- **기능명:** [FR-004] Supabase 프로젝트 생성 + 환경변수 설정
- **Epic:** Scaffolding (프로젝트 초기 셋업)
- **목적:** MVP의 인증(Auth), 데이터베이스(PostgreSQL), 파일 저장소(Storage) 인프라를 제공하는 **Supabase 프로젝트**를 생성하고, Next.js 앱과 연동에 필요한 모든 환경변수를 설정하여 인프라 기반을 확립한다.
- **설계 원칙:** SRS §2.2 C-TEC-007에 따라 **Vercel + Supabase** 조합으로 인프라를 단일화하며, 무료 플랜으로 PoC 운영이 가능하도록 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 C-TEC-003`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-003:** Prisma + Supabase PostgreSQL (배포)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.2 C-TEC-007`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-007:** 배포 및 인프라는 Vercel 단일화. Vercel 환경변수 패널로 시크릿 관리.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.4 스택 선택 이유`](../SRS-HR-AI-Verification-v1.1.md)
  - Supabase 선택 이유: 무료 플랜 충분 (DB 500MB, Storage 1GB); RLS로 RBAC 구현 용이. 제한: 무료 플랜 DB 500MB.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.6 시스템 전체 흐름`](../SRS-HR-AI-Verification-v1.1.md)
  - Supabase 구성: PostgreSQL (Prisma) + Storage (원본+변환 파일) + Auth (세션/JWT)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.14 REQ-NF-020 ~ 026`](../SRS-HR-AI-Verification-v1.1.md)
  - 인증: Supabase Auth (이메일/패스워드 or Google OAuth)
  - 저장 암호화: Supabase Storage AES-256
  - RBAC: Supabase RLS + Middleware
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.16 예상 월 운영 비용`](../SRS-HR-AI-Verification-v1.1.md)
  - Supabase: Free (500MB DB, 1GB Storage) → $0/월
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic A`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Supabase 대시보드에서 신규 프로젝트 생성
  - 프로젝트명: `hr-ai-verification` (또는 팀 규칙에 맞는 명칭)
  - Region: `Northeast Asia (Seoul)` 또는 가장 가까운 리전
  - Database Password: 강력한 비밀번호 생성 후 안전하게 보관
  - 플랜: Free tier
- [ ] **TB-2:** Supabase 대시보드에서 API 키 확인
  - `Project Settings` → `API`에서 다음 값 확인:
    - `URL` (Project URL)
    - `anon (public)` key
    - `service_role` key (Server-side 전용, 프론트엔드 노출 금지)
  - `Project Settings` → `Database`에서:
    - `Connection string` (URI) — Prisma용 `DATABASE_URL`
    - `Direct connection` — Prisma용 `DIRECT_URL` (Connection Pooler 우회)
- [ ] **TB-3:** Supabase JS 클라이언트 라이브러리 설치
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```
- [ ] **TB-4:** `.env.local` 환경변수 값 설정
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
  SUPABASE_SERVICE_ROLE_KEY="eyJ..." # Server-side 전용
  
  # Supabase DB (Prisma용 — 배포 시 활성화)
  # DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
  # DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
  ```
- [ ] **TB-5:** Supabase Client 유틸리티 파일 생성
  - `src/lib/supabase/server.ts` — Server Component / Server Action용 클라이언트
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { cookies } from 'next/headers'

  export async function createClient() {
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* Server Component에서는 set 불가 — 무시 */ }
          },
        },
      }
    )
  }
  ```
  - `src/lib/supabase/client.ts` — Client Component용 (브라우저)
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'

  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  ```
- [ ] **TB-6:** Supabase Storage 버킷 생성
  - Supabase 대시보드 → Storage → `documents` 버킷 생성
  - 접근 권한: **Private** (인증된 사용자만 접근)
  - 파일 크기 제한: 20MB (SRS §3.13 REQ-FUNC-005)
  - 허용 MIME types: `application/pdf, image/jpeg, image/png, image/heic, image/bmp, image/tiff, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- [ ] **TB-7:** Supabase Auth 기본 설정 확인
  - `Authentication` → `Providers` → Email 활성화 확인
  - Email 확인: PoC 단계에서는 **비활성화** (즉시 로그인 가능)
  - Google OAuth: 선택 사항 — 설정 안내 주석으로 남겨둠
- [ ] **TB-8:** 연결 테스트 — Server Action에서 Supabase 클라이언트 생성 후 `supabase.auth.getUser()` 호출 성공 확인
- [ ] **TB-9:** `.env.example` 업데이트 — Supabase 관련 키 목록 추가 (값 없이 키만)

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Supabase 프로젝트 생성**
- **Given:** Supabase 계정이 존재
- **When:** 신규 프로젝트를 Free 플랜으로 생성
- **Then:** 프로젝트 대시보드에서 API URL과 anon key가 확인 가능해야 한다.

**Scenario 2: 환경변수 설정 완료**
- **Given:** Supabase 프로젝트가 생성된 상태
- **When:** `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값을 설정
- **Then:** Next.js 앱에서 `process.env.NEXT_PUBLIC_SUPABASE_URL`이 정상적으로 읽혀야 한다.

**Scenario 3: Supabase 클라이언트 연결 테스트**
- **Given:** 환경변수가 설정되고 Supabase 클라이언트 유틸리티가 구현된 상태
- **When:** Server Action에서 `createClient()`를 호출 후 `supabase.auth.getUser()` 실행
- **Then:** 에러 없이 응답을 반환해야 한다 (미인증 상태라면 `user: null` 반환).

**Scenario 4: Storage 버킷 생성**
- **Given:** Supabase 프로젝트가 존재
- **When:** `documents` 버킷을 Private으로 생성
- **Then:** Supabase 대시보드 Storage에서 `documents` 버킷이 표시되어야 한다.

**Scenario 5: 시크릿 보안**
- **Given:** 환경변수가 설정된 상태
- **When:** `.env.local` 파일을 확인하고, `.gitignore`를 확인
- **Then:** `.env.local`이 `.gitignore`에 포함되어 있어야 한다. `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 코드(`NEXT_PUBLIC_` prefix 없이)에서만 사용되어야 한다.

## :gear: Technical & Non-Functional Constraints
- **인프라 제약:** C-TEC-007 — Vercel + Supabase 조합 외 추가 인프라 사용 금지 (AWS, GCP 직접 사용 금지).
- **무료 플랜 한도:** Supabase Free — DB 500MB, Storage 1GB, Auth 50,000 MAU. PoC 100건 이하 기준 충분.
- **보안:** `SUPABASE_SERVICE_ROLE_KEY`는 Server-side 코드에서만 사용. 브라우저에 절대 노출 금지. `NEXT_PUBLIC_` prefix가 없으므로 자동으로 서버 전용.
- **REQ-NF-021:** Supabase Storage 기본 AES-256 암호화 활성화 확인.
- **Connection Pooler:** Vercel Serverless 환경에서는 PgBouncer를 통한 connection pooling 필수. `DATABASE_URL`에 `?pgbouncer=true` 파라미터 필요.

## :checkered_flag: Definition of Done (DoD)
- [ ] Supabase 프로젝트가 생성되고 대시보드 접근 가능한가?
- [ ] `.env.local`에 Supabase 관련 5개 변수(URL, ANON_KEY, SERVICE_ROLE_KEY, DATABASE_URL, DIRECT_URL)가 정의되어 있는가? (DB 관련은 주석 상태 허용)
- [ ] `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`가 생성되어 있는가?
- [ ] `@supabase/supabase-js`, `@supabase/ssr` 패키지가 설치되어 있는가?
- [ ] 서버에서 `createClient()` 호출 시 에러 없이 Supabase 인스턴스가 반환되는가?
- [ ] Storage에 `documents` 버킷(Private)이 생성되어 있는가?
- [ ] Auth Provider에서 Email이 활성화되어 있는가?
- [ ] `.env.example`에 Supabase 키 목록이 업데이트되어 있는가?
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 `NEXT_PUBLIC_` 없이 서버 전용으로 설정되어 있는가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-001 (A-001: Next.js 프로젝트 생성 완료)
- **Blocks:**
  - E-001 (Supabase Auth 설정 — Auth Provider 필요)
  - E-003 (Supabase RLS 정책 — DB 연결 필요)
  - F-006 (Supabase Storage 파일 업로드 — Storage 버킷 필요)
  - S-002 (Storage AES-256 암호화 확인)
  - S-003 (HTTPS/TLS 검증)
  - V-001 (배포 시 PostgreSQL 전환 — Connection string 필요)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST A-004 | SRS: v1.1*
