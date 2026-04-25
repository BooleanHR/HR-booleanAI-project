---
name: Feature Task
title: "[Feature] FR-036: Supabase RLS 정책 설정"
labels: 'feature, auth, security, priority:critical'
version: v0.1
status: 초안 — 검수 대기
source_task_id: E-003
---

## :dart: Summary
- **기능명:** [FR-036] Supabase RLS 정책 설정
- **Epic:** Auth/RBAC
- **목적:** Supabase PostgreSQL의 Row Level Security(RLS) 정책을 8개 테이블에 설정하여 역할 기반 데이터 접근 제어를 구현한다.
- **설계 원칙:** SRS §3.14 REQ-NF-024.
- **⚠️ 참고:** PoC 로컬 개발(SQLite)에서는 RLS 미적용. **Supabase PostgreSQL 배포 시 적용**.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Supabase SQL Editor에서 각 테이블 RLS 활성화
- [ ] **TB-2:** 역할별 정책 설정
  - OPERATOR: 자신이 생성한 Batch/Applicant/Document 읽기/쓰기, VerificationJob 읽기만
  - ADMIN: 전체 테이블 읽기/쓰기 + 승인/반려 가능
  - AUDITOR: audit_trails 읽기만. 다른 테이블은 접근 불가.
- [ ] **TB-3:** service_role 키로 우회 가능한지 확인 (Server Action에서 사용)

## :construction: Dependencies & Blockers
- **Depends on:** FR-034 (E-001), FR-016 (B-010)
- **Blocks:** J-004 (Audit Trail 조회)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST E-003 | SRS: v1.1*
