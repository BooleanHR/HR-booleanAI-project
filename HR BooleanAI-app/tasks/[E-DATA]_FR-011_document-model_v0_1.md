---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-011: Document 모델 정의"
labels: 'feature, database, priority:critical'
assignees: ''
version: v0.1
status: 초안 — 검수 대기
source_task_id: B-005
---

## :dart: Summary
- **기능명:** [FR-011] Document 모델 정의
- **Epic:** DB Schema
- **목적:** 지원자 제출 서류 정보를 저장하는 **Document 모델**을 정의한다. v1.1에서 파일 변환(originalFileFormat, convertedFilePath), 회전 보정(rotationApplied, rotationDegrees), 자동 명명(originalFilename, normalizedFilename), 서류 분류(docCategory) 관련 필드가 대폭 추가되었다.
- **설계 원칙:** SRS §3.8 (L567 ~ 589). JSON 필드는 String(Text)으로 대체하여 SQLite 호환 (C-TEC-003).

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.8 Prisma Schema — Document`](../SRS-HR-AI-Verification-v1.1.md)
  - v1.1 신규 필드 7개: docCategory, originalFilename, normalizedFilename, originalFileFormat, convertedFilePath, rotationApplied, rotationDegrees
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§2.1 C-TEC-003`](../SRS-HR-AI-Verification-v1.1.md)
  - JSON 타입은 Text로 대체하여 SQLite/PostgreSQL 호환
- SRS 문서: [`SRS-HR-AI-Verification-v1.1.md#§3.13 REQ-FUNC-081 ~ 082, 090 ~ 091`](../SRS-HR-AI-Verification-v1.1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Document 모델 추가
  ```prisma
  model Document {
    docId              String    @id @default(uuid()) @map("doc_id")
    applicantId        String    @map("applicant_id")
    docType            DocType   @map("doc_type")
    docCategory        String?   @map("doc_category")
    rawFilePath        String    @map("raw_file_path")
    originalFilename   String?   @map("original_filename")
    normalizedFilename String?   @map("normalized_filename")
    originalFileFormat String?   @map("original_file_format")
    convertedFilePath  String?   @map("converted_file_path")
    rotationApplied    Boolean   @default(false) @map("rotation_applied")
    rotationDegrees    Int?      @map("rotation_degrees")
    ocrExtractedJson   String?   @map("ocr_extracted_json")
    ocrConfidenceScore Float?    @map("ocr_confidence_score")
    fileFormat         String    @map("file_format")
    uploadedAt         DateTime  @default(now()) @map("uploaded_at")

    applicant        Applicant         @relation(fields: [applicantId], references: [applicantId])
    verificationJobs VerificationJob[]

    @@map("documents")
  }
  ```
- [ ] **TB-2:** JSON 필드 확인 — `ocrExtractedJson`이 `String?` 타입(Text)인지 확인. `Json` 타입 사용 금지.
- [ ] **TB-3:** v1.1 신규 필드 7개 존재 여부 최종 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** Document 모델 15개 필드 정의 → generate 성공
**Scenario 2:** v1.1 신규 필드(docCategory, originalFilename, normalizedFilename, originalFileFormat, convertedFilePath, rotationApplied, rotationDegrees) 모두 존재
**Scenario 3:** ocrExtractedJson이 String 타입 (Json 타입 아님)

## :gear: Technical & Non-Functional Constraints
- **JSON 호환성:** ocrExtractedJson은 `String?` 타입. 애플리케이션에서 `JSON.parse()`/`JSON.stringify()`로 처리 (C-TEC-003).
- **convertedFilePath:** null이면 변환 불필요(원본이 PDF/JPG/PNG)를 의미.
- **rotationDegrees:** 0, 90, 180, 270 중 하나. null이면 회전 보정 미적용.
- **docCategory:** OCR 분류 결과. 졸업증명서, 자격증, 경력증명서 등. 업로드 시점에는 null, OCR 완료 후 업데이트.

## :checkered_flag: Definition of Done (DoD)
- [ ] Document 모델 15개 필드 + 2개 관계 정의 완료
- [ ] v1.1 신규 7개 필드 포함 확인
- [ ] ocrExtractedJson이 String? 타입 확인

## :construction: Dependencies & Blockers
- **Depends on:** FR-010 (B-004: Applicant 모델)
- **Blocks:** B-006 (VerificationJob 모델)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST B-005 | SRS: v1.1*
