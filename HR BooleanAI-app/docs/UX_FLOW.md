# 📱 UX Flow — HR BooleanAI 서류 진위확인 솔루션 (v1.0)

<!-- [AI Guide]
  이 문서는 HR BooleanAI Next.js App Router 구현의 UX 핵심 시나리오를 정의합니다.
  화면 전환 순서, 사용자 액션, 시스템 반응을 포함합니다.
  구현 기반: Next.js 14 App Router + shadcn/ui + Tailwind CSS
  참고용(레퍼런스 전용): hr-booleanai-v0.9.2.html (Prototype — 코드 변경 금지)
-->

> **[2026-05-27 아키텍처 결정]**  
> - **구현 방향:** Next.js 14 (App Router) 클린 스타트. 기존 HTML 단일파일(v0.9.x)은 레퍼런스 전용으로 유지하며 코드 변경 금지.  
> - **기술 스택:** Next.js 14 · Tailwind CSS · shadcn/ui · Prisma(SQLite) · Puppeteer · Gemini API  
> - **이전 UX Flow 버전:** Prototype v0 (HTML 단일파일 기준) → 본 문서(v1.0)로 대체

> **대상 사용자**: HR 담당 관리자 (Admin / Operator)  
> **작성 기준**: Prototype v0 기능 구현 기준

---

## 1️⃣ 시나리오 A — 로그인 및 초기 진입

```
[사용자 액션]               [시스템 반응]
이메일/비밀번호 입력  ──▶  CREDENTIALS 객체 매칭
                          ├─ 성공: STATE.loggedInUser 설정 → 대시보드 전환
                          │         renderDashboard() 호출 (StatCard + 테이블 렌더링)
                          └─ 실패: 에러 메시지 표시 (.error-msg.show)
```

**화면 전환**: `#screen-login` → `#screen-dashboard`

| 조건 | 테스트 계정 |
|------|-----------|
| 관리자 | `test_admin@hrboolean.ai` / `Admin123!` |
| 운영자 | `test_operator@hrboolean.ai` / `Oper123!` |

**역할별 권한 정책 [2026-05-27 확정]:**

| 기능 | Operator (수행자) | Admin (관리자) |
|------|:---:|:---:|
| 배치 생성 + 엑셀 업로드 | ✅ | ✅ |
| 검증 실행 (OCR + RPA + AI) | ✅ | ✅ |
| 검증 결과 1차 확인 (권고) | ✅ | ✅ |
| **최종 승인/반려** | ❌ (권고만) | ✅ |
| ESCALATE 최종 처리 | ❌ | ✅ |
| 기관 설정 (/settings/agencies) | ❌ | ✅ |
| 배치 삭제 | ❌ | ✅ |
| 전체 리포트 PDF/Excel 다운로드 | ✅ | ✅ |
| 알림 발송 | ✅ | ✅ |



---

## 1-B️ 시나리오 Z — 배치 생성 + 지원자 데이터 업로드 [신규 — 2026-05-27]

> **[결정사항]** Layer 1 비교의 "지원자 기재값"은 수동 입력 폼이 아닌,  
> **채용 플랫폼 엑셀/CSV 일괄 업로드(A) + 증빙서류 OCR 자동 파싱(B)** 이중 방식으로 처리

```
[사용자 액션]                    [시스템 반응]
새 배치 생성 버튼 클릭 ─────── > 배치 이름 + 슬롯 입력 폼 표시
                                  배치 ID 자동 생성 → SQLite 저장

[A] 엑셀/CSV 업로드 ──────────▶ parseExcelApplicants()
    채용플랫폼 내보내기 파일         표준 헤더 매핑:
    (사람인, 잡코리아, 원티드 등)     [지원자명] [생년월일] [전화] [이메일]
                                    [지원직무] [점수/성적] [학교명] [전공]
                                    [자격증명] [경력시작일] [경력종료일]
                                  → Applicant 레코드 생성 (SQLite)
                                  → 파싱 실패 행: 오류 피드백 표시

[B] 서류 폴더 스캔 ────────────▶ handleFolderScan()
    로컬 폴더: {batchId}/{지원자ID}/   파일명 규칙: {수험번호}_{서류종류}.ext
                                  → Document 레코드 생성
                                  → OCR 파이프라인 자동 시작

Layer 1 비교: 엑셀 기재값 ↔ OCR 추출값 (사람 개입 없음)
```

**표준 엑셀 템플릿:** 다운로드 버튼 제공 (헤더 불일치 시 매핑 UI 표시)

---

## 2️⃣ 시나리오 B — 폴더 스캔 및 검증 시작

```
[사용자 액션]                    [시스템 반응]
폴더 경로 입력 후 [스캔] 클릭 ──▶ handleFolderScan() 호출
                                  ├─ STATE.folderScanned = true
                                  ├─ #scan-status에 "✅ 스캔 완료" 표시
                                  └─ showToast() 호출 → "6명의 지원자 서류 발견"

[검증 시작] 버튼 클릭 ──────────▶ showToast("🚀 검증이 시작되었습니다.")
```

