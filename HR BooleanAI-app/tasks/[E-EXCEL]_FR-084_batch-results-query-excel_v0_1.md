---
name: Feature Task
title: "[Feature] FR-084: Batch results query for Excel"
labels: 'feature, excel-export, priority:high'
version: v0.1
status: "초안 — 검수 대기"
source_task_id: N-001
---

## :dart: Summary
- **기능명:** [FR-084] Batch results query for Excel
- **Epic:** Excel Export
- **목적:** Queries exam_number, name, normalized_filename, doc_category, final_result, verification_method, discrepancy_detail, mock_used.
- **설계 원칙:** SRS Seq-04
- **복잡도:** M

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#Seq-04`](../SRS-HR-AI-Verification-v1.1.md)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic N`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 핵심 로직/UI 구현 — SRS 참조 섹션 기반
- [ ] **TB-2:** 에러 핸들링 — src/lib/errors.ts 활용
- [ ] **TB-3:** 동작 검증 및 테스트

## :test_tube: Acceptance Criteria (BDD/GWT)
- SRS Seq-04에 명시된 AC(GWT) 기반 검증

## :gear: Technical & Non-Functional Constraints
- SRS Tech Stack Constraints (C-TEC) 준수
- Next.js App Router Server Action / Route Handler 패턴

## :checkered_flag: Definition of Done (DoD)
- [ ] 핵심 기능 구현 완료
- [ ] AC 시나리오 통과
- [ ] npm run build 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** I-005
- **Blocks:** N-002

---
*Document Version: v0.1 (초안) | Source: TASK-LIST N-001 | SRS: v1.1*
