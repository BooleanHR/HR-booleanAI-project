# HR BooleanAI v0.9 — Design Specification

> **버전**: v0.9.2  
> **작성일**: 2026-05-26  
> **참고 원본**: `BooleanHR/DESIGN.md` · `BooleanHR/COMPONENTS.md`  
> **소스 파일**: `hr-booleanai-v0.9.2.html`

본 문서는 HR BooleanAI 서류 진위확인 AI 솔루션의 **디자인 시스템 및 컴포넌트 명세서**입니다.  
단일 HTML 파일(`hr-booleanai-v0.9.2.html`)을 향후 **폴더 기반 컴포넌트 구조**로 분리·재현할 수 있도록,  
색상 토큰·타이포그래피·여백·컴포넌트 인터랙션을 하나의 문서에 정의합니다.

---

## 1. 디자인 철학 및 방향성

HR BooleanAI의 디자인은 **"정밀함, 신뢰, 속도"**를 핵심 가치로 삼습니다.

- **Dark-First UI**: 배경은 극도로 어두운 Navy-Black(`#06080f`)을 기반으로 하여 장시간 업무 환경에서 눈의 피로를 최소화합니다.
- **단일 강조색 (Accent First)**: 모든 핵심 액션, 상태 표시, 브랜드 아이덴티티는 `--acc` (`#00d4aa`, Teal)로 통일합니다. 이 색은 "검증 통과"의 신뢰 신호이자 브랜드 색상입니다.
- **시맨틱 컬러 시스템**: 검증 결과(PASS / FAIL / MANUAL)에는 각각 Teal / Red / Yellow 3색 체계를 일관되게 사용하여 인지 부하를 줄입니다.
- **Mono 타입의 데이터 표현**: 숫자, 코드, ID, 타임스탬프 등 기계적 데이터는 모두 `JetBrains Mono`를 사용합니다.
- **Notion 스타일 레이아웃 계승**: `BooleanHR/DESIGN.md`에서 정의한 카드 반경(`12~14px`), 1px 경계선, 절제된 여백 원칙을 그대로 계승합니다.

---

## 2. 디자인 토큰 (Design Tokens)

### A. 색상 토큰 (Color Tokens)

> BooleanHR DESIGN.md의 그레이스케일 기반을 Dark Mode로 변환·확장한 체계입니다.

#### 2-A-1. 배경 레이어 (Background Layers)

| 토큰명 | 값 (HEX / RGBA) | 사용처 | 대응 BooleanHR 토큰 |
| :--- | :--- | :--- | :--- |
| `--bg` | `#06080f` | 앱 최상위 배경 (body) | `--dark-bg` (`#111111`) |
| `--s1` | `#0b0f1a` | 사이드바, 액션바, 네비 배경 | `--surface` (`#f7f7f7`) Dark 변환 |
| `--s2` | `#101522` | 카드, 모달 배경 | `--canvas` (`#ffffff`) Dark 변환 |
| `--s3` | `#161d2e` | 입력 필드, 코드 블록 배경 | — |
| `--s4` | `#1c2438` | 호버 강조 배경 | — |

#### 2-A-2. 경계선 (Border Layers)

| 토큰명 | 값 | 사용처 | 대응 BooleanHR 토큰 |
| :--- | :--- | :--- | :--- |
| `--bd1` | `rgba(255,255,255,.06)` | 섹션 구분 미세 경계선 | `--hairline-soft` (`#efefef`) |
| `--bd2` | `rgba(255,255,255,.10)` | 카드·버튼 기본 테두리 | `--hairline` (`#e4e4e4`) |
| `--bd3` | `rgba(255,255,255,.16)` | 호버·포커스 테두리 | `--muted` (`#c4c4c4`) |

#### 2-A-3. 텍스트 (Text Layers)

| 토큰명 | 값 | 사용처 | 대응 BooleanHR 토큰 |
| :--- | :--- | :--- | :--- |
| `--tx0` | `#dce4f0` | 주요 텍스트 (제목, 강조) | `--ink` (`#1a1a1a`) |
| `--tx1` | `rgba(220,228,240,.65)` | 본문 텍스트 | `--slate` (`#4a4a4a`) |
| `--tx2` | `rgba(220,228,240,.38)` | 설명·라벨 텍스트 | `--steel` (`#6b6b6b`) |
| `--tx3` | `rgba(220,228,240,.20)` | 비활성·플레이스홀더 | `--stone` (`#999999`) |

