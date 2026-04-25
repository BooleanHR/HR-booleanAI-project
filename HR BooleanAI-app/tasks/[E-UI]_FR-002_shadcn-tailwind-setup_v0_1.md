---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-002: shadcn/ui 설치 및 Tailwind CSS 초기 설정"
labels: 'feature, scaffolding, frontend, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: A-002
---

## :dart: Summary
- **기능명:** [FR-002] shadcn/ui 설치 및 Tailwind CSS 초기 설정
- **Epic:** Scaffolding (프로젝트 초기 셋업)
- **목적:** MVP 전체 UI의 디자인 시스템 기반인 **Tailwind CSS + shadcn/ui** 환경을 구축하여, 이후 모든 프론트엔드 컴포넌트(대시보드, 업로드 UI, 승인/반려 다이얼로그, 알림 관리 등)가 일관된 스타일로 개발될 수 있도록 한다.
- **설계 원칙:** SRS §2.1 C-TEC-004에 따라 **CSS 파일 직접 작성을 금지**하고, shadcn/ui 컴포넌트를 우선 활용한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 C-TEC-004`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-004:** UI는 Tailwind CSS + shadcn/ui만 사용. CSS 파일 직접 작성 금지.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.4 스택 선택 이유`](../SRS-HR-AI-Verification-v1.1.md)
  - shadcn/ui 선택 이유: 복사 붙여넣기 방식; 커스텀 용이. 제한: 초기 설치 설정 필요.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.10 컴포넌트 책임 정의`](../SRS-HR-AI-Verification-v1.1.md)
  - Next.js Pages 역할: 서류 업로드 UI, 대시보드, 승인/반려 화면, 알림 선택 발송 UI — 모두 shadcn/ui 컴포넌트 사용
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-030`](../SRS-HR-AI-Verification-v1.1.md)
  - 담당자 대시보드에 '승인'/'반려' 버튼 표시 → Button, Card, Table, Dialog 등 사용 확정
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic A`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `npx shadcn@latest init` 실행하여 shadcn/ui 초기 설정
  - 스타일: `default`
  - Base color: `neutral` 또는 `slate` (HR 솔루션 전문적 톤)
  - CSS variables: `yes`
  - React Server Components: `yes`
  - `components.json` 경로 확인: `"@/components"`, `"@/lib/utils"`
- [ ] **TB-2:** `tailwind.config.ts` 커스텀 설정 확인
  - `content` 경로에 `./src/**/*.{ts,tsx}` 포함 확인
  - shadcn/ui가 삽입한 커스텀 colors, animations, keyframes 확인
  - `globals.css`에 `@tailwind` 지시어 3개 포함 확인
- [ ] **TB-3:** MVP 핵심 shadcn/ui 컴포넌트 사전 설치
  ```bash
  npx shadcn@latest add button card table dialog input textarea select badge tabs separator alert dropdown-menu checkbox label toast form
  ```
  > 이 컴포넌트들은 대시보드(Table, Card, Badge), 업로드(Input, Button, Form), 승인/반려(Dialog, Textarea), 알림(Checkbox, Toast) 등 MVP 전 페이지에서 사용됨.
- [ ] **TB-4:** `src/components/ui/` 디렉토리 확인 — shadcn/ui 컴포넌트 파일들이 올바르게 생성되었는지 검증
- [ ] **TB-5:** `src/lib/utils.ts` 유틸리티 확인 — `cn()` (className merge) 함수 존재 확인
- [ ] **TB-6:** 기본 레이아웃 검증 페이지 생성  
  - `src/app/page.tsx`에 shadcn/ui `Button`과 `Card` 컴포넌트를 임포트하여 렌더링 테스트
  - 정상적으로 스타일이 적용되는지 시각적 확인
- [ ] **TB-7:** 다크모드 테마 준비 (선택)
  - `globals.css`에 `:root`와 `.dark` CSS 변수 확인 (shadcn/ui 기본 제공)
  - 당장 토글 UI는 불필요하나, 확장 가능한 상태인지 확인

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: shadcn/ui 초기화 성공**
- **Given:** FR-001이 완료된 Next.js 프로젝트가 존재
- **When:** `npx shadcn@latest init` 실행
- **Then:** `components.json`이 프로젝트 루트에 생성되고, `src/lib/utils.ts`에 `cn()` 함수가 존재해야 한다.

**Scenario 2: 핵심 컴포넌트 설치**
- **Given:** shadcn/ui가 초기화된 상태
- **When:** `npx shadcn@latest add button card table dialog` 실행
- **Then:** `src/components/ui/button.tsx`, `card.tsx`, `table.tsx`, `dialog.tsx` 파일이 생성되어야 한다.

**Scenario 3: 컴포넌트 렌더링 검증**
- **Given:** Button, Card 컴포넌트가 설치된 상태
- **When:** `src/app/page.tsx`에서 `<Button>` 컴포넌트를 임포트하여 렌더링
- **Then:** 브라우저에서 Tailwind CSS 스타일이 적용된 버튼이 표시되어야 한다. 스타일 없는 기본 HTML 버튼이 아닌, 배경색/패딩/라운드가 적용된 버튼이어야 한다.

**Scenario 4: Tailwind CSS 동작 확인**
- **Given:** 프로젝트에 Tailwind CSS가 설정된 상태
- **When:** 임의의 컴포넌트에 `className="bg-blue-500 text-white p-4 rounded-lg"` 적용
- **Then:** 해당 스타일이 브라우저에서 정상 렌더링되어야 한다.

**Scenario 5: CSS 직접 작성 금지 규칙 준수**
- **Given:** 프로젝트가 설정된 상태
- **When:** `src/` 디렉토리 내 파일을 검사
- **Then:** `globals.css` 외에 별도의 `.css`, `.scss`, `.module.css` 파일이 존재하지 않아야 한다.

## :gear: Technical & Non-Functional Constraints
- **스택 제약:** C-TEC-004 — CSS 파일 직접 작성 금지. 모든 스타일은 Tailwind utility class 또는 shadcn/ui 컴포넌트의 `className` prop으로만 적용.
- **컴포넌트 접근:** shadcn/ui는 npm 패키지가 아닌 **복사/붙여넣기 방식**. `src/components/ui/` 아래에 소스 코드가 직접 위치하며 자유롭게 커스텀 가능.
- **의존성:** `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` — shadcn/ui 초기화 시 자동 설치됨.
- **번들 최적화:** 사용하지 않는 CSS는 Tailwind의 JIT(Just-In-Time) purge로 자동 제거.

## :checkered_flag: Definition of Done (DoD)
- [ ] `components.json` 파일이 프로젝트 루트에 존재하는가?
- [ ] `src/lib/utils.ts`에 `cn()` 함수가 존재하는가?
- [ ] `src/components/ui/` 아래에 최소 14개 컴포넌트(button, card, table, dialog, input, textarea, select, badge, tabs, separator, alert, dropdown-menu, checkbox, label) 파일이 존재하는가?
- [ ] `src/app/page.tsx`에서 shadcn/ui 컴포넌트가 정상 렌더링되는가?
- [ ] `npm run build`가 에러 없이 완료되는가?
- [ ] `globals.css` 외 별도 CSS 파일이 `src/` 내에 존재하지 않는가?
- [ ] Tailwind utility class가 브라우저에서 정상 적용되는가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-001 (A-001: Next.js 프로젝트 생성 완료)
- **Blocks:**
  - UI-010 (서류 업로드 UI 페이지)
  - UI-020 (대시보드 페이지 UI)
  - UI-021 (검증 결과 상세 모달 UI)
  - UI-022 (승인/반려 버튼 + 반려 사유 Dialog UI)
  - UI-030 (알림 관리 페이지 UI)
  - UI-050 (통계 카드 컴포넌트 UI)
  - UI-002 (로그인 페이지 UI)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST A-002 | SRS: v1.1*
