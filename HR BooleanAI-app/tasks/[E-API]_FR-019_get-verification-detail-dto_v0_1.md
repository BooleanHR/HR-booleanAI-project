---
name: Feature Task
title: "[Feature] FR-019: GET /api/verifications/[job_id] Response DTO 정의"
labels: 'feature, api-contract, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: C-003
---

## :dart: Summary
- **기능명:** [FR-019] GET /api/verifications/[job_id] Response DTO 정의
- **Epic:** API Contract
- **목적:** 검증 결과 상세 조회 API의 Response DTO를 정의한다. OCR 추출값 vs Agency 비교 데이터, 불일치 하이라이트 정보, API 응답 스냅샷을 포함한다.
- **설계 원칙:** §3.7 API Overview (GET /api/verifications/[job_id])에 정의된 API 스펙을 TypeScript 인터페이스로 구현한다.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.7 API Overview (GET /api/verifications/[job_id])`](../SRS-HR-AI-Verification-v1.1.md)
- TASK-LIST: [`TASK-LIST-HR-AI-Verification-v1.1.md#Epic C`](./TASK-LIST-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/types/api.ts`에 해당 Request/Response 인터페이스 추가
- [ ] **TB-2:** Zod 스키마 또는 런타임 검증 함수 작성 (선택)
- [ ] **TB-3:** TypeScript 컴파일 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 인터페이스가 `src/types/api.ts`에 정의 → `npm run build` 성공
**Scenario 2:** SRS §3.7에 명시된 모든 필드가 인터페이스에 포함

## :gear: Technical & Non-Functional Constraints
- SRS §3.7 API Overview에 정의된 스펙 준수
- 파일 스트림 반환 API는 Next.js Response 객체 사용

## :checkered_flag: Definition of Done (DoD)
- [ ] Request/Response DTO 인터페이스 정의 완료
- [ ] TypeScript 컴파일 에러 0건

## :construction: Dependencies & Blockers
- **Depends on:** FR-017 (C-001: 공통 타입 정의)
- **Blocks:** 해당 API Route Handler/Server Action 구현

---
*Document Version: v0.1 (초안) | Source: TASK-LIST C-003 | SRS: v1.1*
