---
name: Feature Task
title: "[Feature] FR-026: HTTP 오류 응답 표준 유틸리티 함수"
labels: 'feature, api-contract, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: C-010
---

## :dart: Summary
- **기능명:** [FR-026] HTTP 오류 응답 표준 유틸리티 함수
- **Epic:** API Contract
- **목적:** 400/401/403/404/422/500 HTTP 오류 응답을 일관된 JSON 형식으로 반환하는 유틸리티 함수를 구현한다. 모든 API 엔드포인트에서 동일한 에러 포맷을 사용하여 클라이언트 측 에러 핸들링을 단순화한다.
- **설계 원칙:** SRS §3.7 오류 응답 표준 (L359 ~ 366).

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.7 오류 응답 표준`](../SRS-HR-AI-Verification-v1.1.md)
  - 400 Bad Request: 파라미터 누락 또는 파일 형식 오류
  - 401 Unauthorized: 미로그인 또는 세션 만료
  - 403 Forbidden: RBAC 권한 부족
  - 404 Not Found: 존재하지 않는 job_id
  - 422 Unprocessable: 파일 크기 초과 또는 변환 불가 형식 (HWP 등)
  - 500 Internal Error: 서버 내부 오류

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/lib/errors.ts` 파일 생성
  ```typescript
  export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  }

  export function createErrorResponse(
    statusCode: number,
    message: string,
    details?: Record<string, unknown>
  ): Response {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    };
    const body: ApiError = {
      error: errorNames[statusCode] || 'Unknown Error',
      message,
      statusCode,
      ...(details && { details }),
    };
    return Response.json(body, { status: statusCode });
  }
  ```
- [ ] **TB-2:** 편의 함수 추가: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `unprocessable()`, `internalError()`
- [ ] **TB-3:** Server Action용 에러 타입 정의 (Response가 아닌 throw 패턴)
- [ ] **TB-4:** 단위 테스트 — 각 상태 코드별 올바른 JSON 반환 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** `createErrorResponse(422, 'HWP 형식은 지원되지 않습니다')` 호출 → `{error: "Unprocessable Entity", message: "HWP 형식은 지원되지 않습니다", statusCode: 422}` 반환
**Scenario 2:** 모든 Route Handler에서 동일한 에러 포맷 사용

## :gear: Technical & Non-Functional Constraints
- Next.js App Router의 Response 객체 사용
- Server Action에서는 throw + try/catch 패턴, Route Handler에서는 Response.json() 패턴

## :checkered_flag: Definition of Done (DoD)
- [ ] `src/lib/errors.ts` 파일 존재
- [ ] 6개 HTTP 상태 코드(400 ~ 500) 처리 함수 구현
- [ ] ApiError 인터페이스 정의

## :construction: Dependencies & Blockers
- **Depends on:** FR-001 (A-001: Next.js 프로젝트)
- **Blocks:** F-001 (파일 형식 검증), F-002 (파일 크기 검증)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST C-010 | SRS: v1.1*
