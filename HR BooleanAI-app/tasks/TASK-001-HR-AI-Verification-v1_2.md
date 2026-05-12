# TASK-001 HR AI 서류 진위확인 v1.2 — 신규 Epic RX (장벽 해소 + AI Reviewer)

**기반 문서:** TASK-001-HR-AI-Verification-v1.0.md  
**추가 버전:** v1.2  
**작성일:** 2026-05-12  
**상태:** 바이브코딩 에이전트 실행 준비 완료

> 이 파일은 기존 TASK-001 v1.0에 **Epic RX (7개 신규 Task)**를 추가합니다.  
> 기존 A~V Epic 태스크는 모두 유지됩니다.

---

## Epic RX — RPA 기술 장벽 해소 + AI Reviewer Agent

### RX-001 | Puppeteer 로컬 환경 설치 및 설정

```yaml
Task ID: RX-001
FR#: FR-200
Epic: E-RPA
Feature: "[Infra] Puppeteer + Stealth Plugin 로컬 환경 구성"
복잡도: L
우선순위: Critical (Phase 1 시작점)
```

**Task Breakdown:**
- [ ] TB-1: `npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth` 설치
- [ ] TB-2: `.env.local`에 `RPA_HEADLESS`, `RPA_SLOW_MO`, `RPA_TIMEOUT` 환경변수 정의
- [ ] TB-3: `lib/rpa/browser.ts` — 브라우저 싱글톤 팩토리 구현 (stealth 플러그인 적용)
- [ ] TB-4: headless/headed 모드 전환 테스트 (실제 Chrome 화면 표시 확인)
- [ ] TB-5: `scripts/rpa-test.ts` — 정부24 접속 + 스크린샷 저장 스모크 테스트

**Acceptance Criteria:**
- Given: 로컬 환경에 Node.js 20+ 설치됨
- When: `npx ts-node scripts/rpa-test.ts` 실행
- Then: `./captures/test_gov24.png` 파일이 생성되고, 정부24 메인 페이지가 캡처됨
- And: `navigator.webdriver`가 `false`로 감지됨 (stealth 적용 확인)

**Dependencies:** 없음  
**Blocks:** RX-002, RX-003, RX-007

---

### RX-002 | 4단계 폴백 캡처 엔진

```yaml
Task ID: RX-002
FR#: FR-201
Epic: E-RPA
Feature: "[Feature] RPA 4단계 폴백 캡처 엔진"
복잡도: H
우선순위: Critical
```

**Task Breakdown:**
- [ ] TB-1: `lib/rpa/capture.ts` — `captureVerificationPage()` 메인 함수 구현
- [ ] TB-2: **Tier 1** — Puppeteer-extra Stealth 모드 캡처 구현
- [ ] TB-3: **Tier 2** — Chrome 사용자 프로파일 연동 (`--user-data-dir`) 구현
- [ ] TB-4: **Tier 3** — API 직접 호출 시도 (정부24 발급번호 확인 API)
- [ ] TB-5: **Tier 4** — Mock 폴백 + `mock_used=true` 플래그 + MANUAL_REVIEW 전환
- [ ] TB-6: 각 Tier 실패 감지 로직 (타임아웃, 셀렉터 미발견, HTTP 에러)
- [ ] TB-7: 캡처 PNG 로컬 저장 + SHA-256 해시 생성
- [ ] TB-8: `CaptureResult` 타입 정의 및 에러 핸들링

**Acceptance Criteria:**
- Given: 정부24 URL, 문서확인번호 입력
- When: `captureVerificationPage('gov24', { docNumber: '1234-5678-9012-3456' })` 호출
- Then: PNG 파일 저장 + hash 반환 (Tier 1 성공 시)
- And: Tier 1 실패 시 자동으로 Tier 2 시도
- And: 모든 Tier 실패 시 `{ success: false, mock_used: true }` 반환 + MANUAL_REVIEW 상태 전환

**Dependencies:** RX-001  
**Blocks:** RX-004, RX-005, P-001 (파이프라인 통합)

---

### RX-003 | 다중 셀렉터 + AI 자가 복구 시스템

