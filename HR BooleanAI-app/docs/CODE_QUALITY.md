# 🧪 Code Quality Report — HR BooleanAI Prototype v0

<!-- [AI Guide]
  이 문서는 Step 3(코드 품질 자동 평가)의 최초 결과와 Step 4~8 개선 후의 최종 평가를 비교합니다.
  다음 리팩토링 시작 시 이 문서를 먼저 읽어 현재 코드의 강점/약점을 파악하세요.
  평가 축: Readability, Reusability, Maintainability
-->

> **평가 기준**: Step 3 AI 자동 평가 (Readability / Reusability / Maintainability)  
> **최초 평가**: 2026-04-25 (RF-09 이전 기준)  
> **최종 평가**: 2026-04-25 (Step 3~8 완료 기준)

---

## 1. 종합 점수 비교

| 평가 축 | 최초 점수 | 최종 점수 | 주요 개선 내용 |
|--------|---------|---------|--------------|
| **Readability** | 74 / 100 🟡 | **88 / 100 🟢** | JSDoc 주석 추가, 인라인 스타일 → Tailwind 클래스 전환 |
| **Reusability** | 71 / 100 🟡 | **82 / 100 🟢** | STATS_CONFIG, CARD_THEMES, SITES 배열 도입, 헬퍼 함수 분리 |
| **Maintainability** | 58 / 100 🟠 | **72 / 100 🟡** | renderBadge/renderCapturePanel 중복 제거, 상태 판별 일원화 |
| **종합** | **68 / 100 🟡** | **81 / 100 🟢** | |

---

## 2. 축별 상세 평가

### 📖 Readability (가독성) — 88점 🟢

**강점**
- 파일 최상단에 파일명 및 함수 호출 구조 주석 (Step 8)
- 모든 주요 함수에 JSDoc 형식 한국어 docstring 추가 (Step 8)
- 인라인 `style=""` 속성 → Tailwind 유틸리티 클래스로 전환 (Step 7)
- `const $ = s => document.querySelector(s)` 로 DOM 조회 일관성 확보

**잔여 이슈**
- `buildCompareRows()` 내부 데이터가 하드코딩 → 순수 함수로 개선 필요
- `APP_NAME` 상수가 UI에 미연결 (로고 텍스트가 하드코딩)

---

### ♻️ Reusability (재사용성) — 82점 🟢

**강점**
- `CARD_THEMES` + `STATS_CONFIG` 패턴: 카드 색상을 theme prop으로 주입 (Step 5)
- `renderBadge()`, `getConfidenceColor()`, `renderCapturePanel()` 헬퍼 함수 분리
- `SITES` 배열 → `openSiteSettings()` 데이터 드리븐 렌더링

**잔여 이슈**
- `getRowById()`, `getFailRows()` 등 데이터 접근 레이어 미분리 (P1)
- FolderTree / Tabs 여전히 정적 HTML — 데이터와 비동기화 상태 (P1)

---

### 🔧 Maintainability (유지보수성) — 72점 🟡

**강점**
- 상태 판별 기준이 `status === 'PASS'` 필드 기반으로 일원화 (RF-03)
- HTML 볼륨 313줄 → 258줄 (-55줄, -18%) 축소
- `styles.css` modifier 클래스 제거 → JS theme prop으로 색상 관리

**잔여 이슈**
- `STATE` 객체 직접 변이: `STATE.activeTab = tab` 형태가 여러 함수에 산재 (M-1)
- `STATE.folderScanned` 선언됐으나 UI에 미반영 (M-3)
- Modal Shell 3개가 독립 HTML — 공통 구조 변경 시 3곳 수정 필요 (P2)

---

## 3. 이슈 트래커

| ID | 우선순위 | 축 | 이슈 | 해결 방안 |
|----|---------|---|------|---------|
| M-1 | 🔴 P0 | Maintainability | STATE 직접 변이 다수 | `setState(key, val)` 래퍼 도입 |
| Q-3 | 🟠 P1 | Readability | `APP_NAME` 상수 미연결 | nav 로고에 `APP_NAME` 바인딩 |
| R-2 | 🟠 P1 | Reusability | MOCK_DATA 직접 참조 | 데이터 접근 레이어(`getRowById` 등) 분리 |
| M-3 | 🟠 P1 | Maintainability | `folderScanned` 미사용 | 제거 또는 사이드바 상태 표시에 활용 |
| CP-04 | 🟡 P2 | Reusability | FolderTree 정적 HTML | `renderFolderTree()` 구현 — MOCK_DATA 연동 |
| CP-05 | 🟡 P2 | Reusability | Tab 카운트 하드코딩 | `renderTabStrip()` 구현 — 실시간 계산 |
| CP-02 | 🟡 P2 | Maintainability | Modal 구조 3개 중복 | `createModal()` 팩토리 함수 도입 |
| CP-03 | 🟡 P2 | Reusability | Render Pipeline 반복 | `renderList(id, items, fn)` 헬퍼 추출 |

---

## 4. 파일별 주요 지표

| 파일 | 총 줄 수 | 인라인 스타일 | JSDoc 함수 수 | 상태 |
|------|---------|-------------|------------|------|
| `index.html` | 258줄 | 0개 ✅ | — | 🟢 양호 |
| `app.js` | ~360줄 | 1개 (신뢰도 색상) | 8개 ✅ | 🟢 양호 |
| `styles.css` | 293줄 | — | — | 🟢 양호 |
