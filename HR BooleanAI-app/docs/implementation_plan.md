# 구현 계획서 - HR AI 서류 진위확인 솔루션 (Next.js 전환 및 MVP 구현)

이 구현 계획서는 현재의 단일 HTML 프로토타입을 Tailwind CSS, SQLite(Prisma), Puppeteer, Gemini API, Resend를 사용하는 완전한 Next.js 14 애플리케이션으로 전환하고 구현하기 위한 세부 계획입니다.

## 사용자 검토 필요 사항

> [!IMPORTANT]
> - **아키텍처 및 세팅:** `HR BooleanAI-app` 디렉터리에 Next.js 14 App Router 프로젝트를 초기화합니다. 로컬 퍼스트 동작을 위해 SQLite 데이터베이스를 Prisma를 통해 구성합니다.
> - **인증 (Auth):** `/grill-me` 세션 결정에 따라, MVP 속도를 위해 Supabase Auth 대신 하드코딩된 두 개의 계정(Admin/Operator) 세션/쿠키 기반 방식을 먼저 구현합니다.
> - **RPA 실행:** Puppeteer는 Next.js Server Action 내부에서 직접 실행되므로 별도의 백그라운드 워커 없이 로컬 개발 서버(`npm run dev`)에서 즉시 구동 가능합니다.
> - **이메일 발송:** 이메일 발송 기능을 테스트하려면 `.env.local` 파일에 유효한 `RESEND_API_KEY`를 설정해야 합니다.

## 열린 질문 (Open Questions)

> [!NOTE]
> 현재 없습니다. 이전 `/grill-me` 인터뷰 세션을 통해 초기 모호성이 모두 해결되었습니다.

---

## 제안된 변경 사항

### 1. 인프라 및 데이터베이스 설정

#### [NEW] [package.json](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/package.json)
- Next.js 14, React 18, Prisma Client, TailwindCSS, Puppeteer, `@google/generative-ai`, `exceljs`, `sharp`, `resend`, `node-cron` 등의 의존성을 설정하고 패키지를 설치합니다.

#### [NEW] [schema.prisma](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/prisma/schema.prisma)
- 로컬 SQLite 데이터 모델을 정의합니다:
  - `User`: 사용자 역할 (Admin / Operator), 이메일, 비밀번호
  - `Batch`: 업로드 이력 관리 (총 업로드 수, 상태)
  - `Applicant`: 지원자 정보 (성명, 생년월일, 이메일, 검증 상태)
  - `Document`: 서류 카테고리 (졸업/자격/경력/어학), 파일 경로, 신뢰도 점수, OCR 추출 데이터
  - `VerificationJob`: RPA 조회 결과, Gemini 검토 결과, 불일치 내용, AI 검토 판정(APPROVE/REJECT/ESCALATE), 요약 설명
  - `SiteCredential`: TOEIC, Q-Net 등 로그인용 비밀번호의 암호화 저장소 (AES-256-GCM 적용)
  - `HealthLog`: RPA 시스템 상태 로그

---

### 2. 핵심 검증 엔진 및 RPA 폴백 (Fallback)

#### [NEW] [browser.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/lib/rpa/browser.ts)
- Stealth 플러그인이 적용된 Puppeteer 브라우저 싱글톤 팩토리를 구현합니다. 환경 변수(`RPA_HEADLESS`, `RPA_SLOW_MO`, `RPA_TIMEOUT`)를 지원합니다.

#### [NEW] [capture.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/lib/rpa/capture.ts)
- 4단계 폴백 로직을 구현합니다:
  - Tier 1: Puppeteer Stealth 크롤링 및 캡처
  - Tier 2: Chrome 사용자 프로필 데이터 연동
  - Tier 3: XHR API 직접 요청 (정부24)
  - Tier 4: 수동 검토로 전환 및 가상(Mock) 검증 결과 처리 (`mock_used=true`)

#### [NEW] [credentials.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/lib/crypto/credentials.ts)
- AES-256-GCM 알고리즘을 이용한 기관 비밀번호 암호화/복호화 유틸리티를 구현합니다.

#### [NEW] [reviewer-agent.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/lib/ai/reviewer-agent.ts)
- 원본 서류 이미지, RPA 조회 결과 캡처본, 지원서 기재 정보를 Gemini 1.5 Pro / Flash에 멀티모달로 전달하여 최종 승인(`APPROVE`), 반려(`REJECT`), 수동검토(`ESCALATE`) 결정을 내리는 에이전트를 개발합니다.

#### [NEW] [expiry-check.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/lib/verification/expiry-check.ts)
- 각 서류 유형별 유효기간 판정 엔진을 구현합니다 (OPIc: 730일, Q-Net: 90일, 정부24 졸업증명: 180일).

#### [NEW] [career-records-matching.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/lib/verification/career-records-matching.ts)
- 4대보험 가입 이력 서류 대조를 위해 회사명 유사도 검사(Jaro-Winkler >= 0.85) 및 재직 기간 겹침(Overlap) 계산 로직을 개발합니다.

---

### 3. 화면 라우팅 및 UI 구현

#### [NEW] [page.tsx](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/src/app/page.tsx)
- 하드코딩된 계정 정보로 세션/쿠키를 구워 로그인하고 `/dashboard`로 라우팅하는 첫 페이지를 구현합니다.

#### [NEW] [dashboard/page.tsx](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/src/app/dashboard/page.tsx)
- 배치 등록, 지원자 엑셀/CSV 업로드, 검증 시작, 배치 이력 조회, ESCALATE 건 카운터 배너 및 필터 기능을 포함한 메인 대시보드를 구축합니다.

#### [NEW] [settings/agencies/page.tsx](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/src/app/settings/agencies/page.tsx)
- 기관 설정을 런타임에 수정/추가하는 페이지로, URL 입력 시 Gemini가 DOM을 분석해 셀렉터를 제안해 주는 기능과 RPA 동작 스모크 테스트 버튼을 포함합니다.

---

## 검증 계획 (Verification Plan)

### 자동 테스트
- `npm run build`를 실행하여 Next.js 빌드가 타입 에러나 린트 에러 없이 정상적으로 수행되는지 검증합니다.
- 데이터베이스 마이그레이션(`npx prisma migrate dev`)이 에러 없이 실행되는지 확인합니다.
- 자체 작성할 스모크 테스트 스크립트(`npm run test:smoke`)를 실행해 암호화/유효기간 판정/경력 사항 대조 로직이 올바르게 동작하는지 확인합니다.

### 수동 검증
- 로컬 웹서버(`http://localhost:3000`)에 접속하여 테스트 계정으로 로그인합니다.
- 지원자 양식을 업로드하고 스캔을 시작해 DB 및 파일 상태가 정상적으로 업데이트되는지 직접 테스트합니다.
- `/settings/agencies`로 진입해 설정을 수정하고 핫로드가 동작하는지 확인합니다.
