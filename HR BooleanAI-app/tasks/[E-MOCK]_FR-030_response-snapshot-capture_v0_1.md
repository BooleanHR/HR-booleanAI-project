---
name: Feature Task
title: "[Feature] FR-030: API 응답 스냅샷 캡처 유틸리티"
labels: 'feature, mock-external, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-004
---

## :dart: Summary
- **기능명:** [FR-030] API 응답 스냅샷 캡처 유틸리티
- **Epic:** Mock/External
- **목적:** 외부 API 응답 JSON 원문과 캡처 타임스탬프를 구조화하여 Audit Trail의 `agency_response_snapshot` 필드에 저장할 수 있도록 캡처 유틸리티를 구현한다. 이는 v1.1 병렬 캡처 MVP 대안(ADR-008)의 핵심 구현이다.
- **설계 원칙:** SRS §3.13 REQ-FUNC-024 — API 응답 JSON 스냅샷 저장. §3.5 ADR-008.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/agency-api.ts`에 `captureResponseSnapshot(response)` 함수 추가
  ```typescript
  export function captureResponseSnapshot(
    responseRaw: string,
    capturedAt: Date = new Date()
  ): { snapshot: string; capturedAt: Date } {
    return {
      snapshot: responseRaw,
      capturedAt,
    };
  }
  ```
- [ ] **TB-2:** Audit Trail 생성 시 이 함수의 반환값을 `agencyResponseSnapshot`, `agencyResponseCapturedAt`에 저장

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** API 응답 JSON 원문 → snapshot 필드에 그대로 보존
**Scenario 2:** capturedAt 타임스탬프가 호출 시점의 정확한 시간

## :construction: Dependencies & Blockers
- **Depends on:** FR-027 (D-001)
- **Blocks:** J-001 (Audit Trail 자동 생성)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-004 | SRS: v1.1*