#### 2-A-4. 브랜드 및 시맨틱 색상

| 토큰명 | 값 | 역할 | 의미 |
| :--- | :--- | :--- | :--- |
| `--acc` | `#00d4aa` | 브랜드 Accent / PASS 상태 | 주 강조색 (단일 강조색) |
| `--acc2` | `rgba(0,212,170,.12)` | Accent 배경 (뱃지·칩) | — |
| `--acc3` | `rgba(0,212,170,.30)` | Accent 테두리 (포커스·강조) | — |
| `--red` | `#ff4d6d` | FAIL 상태 / 위험 액션 | 오류·반려 |
| `--red2` | `rgba(255,77,109,.12)` | FAIL 배경 | — |
| `--red3` | `rgba(255,77,109,.30)` | FAIL 테두리 | — |
| `--yel` | `#f5c842` | MANUAL 상태 / 처리 중 | 수동검토 필요 |
| `--yel2` | `rgba(245,200,66,.12)` | MANUAL 배경 | — |
| `--blu` | `#4d8fff` | 정보·전체 통계 | 중립 정보 |
| `--blu2` | `rgba(77,143,255,.12)` | 정보 배경 | — |

#### 2-A-5. 3색 시맨틱 체계 요약

```
PASS   → --acc  (#00d4aa) Teal    → 서류 진위 확인 완료
FAIL   → --red  (#ff4d6d) Red     → 위·변조 또는 불일치 감지
MANUAL → --yel  (#f5c842) Yellow  → AI 판단 불가, 사람이 검토 필요
```

---

### B. 타이포그래피 (Typography)

#### 2-B-1. 폰트 스택

```
Primary  : 'Noto Sans KR', sans-serif   (UI 전반, 한국어 지원)
Monospace: 'JetBrains Mono', monospace  (코드, ID, 수치, 타임스탬프)
```

> BooleanHR DESIGN.md의 `Inter` 대신 `Noto Sans KR`을 사용해 한국어 렌더링을 최적화합니다.  
> 모노스페이스 철학(`JetBrains Mono`)은 동일하게 계승합니다.

#### 2-B-2. 타이포그래피 계층

| 레벨 | 크기 | Weight | 사용 예시 |
| :--- | :--- | :--- | :--- |
| Hero Display | `clamp(38px, 6.5vw, 78px)` | 900 | 랜딩 메인 헤드라인 |
| Section Title | `clamp(26px, 4vw, 48px)` | 900 | 섹션 타이틀 (`.sec-title`) |
| CTA Title | `clamp(28px, 5vw, 56px)` | 900 | CTA 섹션 헤드라인 |
| H3 Card Title | `18px` | 700 | 카드 제목 (`.pain-ttl`, `.proc-ttl`) |
| Body | `16px / 14px / 13px` | 400~600 | 본문, 버튼, 라벨 |
| Small | `12px / 11px` | 400~500 | 캡션, 메타, 섹션 레이블 |
| Micro Mono | `10px / 9px` | 400~700 | 코드 태그, DB 셀, 인덱스 번호 |

#### 2-B-3. 섹션 레이블 스타일 (`.sec-label`)

```css
font-family: JetBrains Mono;
font-size  : 11px;
color      : var(--acc);
letter-spacing: 2px;
text-transform: uppercase;
```

---

### C. 여백 및 스페이싱 (Spacing System)

BooleanHR DESIGN.md의 **8px 배수 원칙**을 동일하게 적용합니다.

