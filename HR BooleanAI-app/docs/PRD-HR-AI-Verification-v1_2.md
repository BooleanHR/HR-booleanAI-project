# HR AI 서류 진위확인 솔루션 — PRD v1.2 (기술 장벽 해소 + AI 자동 검토 아키텍처)

**Owner:** Product · Engineering · Legal-Tech GTM  
**버전:** v1.2  
**작성일:** 2026-05-12  
**상태:** 확정 초안 — 바이브코딩 에이전트 실행 기준  
**이전 버전:** PRD v1.1 (2026-04-18)

---

## 변경 이력

| 항목 | v1.1 | v1.2 변경 내용 | v1.2+SRS v1.3 추가 반영 |
|---|---|---|---|
| iframe 직접 임베드 | 미정의 | **완전 제거 — Puppeteer 캡처 방식 대체** | HTML v0.8 구현 완료 |
| RPA 캡처 방식 | 개념 수준 | **4단계 폴백 전략 명세** | RX-001~004 Task 대응 |
| Human-in-the-loop | 담당자 검토 | **AI Reviewer Agent 2-tier 구조** | RX-005~006 Task 대응 |
| 사이트 구조 변경 | 수동 패치 | **자동 셀렉터 + Fallback** | RX-003~004 Task 대응 |
| TASK 리스트 | v1.0 기준 | **RX-001~007 (7개) 추가** | — |
| **기관 URL 설정** | **미정의** | **— (v1.2 누락)** | **SRS v1.3 §2 반영: agency_config.json + PM 셀프서비스 UI (REQ-FUNC-110~113)** |
| **제출서류 유형** | **졸업/자격/경력 단순 분류** | **— (v1.2 누락)** | **SRS v1.3 §1 반영: 25개 세부 유형 + 발급처별 Key 스키마 (REQ-FUNC-130~132)** |
| **진위확인 불가 처리** | **미정의** | **— (v1.2 누락)** | **SRS v1.3 §1.3 반영: 대체 처리 정책 + UI 안내 (REQ-FUNC-120~122)** |
| **TASK 리스트** | **RX-001~007** | **— (v1.2)** | **SRS v1.3 신규 RY-001~010 추가 필요 (§6 참조)** |

---

## 1. 핵심 기술 장벽 정의 및 해소 전략

> 이 섹션은 "실제 구현 시 반드시 부딪히는 기술 진입 장벽"을 사전에 정의하고,  
> 각각의 **우회 전략(Bypass Strategy)**과 **폴백 계획(Fallback Plan)**을 명세합니다.

---

### 1.1 장벽 A — iframe 직접 임베드 불가 (X-Frame-Options)

#### 문제 정의

정부24, Q-Net, TOEIC, OPIc 등 모든 대상 기관 사이트는 HTTP 응답 헤더에 아래 보안 정책을 포함합니다:

```
X-Frame-Options: DENY  또는  SAMEORIGIN
Content-Security-Policy: frame-ancestors 'none'
```

**결과:** 브라우저가 `<iframe src="https://www.gov.kr/...">` 렌더링을 완전 차단.  
랜딩페이지나 대시보드에서 실제 사이트 화면을 직접 임베드하는 방식은 **구조적으로 불가능**합니다.

#### 해소 전략 (3-Tier)

```
Tier 1 [랜딩페이지 시각화]
  → iframe 대신 실제 사이트 스크린샷(PNG) base64 임베드
  → 위에 RPA 커서 애니메이션 + 타이핑 시뮬레이션 오버레이
  → 방문자에게 "실제 동작" 느낌 제공 (이미 v0.8에 구현됨)

Tier 2 [대시보드 RPA 실행 시]
  → 로컬 Puppeteer가 실제 사이트에 접속 → 조회 수행 → 캡처 PNG 저장
  → 대시보드는 저장된 캡처 이미지를 <img> 태그로 표시
  → 실시간 사이트 접속 없이 증거 이미지 열람 가능

Tier 3 [감사 증적]
  → 캡처 PNG + SHA-256 해시 + 타임스탬프를 묶어 감사 리포트 PDF에 내장
  → 감사원 제출용 법적 증거 요건 충족
```

