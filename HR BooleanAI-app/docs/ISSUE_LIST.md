# 📋 HR AI 서류 진위확인 솔루션 — 이슈 관리 목록 (ISSUE_LIST.md)

이 문서는 **Goal / Ultrawork 기반의 이슈 병렬 구현**을 위해 전체 개발 태스크를 개별 이슈 단위로 분할하고 진행 현황을 관리하는 마스터 이슈 목록입니다. 
각 이슈는 의존성 관계와 병렬 작업 가능 여부가 명시되어 있어, 협업이나 멀티 에이전트 구동 시 기준점이 됩니다.

---

## 📊 이슈 진행 현황 요약 (Summary)

* **전체 이슈 개수**: 17개
* **완료 (Completed) ✅**: 11개
* **진행 중 (In Progress) ⏳**: 1개
* **대기 (Todo) 💤**: 5개

---

## 📌 마스터 이슈 목록 (Master Issue List)

| 이슈 ID | 분류 | 이슈명 | 상태 | 의존성 / 병렬 가능 여부 |
|:---|:---|:---|:---|:---|
| **ISSUE-001** | 인프라 | Next.js 프로젝트 설정 및 Tailwind CSS 구성 | ✅ 완료 | 독립 실행 가능 |
| **ISSUE-002** | 데이터베이스 | SQLite 스키마 설계 및 Prisma ORM 연동 | ✅ 완료 | ISSUE-001 완료 후 |
| **ISSUE-003** | 보안 | AES-256-GCM 사이트 자격증명 암호화 구현 | ✅ 완료 | ISSUE-002 완료 후 |
| **ISSUE-004** | RPA | Puppeteer Stealth 브라우저 팩토리 구현 | ✅ 완료 | 독립 실행 가능 |
| **ISSUE-005** | RPA | 4단계 폴백 (RPA 캡처) 엔진 구현 | ✅ 완료 | ISSUE-004 완료 후 |
| **ISSUE-006** | AI | Gemini AI 멀티모달 리뷰어 에이전트 연동 | ✅ 완료 | ISSUE-005 완료 후 |
| **ISSUE-007** | 검증 | 서류 유효기간 판단 엔진 구현 | ✅ 완료 | 독립 실행 가능 |
| **ISSUE-008** | 검증 | 4대보험 가입이력 매칭 (Jaro-Winkler) 구현 | ✅ 완료 | 독립 실행 가능 |
| **ISSUE-009** | UI/인증 | 하드코딩 세션/쿠키 기반 로그인 시스템 | ✅ 완료 | ISSUE-001 완료 후 |
| **ISSUE-010** | UI/화면 | 메인 대시보드 및 배치 관리 UI 개발 | ✅ 완료 | ISSUE-002, 009 완료 후 |
| **ISSUE-011** | UI/설정 | 기관 설정 관리 UI 및 JSON hot-load 구현 | ⏳ 진행 중 | ISSUE-010 완료 후 (병렬 가능) |
| **ISSUE-012** | 기능연동 | 수동 검증 대상 엑셀 다운로드 및 결과 업로드 | 💤 대기 | ISSUE-010 완료 후 (병렬 가능) |
| **ISSUE-013** | 알림 | Resend API 연동 메일 자동 발송 구현 | 💤 대기 | ISSUE-006 완료 후 (병렬 가능) |
| **ISSUE-014** | AI | 구버전(2001년 이전) 수첩형 자격증 실인 시각 검증 | 💤 대기 | ISSUE-006 완료 후 (병렬 가능) |
| **ISSUE-015** | AI/RPA | AI 기반 URL 분석 및 입력 필드 셀렉터 추천 | 💤 대기 | ISSUE-011 완료 후 (병렬 가능) |
| **ISSUE-016** | 검증/테스트 | 핵심 알고리즘 13종 자가 스모크 테스트 구현 | ✅ 완료 | ISSUE-003, 007, 008 완료 후 |
| **ISSUE-017** | 검증/테스트 | 전체 파이프라인 E2E 통합 테스트 수행 | 💤 대기 | 모든 대기 이슈 완료 후 진행 가능 |

---

## 🔍 이슈별 상세 내역 (Detailed Issue Cards)

### 1. 인프라 및 데이터베이스 (Infrastructure & Database)

#### 🟩 ISSUE-001: Next.js 프로젝트 설정 및 Tailwind CSS 구성
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-110 기초 인프라
* **설명**: Next.js 14 App Router 기반으로 프로젝트를 초기화하고, Tailwind CSS 및 글로벌 스타일을 설정하여 대시보드 컴포넌트를 만들 수 있는 레이아웃 뼈대 생성.
* **산출 파일**: [package.json](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/package.json), [tailwind.config.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/tailwind.config.ts)

