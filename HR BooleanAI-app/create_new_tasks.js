const fs = require('fs');
const path = require('path');

const tasksDir = path.join(__dirname, 'tasks');

const templates = [
  {
    filename: '[E-RPA]_FR-200_puppeteer-stealth-setup_v0_1.md',
    yaml: 'name: Feature Task\ntitle: "[Feature] FR-200: Puppeteer + Stealth Plugin 로컬 환경 구성"\nlabels: \'feature, rpa, priority:critical\'\nversion: v0.1\nstatus: "초안 — 검수 대기"\nsource_task_id: RX-001',
    epic: 'E-RPA',
    featureId: 'FR-200',
    featureName: 'Puppeteer + Stealth Plugin 로컬 환경 구성',
    purpose: '로컬 Puppeteer + puppeteer-extra-plugin-stealth 설치. headless/headed 모드 전환 가능하도록 환경변수(RPA_HEADLESS, RPA_SLOW_MO, RPA_TIMEOUT) 제어. lib/rpa/browser.ts 싱글톤 팩토리 구현.',
    complexity: 'L',
    srsRef: 'PRD §1 장벽B, TASK-001 v1.2 RX-001',
    taskListRef: 'TASK-001 v1.2 RX-001',
    tb: [
      '`npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth`',
      '`.env.local` — RPA_HEADLESS=true, RPA_SLOW_MO=50, RPA_TIMEOUT=30000',
      '`lib/rpa/browser.ts` — 브라우저 싱글톤 팩토리 (stealth 플러그인 적용)',
      'headless/headed 전환 테스트',
      '`scripts/rpa-test.ts` — 정부24 접속 + `./captures/test_gov24.png` 저장 스모크 테스트'
    ],
    ac: '`navigator.webdriver === false` 감지 + PNG 파일 생성 확인',
    depends: '없음',
    blocks: 'RX-002, RX-003, RX-007',
    sourceTask: 'RX-001'
  },
  {
    filename: '[E-RPA]_FR-201_rpa-fallback-capture-engine_v0_1.md',
    yaml: 'source_task_id: RX-002\ntitle: "[Feature] FR-201: RPA 4단계 폴백 캡처 엔진"\nlabels: \'feature, rpa, priority:critical\'',
    epic: 'E-RPA',
    featureId: 'FR-201',
    featureName: 'RPA 4단계 폴백 캡처 엔진',
    purpose: '`lib/rpa/capture.ts` — captureVerificationPage() 구현. Tier1(Stealth)→Tier2(Chrome프로파일)→Tier3(API직접)→Tier4(Mock+MANUAL_REVIEW) 순서 자동 폴백.',
    complexity: 'H',
    srsRef: 'SRS-HR-AI-Verification-v1.3.md',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'captureVerificationPage(siteKey, inputData, credentials?) 메인 함수',
      'Tier1: puppeteer-extra stealth 캡처',
      'Tier2: --user-data-dir Chrome 프로파일 연동',
      'Tier3: XHR API 직접 호출 (정부24 발급번호 확인 API)',
      'Tier4: mock_used=true + MANUAL_REVIEW 전환',
      '캡처 PNG 저장 + SHA-256 해시 생성'
    ],
    ac: '정부24 조회 PNG 저장 + hash 반환. 실패 시 Tier2 자동 시도. 전부 실패 시 mock_used=true 반환',
    depends: 'RX-001',
    blocks: 'RX-004, RX-005, P-001',
    sourceTask: 'RX-002'
  },
  {
    filename: '[E-RPA]_FR-202_multi-selector-system_v0_1.md',
    yaml: 'source_task_id: RX-003\ntitle: "[Feature] FR-202: 다중 셀렉터 우선순위 시스템 + Gemini DOM 분석"\nlabels: \'feature, rpa, priority:high\'',
    epic: 'E-RPA',
    featureId: 'FR-202',
    featureName: '다중 셀렉터 우선순위 시스템 + Gemini DOM 분석',
    purpose: '`lib/rpa/selectors.ts` — 5개 기관 필드별 다중 셀렉터 정의(ID→name→class→placeholder 우선순위). 전부 실패 시 Gemini 1.5 Flash에 DOM HTML 전달 → 새 셀렉터 제안.',
    complexity: 'H',
    srsRef: 'SRS-HR-AI-Verification-v1.3.md',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'FIELD_SELECTORS 맵 (gov24, qnet, nhis, toeic, opic 각 4개 이상 셀렉터)',
      'findElementWithFallback() 우선순위 시도 함수',
      '전부 실패 시 Gemini DOM 분석 + 셀렉터 캐시 저장',
      '의도적 잘못된 셀렉터 → 폴백 동작 단위 테스트'
    ],
    ac: '1순위 셀렉터 부재 시 2→3→4순위 자동 시도. 전부 실패 시 Gemini 새 셀렉터 제안',
    depends: 'RX-001',
    blocks: 'RX-002, RX-004',
    sourceTask: 'RX-003'
  },
  {
    filename: '[E-RPA]_FR-203_site-health-check-scheduler_v0_1.md',
    yaml: 'source_task_id: RX-004\ntitle: "[Feature] FR-203: 사이트 헬스체크 스케줄러"\nlabels: \'feature, rpa, priority:high\'',
    epic: 'E-RPA',
    featureId: 'FR-203',
    featureName: '사이트 헬스체크 스케줄러',
    purpose: '`lib/rpa/health-check.ts` — 매일 오전 6시(node-cron) 5개 사이트 핵심 셀렉터 존재 확인. 실패 시 콘솔 경고 + 이메일 알림. health_log 테이블 이력 저장.',
    complexity: 'M',
    srsRef: 'SRS-HR-AI-Verification-v1.3.md',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'runSiteHealthCheck() 구현',
      'node-cron 스케줄 `0 6 * * *`',
      '실패 감지 → Resend API 알림 발송',
      '대시보드 "RPA 상태" 표시 컴포넌트'
    ],
    ac: '정상 시 alive:true 반환. 이상 시 30분 이내 알림',
    depends: 'RX-002, RX-003',
    blocks: '없음',
    sourceTask: 'RX-004'
  },
  {
    filename: '[E-AI]_FR-204_ai-reviewer-agent_v0_1.md',
    yaml: 'source_task_id: RX-005\ntitle: "[Feature] FR-204: AI Reviewer Agent — Gemini Vision LLM 자동 검토"\nlabels: \'feature, ai-reviewer, priority:critical\'',
    epic: 'E-AI',
    featureId: 'FR-204',
    featureName: 'AI Reviewer Agent — Gemini Vision LLM 자동 검토',
    purpose: '`lib/ai/reviewer-agent.ts` — runAIReviewer() 구현. 원본 서류 이미지 + RPA 캡처 이미지 + OCR 결과를 Gemini 1.5 Pro Vision에 멀티모달 전달. APPROVE/REJECT/ESCALATE 결정 + 한국어 자연어 설명 생성.\n- **판정 기준:**\n  - APPROVE: 3소스 일치 + 신뢰도 ≥90% + 이미지 정상\n  - REJECT: 핵심 항목 1개 이상 불일치 + 근거 명확\n  - ESCALATE: OCR <70%, 캡처 실패(mock), 판단 불충분',
    complexity: 'H',
    srsRef: 'SRS-HR-AI-Verification-v1.3.md',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'AIReviewInput / AIReviewOutput 타입 정의',
      'Gemini 1.5 Pro Vision 멀티모달 프롬프트 (한국어)',
      'generateObject() + zod 스키마 검증',
      'VerificationJob 완료 후 자동 runAIReviewer() 파이프라인 연결',
      'ai_review_decision, ai_review_summary 컬럼 DB 저장'
    ],
    ac: '홍길동 정보처리기사 → APPROVE (신뢰도≥95%). 김철수 학위 불일치 → REJECT. 처리시간 ≤10초',
    depends: 'RX-002, I-001~005, P-001',
    blocks: 'RX-006',
    sourceTask: 'RX-005'
  },
  {
    filename: '[E-UI]_FR-205_ai-review-panel-ui_v0_1.md',
    yaml: 'source_task_id: RX-006\ntitle: "[Feature] FR-205: 대시보드 AI 검토 결과 패널 UI"\nlabels: \'feature, ui, ai-reviewer, priority:high\'',
    epic: 'E-UI',
    featureId: 'FR-205',
    featureName: '대시보드 AI 검토 결과 패널 UI',
    purpose: '`components/AIReviewPanel.tsx` — APPROVE(초록)/REJECT(빨강)/ESCALATE(노랑) 상태별 시각 표현. 신뢰도 게이지. 자연어 설명. "최종 승인" 원클릭 버튼 (APPROVE 케이스). "직접 검토" 버튼.',
    complexity: 'M',
    srsRef: 'SRS-HR-AI-Verification-v1.3.md',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'AIReviewPanel 컴포넌트 구현',
      'APPROVE/REJECT/ESCALATE 상태별 UI',
      '"최종 승인" 버튼 → approveJob() Server Action 연결',
      'AI 처리 중 스피너',
      '검증 상세 모달 "AI 검토" 탭 표시'
    ],
    ac: 'APPROVE 상태에서 "최종 승인" 1클릭 → 완료. 담당자 액션 ≤10초',
    depends: 'RX-005',
    blocks: '없음',
    sourceTask: 'RX-006'
  },
  {
    filename: '[E-CRED]_FR-206_credential-aes256-storage_v0_1.md',
    yaml: 'source_task_id: RX-007\ntitle: "[Feature] FR-206: 기관 계정 AES-256 암호화 저장"\nlabels: \'feature, security, priority:high\'',
    epic: 'E-CRED',
    featureId: 'FR-206',
    featureName: '기관 계정 AES-256 암호화 저장',
    purpose: '`lib/crypto/credentials.ts` — AES-256-GCM 암호화/복호화. 대시보드 계정 설정 저장 시 암호화 후 SQLite site_credentials 테이블 저장. RPA 실행 시 메모리에서만 복호화. 평문 로그 기록 절대 금지.',
    complexity: 'M',
    srsRef: 'SRS-HR-AI-Verification-v1.3.md',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'AES-256-GCM 암호화/복호화 유틸리티',
      'CREDENTIAL_ENCRYPTION_KEY 32바이트 랜덤 생성 스크립트',
      'SiteCredential Prisma 모델 (encryptedId, encryptedPw, iv)',
      '암호화→DB저장→복호화→원문일치 단위 테스트'
    ],
    ac: 'DB에 평문 없음. 복호화 성공. 로그 평문 미출력. 키 없이 복호화 시 에러',
    depends: 'RX-001',
    blocks: 'RX-002 (TOEIC 로그인)',
    sourceTask: 'RX-007'
  },
  {
    filename: '[E-RPA]_FR-210_agency-config-hotload_v0_1.md',
    yaml: 'source_task_id: RY-001\ntitle: "[Feature] FR-210: agency_config.json hot-load 기관 설정 시스템"\nlabels: \'feature, rpa, config, priority:high\'',
    epic: 'E-RPA',
    featureId: 'FR-210',
    featureName: 'agency_config.json hot-load 기관 설정 시스템',
    purpose: '`config/agency_config.json` 생성 (gov24, qnet_cert, qnet_cert_confirm, toeic_ybm, opic_actfl, korcham_cert, certpia, webminwon 8개 기관). `lib/rpa/agency-loader.ts` — fs.watchFile 런타임 hot-load. RPA 캡처 엔진이 동적으로 URL/셀렉터/입력필드 로드.',
    complexity: 'M',
    srsRef: 'REQ-FUNC-110',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'config/agency_config.json 기본 8개 기관 정의',
      'agency-loader.ts — watchFile 기반 hot-load',
      'applicable_doc_types → OCR doc_category 자동 연결',
      '단위 테스트: JSON 수정 → 재시작 없이 반영 확인'
    ],
    ac: 'agency_config.json 수정 후 10초 이내 재시작 없이 반영',
    depends: 'RX-002, RX-003',
    blocks: 'RY-002, RY-003',
    sourceTask: 'RY-001'
  },
  {
    filename: '[E-UI]_FR-211_agency-settings-ui_v0_1.md',
    yaml: 'source_task_id: RY-002\ntitle: "[Feature] FR-211: PM 비개발자용 기관 설정 폼 UI"\nlabels: \'feature, ui, config, priority:high\'',
    epic: 'E-UI',
    featureId: 'FR-211',
    featureName: 'PM 비개발자용 기관 설정 폼 UI',
    purpose: '`components/AgencySettingsModal.tsx` — 비개발자 PM이 진위확인 기관 URL을 추가/편집할 수 있는 폼. 기관ID/명/URL/로그인여부/입력필드/유효기간 입력. 저장→agency_config.json 자동 업데이트. "RPA 테스트" 버튼 10초 이내 결과 반환.',
    complexity: 'M',
    srsRef: 'REQ-FUNC-111, REQ-FUNC-112',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'AgencySettingsModal 컴포넌트',
      '저장 → agency_config.json 업데이트 Server Action',
      '"RPA 테스트" 버튼 — URL 접속 + 셀렉터 존재 확인',
      '기존 기관 편집/비활성화 (enabled: false)'
    ],
    ac: 'PM이 30초 이내 새 기관 추가 완료. RPA 테스트 10초 이내 결과',
    depends: 'RY-001',
    blocks: 'RY-003',
    sourceTask: 'RY-002'
  },
  {
    filename: '[E-AI]_FR-212_url-auto-analyzer_v0_1.md',
    yaml: 'source_task_id: RY-003\ntitle: "[Feature] FR-212: 진위확인 URL AI 자동 분석 — 셀렉터 탐지"\nlabels: \'feature, ai, config, priority:should\'',
    epic: 'E-AI',
    featureId: 'FR-212',
    featureName: '진위확인 URL AI 자동 분석 — 셀렉터 탐지',
    purpose: '`lib/rpa/url-analyzer.ts` — 진위확인 URL 입력 시 Puppeteer로 HTML 캡처 → Gemini 1.5 Flash에 입력 폼 필드 식별 요청 → 셀렉터 후보 목록 UI 표시. 성공률 ≥70% 목표.',
    complexity: 'H',
    srsRef: 'REQ-FUNC-113',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'url-analyzer.ts URL 접속 + HTML 캡처',
      'Gemini 프롬프트: "이 HTML에서 진위확인 입력 필드 셀렉터를 찾아주세요"',
      '셀렉터 후보 3개 이상 UI 표시 → PM 선택',
      '선택 셀렉터 → agency_config.json 자동 채움'
    ],
    ac: '써트피아 URL 입력 → 셀렉터 후보 ≥3개. 성공률 ≥70%',
    depends: 'RY-002, RX-005',
    blocks: '없음',
    sourceTask: 'RY-003'
  },
  {
    filename: '[E-PIPE]_FR-213_unverifiable-doc-handler_v0_1.md',
    yaml: 'source_task_id: RY-004\ntitle: "[Feature] FR-213: 진위확인 불가 서류 대체 처리 엔진"\nlabels: \'feature, pipeline, priority:must\'',
    epic: 'E-PIPE',
    featureId: 'FR-213',
    featureName: '진위확인 불가 서류 대체 처리 엔진',
    purpose: '`lib/verification/unverifiable.ts` — agency_config에 기관 없으면 verification_possible:false 처리. 에듀퓨어/윈스팩 전용 엑셀 자동 생성. 수동 결과 업로드 UI → final_result 업데이트. 감사 PDF에 "확인불가" 명기.',
    complexity: 'M',
    srsRef: 'REQ-FUNC-120',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'verification_possible 판단 로직',
      '에듀퓨어 전용 엑셀 생성 (발급번호/성명/생년월일/발급일)',
      '윈스팩 전용 엑셀 생성 (대상자 명단 + 교육 리스트 2시트)',
      '대시보드 "대체 처리 필요" 배지 + 엑셀 다운로드 버튼',
      '수동 처리 결과 업로드 → final_result 업데이트 Server Action'
    ],
    ac: '에듀퓨어 수료증 → verification_possible:false + 엑셀 다운 버튼. 엑셀 5개 컬럼 포함',
    depends: 'RY-001, G-001',
    blocks: '없음',
    sourceTask: 'RY-004'
  },
  {
    filename: '[E-VERIFY]_FR-214_expiry-check-engine_v0_1.md',
    yaml: 'source_task_id: RY-005\ntitle: "[Feature] FR-214: 서류 유효기간 자동 판정 + 이전 자격증 Gemini 시각 검토"\nlabels: \'feature, verify, priority:must\'',
    epic: 'E-VERIFY',
    featureId: 'FR-214',
    featureName: '서류 유효기간 자동 판정 + 이전 자격증 Gemini 시각 검토',
    purpose: '`lib/verification/expiry-check.ts` — valid_days 기반 만료일 자동 계산. OPIc(730일), Q-Net 확인서(90일), 정부24(180일). 만료 시 FAIL + 사유 자동 생성. 2001년 이전 수첩형 자격증 → Gemini Vision 실인 시각 검토 → MANUAL_REVIEW.',
    complexity: 'M',
    srsRef: 'REQ-FUNC-121, REQ-FUNC-122',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'valid_days 기반 만료일 계산 (agency_config 참조)',
      '만료 판정 → discrepancy_detail:"성적 유효기간 만료 (만료일: YYYY-MM-DD)"',
      'pass_date 연도 ≤2001 감지 → "이전 자격증" 분기',
      'Gemini Vision "실인·인장 날인 존재 여부 확인" → MANUAL_REVIEW 전환'
    ],
    ac: 'OPIc 만료일 2025/06/18, 검증일 2026/01/01 → FAIL:성적유효기간만료 자동 반환',
    depends: 'G-001, RY-001',
    blocks: '없음',
    sourceTask: 'RY-005'
  },
  {
    filename: '[E-OCR]_FR-215_doc-type-ocr-prompt-router_v0_1.md',
    yaml: 'source_task_id: RY-006\ntitle: "[Feature] FR-215: 서류 유형별 OCR 프롬프트 분기 시스템"\nlabels: \'feature, ocr, priority:must\'',
    epic: 'E-OCR',
    featureId: 'FR-215',
    featureName: '서류 유형별 OCR 프롬프트 분기 시스템',
    purpose: '`lib/ocr/prompts/` 폴더 — graduation.ts/certificate.ts/career.ts/language.ts 4개 전용 프롬프트. `lib/ocr/prompt-router.ts` — 1차 분류 후 전용 프롬프트 선택. 졸업증명서 doc_source 자동 판별(webminwon/certpia/gov24/icerts). "성 명 : 유용완" → "유용완" 분리 처리.',
    complexity: 'H',
    srsRef: 'REQ-FUNC-130, REQ-FUNC-131',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'lib/ocr/prompts/ 4개 파일 생성',
      'prompt-router.ts — doc_category → 전용 프롬프트 선택',
      'graduation.ts — doc_source 판별 로직 (하단 문구 분석)',
      '"성 명" 분리 처리 및 정규화 로직',
      '단위 테스트: 써트피아 졸업증명서 → doc_source:"certpia" + certpia URL 자동 선택'
    ],
    ac: '써트피아 졸업증명서 → doc_source:"certpia". "성 명:유용완" → name:"유용완"',
    depends: 'G-001~G-004, RY-001',
    blocks: 'RY-007',
    sourceTask: 'RY-006'
  },
  {
    filename: '[E-VERIFY]_FR-216_career-records-matching_v0_1.md',
    yaml: 'source_task_id: RY-007\ntitle: "[Feature] FR-216: 경력사항 career_records 배열 추출 + 지원서 1:N 대조"\nlabels: \'feature, verify, priority:must\'',
    epic: 'E-VERIFY',
    featureId: 'FR-216',
    featureName: '경력사항 career_records 배열 추출 + 지원서 1:N 대조',
    purpose: 'OCR career_records 배열 파싱 (회사명/기간/가입자구분 정규화). 입사지원서 경력과 1:N 매칭. 회사명 유사도(Jaro-Winkler ≥0.85) + 기간 overlap 계산. 지역가입자(프리랜서) → MANUAL_REVIEW. discrepancy_detail 구조화 저장.',
    complexity: 'H',
    srsRef: 'REQ-FUNC-132',
    taskListRef: 'TASK-LIST-HR-AI-Verification-v1_2.md',
    tb: [
      'career_records 배열 파싱 + 정규화',
      'Jaro-Winkler 유사도 기반 회사명 매칭',
      '기간 overlap 계산 (날짜 파싱 + 비율)',
      '지역가입자 판별 → MANUAL_REVIEW 전환',
      '단위 테스트: 건강보험자격득실확인서 3개 이력 vs 지원서 2개 대조'
    ],
    ac: '회사명 일치 + overlap≥80% → PASS. 지역가입자 → MANUAL_REVIEW',
    depends: 'RY-006, I-001',
    blocks: '없음',
    sourceTask: 'RY-007'
  }
];

