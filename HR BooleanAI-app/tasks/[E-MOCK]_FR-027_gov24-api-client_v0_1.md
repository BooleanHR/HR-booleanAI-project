---
name: Feature Task
title: "[Feature] FR-027: 정부24 API 클라이언트 인터페이스 정의"
labels: 'feature, mock-external, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-001
---

## :dart: Summary
- **기능명:** [FR-027] 정부24 API 클라이언트 인터페이스 정의
- **Epic:** Mock/External (Mock 데이터 & 외부 API 클라이언트 계약)
- **목적:** 정부24 API 실제 호출 클라이언트를 구현한다. `callGov24Api(docNum, issueDate)` 함수로 문서확인번호·발급일자 기반 진위확인을 수행하며, **10초 타임아웃** 시 자동으로 Mock 폴백하는 로직을 포함한다.
- **설계 원칙:** SRS §3.12 AgencyApiClient. §1.2 Mock 대체 원칙 — 실제 API 미연동 시 Mock으로 대체.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.12 Class Diagram — AgencyApiClient`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§1.2 Mock 대체`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-011`](../SRS-HR-AI-Verification-v1.1.md) — 10초 타임아웃 시 Mock 폴백

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/agency-api.ts` 파일 생성
  ```typescript
  interface AgencyApiResponse {
    verified: boolean;
    issuerInfo: Record<string, string>;
    responseRaw: string; // JSON 원문 (Audit Trail 스냅샷용)
    capturedAt: Date;
    mockUsed: boolean;
  }

  export async function callGov24Api(
    docNum: string,
    issueDate: string
  ): Promise<AgencyApiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10초 타임아웃

    try {
      const response = await fetch(GOV24_API_URL, {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({ docNum, issueDate }),
        // ... headers
      });
      clearTimeout(timeout);
      const data = await response.json();
      return {
        verified: data.verified,
        issuerInfo: data.issuerInfo,
        responseRaw: JSON.stringify(data),
        capturedAt: new Date(),
        mockUsed: false,
      };
    } catch (error) {
      clearTimeout(timeout);
      // 타임아웃 또는 네트워크 에러 → Mock 폴백
      return mockGov24Response();
    }
  }
  ```
- [ ] **TB-2:** 환경변수 기반 API URL/Key 설정 — `GOV24_API_URL`, `GOV24_API_KEY`
- [ ] **TB-3:** 에러 핸들링 — 네트워크 에러, HTTP 4xx/5xx 에러 모두 Mock 폴백

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 정부24 API 성공 → verified 결과 + mockUsed=false 반환
**Scenario 2:** 10초 타임아웃 → Mock 폴백 + mockUsed=true 반환
**Scenario 3:** 네트워크 에러 → Mock 폴백 + mockUsed=true 반환

## :construction: Dependencies & Blockers
- **Depends on:** FR-017 (C-001: 공통 타입)
- **Blocks:** D-002 (HRDK Mock), D-003 (타임아웃 Mock 폴백), D-004 (스냅샷 캡처)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-001 | SRS: v1.1*
