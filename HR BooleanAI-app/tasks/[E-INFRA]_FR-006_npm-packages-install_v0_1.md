---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-006: npm 패키지 일괄 설치"
labels: 'feature, scaffolding, priority:high'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: A-006
---

## :dart: Summary
- **기능명:** [FR-006] npm 패키지 일괄 설치
- **Epic:** Scaffolding (프로젝트 초기 셋업)
- **목적:** MVP 구현에 필요한 핵심 npm 패키지(ai, @ai-sdk/google, pdf-lib, exceljs, sharp, resend, swr 등)를 일괄 설치하여, 이후 개발 태스크에서 별도 패키지 설치 없이 즉시 코드를 작성할 수 있는 환경을 확보한다.
- **설계 원칙:** SRS §2.2 ~ 2.3 C-TEC-005 ~ 010에 따라 **허용된 라이브러리만** 설치하며, 허용 목록 외 라이브러리 설치를 금지한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.2 C-TEC-005`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-005:** AI/LLM 호출은 **Vercel AI SDK** 사용. 별도 Python 서버 금지.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.2 C-TEC-006`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-006:** LLM은 **Google Gemini API** 기본 사용. `GEMINI_API_KEY` 환경변수.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.3 C-TEC-008`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-008:** 엑셀 생성은 **exceljs** 사용 (v1.1).
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.3 C-TEC-009`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-009:** 이미지 변환·보정은 **sharp** 사용 (v1.1).
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.3 C-TEC-010`](../SRS-HR-AI-Verification-v1.1.md)
  - **C-TEC-010:** DOCX→PDF 변환은 **libreoffice-convert** 또는 대안.
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.4 스택 선택 이유`](../SRS-HR-AI-Verification-v1.1.md)
  - pdf-lib: 순수 JS, Vercel 호환. sharp: 고성능 이미지 처리.
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic A`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Vercel AI SDK + Gemini Provider 설치
  ```bash
  npm install ai @ai-sdk/google
  ```
- [ ] **TB-2:** PDF 생성 라이브러리 설치
  ```bash
  npm install pdf-lib
  ```
- [ ] **TB-3:** 엑셀 생성 라이브러리 설치 (v1.1)
  ```bash
  npm install exceljs
  ```
- [ ] **TB-4:** 이미지 처리 라이브러리 설치 (v1.1)
  ```bash
  npm install sharp
  npm install --save-dev @types/sharp
  ```
  > ⚠️ sharp는 네이티브 바이너리를 사용. Vercel Serverless에서 번들 사이즈 문제가 발생할 수 있으므로 `next.config.ts`에 `serverExternalPackages: ['sharp']` 추가 필요.
- [ ] **TB-5:** 이메일 발송 라이브러리 설치
  ```bash
  npm install resend
  ```
- [ ] **TB-6:** 데이터 패칭 라이브러리 설치 (SWR polling용)
  ```bash
  npm install swr
  ```
- [ ] **TB-7:** DOCX→PDF 변환 라이브러리 설치 (선택)
  ```bash
  npm install libreoffice-convert
  ```
  > ⚠️ Vercel Serverless 환경에서는 LibreOffice 바이너리 실행이 불가할 수 있음. 실패 시 지원자에게 PDF 변환 후 재제출 안내로 대체 (C-TEC-010).
- [ ] **TB-8:** 유틸리티 패키지 설치
  ```bash
  npm install uuid
  npm install --save-dev @types/uuid
  ```
- [ ] **TB-9:** `next.config.ts` 업데이트 — sharp 서버 외부 패키지 설정
  ```typescript
  const nextConfig = {
    experimental: {
      serverExternalPackages: ['sharp'],
    },
  }
  ```
- [ ] **TB-10:** `package.json` 의존성 목록 검증
  - 허용 목록 외 패키지(express, fastapi, puppeteer, playwright 등) 미설치 확인
- [ ] **TB-11:** `npm run build` 실행 → 빌드 에러 0건 확인

## :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: AI SDK 패키지 설치 확인**
- **Given:** FR-001이 완료된 Next.js 프로젝트
- **When:** `npm list ai @ai-sdk/google` 실행
- **Then:** 두 패키지가 설치 목록에 표시되어야 한다.

**Scenario 2: 전체 빌드 호환성**
- **Given:** 모든 패키지가 설치된 상태
- **When:** `npm run build` 실행
- **Then:** 빌드가 에러 없이 완료되어야 한다. 패키지 충돌 없음.

**Scenario 3: sharp Node.js 동작 확인**
- **Given:** sharp 패키지가 설치된 상태
- **When:** 간단한 이미지 리사이즈 스크립트 실행
- **Then:** Node.js 환경에서 정상 동작해야 한다.

**Scenario 4: 금지 패키지 미설치 확인**
- **Given:** 전체 패키지 설치 완료
- **When:** `package.json` dependencies/devDependencies 검사
- **Then:** express, fastify, puppeteer, playwright, drizzle-orm, typeorm 등 금지 패키지가 없어야 한다.

## :gear: Technical & Non-Functional Constraints
- **스택 제약:** C-TEC-005 ~ 010에 정의된 라이브러리만 사용. 대안 라이브러리 임의 추가 금지.
- **sharp 주의:** Vercel Serverless에서 네이티브 바이너리 사용. `next.config.ts`에 `serverExternalPackages` 설정 필수.
- **번들 분리:** `pdf-lib`, `exceljs`, `sharp`는 모두 서버 사이드 전용. 클라이언트 번들에 포함되지 않도록 `"use server"` 함수 내에서만 import.
- **libreoffice-convert 한계:** Vercel 서버리스 환경에서 실행 불가 가능성 높음. PoC에서는 DOCX 파일 재제출 안내로 대체 가능.

## :checkered_flag: Definition of Done (DoD)
- [ ] `package.json`에 ai, @ai-sdk/google, pdf-lib, exceljs, sharp, resend, swr 패키지가 포함되어 있는가?
- [ ] `npm run build`가 에러 없이 완료되는가?
- [ ] 금지 패키지(express, puppeteer 등)가 설치되어 있지 않은가?
- [ ] sharp의 Node.js 환경 동작이 확인되었는가?
- [ ] `next.config.ts`에 sharp 관련 설정이 추가되어 있는가?

## :construction: Dependencies & Blockers
- **Depends on:** FR-001 (A-001: Next.js 프로젝트 생성 완료)
- **Blocks:**
  - D-006 (Gemini OCR 프롬프트 — ai, @ai-sdk/google 필요)
  - D-007 (Resend 클라이언트 — resend 필요)
  - F-003 (이미지 변환 — sharp 필요)
  - F-004 (DOCX 변환 — libreoffice-convert 필요)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST A-006 | SRS: v1.1*
