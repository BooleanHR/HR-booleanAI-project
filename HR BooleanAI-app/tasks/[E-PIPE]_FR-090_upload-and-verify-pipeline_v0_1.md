---
name: Feature Task
title: "[Feature] FR-090: uploadAndVerify() integrated Server Action"
labels: 'feature, pipeline, priority:critical'
version: v0.1
status: "초안 — 검수 대기"
source_task_id: P-001
---

## :dart: Summary
- **기능명:** [FR-090] ingestDocuments() integrated Server Action (v1.3)
- **Epic:** E-PIPE
- **목적:** Orchestrates entire Seq-01: 채용공고 폴더 스캔 -> 1~4번 폴더 구조 인식 -> 1. 입사지원서 파싱 -> 2,3,4번 서류 파싱 -> Layer 1 & 2 대조 -> Audit Trail -> 5. 진위확인결과 로컬 저장 -> DRAFT notification. Core pipeline.
- **설계 원칙:** SRS Seq-01, VerificationService (로컬 퍼스트)
- **복잡도:** H

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.3.md#Seq-01`](../SRS-HR-AI-Verification-v1.3.md)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1_2.md#Epic P`](./TASK-LIST-HR-AI-Verification-v1_2.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** 핵심 로직/UI 구현 — SRS 참조 섹션 기반
- [ ] **TB-2:** 에러 핸들링 — src/lib/errors.ts 활용
- [ ] **TB-3:** 동작 검증 및 테스트

## :test_tube: Acceptance Criteria (BDD/GWT)
- SRS Seq-01에 명시된 AC(GWT) 기반 검증

## :gear: Technical & Non-Functional Constraints
- SRS Tech Stack Constraints (C-TEC) 준수
- Next.js App Router Server Action / Route Handler 패턴

## :checkered_flag: Definition of Done (DoD)
- [ ] 핵심 기능 구현 완료
- [ ] AC 시나리오 통과
- [ ] npm run build 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** F-001 ~ F-007, G-001 ~ G-004, H-001 ~ H-003, I-001 ~ I-005, J-001, L-001
- **Blocks:** T-023, U-001, U-005

---
*Document Version: v0.1 (초안) | Source: TASK-LIST P-001 | SRS: v1.3*
