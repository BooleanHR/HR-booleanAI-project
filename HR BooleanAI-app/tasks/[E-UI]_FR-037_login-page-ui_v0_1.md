---
name: Feature Task
title: "[Feature] FR-037: 로그인 페이지 UI"
labels: 'feature, auth, frontend, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: UI-002
---

## :dart: Summary
- **기능명:** [FR-037] 로그인 페이지 UI
- **Epic:** Auth/RBAC
- **목적:** shadcn/ui 컴포넌트(Card, Input, Button)를 사용한 이메일/비밀번호 로그인 페이지를 구현한다. 로그인 성공 시 대시보드(/dashboard)로 리다이렉트한다.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/app/login/page.tsx` 구현
  - shadcn/ui Card 컴포넌트로 로그인 폼 래핑
  - Input: 이메일, 비밀번호 필드
  - Button: 로그인 버튼
  - 에러 메시지 표시 영역
- [ ] **TB-2:** Server Action 호출로 Supabase Auth signIn 실행
- [ ] **TB-3:** 로그인 성공 → `redirect('/dashboard')`
- [ ] **TB-4:** 로그인 실패 → 에러 메시지 표시 (잘못된 이메일/비밀번호)
- [ ] **TB-5:** 이미 로그인된 사용자 → /dashboard 자동 리다이렉트

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 올바른 이메일/비밀번호 → 대시보드 리다이렉트
**Scenario 2:** 잘못된 비밀번호 → 에러 메시지 표시
**Scenario 3:** 이미 로그인 → /login 접근 시 /dashboard 리다이렉트

## :construction: Dependencies & Blockers
- **Depends on:** FR-034 (E-001), FR-002 (A-002: shadcn/ui)
- **Blocks:** UI-010 (서류 업로드 페이지)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST UI-002 | SRS: v1.1*
