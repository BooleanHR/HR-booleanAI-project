# [E-UI] FR-130: 랜딩페이지 검증 흐름 6단계 구체화

| 항목 | 내용 |
|------|------|
| **Task ID** | FR-130 |
| **영역** | E-UI (Landing Page) |
| **우선순위** | Must |
| **상태** | ✅ 완료 (v0.9) |
| **관련 PRD** | M1~M9, Story-2, §3 Seq-01 |
| **관련 SRS** | F1~F9, §3.6 시스템 전체 흐름 |

## 목적

랜딩페이지의 "한눈에 보는 HR BooleanAI 검증 흐름" 인포그래픽 섹션이 기존 4단계에서 PRD/SRS에 정의된 실제 파이프라인과 동일한 **6단계**로 구체화되어야 한다.

## Gap (기존 vs 변경)

| 기존 (v0.8) | 변경 (v0.9) |
|------------|------------|
| STEP 01: 서류 업로드 및 분류 | STEP 01: 서류 수집 · **변환** · 분류 (DOCX→PDF, HEIC→JPG 포함) |
| STEP 02: Gemini Vision OCR 파싱 | STEP 02: Gemini Vision OCR + **자동 명명** (수험번호+서류종류) |
| *(없음)* | **STEP 03: 입사지원서 vs OCR 값 비교** (Triple Check Layer 1) |
| STEP 03: 정부/기관 DB 실시간 대조 | **STEP 04: RPA 5대 기관 DB 자동 조회** (병렬 캡처 포함) |
| *(없음)* | **STEP 05: Vision LLM 크로스체크** (원본+캡처+지원서 E2E) |
| STEP 04: 판정 및 증적 리포트 생성 | **STEP 06: 판정 · 증적 · 리포트** (PDF/Excel + 선택적 알림) |

## 수용 기준 (AC)

- [x] 인포그래픽 좌측 다이어그램에 6개 박스가 화살표(↓)로 연결
- [x] 우측 설명 패널에 6개 STEP 카드 (클릭 시 좌측 박스 하이라이트)
- [x] autoRotateInfograph 타이머가 6단계 순환
- [x] 각 STEP 설명이 PRD의 해당 기능 설명과 일치

## 구현 위치

- `hr-booleanai-v0.9.html` > `#sec-infograph` 섹션
- Lines 976~1050 (HTML), Lines 3420~3440 (JS autoRotate)