#### 구현 명세 (로컬 Puppeteer 캡처 플로우)

```typescript
// lib/rpa/capture.ts
export async function captureVerificationPage(
  siteKey: 'gov24' | 'qnet' | 'nhis' | 'toeic' | 'opic',
  inputData: Record<string, string>,
  credentials?: { id: string; pw: string }
): Promise<CaptureResult> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. 사이트 접속
  await page.goto(SITE_URLS[siteKey], { waitUntil: 'networkidle2', timeout: 30000 });

  // 2. 로그인 필요 시 자동 로그인 (TOEIC 등)
  if (credentials && SITES_REQUIRING_LOGIN.includes(siteKey)) {
    await autoLogin(page, credentials);
  }

  // 3. 데이터 입력 (셀렉터 기반)
  for (const [field, value] of Object.entries(inputData)) {
    const selector = FIELD_SELECTORS[siteKey][field];
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.type(selector, value, { delay: 50 }); // 사람처럼 입력
  }

  // 4. 제출 및 결과 대기
  await page.click(SUBMIT_SELECTORS[siteKey]);
  await page.waitForSelector(RESULT_SELECTORS[siteKey], { timeout: 15000 });

  // 5. 전체 페이지 스크린샷
  const screenshot = await page.screenshot({ fullPage: false, type: 'png' });
  await browser.close();

  // 6. SHA-256 해시 생성 및 로컬 저장
  const hash = crypto.createHash('sha256').update(screenshot).digest('hex');
  const filePath = `./results/${jobId}/rpa_capture_${siteKey}_${Date.now()}.png`;
  fs.writeFileSync(filePath, screenshot);

  return { success: true, filePath, hash, capturedAt: new Date() };
}
```

---

### 1.2 장벽 B — RPA 캡처 차단 / 봇 탐지 (Anti-bot Detection)

#### 문제 정의

일부 기관 사이트는 자동화 브라우저를 탐지하는 수단을 사용합니다:

| 차단 유형 | 발생 기관 | 영향 |
|---|---|---|
| Cloudflare Bot Detection | TOEIC(YBM) | headless 브라우저 자동 차단 |
| reCAPTCHA v3 | 정부24 일부 페이지 | 자동 입력 후 CAPTCHA 요구 |
| 세션 제한 (IP/시간) | Q-Net | 단시간 대량 조회 시 IP 차단 |
| JavaScript 핑거프린팅 | OPIc | navigator.webdriver 감지 |

#### 4단계 폴백 전략 (RPA Fallback Ladder)

```
[STEP 1] Puppeteer-extra + Stealth Plugin 적용
  - puppeteer-extra-plugin-stealth: navigator.webdriver 숨기기
  - 사람 같은 마우스 이동 패턴, 랜덤 딜레이
  - 성공률: ~85% (대부분 기관)

    ↓ 실패 시

[STEP 2] Puppeteer + 실제 Chrome 사용자 프로파일 연동
  - --user-data-dir로 실제 로그인된 Chrome 세션 재활용
  - 이미 로그인된 상태의 쿠키/세션 활용
  - 성공률: ~95% (로그인 필요 사이트)

    ↓ 실패 시

[STEP 3] API 직접 호출 (사이트가 내부 API 노출 시)
  - 브라우저 DevTools로 XHR 요청 분석 후 직접 호출
  - 정부24: 발급번호 확인 API 직접 호출 가능
  - 성공률: ~70% (API 구조 파악 필요)

    ↓ 실패 시 (최후 수단)

[STEP 4] Mock 응답 + AI Vision 판단 + 수동 확인 큐 전환
  - mock_used = true 플래그 설정
  - 기존 캡처 이미지가 있으면 Vision LLM으로 재분석
  - MANUAL_REVIEW 상태로 전환 + 담당자 알림
  - 감사 리포트에 "자동 캡처 불가 — 수동 확인 필요" 명기
```

