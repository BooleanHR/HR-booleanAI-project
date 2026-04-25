---
name: Feature Task
title: "[Feature] FR-048: doc_category auto-classification"
labels: 'feature, ocr-engine, priority:high'
version: v0.1
status: "초안 — 검수 대기"
source_task_id: G-002
---

## :dart: Summary
- **기능명:** [FR-048] doc_category auto-classification
- **Epic:** OCR Engine
- **목적:** Classifies document type from OCR results: graduation certificate, professional certificate, career certificate, etc. Classification instruction included in Gemini prompt.
- **설계 원칙:** SRS REQ-FUNC-006
- **복잡도:** M

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#REQ-FUNC-006`](../SRS-HR-AI-Verification-v1.1.md)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic G`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 핵심 로직/UI 구현 — SRS 참조 섹션 기반
- [ ] **TB-2:** 에러 핸들링 — src/lib/errors.ts 활용
- [ ] **TB-3:** 동작 검증 및 테스트

## :test_tube: Acceptance Criteria (BDD/GWT)
- SRS REQ-FUNC-006에 명시된 AC(GWT) 기반 검증

## :gear: Technical & Non-Functional Constraints
- SRS Tech Stack Constraints (C-TEC) 준수
- Next.js App Router Server Action / Route Handler 패턴

## :checkered_flag: Definition of Done (DoD)
- [ ] 핵심 기능 구현 완료
- [ ] AC 시나리오 통과
- [ ] npm run build 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** G-001
- **Blocks:** G-003, H-001

---
*Document Version: v0.1 (초안) | Source: TASK-LIST G-002 | SRS: v1.1*