| 변수 | 값 | 사용처 |
| :--- | :--- | :--- |
| `--sp-6` | `6px` | 버튼 내부 gap, 인라인 아이콘 간격 |
| `--sp-8` | `8px` | 기본 border-radius(`--r`), 미세 패딩 |
| `--sp-10` | `10px` | 모달 하단 버튼 gap |
| `--sp-12` | `12px` | 버튼 sm 패딩 |
| `--sp-14` | `14px` | border-radius lg (`--rl`), 카드 내부 헤더 패딩 |
| `--sp-16` | `16px` | 기본 버튼 패딩 |
| `--sp-18` | `18px` | 앱 네비 좌우 패딩, 모달 내부 패딩 |
| `--sp-22` | `22px` | 모달 헤더/바디 패딩 |
| `--sp-28` | `28px` | 네비 링크 gap |
| `--sp-34` | `34px` | 데모 박스·pain 카드 내부 패딩 |
| `--sp-48` | `48px` | 랜딩 섹션 좌우 패딩, 섹션 상단 gap |
| `--sp-96` | `96px` | 랜딩 섹션 수직 패딩 (`.sec`) |
| `--sp-110` | `110px` | CTA 섹션 수직 패딩 |

---

### D. 쉐도우 및 Border Radius

| 변수 | 값 | 사용처 |
| :--- | :--- | :--- |
| `--r` | `8px` | 기본 카드·버튼·입력 필드 radius |
| `--rl` | `14px` | 모달·그리드 컨테이너 radius |
| `--r-pill` | `100px` | 뱃지·칩·pill 형태 |
| `--sh` | `0 8px 32px rgba(0,0,0,.5)` | 모달·카드 드롭 쉐도우 |
| `--sh-acc` | `0 0 24px rgba(0,212,170,.2)` | Accent 버튼 글로우 효과 |

---

## 3. 컴포넌트 명세 (Component Specs)

> 아래 각 컴포넌트는 향후 `components/` 폴더 분리 시 독립 파일로 추출될 단위입니다.

---

### 3-1. 공통 (Shared) 컴포넌트

#### 3-1-A. Button

| 클래스 | 설명 | 배경 | 텍스트 | 호버 효과 |
| :--- | :--- | :--- | :--- | :--- |
| `.btn-acc` | 주 강조 버튼 (CTA) | `--acc` | `#000` | `translateY(-1px)` + 글로우 |
| `.btn-ghost` | 서브 버튼 | `transparent` | `--tx1` | `border-color: --bd3` |
| `.btn-danger` | 위험 액션 버튼 | `--red2` | `--red` | `background: --red2 deeper` |
| `.btn-sm` | 소형 버튼 | — | — | `6px 12px` 패딩 |
| `.btn-lg` | 대형 버튼 | — | — | `13px 28px` 패딩 |
| `.btn-hero-p` | 랜딩 Hero CTA | `--acc` | `#000` | 강글로우 효과 |

- **Border Radius**: `var(--r)` (`8px`) — BooleanHR의 Notion 스타일 직사각형 버튼 계승
- **Font Size**: `13px` (기본) / `15px` (대형)
- **Font Weight**: `600`
- **Transition**: `all .2s`

#### 3-1-B. Form Input (`.inp`)

```
배경      : var(--s3) → #161d2e
테두리    : 1px solid var(--bd2)
포커스    : border-color: var(--acc)
플레이스홀더 : color: var(--tx3)
패딩      : 10px 13px
Border Radius: var(--r)
```

#### 3-1-C. Badge (`.badge`)

| 클래스 | 배경 | 텍스트 | 의미 |
| :--- | :--- | :--- | :--- |
| `.b-pass` | `rgba(0,212,170,.13)` | `--acc` | 검증 통과 |
| `.b-fail` | `rgba(255,77,109,.13)` | `--red` | 검증 실패 |
| `.b-manual` | `rgba(245,200,66,.13)` | `--yel` | 수동 검토 |

- **Font**: `JetBrains Mono`, `10px`, `700`
- **Border Radius**: `100px` (pill 형태)
- **Padding**: `3px 9px`

#### 3-1-D. Modal (`.overlay` + `.modal-box`)

```
오버레이   : background: rgba(0,0,0,.72) + backdrop-filter: blur(5px)
모달 박스  : background: var(--s2), border: 1px solid var(--bd2)
             border-radius: var(--rl) (14px), box-shadow: 0 32px 80px rgba(0,0,0,.6)
등장 애니   : scale(.95)→scale(1) + translateY(10px)→translateY(0), 0.22s ease
헤더       : padding: 18px 22px, border-bottom: 1px solid var(--bd1)
바디       : padding: 22px
푸터       : padding: 14px 22px, border-top: 1px solid var(--bd1)
닫기 버튼   : 28×28px, border-radius: 6px, 호버 시 red 색으로 변환
```

