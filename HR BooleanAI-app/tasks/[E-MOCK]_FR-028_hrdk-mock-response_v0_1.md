---
name: Feature Task
title: "[Feature] FR-028: HRDK API Mock 응답 함수 구현"
labels: 'feature, mock-external, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-002
---

## :dart: Summary
- **기능명:** [FR-028] HRDK API Mock 응답 함수 구현
- **Epic:** Mock/External
- **목적:** HRDK(한국산업인력공단) API 미연동 상태에서 자격증 유효 여부를 **고정값으로 반환**하는 Mock 함수를 구현한다. `mockUsed=true`를 반환 데이터에 포함하여 PoC에서 Mock 사용 건을 투명하게 추적한다.
- **설계 원칙:** SRS §1.2 Mock 대체. §3.13 REQ-FUNC-012.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§1.2 Mock 대체`](../SRS-HR-AI-Verification-v1.1.md)
  - HRDK API: OAuth 2.0 계약 필요. PoC 시점 미체결 → Mock JSON 응답 반환.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/mock-responses.ts`에 `mockHrdkResponse(certNum)` 함수 구현
  ```typescript
  export function mockHrdkResponse(certNum: string): AgencyApiResponse {
    return {
      verified: true,
      issuerInfo: { certNumber: certNum, issuer: '한국산업인력공단', validUntil: '2030-12-31' },
      responseRaw: JSON.stringify({ mock: true, certNum, verified: true }),
      capturedAt: new Date(),
      mockUsed: true, // ⚠️ Mock 사용 표시 필수
    };
  }
  ```
- [ ] **TB-2:** 코드 내 주석 `// TODO: Phase 2에서 실제 HRDK API 연동 예정` 추가

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** `mockHrdkResponse('CERT-2026-001')` 호출 → `{verified: true, mockUsed: true}` 반환

## :construction: Dependencies & Blockers
- **Depends on:** FR-027 (D-001: Agency API 클라이언트)
- **Blocks:** I-002 (Triple Check Layer 2)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-002 | SRS: v1.1*
