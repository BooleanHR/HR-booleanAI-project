---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-005: 프로젝트 디렉토리 구조 정의"
labels: 'feature, scaffolding, architecture, priority:high'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: A-005
---

## :dart: Summary
- **기능명:** [FR-005] 프로젝트 디렉토리 구조 정의
- **Epic:** Scaffolding (프로젝트 초기 셋업)
- **목적:** MVP 전체 코드베이스의 **표준 디렉토리 구조**를 확정하고, 이후 모든 개발 태스크에서 AI 에이전트가 "어디에 무엇을 넣을지"를 혼동 없이 참조할 수 있는 **단일 구조 기준(Architectural SSOT)**을 확립한다.
- **설계 원칙:** SRS §3.10 Component Diagram 기반. Next.js App Router 규약을 따르면서, Server Actions, Route Handlers, Prisma 모델, 유틸리티, UI 컴포넌트를 역할별로 명확히 분리한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.10 Component Diagram`](../SRS-HR-AI-Verification-v1.1.md)
  - 컴포넌트: Server Actions(비즈니스 로직), Route Handlers(API), Middleware(Auth), Vercel AI SDK, sharp, exceljs, 파일 자동 명명 유틸리티
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.12 Class Diagram`](../SRS-HR-AI-Verification-v1.1.md)
  - 서비스: VerificationService, GeminiOcrService, FileConversionService, FileNamingService, AgencyApiClient, AuditTrailService, NotificationService, ReportService, PollService
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 C-TEC-001 ~ 002`](../SRS-HR-AI-Verification-v1.1.md)
  - 단일 Next.js 풀스택 — Server Actions / Route Handlers만 사용
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.7 API Overview`](../SRS-HR-AI-Verification-v1.1.md)
  - API 경로: `/api/verifications`, `/api/reports`, `/api/notifications`, `/api/dashboard`
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.11 Use Case Diagram`](../SRS-HR-AI-Verification-v1.1.md)
  - 페이지: 서류 업로드, 대시보드, 승인/반려, PDF/엑셀 다운로드, 알림 관리, Audit Trail 열람, 로그인
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic A`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 표준 디렉토리 구조 생성

아래 트리 구조를 그대로 생성한다. 각 디렉토리에 `.gitkeep` 또는 `index.ts` (barrel export) 파일을 배치하여 Git 추적이 가능하도록 한다.