#### 3-1-E. Toast (`.toast`)

```
위치      : fixed, bottom: 22px, right: 22px
배경      : var(--s2) + border: 1px solid var(--bd2)
등장 효과  : translateX(110%) → translateX(0), transition: .3s ease
최소 너비  : 260px
```

---

### 3-2. 랜딩 페이지 (`#pg-landing`) 컴포넌트

#### 3-2-A. Landing Nav (`.lnav`)

```
높이      : 60px, position: fixed, top: 0
배경      : rgba(6,8,15,.88) + backdrop-filter: blur(20px)
하단 경계  : 1px solid var(--bd1)
로고      : JetBrains Mono, 15px, 700, color: --acc
링크      : 13px, color: --tx1 → 호버 --tx0
우측 버튼  : CTA 버튼 그룹
```

#### 3-2-B. Hero Section (`.hero`)

```
최소 높이  : 90vh
배경 효과  : Grid Pattern (teal 32% opacity) + Radial Orb 그라데이션
Hero 텍스트: clamp(38px~78px), font-weight: 900, letter-spacing: -2.5px
서브텍스트 : clamp(15px~19px), font-weight: 300, color: --tx1
Pill 뱃지  : teal border + 블링킹 닷 + JetBrains Mono
CTA 버튼   : btn-hero-p (Accent) + btn-ghost 쌍
등장 애니   : fuUp 0.5s~0.6s (delay 0.07s 간격)
```

#### 3-2-C. Pain Cards Grid (`.pain-grid`)

```
레이아웃   : 2열 그리드, border: 1px solid --bd2, border-radius: --rl
카드 배경   : var(--s1), padding: 34px
상단 액센트 : ::after pseudo, scaleX(0)→scaleX(1), color: --acc
인덱스 텍스트: JetBrains Mono, 10px, color: --tx3
제목       : 18px, 700, color: --acc
설명       : 13px, color: --tx1, line-height: 1.75
```

#### 3-2-D. Process Steps (`.proc-row`)

```
레이아웃   : 3열 + 화살표 (1fr 28px 1fr 28px 1fr)
카드       : --s2 배경, --bd1 테두리, border-radius: --rl
호버       : border-color: --acc + translateY(-3px)
태그       : .tg(teal) / .tb(blue) / .tr(red) 3종 pill 태그
```

#### 3-2-E. Demo Simulator (`.demo-box`)

```
외곽       : --s1 배경, --bd2 테두리, border-radius: --rl
시뮬 스텝  : opacity 0.3 (비활성) → 1 + border-color: --acc (활성)
콘텐츠 영역: JetBrains Mono, 12px, --s3 배경
로더       : spin 애니메이션, border-top-color: --acc
```

#### 3-2-F. Trust Cards (`.tcard`)

```
레이아웃   : 3열 그리드
카드       : --s1 배경, --bd1 테두리, border-radius: --rl, padding: 26px
인용문     : 14px, color: --tx1, strong → --tx0
아바타     : 36×36px, border-radius: 8px, --s2 배경
```

#### 3-2-G. CTA Section (`.cta-sec`)

```
배경       : --s1 + 하단 Radial Orb (teal glow)
타이틀     : clamp(28px~56px), 900, letter-spacing: -2px
이메일 입력 : --s2 배경 + 포커스 --acc
제출 버튼  : --acc 배경, 호버 translateY(-1px) + 글로우
```

---

### 3-3. 로그인 페이지 (`#pg-login`) 컴포넌트

#### 3-3-A. Login Card (`.login-card`)

```
크기       : width: 410px, border-radius: 18px
배경       : var(--s2), border: 1px solid --bd2
패딩       : 44px 40px
등장 애니   : fuUp .45s ease
로고 영역   : 중앙 정렬, JetBrains Mono, color: --acc
```

#### 3-3-B. Login Form Fields

```
라벨       : 12px, color: --tx1, font-weight: 500
입력 필드   : .inp 공통 스타일 적용
에러 메시지 : --red2 배경 + --red3 테두리 + --red 텍스트, border-radius: 7px
로그인 버튼 : 100% 너비, --acc 배경, 호버 translateY(-1px)
힌트 텍스트 : JetBrains Mono code 태그, --s3 배경
```

