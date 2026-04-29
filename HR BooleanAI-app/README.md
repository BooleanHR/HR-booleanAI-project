<!-- [AI Guide — README.md]
  이 README는 HR BooleanAI Prototype v0의 종합 문서입니다.
  신규 작업 시작 시 아래 "프로젝트 구조" 섹션을 먼저 확인하세요.
  세부 정보는 docs/ 하위 문서(UX_FLOW.md, COMPONENT_STRUCTURE.md, CODE_QUALITY.md)를 참조하세요.
  주요 코드: index.html(마크업), app.js(로직), styles.css(스타일)
-->

# 🛡️ HR BooleanAI — 서류 진위확인 솔루션 (Prototype v0)

HR 담당자를 위한 **AI 기반 서류 진위확인 솔루션**의 로컬 클라이언트 프로토타입입니다.  
수동으로 이루어지던 증빙서류(학력, 자격, 경력 등) 검증 과정을 **RPA + Vision LLM**으로 자동화하는 워크플로우를 시각화합니다.

---

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **버전** | Prototype v0 |
| **기술 스택** | Vanilla HTML / CSS / JavaScript + Tailwind CSS (CDN) |
| **아키텍처** | 로컬 SPA (Single Page Application), 서버 불필요 |
| **대상 사용자** | HR 담당 관리자 (Admin / Operator) |
| **테스트 계정** | `test_admin@hrboolean.ai` / `Admin123!` |

### 핵심 기능

1. **Triple Check 자동 검증** — 입사지원서 기재내용 ↔ OCR 추출값 ↔ 기관 조회 결과 3방향 비교
2. **Human-in-the-Loop 리뷰** — 불일치 항목 상세 모달 → 관리자 승인/반려
3. **자동 알림 발송** — FAIL/MANUAL_REVIEW 지원자에게 불일치 안내 이메일 발송
4. **감사 리포트 추출** — 검증 결과 Excel / 감사 PDF 다운로드

---

## 🗂️ 프로젝트 구조

```
Opus_Prototype-v0/
├── index.html              # 메인 뷰어 — 로그인 + 대시보드 + 3개 모달
├── app.js                  # 비즈니스 로직 — 상태 관리, 렌더링, 이벤트 핸들러
├── styles.css              # 디자인 시스템 — CSS Variables + 컴포넌트 스타일
├── README.md               # 프로젝트 종합 문서 (이 파일)
├── COMPONENT_TREE.md       # 컴포넌트 트리 (RF-01~09 이전 기준 Mermaid 다이어그램)
└── docs/
    ├── UX_FLOW.md          # UX 핵심 시나리오 A~F 흐름 정의
    ├── COMPONENT_STRUCTURE.md  # 컴포넌트 계층 차트 + 현황 분석 + 개선점
    └── CODE_QUALITY.md     # 코드 품질 평가 (Readability/Reusability/Maintainability)
```

---

## 🔄 리팩토링 이력 (RF-01 ~ Step 8)

### 작업 전/후 비교

| 항목 | Before | After |
|------|--------|-------|
| `index.html` | 313줄 (하드코딩 중복 다수) | **258줄** (-55줄, -18%) |
| 인라인 스타일 | 12개 이상 | **0개** (Tailwind 클래스로 전환) |
| 주석/문서화 | 없음 | JSDoc 8개 함수 + 파일 개요 주석 |
| StatCard | 하드코딩 HTML × 4 | `STATS_CONFIG` + `renderStatGrid()` |
| 색상 관리 | CSS `.modifier` 클래스 | `CARD_THEMES` theme prop |
| 상태 판별 | 한국어 문자열 `'완료'` 비교 | `status === 'PASS'` 필드 비교 |

### 주요 패턴 적용 내역

| 패턴 ID | 내용 | 효과 |
|---------|------|------|
| RF-01 | `renderCapturePanel()` 추출 | 캡처 패널 중복 제거 |
| RF-02 | `SITES` 배열 기반 SiteRows 렌더링 | HTML -25줄 |
| RF-03 | `status` 필드 기반 판별 일원화 | 한글 비교 버그 제거 |
| RF-04/05 | `getConfidenceColor`, `renderBadge` 헬퍼 | 중복 로직 함수화 |
| CP-01 | `STATS_CONFIG` + `renderStatGrid()` | StatCard HTML -22줄 |
| Step-5 | `CARD_THEMES` 테마 레지스트리 | 색상 props 주입 패턴 |
| Step-7 | Tailwind CSS 적용 | 인라인 스타일 전면 제거 |
| Step-8 | JSDoc 한국어 주석 | 코드 리뷰/AI 컨텍스트 개선 |

---

## 📊 코드 품질 평가 요약

| 축 | 초기 | 최종 | 상태 |
|----|------|------|------|
| Readability  | 74 / 100 | **88 / 100** | 🟢 |
| Reusability  | 71 / 100 | **82 / 100** | 🟢 |
| Maintainability | 58 / 100 | **72 / 100** | 🟡 |
| **종합** | **68 / 100** | **81 / 100** | 🟢 |

> 상세 평가 → [`docs/CODE_QUALITY.md`](./docs/CODE_QUALITY.md)

---

## 📱 UX 핵심 시나리오

| 시나리오 | 설명 |
|---------|------|
| A | 로그인 → 대시보드 진입 |
| B | 폴더 스캔 → 검증 시작 |
| C | 대시보드 탭 필터링 |
| D | 검증 상세 모달 (Triple Check) |
| E | 불일치 알림 발송 |
| F | 사이트 계정 설정 |

> 상세 시나리오 → [`docs/UX_FLOW.md`](./docs/UX_FLOW.md)

---

## 🗺️ 컴포넌트 구조

> 계층 차트 + 개선점 분석 → [`docs/COMPONENT_STRUCTURE.md`](./docs/COMPONENT_STRUCTURE.md)

**JS 동적 렌더링 컴포넌트 (★)**

| 컴포넌트 | 함수 | 데이터 소스 |
|---------|------|------------|
| StatGrid | `renderStatGrid()` | `STATS_CONFIG` + `CARD_THEMES` |
| ResultRows | `renderTable()` | `MOCK_DATA` (STATE 필터) |
| CapturePanel | `renderCapturePanel()` | `MOCK_DATA` row |
| CompareTable | `buildCompareRows()` | `MOCK_DATA` row |
| NotiList | `openNotiModal()` | `MOCK_DATA` 필터 |
| SiteRows | `openSiteSettings()` | `SITES` 배열 |

---

## 🚀 향후 구현 계획 (Roadmap)

### 🔴 즉시 (P0 — v0 마무리)
- `setState()` 래퍼 도입으로 STATE 변이 중앙화
- `APP_NAME` 상수를 nav 로고 텍스트에 연결

### 🟠 단기 (P1 — v1 준비)
- `getRowById()`, `getFailRows()` 데이터 접근 레이어 분리
- `renderFolderTree()` — MOCK_DATA 연동 (정적 HTML 교체)
- `renderTabStrip()` — 탭 카운트 실시간 계산

### 🟡 중기 (P2 — v1 구현)
- `createModal()` 팩토리 — 3개 모달 공통 Shell 생성
- `renderList()` 헬퍼 — Render Pipeline 패턴 통합
- 프레임워크 전환 검토 (React / Next.js)

### 🟢 장기 (P3 — v2 이후)
- 실제 API 연동 레이어 (fetch / axios)
- 상태 관리 고도화 (Zustand / Redux)
- 접근성(A11y) 강화 — 키보드 내비게이션 + ARIA 속성