templates.forEach(t => {
  const content = '---\\n' + t.yaml + '\\n---\\n\\n' +
    '## :dart: Summary\\n' +
    '- **기능명:** [' + t.featureId + '] ' + t.featureName + '\\n' +
    '- **Epic:** ' + t.epic + '\\n' +
    '- **목적:** ' + t.purpose + '\\n' +
    '- **복잡도:** ' + t.complexity + '\\n\\n' +
    '## :link: References (Spec & Context)\\n' +
    '- SRS 문서: ' + t.srsRef + '\\n' +
    '- TASK-LIST: ' + t.taskListRef + '\\n\\n' +
    '## :white_check_mark: Task Breakdown (실행 계획)\\n' +
    t.tb.map((item, i) => '- [ ] **TB-' + (i+1) + ':** ' + item).join('\\n') + '\\n\\n' +
    '## :test_tube: Acceptance Criteria (BDD/GWT)\\n' +
    '- ' + t.ac + '\\n\\n' +
    '## :gear: Technical & Non-Functional Constraints\\n' +
    '- Next.js App Router Server Action / Route Handler 패턴 (필요시)\\n\\n' +
    '## :checkered_flag: Definition of Done (DoD)\\n' +
    '- [ ] 핵심 기능 구현 완료\\n' +
    '- [ ] AC 시나리오 통과\\n' +
    '- [ ] npm run build 에러 0건\\n\\n' +
    '## :construction: Dependencies & Blockers\\n' +
    '- **Depends on:** ' + t.depends + '\\n' +
    '- **Blocks:** ' + t.blocks + '\\n\\n' +
    '---\\n' +
    '*Document Version: v0.1 (초안) | Source: TASK-LIST ' + t.sourceTask + ' | SRS: v1.3*\\n';

  fs.writeFileSync(path.join(tasksDir, t.filename), content, 'utf8');
});

console.log('14 Task files created successfully.');