#### 셀렉터 파손 자동 감지 시스템

```typescript
// lib/rpa/health-check.ts
export async function runSiteHealthCheck(): Promise<HealthReport> {
  const results: HealthReport = {};
  for (const site of ALL_SITES) {
    try {
      const page = await loadPage(site.url);
      const selectorExists = await page.$(site.keySelector) !== null;
      results[site.key] = {
        alive: selectorExists,
        checkedAt: new Date(),
        lastWorkingAt: selectorExists ? new Date() : results[site.key]?.lastWorkingAt
      };
      if (!selectorExists) {
        // Slack/Email 알림 발송
        await notifyRpaBroken(site.key, site.keySelector);
      }
    } catch (e) {
      results[site.key] = { alive: false, error: e.message };
    }
  }
  return results;
}
// 스케줄: 매일 오전 6시 자동 실행 (로컬 cron)
```

---

### 1.3 장벽 C — 로그인 필요 사이트 (TOEIC 등)

#### 문제 정의

YBM TOEIC 성적 진위확인은 **로그인한 기업 회원만** 조회 가능합니다. 쿠키 없이 접근 시 로그인 페이지로 리다이렉트됩니다.

#### 해소 전략

```
옵션 A — 대시보드 계정 설정 UI (이미 v1.1에 명세됨)
  → 담당자가 대시보드에 TOEIC 기업 ID/PW 입력
  → RPA가 자동 로그인 후 조회
  → 보안: 입력값을 AES-256으로 암호화하여 로컬 SQLite 저장
  → 메모리에서만 복호화, 로그에 절대 기록 안 함

옵션 B — 세션 쿠키 재활용
  → 담당자가 Chrome에서 직접 로그인
  → RPA가 --user-data-dir로 동일 Chrome 프로파일 사용
  → 이미 발급된 세션 토큰 자동 활용

옵션 C — 단체 API 계약 (Phase 2)
  → YBM B2B API 계약 시 계정 없이 직접 조회 가능
  → 현재: 기업 계정 로그인 방식으로 PoC 진행
```

---

### 1.4 장벽 D — 사이트 구조 변경 (DOM Mutation)

#### 문제 정의

정부 기관 사이트는 개편 주기가 예측 불가능합니다. 셀렉터 1개가 바뀌면 RPA 전체가 중단됩니다.

#### 해소 전략: 다중 셀렉터 + AI 자가 복구

```typescript
// lib/rpa/selectors.ts
// 각 필드에 우선순위 순서로 복수 셀렉터 정의
export const FIELD_SELECTORS = {
  gov24: {
    docNumber: [
      '#docNumber',           // 1순위: ID
      'input[name="docNum"]', // 2순위: name
      '.doc-number-input',    // 3순위: class
      'input[placeholder*="문서확인번호"]' // 4순위: placeholder 텍스트
    ]
  }
};

// 셀렉터 순서대로 시도, 전부 실패 시 AI에게 DOM 분석 요청
async function findElement(page: Page, selectors: string[]): Promise<ElementHandle | null> {
  for (const sel of selectors) {
    const el = await page.$(sel);
    if (el) return el;
  }
  // 최후 수단: AI에게 페이지 HTML + 목적 전달 → 새 셀렉터 제안
  const html = await page.content();
  const newSelector = await askGeminiForSelector(html, '문서확인번호 입력 필드');
  return page.$(newSelector);
}
```

---

## 2. AI Reviewer Agent — 인적 검토의 AI 대체

> **핵심 목표:** Human-in-the-loop(사람이 검토)에서 **AI-in-the-loop(AI가 검토, 사람이 최종 승인)**으로 진화

### 2.1 기존 구조 vs 새 구조

