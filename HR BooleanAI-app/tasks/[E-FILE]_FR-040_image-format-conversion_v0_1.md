---
name: Feature Task
title: "[Feature] FR-040: 이미지 형식 변환 (HEIC/BMP/TIFF → JPG)"
labels: 'feature, file-ingestion, priority:critical'
version: v0.1
status: 초안 — 검수 대기
source_task_id: F-003
---

## :dart: Summary
- **기능명:** [FR-040] 이미지 형식 변환 (sharp)
- **Epic:** File Ingestion
- **목적:** sharp 라이브러리를 사용하여 비표준 이미지 형식(HEIC, BMP, TIFF)을 JPG로 변환한다. 원본 파일 형식을 `original_file_format`에 기록한다.
- **설계 원칙:** SRS §3.13 REQ-FUNC-081. C-TEC-009 sharp 사용.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `src/actions/file-conversion.ts`에 `convertImageToJpg(buffer, format)` 함수 구현
  ```typescript
  import sharp from 'sharp';

  export async function convertImageToJpg(
    buffer: Buffer,
    originalFormat: string
  ): Promise<{ converted: Buffer; originalFormat: string }> {
    const converted = await sharp(buffer)
      .jpeg({ quality: 90 })
      .toBuffer();
    return { converted, originalFormat };
  }
  ```
- [ ] **TB-2:** HEIC, BMP, TIFF 각각 변환 테스트
- [ ] **TB-3:** Vercel Serverless 환경에서 sharp 동작 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** HEIC Buffer 입력 → JPG Buffer 반환 + originalFormat='heic'
**Scenario 2:** 변환된 JPG의 품질이 OCR 처리에 충분 (quality: 90)

## :construction: Dependencies & Blockers
- **Depends on:** FR-006 (A-006: sharp 패키지)
- **Blocks:** F-005 (이미지 회전 보정)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST F-003 | SRS: v1.1*