```
src/
├── app/                         # Next.js App Router (페이지 + API)
│   ├── layout.tsx               # 루트 레이아웃 (Supabase Auth Provider)
│   ├── page.tsx                 # 메인 페이지 (→ 대시보드 리다이렉트)
│   ├── login/
│   │   └── page.tsx             # 로그인 페이지
│   ├── upload/
│   │   └── page.tsx             # 서류 업로드 페이지
│   ├── dashboard/
│   │   ├── page.tsx             # 검증 결과 대시보드
│   │   └── [jobId]/
│   │       └── page.tsx         # 검증 결과 상세 (OCR vs Agency 비교)
│   ├── review/
│   │   └── page.tsx             # MANUAL_REVIEW 큐 페이지
│   ├── notifications/
│   │   └── page.tsx             # 알림 관리 (선택 발송 UI)
│   ├── audit/
│   │   └── page.tsx             # Audit Trail 열람 (AUDITOR 전용)
│   └── api/                     # Route Handlers
│       ├── verifications/
│       │   ├── route.ts         # POST: 검증 요청
│       │   └── [jobId]/
│       │       ├── route.ts     # GET: 검증 결과 조회
│       │       └── approve/
│       │           └── route.ts # POST: 승인/반려
│       ├── reports/
│       │   └── [batchId]/
│       │       ├── pdf/
│       │       │   └── route.ts # GET: PDF 다운로드
│       │       └── excel/
│       │           └── route.ts # GET: 엑셀 다운로드
│       ├── notifications/
│       │   ├── send/
│       │   │   └── route.ts     # POST: 선택 발송
│       │   └── preview/
│       │       └── [jobId]/
│       │           └── route.ts # GET: 알림 미리보기
│       └── dashboard/
│           └── stats/
│               └── route.ts     # GET: 통계 데이터
│
├── actions/                     # Server Actions ("use server" 함수)
│   ├── verification.ts          # uploadAndVerify, executeTripleCheck, approveJob, rejectJob
│   ├── ocr.ts                   # extractFields, classifyDocCategory (Gemini Vision)
│   ├── file-conversion.ts       # convertToStandard, autoOrientImage (sharp)
│   ├── file-naming.ts           # generateFilename, sanitizeFilename
│   ├── audit-trail.ts           # createTrail, logAccess, blockModification
│   ├── notification.ts          # previewNotification, sendSelectedNotifications, updateMessage
│   └── report.ts                # generatePdf, generateExcel
│
├── lib/                         # 공유 유틸리티 및 설정
│   ├── prisma.ts                # Prisma Client 싱글턴
│   ├── supabase/
│   │   ├── server.ts            # Server-side Supabase 클라이언트
│   │   └── client.ts            # Client-side Supabase 클라이언트
│   ├── gemini.ts                # Vercel AI SDK + Gemini Provider 설정
│   ├── resend.ts                # Resend API 클라이언트
│   ├── agency-api.ts            # 정부24 API 클라이언트 + Mock 폴백
│   ├── mock-responses.ts        # Mock 응답 함수 (HRDK, RPA 등)
│   ├── errors.ts                # HTTP 오류 응답 표준 유틸리티 (400 ~ 500)
│   ├── masking.ts               # 개인정보 마스킹 유틸리티 (홍○○, 010-****-1234)
│   ├── hash.ts                  # SHA-256 해시 유틸리티 (Audit Trail timestamp_hash)
│   └── constants.ts             # 상수 정의 (OCR 임계치 70, 보존기간 5년 등)
│
├── types/                       # TypeScript 타입/인터페이스 정의
│   ├── index.ts                 # barrel export
│   ├── ocr.ts                   # OcrResult, StructuredFields, CompareResult
│   ├── verification.ts          # VerificationResult, JobResult, AgencyResult
│   ├── notification.ts          # NotificationPreview, SendResult, DiscrepancyItem
│   ├── report.ts                # ReportResult, ExcelRow
│   └── api.ts                   # API Request/Response DTO 공통 타입
│
├── components/                  # React 컴포넌트
│   ├── ui/                      # shadcn/ui 컴포넌트 (자동 생성)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── header.tsx           # 상단 네비게이션 (로고, 사용자 정보, 로그아웃)
│   │   ├── sidebar.tsx          # 사이드바 네비게이션
│   │   └── main-layout.tsx      # 메인 레이아웃 래퍼
│   ├── upload/                  # 업로드 관련 컴포넌트
│   │   ├── file-dropzone.tsx    # 파일 드래그 & 드롭 영역
│   │   └── page-reorder.tsx     # 다중 페이지 순서 변경 UI
│   ├── dashboard/               # 대시보드 관련 컴포넌트
│   │   ├── verification-table.tsx   # 검증 결과 테이블
│   │   ├── stats-cards.tsx          # 통계 카드
│   │   └── detail-comparison.tsx    # OCR vs Agency 비교 패널
│   ├── approval/                # 승인/반려 관련 컴포넌트
│   │   ├── approve-button.tsx
│   │   ├── reject-dialog.tsx
│   │   └── review-queue.tsx
│   └── notification/            # 알림 관련 컴포넌트
│       ├── notification-list.tsx    # DRAFT 알림 목록 + 체크박스
│       ├── preview-modal.tsx        # 알림 미리보기 모달
│       └── send-button.tsx          # 선택 발송 버튼
│
├── hooks/                       # 커스텀 React Hooks
│   ├── use-verification-polling.ts  # SWR 5초 polling 훅
│   └── use-auth.ts                  # Supabase Auth 상태 관리 훅
│
└── middleware.ts                # Next.js Middleware (Supabase Auth 세션 + RBAC)

prisma/
├── schema.prisma                # Prisma 스키마 (8 모델, 7 Enum)
├── seed.ts                      # Seed 데이터 스크립트
├── migrations/                  # 자동 생성 마이그레이션 파일
└── dev.db                       # SQLite 로컬 DB (gitignore)
```