```
[기존 v1.1 — Human-in-the-loop]
  파이프라인 완료
      ↓
  FAIL/MANUAL_REVIEW 결과 대시보드에 표시
      ↓
  담당자가 OCR 결과 + RPA 캡처 보고 육안으로 검토
      ↓
  담당자가 승인/반려 클릭
      ↓
  Audit Trail 저장

[신규 v1.2 — AI-in-the-loop (2-tier)]
  파이프라인 완료
      ↓
  ① AI Reviewer Agent 자동 실행 (Gemini Vision LLM)
     - 원본 서류 이미지 분석
     - RPA 캡처 이미지 분석
     - 입사지원서 기재값과 대조
     - 불일치 항목 자연어 설명 생성
     - ai_review_decision: APPROVE | REJECT | ESCALATE
      ↓
  ② 대시보드에 AI 검토 결과 + 근거 표시
      ↓
  ③ APPROVE → 담당자 원클릭 최종 승인 (검토 부담 제거)
     REJECT → 담당자 반려 사유 확인 후 승인/반려
     ESCALATE → 담당자 직접 상세 검토 필요 (자동화 불가 케이스)
```

### 2.2 AI Reviewer Agent 명세

```typescript
// lib/ai/reviewer-agent.ts

interface AIReviewInput {
  applicantInput: ApplicantFields;    // 입사지원서 기재값
  ocrExtracted: OcrFields;            // Gemini OCR 추출값
  rpaCaptures: RpaCapture[];          // 각 기관 캡처 이미지 (base64)
  originalDocImages: string[];        // 원본 서류 이미지 (base64)
  tripleCheckLayer1: CompareResult;   // Layer 1 비교 결과
  tripleCheckLayer2: CompareResult;   // Layer 2 비교 결과
}

interface AIReviewOutput {
  decision: 'APPROVE' | 'REJECT' | 'ESCALATE';
  confidenceScore: number;            // 0~100
  discrepancies: Discrepancy[];       // 불일치 항목 배열
  naturalLanguageSummary: string;     // 담당자에게 보여줄 자연어 설명
  escalationReason?: string;          // ESCALATE 사유
  processingTime: number;             // ms
}

export async function runAIReviewer(input: AIReviewInput): Promise<AIReviewOutput> {
  const prompt = buildReviewerPrompt(input);

  // Gemini 1.5 Pro Vision 호출 (멀티모달: 텍스트 + 이미지 동시 분석)
  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    schema: aiReviewOutputSchema,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        // 원본 서류 이미지들
        ...input.originalDocImages.map(img => ({ type: 'image', image: img })),
        // RPA 캡처 이미지들
        ...input.rpaCaptures.map(cap => ({ type: 'image', image: cap.imageBase64 })),
      ]
    }]
  });

  return result.object;
}

function buildReviewerPrompt(input: AIReviewInput): string {
  return `
당신은 HR 서류 진위확인 전문 AI 심사관입니다.
아래 데이터를 종합 분석하여 서류의 진위를 판정하십시오.

## 지원자 기재값 (입사지원서)
${JSON.stringify(input.applicantInput, null, 2)}

## OCR 추출값 (AI가 서류에서 읽은 값)
${JSON.stringify(input.ocrExtracted, null, 2)}

## Triple Check Layer 1 결과 (기재값 vs OCR)
${JSON.stringify(input.tripleCheckLayer1, null, 2)}

## Triple Check Layer 2 결과 (OCR vs 기관 DB)
${JSON.stringify(input.tripleCheckLayer2, null, 2)}

## 첨부 이미지
- 첫 번째 이미지(들): 원본 제출 서류
- 이후 이미지(들): 각 기관 사이트 RPA 조회 캡처

## 판정 기준
- APPROVE: 모든 핵심 항목(성명, 발급번호, 취득일자)이 3소스에서 일치하고 이미지가 정상
- REJECT: 1개 이상의 핵심 항목이 불일치하거나 이미지 위조 징후 발견
- ESCALATE: OCR 신뢰도 부족, 이미지 품질 불량, 판단 근거 불충분

