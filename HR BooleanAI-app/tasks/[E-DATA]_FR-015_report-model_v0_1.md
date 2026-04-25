---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-015: Report 모델 정의"
labels: 'feature, database, priority:high'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-009
---

## :dart: Summary
- **기능명:** [FR-015] Report 모델 정의
- **Epic:** DB Schema
- **목적:** PDF/엑셀 리포트 생성 기록을 저장하는 **Report 모델**을 정의한다. v1.1에서 `reportType` (PDF|EXCEL) Enum과 `excelPath` 필드가 추가되었다.
- **설계 원칙:** SRS §3.8 (L656 ~ 671). Batch → Report 1:N, User → Report 1:N 관계.

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — Report`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Report 모델 추가
  ```prisma
  model Report {
    reportId     String     @id @default(uuid()) @map("report_id")
    batchId      String     @map("batch_id")
    generatedBy  String     @map("generated_by")
    reportType   ReportType @default(PDF) @map("report_type")
    pdfPath      String?    @map("pdf_path")
    excelPath    String?    @map("excel_path")
    status       String
    totalCount   Int?       @map("total_count")
    generatedAt  DateTime?  @map("generated_at")

    batch     Batch  @relation(fields: [batchId], references: [batchId])
    generator User   @relation("generator", fields: [generatedBy], references: [userId])

    @@map("reports")
  }
  ```

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** Report 모델 9개 필드 + 2개 관계 → generate 성공
**Scenario 2:** reportType이 ReportType enum(PDF|EXCEL) 사용
**Scenario 3:** v1.1 필드(excelPath) 존재

## :gear: Technical & Non-Functional Constraints
- reportType: ReportType enum (PDF | EXCEL). v1.1 신규.
- status: GENERATING | COMPLETED | FAILED
- pdfPath, excelPath: 각각 PDF/엑셀 파일 저장 경로. 해당 타입이 아니면 null.

## :checkered_flag: Definition of Done (DoD)
- [ ] Report 모델 9개 필드 + 2개 관계 정의
- [ ] reportType ReportType enum 사용
- [ ] excelPath 필드 존재

## :construction: Dependencies & Blockers
- **Depends on:** FR-009 (B-003: Batch), FR-008 (B-002: User)
- **Blocks:** B-010 (일괄 마이그레이션)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-009 | SRS: v1.1*
