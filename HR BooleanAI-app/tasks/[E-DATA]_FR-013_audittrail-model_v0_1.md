---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-013: AuditTrail 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-007
---

## :dart: Summary
- **기능명:** [FR-013] AuditTrail 모델 정의
- **Epic:** DB Schema
- **목적:** 검증 처리 이력의 불변 감사 기록을 저장하는 **AuditTrail 모델**을 정의한다. VerificationJob과 **1:1 관계** (jobId @unique). v1.1에서 **API 응답 스냅샷**(agencyResponseSnapshot, agencyResponseCapturedAt) 필드가 추가되어 병렬 캡처 MVP 대안을 지원한다.
- **설계 원칙:** SRS §3.8 (L616 ~ 632). ADR-006 논리적 불변성 (is_immutable=true). ADR-008 병렬 캡처 MVP 대안.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — AuditTrail`](../SRS-HR-AI-Verification-v1.1.md)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ADR-006`](../SRS-HR-AI-Verification-v1.1.md) — 논리적 불변성
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.5 ADR-008`](../SRS-HR-AI-Verification-v1.1.md) — 병렬 캡처 MVP 대안
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-020 ~ 024`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** AuditTrail 모델 추가
  ```prisma
  model AuditTrail {
    trailId                  String    @id @default(uuid()) @map("trail_id")
    jobId                    String    @unique @map("job_id")
    captureFilePath          String?   @map("capture_file_path")
    agencyResponseSnapshot   String?   @map("agency_response_snapshot")
    agencyResponseCapturedAt DateTime? @map("agency_response_captured_at")
    timestampHash            String    @map("timestamp_hash")
    captureTimestamp         DateTime  @map("capture_timestamp")
    viewerLog                String    @default("[]") @map("viewer_log")
    isImmutable              Boolean   @default(true) @map("is_immutable")
    createdAt                DateTime  @default(now()) @map("created_at")
    retentionUntil           DateTime  @map("retention_until")

    verificationJob VerificationJob @relation(fields: [jobId], references: [jobId])

    @@map("audit_trails")
  }
  ```
- [ ] **TB-2:** `jobId @unique` — 1:1 관계 설정 확인
- [ ] **TB-3:** `viewerLog` default("[]") — 빈 JSON Array 문자열 초기값

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** AuditTrail 모델 11개 필드 → generate 성공
**Scenario 2:** jobId @unique — VerificationJob과 정확히 1:1 관계
**Scenario 3:** isImmutable default(true), viewerLog default("[]") 확인
**Scenario 4:** v1.1 필드(agencyResponseSnapshot, agencyResponseCapturedAt) 존재

## :gear: Technical & Non-Functional Constraints
- **1:1 관계:** jobId @unique → 하나의 VerificationJob에 하나의 AuditTrail만 존재
- **viewerLog:** JSON Array as String. 열람자 정보를 append. 예: `[{"userId":"abc","timestamp":"2026-04-18T10:00:00Z"}]`
- **retentionUntil:** 애플리케이션 레벨에서 `created_at + 5년(1825일)` 계산하여 저장 (REQ-FUNC-023)
- **isImmutable:** default(true). 삭제/수정 API 미노출로 논리적 불변성 보장 (ADR-006)
- **timestampHash:** SHA-256 해시. 감사 증빙의 무결성 검증용.

## :checkered_flag: Definition of Done (DoD)
- [ ] AuditTrail 모델 11개 필드 + 1개 관계 정의
- [ ] jobId @unique 1:1 관계 설정
- [ ] v1.1 신규 2개 필드(agencyResponseSnapshot, agencyResponseCapturedAt) 포함

## :construction: Dependencies & Blockers
- **Depends on:** FR-012 (B-006: VerificationJob 모델)
- **Blocks:** B-010 (일괄 마이그레이션)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-007 | SRS: v1.1*