반드시 한국어로 담당자가 이해할 수 있는 자연어 설명을 포함하십시오.
  `;
}
```

### 2.3 AI Reviewer 판정 기준표

| 조건 | AI 결정 | 담당자 액션 |
|---|---|---|
| 3소스 모두 일치 + 이미지 정상 + 신뢰도 ≥ 90% | **APPROVE** | 원클릭 최종 승인 (1초) |
| 핵심 항목 불일치 1건 이상 + 근거 명확 | **REJECT** | AI 사유 확인 후 반려 (10초) |
| OCR 신뢰도 < 70% + 이미지 판독 불가 | **ESCALATE** | 직접 상세 검토 필요 |
| RPA 캡처 실패 (mock_used=true) | **ESCALATE** | 수동 기관 조회 필요 |
| 위조 의심 패턴 감지 (비정상 폰트, 레이아웃) | **REJECT** | 즉시 반려 권고 |

### 2.4 대시보드 AI 검토 결과 표시 UI 명세

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 AI 검토 결과 — 홍길동 / 정보처리기사                    │
├─────────────────────────────────────────────────────────┤
│ 결정: ✅ APPROVE          신뢰도: 97%                    │
│                                                         │
│ AI 종합 의견:                                            │
│ "입사지원서 기재값, OCR 추출값, Q-Net 기관 DB 조회 결과    │
│  3개 소스 모두에서 성명(홍길동), 자격증번호(23-A01-0447),  │
│  취득일자(2023.03.15)가 완전히 일치합니다. 원본 서류       │
│  이미지에서 위조 징후가 감지되지 않았습니다."              │
│                                                         │
│ 처리 시간: 3.2초                                         │
├─────────────────────────────────────────────────────────┤
│         [✅ 최종 승인]          [⚠️ 직접 검토]            │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 업데이트된 파이프라인 전체 흐름 (v1.2)

```
[Seq-01 v1.2 — 완전 자동화 파이프라인]

로컬 폴더 스캔 (fs.readdirSync)
    ↓
파일 형식 변환 (sharp: HEIC→JPG, DOCX→PDF)
    ↓
이미지 회전 보정 (sharp: EXIF 기반 auto-orient)
    ↓
파일 자동 명명 ({수험번호}_{서류종류}.ext)
    ↓
Gemini Vision OCR (generateObject → 구조화 JSON)
    ↓ [신뢰도 < 70% → MANUAL_REVIEW 분기]
Triple Check Layer 1 (입사지원서 vs OCR 값)
    ↓
로컬 RPA 병렬 캡처 (Puppeteer × 5개 사이트)
    ↓ [캡처 실패 → 4단계 폴백 → Fallback Mock]
Triple Check Layer 2 (OCR vs RPA 기관 DB)
    ↓
AI Reviewer Agent 자동 실행 (Gemini Vision LLM)   ← [v1.2 신규]
    ↓
APPROVE → 대시보드에 승인 권고 표시
REJECT  → 대시보드에 반려 근거 표시
ESCALATE → 수동 검토 큐 전환 + 담당자 알림
    ↓
담당자 최종 승인/반려 (1~30초, 케이스에 따라)     ← [v1.2: 검토 부담 최소화]
    ↓
Audit Trail 생성 (SHA-256 + 타임스탬프 + 캡처)
    ↓
DRAFT 알림 생성 (FAIL 건)
    ↓
선택적 알림 발송 (이메일)
    ↓
결과 폴더 저장 (5. 진위확인결과/)
    ↓
PDF 감사 리포트 생성
    ↓
Excel 결과 파일 생성
```

---

## 4. 업데이트된 TASK 리스트 (v1.2 신규 항목)

> 기존 TASK-001 v1.0 항목은 유지하며, 아래 신규 Epic RX를 추가합니다.

### Epic RX — RPA 장벽 해소 + AI Reviewer