---

### 3-4. 앱 대시보드 (`#pg-app`) 컴포넌트

#### 3-4-A. App Top Nav (`.app-nav`)

```
높이       : 54px, flex-shrink: 0
배경       : --s1, border-bottom: 1px solid --bd2
로고 영역   : JetBrains Mono, 14px, --acc + 블링킹 닷
중앙 버튼   : .anav-btn — ghost 스타일, 12px
우측       : user-email (Mono) + role-chip (teal) + 로그아웃 버튼
```

#### 3-4-B. Sidebar (`.app-side`)

```
너비       : 216px, flex-shrink: 0
배경       : --s2, border-right: 1px solid --bd1
스캔 영역   : 폴더 경로 입력 + 스캔 버튼 (--acc)
트리 목록   : .ti 아이템 — 호버 rgba(255,255,255,.04), 활성 --acc2 배경
검증 버튼   : 100% 너비, --acc, 호버 글로우
```

#### 3-4-C. Stats Row (`.stats-row`)

```
레이아웃   : 4열 그리드
카드 (.sc) : --s1 배경, --r radius, 상단 2px 컬러 바
             total→--blu / pass→--acc / fail→--red / manual→--yel
수치       : JetBrains Mono, 30px, 700
서브텍스트  : 10px, --tx2
```

#### 3-4-D. App Tabs (`.app-tabs`)

```
배경       : --s1, border-bottom: 1px solid --bd1
탭 아이템  : padding: 9px 16px, 13px, font-weight: 500
활성 탭    : color: --acc + border-bottom: 2px solid --acc
호버       : color: --tx0
```

#### 3-4-E. Data Table (`.dtbl`)

```
헤더       : JetBrains Mono, 10px, --tx2, sticky top:0, --s2 배경
셀         : 12px, --tx1, border-bottom: 1px solid --bd1
행 호버    : rgba(255,255,255,.02)
이름 셀    : font-weight: 600, color: --tx0
코드 셀    : JetBrains Mono, 11px, --tx2
```

#### 3-4-F. Confidence Bar (`.conf-wrap`)

```
배경       : rgba(255,255,255,.06), height: 4px
채움       : height 100%, border-radius: 2px, transition: width .4s
수치 텍스트 : JetBrains Mono, 10px, --tx1
```

---

### 3-5. 검증 엔진 모달 (Verification Engine Modal)

#### 3-5-A. 3-Panel 레이아웃 (`.ve-top`)

```
레이아웃   : grid 1fr 200px 1fr (원본서류 | 엔진 | 기관사이트)
```

##### 원본 서류 패널 (`.doc-panel`)

```
배경       : --s2, border: --bd2, border-radius: 10px
패널 헤더  : JetBrains Mono, 10px, --tx2 + 라이브 닷
스캔 빔    : linear-gradient teal 수평 빔, beamDown 1.4s 애니메이션
문서 필드  : .dfield — key/value 2열, 스캔→ok→warn 상태 전환
OCR 태그   : teal pill, 스캔 완료 시 translateX(-6px)→0 등장
```

##### 엔진 컬럼 (`.engine-col`)

```
플로우 스텝 : wait(opacity .5) → run(yellow) → ok(teal) → ng(red) 전환
스피너     : 14px, border-top-color: --yel, spin .7s
진행 바    : linear-gradient(90deg, --acc → rgba(acc,.6))
화살표 커넥터: --acc 색으로 lit 상태 전환
```

##### 기관 사이트 패널 (`.site-panel`)

```
브라우저 크롬 : light 배경(#e8edf2), macOS 닷 버튼, 주소 표시줄
사이트 폼    : 화이트 배경, serif sans, RPA 커서 애니메이션
필드 상태    : typing(blue) → ok(green) → ng(red) 실시간 전환
결과 표시    : res-ok(green) / res-ng(red) 인라인 배너
```

#### 3-5-B. DB 패널 + 판정 패널 (`.ve-bottom`)

```
레이아웃   : 2열 그리드
DB 테이블  : JetBrains Mono, 10px, dm(teal) / dn(red) / dp(ghost) 상태
판정 패널  : vr-badge — PASS(teal) / FAIL(red) / MANUAL(yellow)
           상세 설명 + 메타 chip 목록
실행 버튼  : run-btn — 기본(acc) → 실행중(yellow), 비활성(ghost)
```

