---
name: Feature Task
title: "[Feature] FR-039: 파일 크기 검증"
labels: 'feature, file-ingestion, priority:critical'
version: v0.1
status: 초안 — 검수 대기
source_task_id: F-002
---

## :dart: Summary
- **기능명:** [FR-039] 파일 크기 검증
- **Epic:** File Ingestion
- **목적:** 20MB 초과 파일에 대해 HTTP 422를 반환한다. FR-038의 validateFile 함수에 통합 구현한다.
- **설계 원칙:** SRS §3.13 REQ-FUNC-005 — 최대 20MB.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** FR-038의 `validateFile()` 함수에 크기 검증 로직 추가
  - `file.size > 20 * 1024 * 1024` → 에러 반환
- [ ] **TB-2:** 에러 메시지에 실제 파일 크기 포함 (UX 개선)

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** 15MB PDF → 통과
**Scenario 2:** 25MB JPG → `{valid: false, error: '파일 크기가 20MB를 초과합니다. (25.0MB)'}`

## :construction: Dependencies & Blockers
- **Depends on:** FR-026 (C-010)
- **Blocks:** P-001 (통합 파이프라인)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST F-002 | SRS: v1.1*