**데이터 흐름**: 폴더 경로 입력값 → STATE → 사이드바 폴더 트리 시각화

---

## 3️⃣ 시나리오 C — 대시보드 탭 필터링

```
[사용자 액션]          [시스템 반응]
탭 클릭 ──────────▶  switchTab(tab) 호출
                      ├─ STATE.activeTab 업데이트
                      ├─ 활성 탭 CSS 클래스 전환
                      └─ renderTable() 재호출 → 필터링된 데이터 렌더링
```

| 탭 | 필터 조건 | 예상 결과 |
|----|---------|---------|
| 전체 보기 | 없음 (전체) | 6건 |
| 확인 필요 | `status === 'FAIL'` | 2건 |
| 수동 리뷰 | `status === 'MANUAL_REVIEW'` | 1건 |

---

## 4️⃣ 시나리오 D — 검증 상세 모달 (핵심 시나리오)

```
[사용자 액션]              [시스템 반응]
[상세 보기] 버튼 클릭 ──▶ openDetailModal(id) 호출
                           ├─ MOCK_DATA.find(r => r.id === id)
                           ├─ 모달 헤더: 수험번호 + 이름 + 서류종류 바인딩
                           ├─ 캡처 뷰어: renderCapturePanel() × 2 (원본 + RPA 캡처)
                           ├─ Triple Check 테이블: buildCompareRows(row, isMatch)
                           │   └─ 항목별 불일치 강조 (.mismatch / .match CSS)
                           ├─ AI 종합 검토 텍스트: isMatch 여부에 따른 동적 생성
                           └─ toggleModal('detail-modal', true)

[승인] 클릭 ──▶ handleApprove() → 로컬 저장 Toast + 모달 닫기
[반려] 클릭 ──▶ handleReject() → 반려 사유 입력(prompt) + Toast + 모달 닫기
```

**Triple Check 비교 축**:
1. 입사지원서 기재내용 (엑셀/CSV 업로드값)
2. 증빙서류 OCR 추출값 (AI Vision 판독)
3. 발급기관 조회 결과 (정부24 / Q-Net 등 RPA 크롤링)

---

## 4️⃣-B 시나리오 D2 — AI Reviewer ESCALATE 처리 [신규 — 2026-05-27]

> **[결정사항]**  
> - ESCALATE 건은 대시보드 카운터로 수치 표시 (몇 건 쌓였는지 즉시 파악)  
> - 수동검토 큐에 별도 저장 (나중에 일괄 처리 가능)  
> - 최종 승인/반려 결과는 전체 통합 결과 폴더에 합산

```
[AI Reviewer → ESCALATE 판정 시]
대시보드 상단 배너 업데이트:
  "⚠️ 수동 검토 필요: N건 (ESCALATE)"
  → 클릭 시 ESCALATE 목록만 필터링하여 표시

[ESCALATE 목록 뷰]
  각 항목 카드:
  - 지원자명 / 서류종류
  - ESCALATE 사유 (AI 자연어 설명)
  - 발생 시각
  - [지금 검토] 버튼 → 상세 모달 진입

[담당자 상세 검토]
  상세 모달 내 전체 데이터 노출:
  - 원본 서류 이미지 (고화질)
  - RPA 캡처 이미지
  - Triple Check 상세 비교표
  - AI 분석 근거 텍스트
  → [최종 승인] 또는 [반려] 클릭
  → Audit Trail 저장 → 통합 결과 폴더에 합산

[결과 통합 저장]
  결과 파일 경로: ./results/{batchId}/
  └─ PASS 건 + FAIL 건 + 수동확인완료 건 모두 동일 폴더
  → 최종 Excel/PDF 리포트에 ESCALATE 처리 이력 포함
```



---

## 5️⃣ 시나리오 E — 불일치 알림 발송

```
[사용자 액션]                     [시스템 반응]
[불일치 알림 발송] 버튼 클릭 ──▶ openNotiModal() 호출
                                  └─ FAIL | MANUAL_REVIEW 필터 → 체크박스 목록 렌더링
                                     각 항목에 지원자 이메일 표시 (엑셀 업로드 시 수집)

체크박스 선택 후 [선택 발송] ────▶ handleSendNotifications()
                                  └─ Resend API → 실제 이메일 발송
                                     수신자: 엑셀/CSV의 지원자 이메일
                                     발송 성공/실패 건수 Toast로 표시
```

**알림 이메일 내용:**
- 불일치 항목 명시 (자격증명/성적/경력 등 구체적 항목)
- 재제출 요청 안내 메시지
- 재제출 URL: `https://verify.hrboolean.ai/resubmit/{tokenId}` (유효기간 72시간)
  → **MVP에서도 실제 동작** (Resend API 키 설정 시 실제 발송 테스트 가능)
  → 재제출 페이지는 Phase 1 구현 대상

**[결정사항 2026-05-27]:**
- 지원자 이메일: 엑셀/CSV 업로드 시 자동 수집 (`[이메일]` 헤더 열)
- 발송 엔진: Resend API (RESEND_API_KEY 설정 필요)
- MVP에서 테스트 발송 가능하도록 실제 구현 포함