```yaml
Task ID: RX-003
FR#: FR-202
Epic: E-RPA
Feature: "[Feature] 다중 셀렉터 우선순위 시스템 + Gemini DOM 분석"
복잡도: H
우선순위: High
```

**Task Breakdown:**
- [ ] TB-1: `lib/rpa/selectors.ts` — 5개 사이트별 다중 셀렉터 맵 정의
  ```typescript
  // 각 필드마다 [ID셀렉터, name속성, class, placeholder] 4개 이상 정의
  gov24: { docNumber: ['#docNumber', 'input[name="docNum"]', ...] }
  qnet: { certType: ['#certType', 'select[name="certGb"]', ...] }
  nhis: { bizNum: ['#bizNo', 'input[name="bzno"]', ...] }
  toeic: { name: ['#nm', 'input[name="name"]', ...] }
  opic: { certNum: ['#certNo', 'input[id*="cert"]', ...] }
  ```
- [ ] TB-2: `findElementWithFallback()` — 우선순위 순서 시도 함수
- [ ] TB-3: 전부 실패 시 Gemini 1.5 Flash에게 DOM HTML 전달 → 새 셀렉터 제안 요청
- [ ] TB-4: 성공한 셀렉터를 로컬 캐시에 저장 (다음 실행 시 우선 사용)
- [ ] TB-5: 단위 테스트: 의도적으로 잘못된 셀렉터 → 폴백 동작 확인

**Acceptance Criteria:**
- Given: 1순위 셀렉터(`#docNumber`)가 존재하지 않는 상황
- When: `findElementWithFallback(page, selectors.gov24.docNumber)` 호출
- Then: 2, 3, 4순위 셀렉터 순서대로 시도
- And: 전부 실패 시 Gemini가 새 셀렉터를 제안하고 해당 셀렉터로 재시도

**Dependencies:** RX-001  
**Blocks:** RX-002, RX-004

---

### RX-004 | 사이트 헬스체크 스케줄러

```yaml
Task ID: RX-004
FR#: FR-203
Epic: E-RPA
Feature: "[Feature] 사이트 셀렉터 헬스체크 + 알림 스케줄러"
복잡도: M
우선순위: High
```

**Task Breakdown:**
- [ ] TB-1: `lib/rpa/health-check.ts` — `runSiteHealthCheck()` 구현
- [ ] TB-2: 각 사이트의 핵심 셀렉터(입력 필드 + 제출 버튼 + 결과 영역) 존재 여부 확인
- [ ] TB-3: `node-cron` 으로 매일 오전 6시 자동 실행 (`0 6 * * *`)
- [ ] TB-4: 실패 감지 시 콘솔 경고 + 선택적 이메일 알림 (Resend API)
- [ ] TB-5: 헬스체크 결과를 `health_log` 테이블에 저장 (이력 관리)
- [ ] TB-6: 대시보드에 "RPA 상태" 표시 컴포넌트 (정상/경고/오류)

**Acceptance Criteria:**
- Given: 정부24 사이트가 정상 동작 중
- When: 헬스체크 실행
- Then: `{ alive: true, checkedAt: Date }` 반환
- And: 이상 감지 시 30분 이내 알림 발송

**Dependencies:** RX-002, RX-003  
**Blocks:** 없음 (독립 실행)

---

### RX-005 | AI Reviewer Agent 구현

```yaml
Task ID: RX-005
FR#: FR-204
Epic: E-AI
Feature: "[Feature] AI Reviewer Agent — Gemini Vision LLM 자동 검토"
복잡도: H
우선순위: Critical (핵심 목표)
```

