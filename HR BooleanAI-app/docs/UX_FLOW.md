# 📱 UX Flow — HR BooleanAI 서류 진위확인 솔루션 (Prototype v0)

<!-- [AI Guide]
  이 문서는 HR BooleanAI Prototype v0의 UX 핵심 시나리오를 정의합니다.
  화면 전환 순서, 사용자 액션, 시스템 반응을 포함합니다.
  관련 코드: index.html(화면 마크업), app.js(흐름 제어 로직)
-->

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
1. 입사지원서 기재내용 (지원자 자기 신고)
2. 증빙서류 OCR 추출값 (AI Vision 판독)
3. 발급기관 조회 결과 (정부24 / Q-Net 등 RPA 크롤링)

---

## 5️⃣ 시나리오 E — 불일치 알림 발송

```
[사용자 액션]                     [시스템 반응]
[불일치 알림 발송] 버튼 클릭 ──▶ openNotiModal() 호출
                                  └─ FAIL | MANUAL_REVIEW 필터 → 체크박스 목록 렌더링

체크박스 선택 후 [선택 발송] ────▶ handleSendNotifications()
                                  └─ 선택된 건수 계산 → showToast("N건 발송 완료")
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

## 7️⃣ 화면 전환 요약 다이어그램

```
[로그인 화면]
    │ 로그인 성공
    ▼
[대시보드]──────────────────────────────────────────┐
    │                                               │
    ├─ 탭 클릭 ──▶ 필터 재렌더링 (동일 화면 내)      │
    │                                               │
    ├─ 상세 보기 ──▶ [검증 상세 모달]                │
    │                 ├─ 승인/반려 → 모달 닫기       │
    │                 └─ ✕ 버튼 → 모달 닫기          │
    │                                               │
    ├─ 불일치 알림 ──▶ [알림 발송 모달]              │
    │                  └─ 발송/취소 → 모달 닫기      │
    │                                               │
    └─ 계정 설정 ──▶ [사이트 설정 모달]              │
                     └─ 저장/취소 → 모달 닫기        │
                                                    │
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

