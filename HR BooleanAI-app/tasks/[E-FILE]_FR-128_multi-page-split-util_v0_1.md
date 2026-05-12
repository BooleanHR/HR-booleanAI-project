---
name: Feature Task
title: "[Feature] FR-128: 다중 페이지 PDF/이미지 분리(Split) 유틸리티"
labels: 'feature, file, priority:medium'
version: v1.0
status: "초안 — 검수 대기"
source_task_id: F-009
---

## :dart: Summary
- **기능명:** [FR-128] 다중 페이지 PDF 분할(Split) 및 특정 페이지 추출 유틸리티
- **Epic:** E-FILE
- **목적:** 지원자가 여러 장의 PDF를 제출했을 때, UI에서 선택된 특정 페이지 번호들만 추출하여 새로운 버퍼(또는 파일)로 분리해주는 백엔드 로직
- **설계 원칙:** SRS REQ-FUNC-085 (v1.3)
- **복잡도:** M

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.3.md#REQ-FUNC-085`](../SRS-HR-AI-Verification-v1.3.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `pdf-lib`을 사용해 원본 PDF 로드
- [ ] **TB-2:** 선택된 페이지 인덱스만 복사하여 새로운 PDF Document 생성
- [ ] **TB-3:** 분리된 PDF 버퍼 반환

## :test_tube: Acceptance Criteria (BDD/GWT)
- **Given** 5페이지 PDF 버퍼와 `[2, 3]` (추출할 페이지 인덱스)
- **When** `splitPdf()` 유틸리티 호출
- **Then** 2페이지만 포함된 새로운 PDF 버퍼 반환

## :gear: Technical & Non-Functional Constraints
- `pdf-lib` 패키지 활용

## :checkered_flag: Definition of Done (DoD)
- [ ] 유틸리티 함수 구현 완료
- [ ] Unit Test (선택 사항) 또는 수동 테스트 통과

## :construction: Dependencies & Blockers
- **Depends on:** F-001