**Task Breakdown:**
- [ ] TB-1: `lib/ai/reviewer-agent.ts` — `runAIReviewer()` 메인 함수 구현
- [ ] TB-2: 입력 스키마 정의 (`AIReviewInput`) — OCR 결과, 캡처 이미지, 지원서 값
- [ ] TB-3: 출력 스키마 정의 (`AIReviewOutput`) — APPROVE/REJECT/ESCALATE + 자연어 설명
- [ ] TB-4: Gemini 1.5 Pro Vision 멀티모달 프롬프트 작성 (한국어, 담당자 친화적)
- [ ] TB-5: `generateObject()` 호출 + `zod` 스키마 검증
- [ ] TB-6: APPROVE 기준: 3소스 일치 + 신뢰도 ≥ 90% + 이미지 이상 없음
- [ ] TB-7: REJECT 기준: 핵심 항목 1개 이상 불일치 + 근거 명확
- [ ] TB-8: ESCALATE 기준: OCR < 70%, 캡처 실패(mock), 판단 불충분
- [ ] TB-9: `VerificationJob` 완료 후 자동으로 `runAIReviewer()` 호출되도록 파이프라인 연결
- [ ] TB-10: AI 검토 결과를 `ai_review_decision`, `ai_review_summary` 컬럼에 저장

**Acceptance Criteria:**
- Given: 홍길동 정보처리기사 검증 완료 (3소스 일치)
- When: `runAIReviewer(reviewInput)` 호출
- Then: `{ decision: 'APPROVE', confidenceScore: 95, naturalLanguageSummary: '...' }` 반환
- And: 처리 시간 ≤ 10초

- Given: 김철수 학위증명서 (졸업일자 불일치)
- When: `runAIReviewer(reviewInput)` 호출
- Then: `{ decision: 'REJECT', discrepancies: [{field: '졸업일자', ...}], ... }` 반환

**Dependencies:** RX-002, I-001 (OCR 구현), P-001 (파이프라인)  
**Blocks:** RX-006

---

### RX-006 | 대시보드 AI 검토 결과 패널 UI

```yaml
Task ID: RX-006
FR#: FR-205
Epic: E-UI
Feature: "[UI] AI 검토 결과 패널 컴포넌트"
복잡도: M
우선순위: High
```

**Task Breakdown:**
- [ ] TB-1: `components/AIReviewPanel.tsx` — AI 검토 결과 카드 컴포넌트
- [ ] TB-2: APPROVE 상태 — 초록 배지 + 신뢰도 게이지 + 자연어 설명
- [ ] TB-3: REJECT 상태 — 빨간 배지 + 불일치 항목 목록 + 자연어 설명
- [ ] TB-4: ESCALATE 상태 — 노란 배지 + 에스컬레이션 사유 + "직접 검토" 강조
- [ ] TB-5: "최종 승인" 버튼 (AI APPROVE 케이스) — 1초 원클릭 확정
- [ ] TB-6: "직접 검토" 버튼 — 기존 상세 모달 열기
- [ ] TB-7: AI 처리 중 스피너 (runAIReviewer 실행 동안)
- [ ] TB-8: 검증 상세 모달 내 "AI 검토" 탭에 전체 분석 결과 표시

**Acceptance Criteria:**
- Given: AI Reviewer가 APPROVE 결정 반환
- When: 담당자가 대시보드 확인
- Then: "✅ AI 검토 완료 — 승인 권고" 패널이 표시됨
- And: "최종 승인" 버튼 1회 클릭으로 완료 처리됨
- And: 소요 시간: 담당자 액션 ≤ 10초

**Dependencies:** RX-005  
**Blocks:** 없음

---

### RX-007 | 기관 계정 AES-256 암호화 저장

```yaml
Task ID: RX-007
FR#: FR-206
Epic: E-CRED
Feature: "[Feature] 계정 정보 암호화 저장 + 안전한 복호화"
복잡도: M
우선순위: High (보안 필수)
```

**Task Breakdown:**
- [ ] TB-1: `lib/crypto/credentials.ts` — AES-256-GCM 암호화/복호화 유틸리티
- [ ] TB-2: `CREDENTIAL_ENCRYPTION_KEY` 환경변수 32바이트 랜덤 생성 스크립트
- [ ] TB-3: 대시보드 "계정 설정" 저장 시 암호화 후 SQLite `site_credentials` 테이블 저장
- [ ] TB-4: RPA 실행 시 메모리에서만 복호화, 로그/파일에 절대 기록 안 함
- [ ] TB-5: `SiteCredential` Prisma 모델 정의
  ```prisma
  model SiteCredential {
    id           Int      @id @default(autoincrement())
    siteKey      String   @unique  // 'toeic', 'nhis' 등
    encryptedId  String            // AES-256 암호화된 ID
    encryptedPw  String            // AES-256 암호화된 PW
    iv           String            // 초기화 벡터
    updatedAt    DateTime @updatedAt
  }
  ```