---

### 3-6. Human Error 비교 섹션 컴포넌트

#### 3-6-A. Alert Cards (`.he-alert-grid`)

```
레이아웃   : 3열 그리드
카드 종류   : hac-red / hac-yel / hac-blu
수치       : JetBrains Mono, 38px, 700
호버       : translateY(-4px)
```

#### 3-6-B. Race Section (`.he-race-panels`)

```
레이아웃   : 1fr 56px 1fr (인간 | VS | AI)
Human 패널  : red border, 타이머 카운트업, step dot 애니메이션
AI 패널    : teal border, 빠른 완료 애니메이션
VS 배지    : JetBrains Mono pill, --s3 배경
```

#### 3-6-C. Comparison Table (`.he-cmp-table`)

```
레이아웃   : 3열 (항목 | 인간 | AI)
셀 스타일  : he-cmp-bad(red+alpha) / he-cmp-good(teal+alpha)
```

---

### 3-7. 알림 발송 모달 (Notification Modal)

```
알림 목록  : 체크박스 선택, FAIL/MANUAL 대상자 리스트
미리보기   : 이메일 템플릿 프리뷰 박스
발송 버튼  : --acc + 선택된 인원 수 뱃지
```

### 3-8. 사이트 설정 모달 (Site Settings Modal)

```
사이트 행  : SITES 배열 기반 동적 렌더링
Toggle 스위치: 활성/비활성 상태 인터랙션
저장 버튼  : --acc CTA
```

---

## 4. 인터랙션 및 애니메이션 원칙

### 4-A. 전역 Reveal 애니메이션 (`.rv`)

```css
opacity: 0 → 1
translateY(26px) → translateY(0)
transition: opacity .65s ease, transform .65s ease
트리거: IntersectionObserver (.vis 클래스 추가)
```

### 4-B. 등장 애니메이션 키프레임

| 이름 | 동작 | 적용 대상 |
| :--- | :--- | :--- |
| `fuUp` | translateY(22px)→0 + opacity | 랜딩 Hero 요소 순차 등장 |
| `mIn` | scale(.95)+translateY(10px)→1 | 모달 등장 |
| `fdIn` | translateY(10px)→0 + opacity | 탭 패널 전환 |
| `stepIn` | translateX(-8px)→0 + opacity | Human Error 스텝 등장 |
| `beamDown` | top: 5%→95% + opacity | 문서 스캔 빔 |
| `blink` | opacity 1→.25→1 | 상태 닷, Pill 닷 |
| `spin` | rotate(360deg) | 로더, 스피너 |
| `blink-cursor` | opacity 1→0→1 | 타이프라이터 커서 |

### 4-C. 상태 전환 원칙

- **즉각성**: 버튼 클릭·호버 → `transition: all .2s`
- **정보성**: 검증 상태 전환(필드 색상 변화) → `.35s`
- **극적 연출**: 검증 판정 등장 → `.4s~.65s`
- **모달 개폐**: `.22s` (열기) / 즉시 (닫기)

---

## 5. 컴포넌트 폴더 구조 (Component Folder Architecture)

향후 단일 HTML을 아래 폴더 구조로 분리할 것을 권장합니다.