```

**알림 내용 미리보기** (하드코딩 템플릿):
- 불일치 항목 명시
- 재제출 링크 포함 (`https://verify.hrboolean.ai/resubmit/abc123`)
- 링크 유효기간: 72시간

---

## 6️⃣ 시나리오 F — 사이트 계정 설정

```
[사용자 액션]                  [시스템 반응]
[사이트 계정 설정] 클릭 ─────▶ openSiteSettings() 호출
                                └─ SITES 배열 기반 동적 렌더링 (정부24, Q-Net 등 5개)
                                   각 사이트별 아이디 / 비밀번호 입력 필드 제공

[저장] 클릭 ────────────────▶ saveSiteSettings() → Toast 표시 → 모달 닫기
```

---

## 6️⃣-B 시나리오 G2 — 기관 URL 관리 페이지 [신규 — 2026-05-27]

> **[결정사항]** 기관 설정 = `/settings/agencies` 별도 페이지 (사이드바 직접 진입)

```
[사용자 액션]                       [시스템 반응]
사이드바 "기관 설정" 클릭 ─────▶   /settings/agencies 페이지 이동
                                     loadAgencyConfig() -> 기관 목록 카드 렌더링

[새 기관 추가] 버튼 ────────────▶   우측 폼 패널 표시
  기관 ID / 기관명 / URL 입력          저장 -> agency_config.json 갱신 (hot-load)

[AI URL 자동 분석] ─────────────▶   Gemini가 URL 페이지 DOM 분석
                                     -> 셀렉터 후보 자동 제안 (성공률 ~70%)

[RPA 테스트] 클릭 ─────────────▶   Puppeteer 즉시 접속 테스트
                                     10초 이내 성공/실패 반환
```

---

## 7️⃣ 화면 전환 요약 다이어그램 (v1.0 업데이트)

```
[로그인 화면]
    │ 로그인 성공
    ▼
[대시보드]──────────────────────────────────────────┐
    │                                               │
    ├─ 탭 클릭 ──▶ 필터 재렌더링 (동일 화면 내)      │
    │                                               │
    ├─ 새 배치 생성 ──▶ [배치 생성 + 엑셀 업로드]   │
    │                   └─ 완료 → 대시보드 이동     │
    │                                               │
    ├─ 상세 보기 ──▶ [검증 상세 모달]                │
    │                 ├─ 승인/반려 → 모달 닫기       │
    │                 └─ ✕ 버튼 → 모달 닫기          │
    │                                               │
    ├─ 불일치 알림 ──▶ [알림 발송 모달]              │
    │                  └─ 발송/취소 → 모달 닫기      │
    │                                               │
    ├─ 계정 설정 ──▶ [사이트 계정 모달]             │
    │                └─ 저장/취소 → 모달 닫기        │
    │                                               │
    ├─ 기관 설정 ──▶ [/settings/agencies 페이지]    │
    │                └─ 뒤로가기 → 대시보드          │
    │                                               │
    로그아웃 ◀─────────────────────────────────────┘
    │
    ▼
[로그인 화면]
```

---


## 8️⃣ 시나리오 G — 랜딩페이지 검증 흐름 시각화 (v0.9 추가)

> **대상**: 랜딩페이지 방문자 (잠재 고객)  
> **목적**: 제품의 6단계 자동화 파이프라인을 직관적으로 시연

### 검증 흐름 인포그래픽 (6단계)

```
STEP 01  서류 수집 · 변환 · 분류
  ↓      폴더 스캔 / 파일 형식 변환(DOCX→PDF, HEIC→JPG) / 이미지 회전 보정
STEP 02  Gemini Vision OCR + 자동 명명
  ↓      핵심 항목 추출 / 서류 종류 분류 / 파일명 자동 생성
STEP 03  입사지원서 vs OCR 값 비교
  ↓      Triple Check Layer 1 — 지원자 기재 내용과 OCR 추출값 교차 검증
STEP 04  RPA 5대 기관 DB 자동 조회
  ↓      정부24 · Q-Net · 건강보험 · TOEIC · OPIc 병렬 캡처
STEP 05  Vision LLM 크로스체크
  ↓      원본 서류 + RPA 캡처 + 지원서 내용 종합 분석
STEP 06  판정 · 증적 · 리포트 자동 생성
         PASS/FAIL/REVIEW + SHA-256 감사 증적 5년 보존 + PDF/Excel
```

### RPA 연동 기관 사이트 (6개 탭)

| 탭 | 기관 | 용도 |
|---|------|------|
| 🏛️ 정부24 | www.gov.kr | 인터넷 발급문서 진위확인 |
| 🔧 Q-Net | www.q-net.or.kr | 자격증 진위확인 |
| 📄 Q-Net | www.q-net.or.kr | 확인서 진위확인 |
| 📝 TOEIC | www.ybmnet.co.kr | 성적 진위확인 |
| 🗣️ OPIc | www.opic.or.kr | 인증서 진위확인 |
| 🏥 건강보험 | si4n.nhis.or.kr | 자격득실확인서 진위확인 |