- [ ] TB-6: 단위 테스트: 암호화 → DB 저장 → 복호화 → 원문 일치 확인

**Acceptance Criteria:**
- Given: 담당자가 TOEIC ID/PW를 계정 설정에 입력
- When: 저장 버튼 클릭
- Then: DB에 암호화된 값만 저장됨 (평문 없음)
- And: RPA 실행 시 복호화 성공 + 로그에 평문 미출력
- And: `CREDENTIAL_ENCRYPTION_KEY` 없이 복호화 시도 시 에러 발생

**Dependencies:** RX-001  
**Blocks:** RX-002 (TOEIC 로그인)

---

## 전체 Task 우선순위 및 실행 순서 (Phase별)

```
Phase 1 — 기반 인프라 (1~2일)
  ├── RX-001: Puppeteer 설치 ★ 시작점
  └── RX-007: 계정 암호화 저장

Phase 2 — RPA 캡처 엔진 (2~3일)
  ├── RX-003: 다중 셀렉터 시스템
  ├── RX-002: 4단계 폴백 캡처 엔진 (RX-003 선행)
  └── RX-004: 헬스체크 스케줄러

Phase 3 — AI Reviewer (2~3일)
  ├── RX-005: AI Reviewer Agent ★ 핵심 목표
  └── RX-006: 대시보드 AI 검토 UI (RX-005 선행)

Phase 4 — 파이프라인 통합 (1~2일)
  └── P-001과 통합: ingestDocuments() → RPA → AI Reviewer → 대시보드

Phase 5 — E2E 검증 (1일)
  └── 실제 서류 5건으로 PASS/REJECT/ESCALATE 케이스 통합 테스트
```

---

## Epic RY — SRS v1.3 신규 기능 (기관 URL 설정 + 서류 유형 스키마 + 불가 서류 처리)

> **근거:** SRS v1.3 REQ-FUNC-110~132, PRD §9  
> **대상:** RX 시리즈 완료 후 Phase 6으로 실행

---

### RY-001 | agency_config.json 시스템 구축

```yaml
Task ID: RY-001
FR#: FR-210
Epic: E-RPA
Feature: "[Infra] agency_config.json hot-load 기관 설정 시스템"
복잡도: M
우선순위: High
관련 SRS: REQ-FUNC-110
```

**Task Breakdown:**
- [ ] TB-1: `config/agency_config.json` 파일 생성 — 기본 7개 기관 (gov24, qnet_cert, qnet_cert_confirm, toeic_ybm, opic_actfl, korcham_cert, certpia, webminwon) 정의
- [ ] TB-2: `lib/rpa/agency-loader.ts` — JSON 파일 런타임 hot-load (`fs.watchFile` 감지)
- [ ] TB-3: RPA 캡처 엔진이 `agency_config`를 참조하여 URL·셀렉터·입력필드를 동적 로드
- [ ] TB-4: `applicable_doc_types` 매핑 → OCR `doc_category` 결과와 자동 연결
- [ ] TB-5: 단위 테스트: JSON 수정 → 앱 재시작 없이 반영 확인

**Acceptance Criteria:**
- Given: `agency_config.json`에 새 기관 추가
- When: 앱 재시작 없이 10초 대기
- Then: 해당 기관 RPA 즉시 실행 가능

**Dependencies:** RX-002, RX-003  
**Blocks:** RY-002, RY-003

---

### RY-002 | 대시보드 "기관 설정" UI (PM 셀프서비스)

```yaml
Task ID: RY-002
FR#: FR-211
Epic: E-UI
Feature: "[UI] PM 비개발자용 기관 URL 설정 폼"
복잡도: M
우선순위: High
관련 SRS: REQ-FUNC-111, REQ-FUNC-112
```