| Task ID | FR# | Epic | Feature | 관련 SRS | 선행 태스크 | 복잡도 |
|---|---|---|---|---|---|---|
| **RX-001** | FR-200 | E-RPA | [Infra] Puppeteer + puppeteer-extra-plugin-stealth 로컬 환경 설치 및 설정. headless/headed 모드 전환 가능하도록 환경변수 제어. | §1.2 장벽B | - | L |
| **RX-002** | FR-201 | E-RPA | [Feature] 4단계 폴백 캡처 엔진 구현: Stealth→Chrome 프로파일→API 직접→Mock 순서. 각 단계 실패 시 자동 다음 단계 시도. 최종 실패 시 mock_used=true + MANUAL_REVIEW 전환. | §1.2 장벽B | RX-001 | H |
| **RX-003** | FR-202 | E-RPA | [Feature] 다중 셀렉터 시스템 구현 (FIELD_SELECTORS). 우선순위 순서 시도 → 전부 실패 시 Gemini에게 DOM 분석 요청 → 새 셀렉터 자동 제안. | §1.4 장벽D | RX-001 | H |
| **RX-004** | FR-203 | E-RPA | [Feature] 사이트 헬스체크 스케줄러 구현. 매일 오전 6시 자동 실행, 셀렉터 파손 감지 시 알림 발송 (이메일 or 콘솔 경고). | §1.4 장벽D | RX-002, RX-003 | M |
| **RX-005** | FR-204 | E-AI | [Feature] AI Reviewer Agent 구현. Gemini Vision LLM 멀티모달 호출. 원본 서류 + RPA 캡처 이미지 + OCR 결과 종합 분석 → APPROVE/REJECT/ESCALATE 결정 + 자연어 설명 생성. | §2.2 | I-001~005, RX-002 | H |
| **RX-006** | FR-205 | E-UI | [UI] 대시보드 AI 검토 결과 패널 구현. APPROVE/REJECT/ESCALATE 상태별 시각 표현. "최종 승인" / "직접 검토" 버튼. 신뢰도 게이지. 자연어 설명 표시. | §2.4 | RX-005 | M |
| **RX-007** | FR-206 | E-CRED | [Feature] 기관 계정 AES-256 암호화 저장. 대시보드 계정 설정 UI에서 입력 → 로컬 SQLite에 암호화 저장 → RPA 실행 시 메모리에서만 복호화. 평문 로그 기록 절대 금지. | §1.3 장벽C | RX-001 | M |

---

## 5. 랜딩페이지 기술 장벽 해소 전략 (v0.8 현재 상태 기준)

### 현재 v0.8 구현 방식 — 정답 방향 확인

```
✅ 이미 올바른 방향:
   - 실제 사이트 스크린샷 base64 임베드 (iframe 미사용)
   - RPA 커서 애니메이션 오버레이 (Puppeteer처럼 보임)
   - 타이핑 시뮬레이션 (실제 동작 재현)

🔧 개선 필요 (v0.9):
   - 인포그래픽 섹션 레이아웃 깨짐 수정
   - RPA 데모 패널 반응형 최적화
   - 모바일 뷰 레이아웃 점검
```

### v0.9 랜딩페이지 개선 계획

| 항목 | 문제 | 해결 |
|---|---|---|
| 인포그래픽 섹션 | `grid-template-columns: 1fr 1fr` 에서 이미지 비율 깨짐 | 이미지 컨테이너 고정 높이 + `object-fit: contain` 적용 |
| 스텝 카드 레이아웃 | 좌우 정렬 불일치 | flex 컨테이너 재구성, 아이콘/텍스트 분리 |
| 자동 로테이션 | 처음 로드 시 하이라이트 박스 위치 부정확 | 이미지 로드 완료 후 `onload` 이벤트에서 초기화 |
| 모바일 | 3열 그리드가 모바일에서 overflow | `@media (max-width: 768px)` 단일 열 전환 |

---

