---
name: Feature Task
title: "[Feature] FR-034: Supabase Auth 이메일/패스워드 로그인 설정"
labels: 'feature, auth, priority:critical'
version: v0.1
status: 초안 — 검수 대기
source_task_id: E-001
---

## :dart: Summary
- **기능명:** [FR-034] Supabase Auth 이메일/패스워드 로그인
- **Epic:** Auth/RBAC (인증 & 권한)
- **목적:** Supabase Auth를 이용한 이메일/패스워드 회원가입 및 로그인 기능을 구현한다. Google OAuth는 선택 사항으로 남겨둔다.
- **설계 원칙:** SRS §3.5 ADR. §3.14 REQ-NF-020. Supabase Auth 표준 SSR 패턴 사용.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.14 REQ-NF-020`](../SRS-HR-AI-Verification-v1.1.md) — 인증
- FR-004에서 이미 구현된 `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts` 활용

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Supabase Auth signUp 함수 구현
  ```typescript
  export async function signUp(email: string, password: string) {
    const supabase = await createClient();
    return supabase.auth.signUp({ email, password });
  }
  ```
- [ ] **TB-2:** Supabase Auth signIn 함수 구현
  ```typescript
  export async function signIn(email: string, password: string) {
    const supabase = await createClient();
    return supabase.auth.signInWithPassword({ email, password });
  }
  ```
- [ ] **TB-3:** signOut 함수 구현
- [ ] **TB-4:** 로그인 후 User 테이블과 Supabase Auth 사용자 연동 로직
  - Supabase Auth의 user.id와 User 테이블의 userId 매핑
  - 최초 로그인 시 User 레코드 존재 여부 확인
- [ ] **TB-5:** Supabase 대시보드에서 Email Provider 활성화 확인
  - PoC 단계: 이메일 확인 비활성화 (즉시 로그인)

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 이메일/비밀번호로 회원가입 → 성공 응답
**Scenario 2:** 가입한 계정으로 로그인 → 세션 생성
**Scenario 3:** signOut → 세션 제거

## :construction: Dependencies & Blockers
- **Depends on:** FR-004 (A-004: Supabase 프로젝트), FR-016 (B-010: DB 마이그레이션)
- **Blocks:** E-002 (Middleware RBAC), E-003 (RLS), UI-002 (로그인 페이지)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST E-001 | SRS: v1.1*
