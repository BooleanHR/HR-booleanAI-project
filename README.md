# 📋 HR AI 서류 진위확인 솔루션 (HR BooleanAI Project)

본 프로젝트는 AI 및 RPA(로봇 프로세스 자동화) 기술을 융합하여 채용 과정에서 제출되는 다양한 증빙 서류(학력증명서, 국가기술자격증, 어학성적표, 4대보험 가입이력 등)의 진위 여부를 자동으로 확인하고 검증하는 로컬 및 웹 대시보드 솔루션입니다.

---

## 📂 프로젝트 폴더 구조 (Directory Structure)

```text
HR-booleanAI-project/
├── HR BooleanAI-app/
│   ├── nextapp/                 # Next.js 14 Web Application
│   │   ├── prisma/              # SQLite 스키마 및 마이그레이션 정의
│   │   ├── scripts/             # 자가 스모크 테스트 및 E2E 파이프라인 통합 테스트 스크립트
│   │   ├── src/
│   │   │   ├── app/             # 대시보드, 기관 설정 관리, 로그인 라우터 및 화면
│   │   │   └── lib/             # RPA 팩토리, Gemini AI 연동, 암호화, 메일 전송 헬퍼 등
│   │   └── config/              # 기관 설정 정보 JSON (hot-load 대응)
│   ├── docs/                    # 기획 설계서, 이슈 리스트, 아키텍처 결정 로그
│   └── reports/                 # 각 이슈별 TDD 구현 완료 보고서
├── HR_AI BooleanAI_Work Base/    # 기획 설계 레퍼런스 및 분석 자산
├── Prototype/                   # 와이어프레임 및 초기 프론트엔드 프로토타입
├── launcher.py                  # 불리언 진위확인 실행기 (Tkinter GUI 데스크톱 런처)
├── 불리언 진위확인 실행기.exe    # 빌드된 윈도우 실행 파일
└── README.md                    # (본 파일) 프로젝트 메인 안내서
```

---

## 🌟 핵심 기능 (Key Features)

1. **4단계 폴백(Fallback) RPA 캡처 엔진**
   - **Tier 1**: Puppeteer Stealth 브라우저를 통한 공식 기관 사이트 크롤링 및 스크린샷 캡처.
   - **Tier 2**: 로컬 Chrome 브라우저 프로필을 연동하여 쿠키 및 세션 자동 재사용.
   - **Tier 3**: XHR/REST API를 통한 정부24 등 공공 Open API 직접 대조.
   - **Tier 4**: 자동화가 모두 실패한 경우 수동 검토 대기 모드로 전환.
2. **Gemini AI 멀티모달 리뷰어 에이전트**
   - 원본 증빙 이미지와 RPA 캡처본을 함께 멀티모달 분석하여 승인(`APPROVE`), 반려(`REJECT`), 수동검토(`ESCALATE`)를 최종 판정합니다.
   - **구버전(2001년 이전) 자격증 대응**: Q-Net 데이터베이스 미등록 대상인 경우, Gemini Vision이 직인/인장 도장의 실제 날인 여부 및 정교함을 비전 프롬프트로 심층 분석합니다.
3. **서류 유효기간 판단 엔진**
   - 어학 성적(OPIc 730일), 자격 확인서(90일) 등 유효기간 만료일자를 자동으로 계산하여 기간이 지난 서류에 대해 `FAIL: 성적 만료`를 자동 판단합니다.
4. **4대보험 가입이력 매칭 (Jaro-Winkler)**
   - 건강보험공단 등에서 발급된 가입자격득실 정보와 이력서의 경력 사항을 Jaro-Winkler 유사도 알고리즘(유사도 >= 0.85) 및 재직 기간 중첩 계산으로 대조 검사합니다.
5. **기관 설정 실시간 반영 (Hot-Load)**
   - 자동화 대상 사이트의 URL 및 입력 태그 CSS 셀렉터를 웹 UI 상에서 직접 수정하면 서버의 재시작 없이 JSON 데이터를 메모리에 실시간으로 hot-load 반영합니다.
6. **AI 기반 CSS 셀렉터 자동 분석 및 추천**
   - 새로운 사이트 URL을 추가할 때, Gemini AI가 해당 페이지의 HTML 소스를 긁어 분석하여 아이디, 패스워드, 검색 필드 등의 CSS 셀렉터 후보군을 실시간으로 추천 및 채워줍니다.
7. **수동 검증 대상 엑셀 일괄 내보내기/가져오기**
   - 에듀퓨어 등 자동 조회가 불가능한 수동 검토 지원자 명단을 엑셀 파일로 출력하고, 담당자가 검토 결과를 기록해 업로드하면 DB에 일괄 동기화하는 기능을 제공합니다.
8. **Resend API 알림 메일 자동 발송**
   - AI 판독 결과가 반려(`REJECT`)로 도출된 지원자에게 탈락 사유 및 보완 서류를 업로드할 수 있는 고유 링크를 이메일로 자동 전송합니다.

---

## 🚀 시작하기 (Getting Started)

### 방법 A: 데스크톱 실행기 사용 (권장)
프로젝트 루트에 있는 **`불리언 진위확인 실행기.exe`** 파일(또는 `python launcher.py`)을 실행하면 원클릭으로 웹 서버 기동, 스모크 테스트 및 데이터베이스 마이그레이션을 GUI 환경에서 간편히 제어할 수 있습니다.

### 방법 B: 수동 명령 실행 (웹 앱 개발 모드)
1. **Next.js 디렉터리로 이동**:
   ```bash
   cd "HR BooleanAI-app/nextapp"
   ```
2. **패키지 설치** (pnpm 또는 npm 사용):
   ```bash
   pnpm install
   # 또는
   npm install
   ```
3. **데이터베이스 초기화 및 Prisma 클라이언트 빌드**:
   ```bash
   pnpm db:migrate
   pnpm db:generate
   ```
4. **개발 환경 변수 설정**:
   - `nextapp` 폴더 내에 `.env.local` 파일을 생성하고 필요한 API Key 및 암호화 키를 기재합니다. (자세한 서식은 `.env.example`을 참조하십시오.)
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     RESEND_API_KEY=your_resend_api_key_here
     ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
     ```
5. **서버 구동**:
   ```bash
   pnpm dev
   ```
   이후 브라우저에서 `http://localhost:3000`에 접속합니다.

---

## 🧪 테스트 및 품질 검증 (Testing & Verification)

### 1. 알고리즘 자가 스모크 테스트 (Smoke Test)
서버를 띄우지 않은 독립 CLI 상태에서 암호화, 유효기간 판단, 경력 유사도 비교 엔진의 무결성을 빠르게 확인합니다:
```bash
pnpm test
```

### 2. 전체 파이프라인 E2E 통합 테스트 (E2E Integration Test)
실제 데이터베이스 생성부터 시작해 RPA 구동, AI 판정, 반려 메일 구성, 수동 검증 엑셀 다운로드 및 업로드 롤플레잉까지 전 과정이 원활히 동작하는지 검증합니다:
```bash
npx tsx scripts/test-issue-017.ts
```

### 3. 코드 무결성 검증 명령어
프로젝트 배포 및 QA 전 코드 정합성을 판단하는 표준 점검 명령어 세트입니다:
```bash
pnpm typecheck  # TypeScript 타입 컴파일 에러 체크
pnpm lint       # 코드 스타일 및 린터 체크
pnpm build      # Next.js 프로덕션 빌드 성공 여부 체크
```
