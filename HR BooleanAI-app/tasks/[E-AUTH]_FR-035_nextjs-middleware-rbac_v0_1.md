---
name: Feature Task
title: "[Feature] FR-035: Next.js Middleware — RBAC 역할 검사"
labels: 'feature, auth, priority:critical'
version: v0.1
status: 초안 — 검수 대기
source_task_id: E-002
---

## :dart: Summary
- **기능명:** [FR-035] Next.js Middleware RBAC
- **Epic:** Auth/RBAC
- **목적:** Supabase 세션을 확인하고 **역할 기반 접근 제어(RBAC)**를 적용하는 Next.js Middleware를 구현한다. 미인증 사용자는 /login으로 리다이렉트하고, OPERATOR는 /review와 /api/reports 접근을 차단(403)한다.
- **설계 원칙:** SRS §3.10 Middleware. §3.14 REQ-NF-024.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.10 Component Diagram — Middleware`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.14 REQ-NF-024`](../SRS-HR-AI-Verification-v1.1.md) — RBAC

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/middleware.ts` 구현
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'

  export async function middleware(request: NextRequest) {
    // 1. Supabase 세션 확인
    // 2. 미인증 → /login 리다이렉트
    // 3. RBAC 검사
    //    - OPERATOR: /review, /api/reports 접근 불가 → 403
    //    - ADMIN, AUDITOR: 모든 경로 접근 가능
    //    - AUDITOR: /audit 외 경로는 읽기 전용 권장
  }

  export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
  }
  ```
- [ ] **TB-2:** 역할(role) 조회 — Supabase Auth user metadata 또는 User 테이블 조회
- [ ] **TB-3:** 403 응답 처리 — `src/lib/errors.ts`의 forbidden() 활용

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 미인증 사용자 → /dashboard 접근 → /login 리다이렉트
**Scenario 2:** OPERATOR → /review 접근 → HTTP 403
**Scenario 3:** ADMIN → /review 접근 → 정상 접근
**Scenario 4:** AUDITOR → /audit 접근 → 정상 접근

## :construction: Dependencies & Blockers
- **Depends on:** FR-034 (E-001: Auth 설정)
- **Blocks:** 전체 보호된 경로 접근

---
*Document Version: v0.1 (초안) | Source: TASK-LIST E-002 | SRS: v1.1*
