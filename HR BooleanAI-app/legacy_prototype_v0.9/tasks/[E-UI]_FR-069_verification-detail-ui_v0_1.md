---
name: Feature Task
title: "[Feature] FR-069: Verification detail modal/page UI"
labels: 'feature, hitl-approval, priority:critical'
version: v0.1
status: "초안 — 검수 대기"
source_task_id: UI-021
---

## :dart: Summary
- **기능명:** [FR-069] Verification detail modal/page UI (Top/Bottom 병렬 캡처 및 대조 UI)
- **Epic:** E-UI
- **목적:** 상단 병렬 캡처 뷰어(원본 vs RPA) 및 하단 3중 대조 테이블(입사지원서 vs 증빙서류 vs 기관조회) + AI 사유 렌더링. src/components/dashboard/detail-comparison.tsx. *(v1.3 변경)*
- **설계 원칙:** SRS REQ-FUNC-014
- **복잡도:** H

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.3.md#REQ-FUNC-014`](../SRS-HR-AI-Verification-v1.3.md)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1_2.md#Epic K`](./TASK-LIST-HR-AI-Verification-v1_2.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 핵심 로직/UI 구현 — SRS 참조 섹션 기반
- [ ] **TB-2:** 에러 핸들링 — src/lib/errors.ts 활용
- [ ] **TB-3:** 동작 검증 및 테스트

## :test_tube: Acceptance Criteria (BDD/GWT)
- SRS REQ-FUNC-014에 명시된 AC(GWT) 기반 검증

## :gear: Technical & Non-Functional Constraints
- SRS Tech Stack Constraints (C-TEC) 준수
- Next.js App Router Server Action / Route Handler 패턴

## :checkered_flag: Definition of Done (DoD)
- [ ] 핵심 기능 구현 완료
- [ ] AC 시나리오 통과
- [ ] npm run build 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** K-002, A-002
- **Blocks:** UI-022

---
*Document Version: v0.1 (초안) | Source: TASK-LIST UI-021 | SRS: v1.3*