**Task Breakdown:**
- [ ] TB-1: `components/AgencySettingsModal.tsx` — 기관 목록 표시 + 추가/편집 폼
- [ ] TB-2: 폼 필드: 기관ID, 기관명, URL, 로그인여부, 입력필드 정의(동적 추가), 유효기간, 메모
- [ ] TB-3: 저장 버튼 → `agency_config.json` 자동 업데이트 Server Action
- [ ] TB-4: **"RPA 테스트" 버튼**: URL 접속 확인 + 기본 셀렉터 존재 여부 10초 내 반환
- [ ] TB-5: 기존 기관 편집 / 비활성화 기능 (삭제 없이 `enabled: false` 처리)

**Acceptance Criteria:**
- Given: PM이 대시보드 "기관 설정" 접속
- When: 새 기관 추가 폼 작성 + 저장 클릭
- Then: `agency_config.json` 즉시 업데이트 + RPA 테스트 성공 결과 10초 이내

**Dependencies:** RY-001  
**Blocks:** RY-003

---

### RY-003 | AI 자동 URL 분석 (셀렉터 자동 탐지)

```yaml
Task ID: RY-003
FR#: FR-212
Epic: E-AI
Feature: "[Feature] 진위확인 URL AI 자동 분석 → 셀렉터 제안"
복잡도: H
우선순위: Should
관련 SRS: REQ-FUNC-113
```

**Task Breakdown:**
- [ ] TB-1: `lib/rpa/url-analyzer.ts` — URL 접속 후 HTML 캡처
- [ ] TB-2: Gemini 1.5 Flash에 HTML + "진위확인 입력 폼 필드 식별" 프롬프트 전달
- [ ] TB-3: 반환된 셀렉터 후보 목록을 UI에 표시 → PM이 검토 후 선택
- [ ] TB-4: 선택된 셀렉터로 `agency_config.json` 자동 채움

**Acceptance Criteria:**
- Given: PM이 써트피아 URL 입력
- When: "자동 분석" 클릭
- Then: 입력 필드 셀렉터 후보 3개 이상 제안 + 성공률 ≥ 70%

**Dependencies:** RY-002, RX-005  
**Blocks:** 없음

---

### RY-004 | 진위확인 불가 서류 대체 처리 엔진

```yaml
Task ID: RY-004
FR#: FR-213
Epic: E-PIPE
Feature: "[Feature] 자동화 불가 서류 대체 처리 (에듀퓨어/윈스팩 엑셀 자동생성)"
복잡도: M
우선순위: Must
관련 SRS: REQ-FUNC-120
```

**Task Breakdown:**
- [ ] TB-1: `lib/verification/unverifiable.ts` — `verification_possible` 판단 로직
  - 판단 기준: `agency_config`에 해당 기관 없음 → `false`
- [ ] TB-2: 에듀퓨어 전용 엑셀 자동 생성 (발급번호/성명/생년월일/발급일 컬럼)
- [ ] TB-3: 윈스팩 전용 엑셀 자동 생성 (진위신청 대상자 명단 + 직업교육 리스트 2개 시트)
- [ ] TB-4: 대시보드에 "대체 처리 필요" 배지 + 해당 기관 엑셀 다운로드 버튼
- [ ] TB-5: 수동 처리 결과 업로드 UI → `final_result` 업데이트 Server Action
- [ ] TB-6: `final_result: "확인불가"` 상태를 PDF 감사 리포트에 명기

**Acceptance Criteria:**
- Given: 에듀퓨어 수료증 업로드 시
- When: 파이프라인 실행
- Then: `verification_possible: false` + "에듀퓨어 진위확인 엑셀 다운로드" 버튼 표시
- And: 엑셀에 [번호, 발급번호, 성명, 생년월일, 발급일] 5개 컬럼 포함

**Dependencies:** RY-001, G-001 (OCR)  
**Blocks:** 없음

---

### RY-005 | 서류 유효기간 자동 판단 + 이전 자격증 AI 검토