#### 🟩 ISSUE-002: SQLite 스키마 설계 및 Prisma ORM 연동
* **상태**: ✅ 완료
* **요구사항**: SRS v1.3 데이터 모델 전체
* **설명**: 로컬 영속성 저장을 위한 SQLite 스키마 설계 (`User`, `Batch`, `Applicant`, `Document`, `VerificationJob`, `SiteCredential` 등) 및 Prisma 클라이언트 연동.
* **산출 파일**: [schema.prisma](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/prisma/schema.prisma), [db.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/db.ts)

---

### 2. 핵심 알고리즘 및 엔진 (Core Engine & Logic)

#### 🟩 ISSUE-003: AES-256-GCM 사이트 자격증명 암호화 구현
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-110, Q-Net 등 로그인 계정 정보 보안 유지
* **설명**: TOEIC, Q-Net 등 외부 기관에서 RPA 검증을 돌릴 때 사용될 로그인 비밀번호를 암호화하여 DB에 보관하고 복호화할 수 있는 대칭키 유틸리티 개발.
* **산출 파일**: [credentials.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/crypto/credentials.ts)

#### 🟩 ISSUE-004: Puppeteer Stealth 브라우저 팩토리 구현
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-110, REQ-FUNC-112
* **설명**: 외부 검증 사이트의 매크로 탐지를 방지하기 위한 Puppeteer Stealth 브라우저 설정 및 싱글톤 구조 구현.
* **산출 파일**: [browser.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/rpa/browser.ts)

#### 🟩 ISSUE-005: 4단계 폴백 (RPA 캡처) 엔진 구현
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-120
* **설명**: RPA 구동 실패 시 크롬 프로필 연동, 직접 API 연동, 수동 검토 순으로 폴백 처리되는 4단계 아키텍처 제어 엔진 구현.
* **산출 파일**: [capture.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/rpa/capture.ts)

#### 🟩 ISSUE-006: Gemini AI 멀티모달 리뷰어 에이전트 연동
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-130, REQ-FUNC-131
* **설명**: 원본 증빙 이미지와 RPA 수집 결과 스크린샷 데이터를 Gemini AI에 입력하여 OCR 검출 및 승인/반려/에스컬레이션 최종 판독을 시키는 에이전트 연동.
* **산출 파일**: [reviewer-agent.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/ai/reviewer-agent.ts)

#### 🟩 ISSUE-007: 서류 유효기간 판단 엔진 구현
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-121
* **설명**: OPIc(730일), Q-Net 확인서(90일) 등 유효기간 만료 서류를 걸러내어 `FAIL: 성적 만료`를 반환하도록 하는 계산 로직 구현.
* **산출 파일**: [expiry-check.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/verification/expiry-check.ts)

#### 🟩 ISSUE-008: 4대보험 가입이력 매칭 (Jaro-Winkler) 구현
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-132
* **설명**: 건강보험자격득실 등 4대보험 가입 이력과 지원서 내역 대조 시 회사명 유사도 검사(Jaro-Winkler 알고리즘 >= 0.85 적용) 및 기간 겹침 계산 유틸리티 구현.
* **산출 파일**: [career-records-matching.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/verification/career-records-matching.ts)

---

### 3. 페이지 뷰 및 화면 UI (Web UI)

#### 🟩 ISSUE-009: 하드코딩 세션/쿠키 기반 로그인 시스템
* **상태**: ✅ 완료
* **요구사항**: D-02 (Admin / Operator 계정 분기)
* **설명**: 별도 Supabase Auth 없이 빠른 PoC 가동을 위한 하드코딩 계정 세션 처리 및 쿠키 기반 어플리케이션 가드 미들웨어/라우팅 연동.
* **산출 파일**: [session.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/auth/session.ts), [page.tsx](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/app/login/page.tsx)

#### 🟩 ISSUE-010: 메인 대시보드 및 배치 관리 UI 개발
* **상태**: ✅ 완료
* **요구사항**: REQ-FUNC-120 대시보드 뷰
* **설명**: 배치 업로드 목록 조회, 신규 파일 업로드 팝업, 검증 결과 상태 필터링 및 에스컬레이션(ESCALATE) 수치 배너가 연동된 반응형 대시보드 구축.
* **산출 파일**: [DashboardClient.tsx](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/app/dashboard/DashboardClient.tsx)