- [ ] **TB-2:** 각 디렉토리에 기본 파일 생성
  - `src/actions/` — 각 `.ts` 파일에 `"use server"` 지시어 + TODO 주석
  - `src/types/` — 빈 인터페이스 + `index.ts` barrel export
  - `src/lib/` — FR-003, FR-004에서 이미 생성된 파일 위치 확인
  - `src/hooks/` — 빈 훅 파일 + TODO 주석
  - `src/components/layout/` — 빈 레이아웃 컴포넌트 파일

- [ ] **TB-3:** `src/actions/` Server Action 파일 템플릿 작성
  - 각 파일 최상단에 `"use server"` 지시어 포함
  - 각 함수에 `// TODO: [TASK-ID] 구현 예정` 주석 포함
  - 예시:
  ```typescript
  "use server"
  
  // TODO: [P-001] uploadAndVerify 통합 파이프라인 구현
  export async function uploadAndVerify(formData: FormData) {
    throw new Error("Not implemented")
  }
  
  // TODO: [K-003] 승인 로직 구현
  export async function approveJob(jobId: string, reviewerId: string) {
    throw new Error("Not implemented")
  }
  ```

- [ ] **TB-4:** `src/types/index.ts` barrel export 설정
  ```typescript
  export * from './ocr'
  export * from './verification'
  export * from './notification'
  export * from './report'
  export * from './api'
  ```

- [ ] **TB-5:** README.md 디렉토리 구조 문서화
  - 프로젝트 루트 `README.md`에 디렉토리 설명 섹션 추가
  - 각 디렉토리의 역할과 컨벤션을 간략히 서술

- [ ] **TB-6:** `npm run build` 실행 → 디렉토리 구조 변경 후 빌드 에러 0건 확인

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 핵심 디렉토리 존재**
- **Given:** FR-001 ~ 004가 완료된 Next.js 프로젝트
- **When:** `src/` 디렉토리를 확인
- **Then:** `app/`, `actions/`, `lib/`, `types/`, `components/`, `hooks/` 6개 최상위 디렉토리가 존재해야 한다.

**Scenario 2: App Router 페이지 경로**
- **Given:** 디렉토리 구조가 생성된 상태
- **When:** `src/app/` 하위를 확인
- **Then:** `login/`, `upload/`, `dashboard/`, `review/`, `notifications/`, `audit/` 6개 페이지 디렉토리가 존재해야 한다.

**Scenario 3: API Route Handler 경로**
- **Given:** 디렉토리 구조가 생성된 상태
- **When:** `src/app/api/` 하위를 확인
- **Then:** `verifications/`, `reports/`, `notifications/`, `dashboard/` 4개 API 도메인 디렉토리가 존재하고, SRS §3.7의 8개 엔드포인트에 대응하는 `route.ts` 파일이 (빈 상태라도) 존재해야 한다.

**Scenario 4: Server Action 파일 템플릿**
- **Given:** `src/actions/` 디렉토리가 존재
- **When:** `src/actions/verification.ts`를 확인
- **Then:** 파일 최상단에 `"use server"` 지시어가 있어야 하고, `uploadAndVerify`, `approveJob`, `rejectJob` 함수 스텁이 존재해야 한다.