```yaml
Task ID: RY-005
FR#: FR-214
Epic: E-VERIFY
Feature: "[Feature] 유효기간 자동 만료 판정 + 2001년 이전 자격증 Gemini 시각 검토"
복잡도: M
우선순위: Must
관련 SRS: REQ-FUNC-121, REQ-FUNC-122
```

**Task Breakdown:**
- [ ] TB-1: `lib/verification/expiry-check.ts` — `valid_days` 기반 만료일 자동 계산
  - OPIc: `test_date` + 730일 초과 시 FAIL
  - Q-Net 확인서: `issue_date` + 90일 초과 시 FAIL
  - 정부24 문서: `issue_date` + 180일 초과 시 FAIL
- [ ] TB-2: 만료 판정 시 `discrepancy_detail: "성적 유효기간 만료 (만료일: YYYY-MM-DD)"` 자동 생성
- [ ] TB-3: 2001년 이전 수첩형 자격증 감지 (OCR `pass_date` 연도 ≤ 2001)
- [ ] TB-4: Gemini Vision에 "실인·인장 날인 존재 여부 확인" 프롬프트 → `MANUAL_REVIEW` 전환

**Acceptance Criteria:**
- Given: OPIc 성적 `expire_date: 2025/06/18`, 검증일 `2026-01-01`
- When: 파이프라인 실행
- Then: `FAIL: 성적 유효기간 만료 (만료일: 2025-06-18)` 자동 반환

**Dependencies:** G-001 (OCR), RY-001  
**Blocks:** 없음

---

### RY-006 | 서류 유형별 OCR 프롬프트 분기 시스템

```yaml
Task ID: RY-006
FR#: FR-215
Epic: E-OCR
Feature: "[Feature] doc_category별 전용 OCR 프롬프트 + doc_source 자동 판별"
복잡도: H
우선순위: Must
관련 SRS: REQ-FUNC-130, REQ-FUNC-131
```

**Task Breakdown:**
- [ ] TB-1: `lib/ocr/prompts/` 폴더 생성, 서류 유형별 프롬프트 파일 분리
  - `graduation.ts` — 졸업증명서 (doc_source 판별 포함: webminwon/certpia/gov24/icerts)
  - `certificate.ts` — 자격증 (cert_form_type: 수첩형/상장형/카드형/확인서)
  - `career.ts` — 경력사항 4대보험 (doc_subtype + career_records 배열)
  - `language.ts` — 어학성적 (TOEIC/OPIc + 만료일 포함)
- [ ] TB-2: `lib/ocr/prompt-router.ts` — 1차 분류 OCR 후 `doc_category` 판별 → 전용 프롬프트 선택
- [ ] TB-3: 졸업증명서 `doc_source` 자동 판별 → `agency_config`의 해당 기관 URL 자동 연결
- [ ] TB-4: "성 명 : 유용완" → "유용완" 분리 처리 로직 (SRS §0-2 이슈 반영)
- [ ] TB-5: 단위 테스트: 써트피아 졸업증명서 → `doc_source: "certpia"` 판별 확인

**Acceptance Criteria:**
- Given: 써트피아 발급 졸업증명서 이미지
- When: OCR 실행
- Then: `doc_source: "certpia"`, `doc_category: "졸업증명서"` 반환 + certpia URL 자동 선택
- And: `성 명 : 유용완` → `name: "유용완"` 정상 추출

**Dependencies:** G-001~G-004 (기존 OCR), RY-001  
**Blocks:** RY-007

---

### RY-007 | 경력사항 career_records 1:N 대조 엔진

```yaml
Task ID: RY-007
FR#: FR-216
Epic: E-VERIFY
Feature: "[Feature] 4대보험 career_records 배열 추출 + 지원서 경력 1:N 대조"
복잡도: H
우선순위: Must
관련 SRS: REQ-FUNC-132
```