#### 🟨 ISSUE-011: 기관 설정 관리 UI 및 JSON hot-load 구현
* **상태**: ⏳ 진행 중
* **요구사항**: REQ-FUNC-110, REQ-FUNC-111, REQ-FUNC-112
* **설명**: 비개발자 PM이 RPA를 타겟으로 할 진위확인 사이트 정보(URL 및 입력 셀렉터 필드)를 직접 입력/수정하면 서버 가동 중단 없이 실시간 반영되는 Hot-Load 시스템 구축.
* **산출 파일**: [AgenciesClient.tsx](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/app/settings/agencies/AgenciesClient.tsx)

---

### 4. 미구현 및 대기 작업 (Backlog Issues for Parallelization)

#### 🟦 ISSUE-012: 수동 검증 대상 엑셀 다운로드 및 결과 업로드
* **상태**: 💤 대기 (Todo)
* **요구사항**: REQ-FUNC-120
* **설명**: 에듀퓨어, 윈스팩 등 자동화가 애당초 불가능한 서류에 대하여, 수동 처리 명단을 엑셀 파일로 일괄 출력받아 수동 검증 후 결과를 파일로 다시 올려 결과를 동기화하는 로직 개발.
* **의존성**: ISSUE-010 완료 후 (웹 대시보드 화면 내에 다운로드/업로드 액션 추가)
* **병렬 가능 여부**: 독립적으로 개발하여 대시보드 API와 바로 결합 가능 (병렬 적극 권장)

#### 🟦 ISSUE-013: Resend API 연동 메일 자동 발송 구현
* **상태**: 💤 대기 (Todo)
* **요구사항**: REQ-FUNC-120, REQ-FUNC-121
* **설명**: 서류 불일치 판정(`REJECT`) 시 또는 추가 보완이 요구될 때, Resend API를 통해 자동으로 탈락 사유 및 보완 링크를 지원자 이메일로 전송하는 시스템 구현.
* **의존성**: ISSUE-006 완료 후 (에이전트가 REJECT 결과를 도출했을 때 트리거)
* **병렬 가능 여부**: 백엔드 이메일 발송 헬퍼 형태로 단독 구현 후 연동 가능 (병렬 적극 권장)

#### 🟦 ISSUE-014: 구버전(2001년 이전) 수첩형 자격증 실인 시각 검증
* **상태**: 💤 대기 (Todo)
* **요구사항**: REQ-FUNC-122
* **설명**: Q-Net 데이터베이스 상에 존재하지 않는 2001년 이전 자격증의 경우, 스캔본에서 실제 공인 직인/도장(시각 요소)이 날인되어 있는지 Gemini Vision 프롬프트를 분기하여 확인하는 로직.
* **의존성**: ISSUE-006 완료 후 (Gemini AI Agent 프롬프트 조건 분기 추가)
* **병렬 가능 여부**: 독립적인 Gemini Vision 프롬프트 테스트 모듈로 선개발 후 병합 가능 (병렬 가능)

#### 🟦 ISSUE-015: AI 기반 URL 분석 및 입력 필드 셀렉터 추천
* **상태**: 💤 대기 (Todo)
* **요구사항**: REQ-FUNC-113 (Should)
* **설명**: 기관 설정 화면에서 새로운 URL 입력 시, Gemini가 해당 사이트의 HTML 소스를 분석하여 아이디/성명/번호 입력 필드의 CSS 셀렉터 후보를 찾아 비개발자 PM에게 추천해 주는 지능형 파싱 시스템 개발.
* **의존성**: ISSUE-011 완료 후
* **병렬 가능 여부**: `settings/agencies`의 부가 기능이므로 별도 API 엔드포인트로 구현해 두고 나중에 연동 가능 (병렬 가능)

---

### 5. 테스트 및 최종 검증 (Validation)

#### 🟩 ISSUE-016: 핵심 알고리즘 13종 자가 스모크 테스트 구현
* **상태**: ✅ 완료
* **요구사항**: D-08, 검증 계획
* **설명**: 서버를 실행하지 않고 로컬 CLI 상에서 암호화, 유효기간, 경력 대조 로직의 정합성을 한 번에 보장할 수 있는 유닛 테스트 스크립트 작성 및 구동 확인.
* **산출 파일**: [smoke-test.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/scripts/smoke-test.ts)

#### 🟦 ISSUE-017: 전체 파이프라인 E2E 통합 테스트 수행
* **상태**: 💤 대기 (Todo)
* **요구사항**: 최종 4단계 통합 검사
* **설명**: 로그인 -> 파일 업로드 -> RPA 자동 캡처 구동 -> Gemini 최종 진위 판정 -> 메일 알림 및 결과 확인으로 이루어지는 전 과정 E2E 테스트 시나리오 실행 및 품질 검수.
* **의존성**: 모든 백로그 기능 구현 완료 후 진행
