---
name: Feature Task
title: "[Feature] FR-088: Statistics aggregation Route Handler"
labels: 'feature, dashboard-stats, priority:high'
version: v0.1
status: "초안 — 검수 대기"
source_task_id: O-001
---

## :dart: Summary
- **기능명:** [FR-088] Statistics aggregation Route Handler
- **Epic:** Dashboard Stats
- **목적:** Aggregates total verifications, PASS/FAIL/MANUAL_REVIEW counts, Mock usage count, complete/needs-review counts via Prisma groupBy/count.
- **설계 원칙:** SRS REQ-FUNC-060
- **복잡도:** M

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#REQ-FUNC-060`](../SRS-HR-AI-Verification-v1.1.md)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic O`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 핵심 로직/UI 구현 — SRS 참조 섹션 기반
- [ ] **TB-2:** 에러 핸들링 — src/lib/errors.ts 활용
- [ ] **TB-3:** 동작 검증 및 테스트

## :test_tube: Acceptance Criteria (BDD/GWT)
- SRS REQ-FUNC-060에 명시된 AC(GWT) 기반 검증

## :gear: Technical & Non-Functional Constraints
- SRS Tech Stack Constraints (C-TEC) 준수
- Next.js App Router Server Action / Route Handler 패턴

## :checkered_flag: Definition of Done (DoD)
- [ ] 핵심 기능 구현 완료
- [ ] AC 시나리오 통과
- [ ] npm run build 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** I-005, B-006
- **Blocks:** UI-050, U-006

---
*Document Version: v0.1 (초안) | Source: TASK-LIST O-001 | SRS: v1.1*