## 6. 바이브코딩 에이전트 실행 가이드 (다음 단계)

> 이 섹션은 Claude Code 에이전트가 실제 코드를 작성할 때 참조하는 실행 지침입니다.

### 실행 순서 (권장)

```
Phase 1 — 기반 인프라 (1~2일)
  RX-001: Puppeteer 환경 설치
  RX-007: 계정 암호화 저장 구현

Phase 2 — RPA 핵심 엔진 (2~3일)
  RX-002: 4단계 폴백 캡처 엔진
  RX-003: 다중 셀렉터 시스템
  RX-004: 헬스체크 스케줄러

Phase 3 — AI Reviewer (2~3일)
  RX-005: AI Reviewer Agent
  RX-006: 대시보드 AI 검토 UI

Phase 4 — 통합 테스트 (1~2일)
  전체 파이프라인 E2E 테스트
  실제 서류로 PASS/FAIL/ESCALATE 케이스 검증
```

### 환경 변수 정의 (.env.local)

```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# RPA 설정
RPA_HEADLESS=true                    # false: 디버깅 시 브라우저 화면 보임
RPA_SLOW_MO=50                       # ms, 사람처럼 느리게 동작
RPA_TIMEOUT=30000                    # ms, 페이지 로드 타임아웃

# 계정 암호화
CREDENTIAL_ENCRYPTION_KEY=32바이트_랜덤_키  # AES-256용

# 로컬 경로
LOCAL_RESULTS_BASE=./results          # 검증 결과 저장 경로
LOCAL_CAPTURES_BASE=./captures        # RPA 캡처 저장 경로

# 이메일 (알림 발송)
RESEND_API_KEY=your_resend_api_key

# 개발/운영 모드
MOCK_FALLBACK=true                    # true: RPA 실패 시 Mock 사용
HEALTH_CHECK_INTERVAL=86400000        # ms = 24시간
```

### 핵심 패키지 목록

```json
{
  "dependencies": {
    "puppeteer": "^22.0.0",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "puppeteer-extra-plugin-recaptcha": "^3.6.8",
    "@google/generative-ai": "^0.17.0",
    "ai": "^3.0.0",
    "exceljs": "^4.4.0",
    "sharp": "^0.33.0",
    "pdf-lib": "^1.17.1",
    "resend": "^3.0.0",
    "prisma": "^5.0.0",
    "node-cron": "^3.0.3"
  }
}
```

---

## 7. 위험도 매트릭스 (Risk Matrix)

| 위험 항목 | 발생 가능성 | 영향도 | 대응 전략 |
|---|---|---|---|
| 정부24 사이트 구조 변경 | 중 | 높음 | 다중 셀렉터 + 헬스체크 + 72h SLA |
| TOEIC 봇 차단 강화 | 높음 | 중간 | Chrome 프로파일 방식 + 단체 API 계약 로드맵 |
| Gemini API 비용 초과 | 낮음 | 중간 | 배치당 토큰 사용량 모니터링 + 임계치 알림 |
| 로컬 PC 장애 | 낮음 | 높음 | 검증 결과 자동 백업 + 재시작 재개 기능 |
| 개인정보 유출 | 매우 낮음 | 매우 높음 | 로컬 퍼스트 아키텍처 + 클라우드 전송 원천 차단 |
| AI Reviewer 오판정 | 중 | 높음 | ESCALATE 케이스 담당자 검토 의무화 + 정확도 모니터링 |

---

---

## 9. SRS v1.3 신규 기능 반영 (PRD 추가 — 2026-05-12)

> SRS v1.3에서 추가된 아래 3개 기능군은 PRD에도 Must 수준으로 반영됩니다.

### 9.1 기관 URL 커스텀 설정 (SRS §2 — REQ-FUNC-110~113)

**배경:** 졸업증명서 발급처가 웹민원센터·써트피아·정부24·아이써티 등으로 다양하고, 아이써티는 학교마다 진위확인 URL이 다릅니다. 개발자 없이 PM이 직접 새 URL을 추가할 수 있어야 합니다.

