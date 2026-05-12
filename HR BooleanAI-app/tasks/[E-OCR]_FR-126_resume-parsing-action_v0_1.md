---
name: Feature Task
title: "[Feature] FR-126: '1. 입사지원서' 전용 파싱 Action"
labels: 'feature, ocr, priority:high'
version: v1.0
status: "초안 — 검수 대기"
source_task_id: G-002
---

## :dart: Summary
- **기능명:** [FR-126] '1. 입사지원서' 전용 파싱 Action (지원자 기재 스펙 추출)
- **Epic:** E-OCR
- **목적:** 지원자의 입사지원서(이력서) 파일(PDF 등)에서 이름, 수험번호, 자격증 내역, 어학점수 내역 등을 JSON 형태로 추출하여 검증의 '기준점(Ground Truth Input)'으로 삼는다. v1.3: doc_category별 전용 프롬프트 분기 및 doc_source 자동 판별(webminwon/certpia/gov24/icerts) 적용.
- **설계 원칙:** SRS REQ-FUNC-010 (v1.3)
- **복잡도:** H

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.3.md#REQ-FUNC-010`](../SRS-HR-AI-Verification-v1.3.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Gemini Vision API `generateObject()` 프롬프트 설계 (표/텍스트에서 핵심 스펙 추출)
- [ ] **TB-2:** 에러 핸들링 및 재시도 로직
- [ ] **TB-3:** 추출된 JSON 형태 검증 및 반환

## :test_tube: Acceptance Criteria (BDD/GWT)
- **Given** 1. 입사지원서 PDF 파일 입력
- **When** 파싱 액션 호출
- **Then** 이력서에 기재된 자격증 밒 어학점수 목록을 포함한 JSON 반환

## :gear: Technical & Non-Functional Constraints
- Vercel AI SDK 사용 (`generateObject`)

## :checkered_flag: Definition of Done (DoD)
- [ ] 로직 구현 완료
- [ ] npm run build 통과

## :construction: Dependencies & Blockers
- **Depends on:** D-006
- **Blocks:** I-001
