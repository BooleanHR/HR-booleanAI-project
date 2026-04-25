---
name: Feature Task
title: "[Feature] FR-029: 정부24 API 타임아웃 시 Mock 폴백 함수 구현"
labels: 'feature, mock-external, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-003
---

## :dart: Summary
- **기능명:** [FR-029] 정부24 API 타임아웃 시 Mock 폴백 함수
- **Epic:** Mock/External
- **목적:** 정부24 API 호출이 10초 타임아웃되거나 네트워크 에러 발생 시 자동으로 Mock 응답을 반환하는 폴백 함수를 구현한다.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/mock-responses.ts`에 `mockGov24Response()` 함수 구현
  ```typescript
  export function mockGov24Response(): AgencyApiResponse {
    return {
      verified: true,
      issuerInfo: { issuer: '정부24 (Mock)', docVerified: 'true' },
      responseRaw: JSON.stringify({ mock: true, verified: true, reason: 'timeout_fallback' }),
      capturedAt: new Date(),
      mockUsed: true,
    };
  }
  ```

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 함수 호출 → `mockUsed: true` 포함된 응답 반환
**Scenario 2:** responseRaw에 `"reason": "timeout_fallback"` 포함

## :construction: Dependencies & Blockers
- **Depends on:** FR-027 (D-001)
- **Blocks:** I-002 (Triple Check Layer 2)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-003 | SRS: v1.1*