**Scenario 5: SRS Class Diagram 서비스 매핑**
- **Given:** SRS §3.12 Class Diagram에 정의된 9개 서비스
- **When:** `src/actions/`과 `src/lib/` 디렉토리를 확인
- **Then:** 다음 매핑이 성립해야 한다:
  | SRS 서비스 | 파일 위치 |
  |---|---|
  | VerificationService | `src/actions/verification.ts` |
  | GeminiOcrService | `src/actions/ocr.ts` |
  | FileConversionService | `src/actions/file-conversion.ts` |
  | FileNamingService | `src/actions/file-naming.ts` |
  | AgencyApiClient | `src/lib/agency-api.ts` |
  | AuditTrailService | `src/actions/audit-trail.ts` |
  | NotificationService | `src/actions/notification.ts` |
  | ReportService | `src/actions/report.ts` |
  | PollService | `src/app/api/dashboard/stats/route.ts` |

**Scenario 6: 빌드 성공**
- **Given:** 전체 디렉토리 구조가 생성된 상태
- **When:** `npm run build` 실행
- **Then:** 빌드가 에러 없이 완료되어야 한다.

## :gear: Technical & Non-Functional Constraints
- **네이밍 컨벤션:**
  - 파일명: `kebab-case` (예: `file-conversion.ts`, `stats-cards.tsx`)
  - 컴포넌트 함수: `PascalCase` (예: `FileDropzone`, `VerificationTable`)
  - Server Action 함수: `camelCase` (예: `uploadAndVerify`, `approveJob`)
  - 타입/인터페이스: `PascalCase` (예: `OcrResult`, `VerificationResult`)
- **Server Action 규칙:** `src/actions/` 디렉토리 내 모든 `.ts` 파일은 최상단에 `"use server"` 지시어 필수.
- **Route Handler 규칙:** `src/app/api/` 하위에서만 Route Handler 사용. `src/actions/`의 Server Action과 역할 중복 불가 — Route Handler는 SWR polling 응답, 파일 스트림 반환 등 Server Action으로 처리하기 어려운 경우에만 사용.
- **컴포넌트 계층:** `src/components/ui/`는 shadcn/ui 자동 생성 영역. 커스텀 비즈니스 컴포넌트는 도메인별 하위 디렉토리(`upload/`, `dashboard/`, `approval/`, `notification/`)에 배치.

## :checkered_flag: Definition of Done (DoD)
- [ ] `src/` 하위 6개 최상위 디렉토리(app, actions, lib, types, components, hooks)가 존재하는가?
- [ ] `src/app/`에 6개 페이지 디렉토리(login, upload, dashboard, review, notifications, audit)가 존재하는가?
- [ ] `src/app/api/`에 SRS §3.7 API 경로에 대응하는 디렉토리 구조가 존재하는가?
- [ ] `src/actions/`에 SRS §3.12 서비스에 대응하는 7개 Server Action 파일이 존재하는가?
- [ ] 각 Server Action 파일에 `"use server"` 지시어가 포함되어 있는가?
- [ ] `src/types/index.ts` barrel export가 설정되어 있는가?
- [ ] `src/middleware.ts` 파일이 존재하는가? (빈 상태 허용)
- [ ] README.md에 디렉토리 구조 설명이 포함되어 있는가?
- [ ] `npm run build`가 에러 없이 완료되는가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-001 (A-001: Next.js 프로젝트 생성 완료)
- **Blocks:**
  - A-006 (npm 패키지 일괄 설치 — 디렉토리 구조 확정 후 진행 권장)
  - B-001 ~ B-010 (Prisma 스키마 → `prisma/schema.prisma` 위치 확정)
  - C-001 ~ C-010 (API 계약 → `src/types/` 위치 확정)
  - 이후 모든 Logic 태스크 (Epic E ~ P) — 파일 배치 위치 참조

---
*Document Version: v0.1 (초안) | Source: TASK-LIST A-005 | SRS: v1.1*