```
HR BooleanAI-app/
├── DESIGN.md                    ← 이 문서 (디자인 단일 진실 공급원)
├── COMPONENT_TREE.md            ← 컴포넌트 계층 다이어그램
├── index.html                   ← 진입점 (최소한의 마크업)
│
├── styles/
│   ├── tokens.css               ← :root 디자인 토큰 (변수 정의)
│   ├── reset.css                ← 초기화 및 base styles
│   ├── typography.css           ← 타이포그래피 시스템
│   ├── layout.css               ← 섹션·그리드·컨테이너
│   └── animations.css           ← 키프레임 및 전환 클래스
│
├── components/
│   ├── shared/
│   │   ├── Button.css           ← .btn, .btn-acc, .btn-ghost 등
│   │   ├── Badge.css            ← .badge, .b-pass, .b-fail 등
│   │   ├── Modal.css            ← .overlay, .modal-box 등
│   │   ├── Toast.css            ← .toast
│   │   ├── Input.css            ← .inp, .fg
│   │   └── Table.css            ← .dtbl, .db-tbl, .cmp-tbl
│   │
│   ├── landing/
│   │   ├── LandingNav.css       ← .lnav
│   │   ├── Hero.css             ← .hero, .pill, .h1, .cta-row
│   │   ├── PainCards.css        ← .pain-grid, .pain-card
│   │   ├── ProcessSteps.css     ← .proc-row, .proc-step
│   │   ├── DemoSimulator.css    ← .demo-box, .sim-*
│   │   ├── TrustCards.css       ← .trust-grid, .tcard
│   │   └── CTASection.css       ← .cta-sec, .cta-form
│   │
│   ├── login/
│   │   └── LoginCard.css        ← .login-card, .login-form
│   │
│   ├── app/
│   │   ├── AppNav.css           ← .app-nav, .app-logo, .role-chip
│   │   ├── Sidebar.css          ← .app-side, .ti, .tree-lbl
│   │   ├── StatsRow.css         ← .stats-row, .sc
│   │   ├── AppTabs.css          ← .app-tabs, .at
│   │   └── DataTable.css        ← .dtbl, .conf-wrap, .btn-view
│   │
│   ├── verification/
│   │   ├── DocPanel.css         ← .doc-panel, .scan-beam, .dfield
│   │   ├── EngineCol.css        ← .engine-col, .flow-step, .flow-arr
│   │   ├── SitePanel.css        ← .site-panel, .browser-chrome, .rpa-ptr
│   │   ├── DBPanel.css          ← .db-panel, .db-tbl
│   │   └── VerdictPanel.css     ← .verdict-panel, .vr-badge
│   │
│   └── human-error/
│       ├── AlertCards.css       ← .he-alert-grid, .he-alert-card
│       ├── RaceSection.css      ← .he-race-panels, .he-panel
│       └── CompareTable.css     ← .he-cmp-table, .he-cmp-row
│
└── js/
    ├── app.js                   ← 앱 상태 관리·이벤트 핸들러
    ├── verification.js          ← 검증 엔진 시뮬레이션
    ├── human-error.js           ← Human Error 레이스 애니메이션
    └── landing.js               ← 랜딩 인터랙션 (스크롤, 데모)
```

---

## 6. 유지보수 가이드라인

### 6-A. 색상 변경 시

1. `styles/tokens.css`의 `:root` 변수만 수정하면 전체 UI에 반영됩니다.
2. `--acc`(Teal) 색상 변경 시 **PASS 상태 의미도 함께 변경**됨을 인지해야 합니다.
3. 시맨틱 색(--red, --yel)은 의미가 고정되어 있으므로 변경하지 않는 것을 원칙으로 합니다.

### 6-B. 새 컴포넌트 추가 시

1. `COMPONENT_TREE.md` 다이어그램을 먼저 업데이트합니다.
2. 적절한 `components/` 하위 폴더에 CSS 파일을 생성합니다.
3. 디자인 토큰(Section 2)의 변수만 사용하며, 하드코딩된 색상값은 지양합니다.
4. 이 문서(DESIGN.md) Section 3에 컴포넌트 명세를 추가합니다.

### 6-C. 3색 시맨틱 체계 준수

```
신규 상태 표시 컴포넌트 추가 시:
  검증 성공 계열 → --acc / --acc2 / --acc3
  오류·실패 계열 → --red / --red2 / --red3
  대기·경고 계열 → --yel / --yel2
  중립 정보 계열 → --blu / --blu2
  위 4가지 이외의 색상 신규 추가는 디자인 리뷰를 거쳐야 합니다.
```

### 6-D. 버전 관리

| 버전 | 주요 변경 내용 |
| :--- | :--- |
| v0.9.1 | 초기 단일 HTML 프로토타입 |
| v0.9.2 | Verification Engine 3-Panel 레이아웃, Human Error 레이스 섹션 추가 |
| v1.0.0 | (예정) 컴포넌트 폴더 분리, 토큰 CSS 파일화 |

---

*본 문서는 `hr-booleanai-v0.9.2.html` 기준으로 작성되었습니다.*  
*파일 구조 변경 시 이 문서를 단일 진실 공급원(Source of Truth)으로 유지해주세요.*