**Task Breakdown:**
- [ ] TB-1: OCR `career_records` 배열 파싱 — 회사명/기간/가입자구분 정규화
- [ ] TB-2: 입사지원서 경력 사항 파싱 (이름/회사명/기간 구조화)
- [ ] TB-3: 1:N 매칭 알고리즘: 회사명 유사도(Jaro-Winkler ≥ 0.85) + 기간 overlap 계산
- [ ] TB-4: 불일치 케이스: `discrepancy_detail`에 {기재: "A회사 2년", 보험: "B회사 1년 3개월"} 구조 저장
- [ ] TB-5: 개인사업자/프리랜서(지역가입자) → "경력 일수 확인 필요" `MANUAL_REVIEW` 처리
- [ ] TB-6: 단위 테스트: 건강보험자격득실확인서 3개 이력 vs 지원서 경력 2개 대조

**Acceptance Criteria:**
- Given: 건강보험자격득실확인서 (3개 이력) + 지원서 경력 2개 기재
- When: Layer 1 대조 실행
- Then: 회사명 일치 + 기간 overlap ≥ 80% → PASS
- And: 지역가입자 이력 → "프리랜서 경력 확인 필요" MANUAL_REVIEW

**Dependencies:** RY-006, I-001 (Layer1)  
**Blocks:** 없음

---

## 전체 실행 순서 업데이트 (RX + RY 통합)

```
Phase 1 — 기반 인프라 (1~2일)
  ├── RX-001: Puppeteer 설치
  └── RX-007: 계정 암호화 저장

Phase 2 — RPA 캡처 엔진 (2~3일)
  ├── RX-003: 다중 셀렉터 시스템
  ├── RX-002: 4단계 폴백 캡처 엔진
  └── RX-004: 헬스체크 스케줄러

Phase 3 — AI Reviewer (2~3일)
  ├── RX-005: AI Reviewer Agent
  └── RX-006: 대시보드 AI 검토 UI

Phase 4 — 파이프라인 통합 (1~2일)
  └── P-001과 통합: 전체 파이프라인

Phase 5 — SRS v1.3 신규 기능 (3~4일)   ← 신규
  ├── RY-001: agency_config.json 시스템
  ├── RY-002: 기관 설정 UI (PM 셀프서비스)
  ├── RY-004: 불가 서류 대체 처리
  ├── RY-005: 유효기간 자동 판정
  ├── RY-006: 서류 유형별 OCR 프롬프트
  └── RY-007: 경력사항 1:N 대조

Phase 6 — 선택 기능 (1~2일)
  └── RY-003: AI URL 자동 분석 (Should)

Phase 7 — E2E 검증 (1~2일)
  └── 실제 서류 10건 (졸업/자격/경력/어학 각 2~3건) 통합 테스트
```

---

## Definition of Done (Epic RX + RY 완료 기준)

**Epic RX (기존):**
- [ ] 5개 기관(정부24, Q-Net, NHIS, TOEIC, OPIc) RPA 캡처 성공
- [ ] 4단계 폴백 자동 동작 확인
- [ ] AI Reviewer 10건 테스트 정확도 ≥ 95%
- [ ] 담당자 AI 권고 케이스 처리 ≤ 30초
- [ ] 계정 암호화 단위 테스트 통과
- [ ] 헬스체크 스케줄러 정상 동작

**Epic RY (신규 — SRS v1.3):**
- [ ] `agency_config.json` hot-load: 재시작 없이 신규 기관 반영
- [ ] PM이 UI에서 30초 이내 신규 기관 추가 완료
- [ ] RPA 테스트 버튼: 10초 이내 성공/실패 결과 반환
- [ ] 에듀퓨어/윈스팩 엑셀 자동 생성 + 수동 결과 업로드 정상 동작
- [ ] OPIc 만료 자동 FAIL 판정 정확도 100%
- [ ] 써트피아 졸업증명서 `doc_source: "certpia"` 자동 판별
- [ ] "성 명 : 유용완" → `name: "유용완"` 정상 추출
- [ ] 건강보험 career_records 3개 이력 1:N 대조 정상 동작
- [ ] `npm run build` 에러 0건

---

*TASK 버전: v1.2 (SRS v1.3 반영) | 기반: TASK-001 v1.0 | PRD: v1.2 | SRS: v1.3 | 업데이트: 2026-05-12*
