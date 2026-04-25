---
name: Feature Task
title: "[Feature] FR-038: 파일 형식 검증 유틸리티"
labels: 'feature, file-ingestion, priority:critical'
version: v0.1
status: 초안 — 검수 대기
source_task_id: F-001
---

## :dart: Summary
- **기능명:** [FR-038] 파일 형식 검증 유틸리티
- **Epic:** File Ingestion (파일 업로드 & 변환)
- **목적:** 업로드된 파일의 형식을 판별하여 지원 형식(PDF/JPG/PNG/DOCX/HEIC/BMP/TIFF)은 통과시키고, 미지원 형식(HWP 등)은 HTTP 422 + "PDF/JPG/PNG로 변환하여 재제출해주세요" 안내를 반환한다.
- **설계 원칙:** SRS §3.13 REQ-FUNC-005, REQ-FUNC-083.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/actions/file-conversion.ts`에 `validateFile(file)` 함수 구현
  ```typescript
  "use server"

  const SUPPORTED_FORMATS = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/heic', 'image/bmp', 'image/tiff'];
  const CONVERTIBLE_FORMATS = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/heic', 'image/bmp', 'image/tiff'];
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  export async function validateFile(file: File): Promise<{
    valid: boolean;
    needsConversion: boolean;
    format: string;
    error?: string;
  }> {
    // MIME type + 확장자 판별
    // HWP → 422 에러
    // 20MB 초과 → 422 에러
    // 변환 필요 여부 판별
  }
  ```
- [ ] **TB-2:** HWP 파일 감지 — MIME type `application/x-hwp` 또는 확장자 `.hwp`
- [ ] **TB-3:** 에러 메시지 국제화 — 한국어 안내 메시지

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** PDF → `{valid: true, needsConversion: false}`
**Scenario 2:** HEIC → `{valid: true, needsConversion: true}`
**Scenario 3:** HWP → `{valid: false, error: 'HWP 형식은 지원되지 않습니다. PDF/JPG/PNG로 변환 후 재제출해주세요.'}`
**Scenario 4:** 25MB JPG → `{valid: false, error: '파일 크기가 20MB를 초과합니다.'}`

## :construction: Dependencies & Blockers
- **Depends on:** FR-026 (C-010: HTTP 에러 유틸리티)
- **Blocks:** P-001 (통합 파이프라인)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST F-001 | SRS: v1.1*
