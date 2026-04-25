---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-001: Next.js (App Router) 프로젝트 생성 + TypeScript 설정"
labels: 'feature, scaffolding, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: A-001
---

## :dart: Summary
- **기능명:** [FR-001] Next.js (App Router) 프로젝트 생성 + TypeScript 설정
- **Epic:** Scaffolding (프로젝트 초기 셋업)
- **목적:** HR AI 서류 진위확인 솔루션 MVP의 기반이 되는 **Next.js App Router 풀스택 프로젝트**를 생성하고, TypeScript 엄격 모드를 활성화하여 이후 모든 개발 태스크의 출발점(SSOT)을 확립한다.
- **설계 원칙:** SRS §2.1 C-TEC-001에 따라 **단일 Next.js 풀스택으로만** 구현하며, 별도 Express/FastAPI/NestJS 서버를 절대 생성하지 않는다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 시스템 내부 — 단일 통합 프레임워크`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-001:** 모든 서비스는 Next.js (App Router) 기반 단일 풀스택으로 구현
  - **C-TEC-002:** 서버 로직은 Next.js Server Actions 또는 Route Handlers 만 사용
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 아키텍처 제약 (ADR)`](../SRS-HR-AI-Verification-v1.1.md)
  - **ADR-001:** 단일 Next.js 풀스택 — 별도 백엔드 서버 금지
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.4 스택 선택 이유 및 제한사항`](../SRS-HR-AI-Verification-v1.1.md)
  - Next.js App Router 선택 이유: 풀스택 단일 파일, AI 코드 생성 친화적
  - 알려진 제한: Vercel Serverless 실행 시간 60초 제한 (Pro 기준)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic A: 프로젝트 초기 셋업`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `npx create-next-app@latest ./` 명령으로 Next.js App Router 프로젝트 생성
  - 옵션: `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - 프로젝트 루트에서 초기화 (`./` 사용)
- [ ] **TB-2:** `tsconfig.json` TypeScript 엄격 모드 확인 및 조정
  - `"strict": true` 확인
  - `"noUncheckedIndexedAccess": true` 추가 (타입 안전성 강화)
  - `"paths": { "@/*": ["./src/*"] }` alias 확인
- [ ] **TB-3:** `.env.local` 환경변수 템플릿 파일 생성
  ```env
  # Database
  DATABASE_URL="file:./prisma/dev.db"
  DIRECT_URL=""
  
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=""
  NEXT_PUBLIC_SUPABASE_ANON_KEY=""
  
  # Gemini AI
  GEMINI_API_KEY=""
  
  # Resend (Email)
  RESEND_API_KEY=""
  ```
- [ ] **TB-4:** `.env.example` 파일 생성 (시크릿 값 없는 키 목록만)
- [ ] **TB-5:** `.gitignore` 검증 — `.env.local`, `node_modules/`, `.next/`, `prisma/dev.db` 포함 확인
- [ ] **TB-6:** `next.config.ts` 기본 설정 확인
  - `experimental.serverActions` 활성화 확인 (Next.js 14+ 기본 활성화)
  - `images.remotePatterns` 필요 시 Supabase Storage 도메인 추가 준비
- [ ] **TB-7:** 초기 `npm run dev` 실행 후 `http://localhost:3000` 접속 → 기본 페이지 렌더링 확인
- [ ] **TB-8:** 초기 `npm run build` 실행 → 빌드 에러 0건 확인

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 프로젝트 생성 및 실행**
- **Given:** 빈 프로젝트 디렉토리가 주어짐
- **When:** `npx create-next-app@latest ./` 실행 후 `npm run dev` 실행
- **Then:** `http://localhost:3000`에서 Next.js App Router 기본 페이지가 렌더링되어야 한다.

**Scenario 2: TypeScript 엄격 모드**
- **Given:** 프로젝트가 생성된 상태
- **When:** `tsconfig.json`을 확인
- **Then:** `"strict": true`가 설정되어 있어야 한다.

**Scenario 3: App Router 디렉토리 구조**
- **Given:** 프로젝트가 생성된 상태
- **When:** `src/app/` 디렉토리를 확인
- **Then:** `layout.tsx`와 `page.tsx`가 App Router 형식으로 존재해야 한다. `pages/` 디렉토리는 존재하지 않아야 한다.

**Scenario 4: 환경변수 템플릿**
- **Given:** 프로젝트가 생성된 상태
- **When:** `.env.local` 파일을 확인
- **Then:** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY` 키가 정의되어 있어야 한다.

**Scenario 5: 프로덕션 빌드 성공**
- **Given:** 프로젝트가 생성되고 환경변수 설정 완료
- **When:** `npm run build` 실행
- **Then:** 빌드가 에러 없이 완료되어야 한다. TypeScript 컴파일 에러 0건.

## :gear: Technical & Non-Functional Constraints
- **스택 제약:** C-TEC-001 — Next.js App Router 단일 풀스택. Express, FastAPI, NestJS 등 별도 서버 프레임워크 사용 절대 금지.
- **Server Action 지원:** C-TEC-002 — `"use server"` 지시어가 동작하는 App Router 버전 사용 필수 (Next.js 14+)
- **배포 대상:** C-TEC-007 — Vercel 배포 호환 (Serverless Functions 60초 제한 인지)
- **Node.js 버전:** Vercel 지원 LTS 버전 (18.x 또는 20.x)

## :checkered_flag: Definition of Done (DoD)
- [ ] `npm run dev`로 로컬 개발 서버가 정상 실행되는가?
- [ ] `npm run build`가 에러 없이 완료되는가?
- [ ] `tsconfig.json`에 `"strict": true`가 설정되어 있는가?
- [ ] `src/app/layout.tsx`, `src/app/page.tsx`가 App Router 형식으로 존재하는가?
- [ ] `pages/` 디렉토리가 존재하지 않는가? (App Router만 사용)
- [ ] `.env.local`, `.env.example` 파일이 생성되어 있는가?
- [ ] `.gitignore`에 `.env.local`, `node_modules/`, `.next/`, `prisma/dev.db`가 포함되어 있는가?

## :construction: Dependencies & Blockers
- **Depends on:** None (최초 태스크 — 의존성 없음)
- **Blocks:**
  - FR-002 (A-002: shadcn/ui + Tailwind CSS 설치)
  - FR-003 (A-003: Prisma 초기 설정)
  - FR-004 (A-004: Supabase 프로젝트 설정)
  - FR-005 (A-005: 디렉토리 구조 정의)
  - A-006 (npm 패키지 일괄 설치)
  - C-010 (HTTP 오류 응답 표준)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST A-001 | SRS: v1.1*