| 기능 | Priority | SRS REQ | 담당 Task |
|---|---|---|---|
| `config/agency_config.json` hot-load (재시작 없이 반영) | Must | REQ-FUNC-110 | RY-001 |
| 대시보드 "기관 설정" 폼 UI (비개발자 추가 가능) | Must | REQ-FUNC-111 | RY-002 |
| RPA 테스트 버튼 (URL 저장 직후 즉시 검증) | Must | REQ-FUNC-112 | RY-002 |
| AI 자동 URL 분석 (셀렉터 자동 탐지, 성공률 ≥70%) | Should | REQ-FUNC-113 | RY-003 |

**핵심 설계:** `config/agency_config.json`에 기관 ID, URL, 입력 필드, RPA 셀렉터, 유효기간을 정의. 대시보드 폼에서 JSON 자동 생성.

### 9.2 진위확인 불가 서류 처리 정책 (SRS §1.3 — REQ-FUNC-120~122)

| 불가 서류 | 대체 처리 | Priority | SRS REQ | Task |
|---|---|---|---|---|
| 에듀퓨어·윈스팩 수료증 | 기관별 엑셀 자동 생성 → 이메일 발송 | Must | REQ-FUNC-120 | RY-004 |
| OPIc 만료·90일 초과 확인서 | 만료일 자동 계산 → FAIL 자동 처리 | Must | REQ-FUNC-121 | RY-005 |
| 2001년 이전 수첩형 자격증 | Gemini Vision 실인 시각 검토 | Should | REQ-FUNC-122 | RY-005 |

### 9.3 서류 유형별 OCR 스키마 (SRS §1.2 — REQ-FUNC-130~132)

**배경:** 실제 서류는 25개 세부 유형이 있으며 Key 구조가 각기 다릅니다. 단일 OCR 프롬프트로는 정확한 필드 추출 불가.

| 기능 | Priority | SRS REQ | Task |
|---|---|---|---|
| `doc_category`별 전용 OCR 프롬프트 (졸업/자격/경력/어학) | Must | REQ-FUNC-130 | RY-006 |
| 졸업증명서 `doc_source` 자동 판별 (webminwon/certpia/gov24/icerts) | Must | REQ-FUNC-131 | RY-006 |
| 경력사항 `career_records` 배열 추출 + 지원서 1:N 대조 | Must | REQ-FUNC-132 | RY-007 |

---

## 10. 성공 지표 업데이트 (v1.2 + SRS v1.3 기준)

| KPI | 기준선 | v1.1 목표 | v1.2+v1.3 목표 | 측정 방법 |
|---|---|---|---|---|
| RPA 캡처 성공률 | 0% (수동) | ≥ 99.5% | ≥ 95% (폴백 포함) | 배치당 캡처 실패 건수 |
| AI Reviewer 정확도 | N/A | N/A | ≥ 95% (Precision) | 담당자 override 비율 |
| 담당자 검토 시간 | 12분/건 | — | ≤ 30초/건 (AI 권고) | 승인 클릭까지 시간 |
| 수동 에스컬레이션 비율 | 100% | — | ≤ 5% | ESCALATE / 전체 건수 |
| 기관 URL 추가 소요 시간 | 개발자 의뢰 (1~3일) | — | PM 직접 30초 이내 | 설정 완료~RPA 테스트 |
| 진위확인 불가 서류 처리 | 수동 100% | — | 엑셀 자동생성 + 수동 발송 | 자동 생성 성공률 |
| 서류 유형 OCR 정확도 | 70% (단일 프롬프트) | — | ≥ 90% (유형별 프롬프트) | 필드 추출 정확도 |

---

*Document Version: PRD v1.2 (SRS v1.3 반영 업데이트) | 작성: Claude | 기준: PRD v1.1 + SRS v1.2 + SRS v1.3 + TASK-001 v1.0*
