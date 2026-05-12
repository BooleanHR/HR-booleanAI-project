---
name: Feature Task
title: "[Feature] FR-127: 로컬 5. 진위확인결과 폴더 생성 유틸"
labels: 'feature, file, priority:medium'
version: v1.0
status: "초안 — 검수 대기"
source_task_id: F-008
---

## :dart: Summary
- **기능명:** [FR-127] 로컬 `5. 진위확인결과` 폴더 자동 생성 및 리포트 저장 유틸리티
- **Epic:** E-FILE
- **목적:** 진위확인이 완료되면 해당 지원자의 로컬 폴더(채용공고 폴더 내부) 안에 `5. 진위확인결과`라는 디렉토리를 생성하고, 그 안에 결과물(PDF, 엑셀, RPA캡처 이미지)을 작성한다.
- **설계 원칙:** SRS REQ-FUNC-025 (v1.3)
- **복잡도:** L

## :link: References (Spec & Context)
- SRS 문서: [`SRS-HR-AI-Verification-v1.3.md#REQ-FUNC-025`](../SRS-HR-AI-Verification-v1.3.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** Node.js `fs` 모듈을 통한 지원자 하위 `5. 진위확인결과` 폴더 존재 여부 확인 및 생성 (`fs.mkdirSync`)
- [ ] **TB-2:** 결과 파일(PDF 버퍼, RPA 캡처 이미지 버퍼 등)을 해당 경로에 `fs.writeFileSync` 로 저장
- [ ] **TB-3:** 파일명 충돌 회피(접미사 번호 부여) 로직

## :test_tube: Acceptance Criteria (BDD/GWT)
- **Given** 검증 완료된 Job ID 및 결과 파일 버퍼
- **When** `saveVerificationResultToLocal()` 호출
- **Then** 로컬 파일시스템 해당 지원자 폴더 내에 5번 폴더와 결과 파일 생성 확인

## :gear: Technical & Non-Functional Constraints
- Node.js 환경에서만 구동 (로컬 퍼스트 환경 특화)

## :checkered_flag: Definition of Done (DoD)
- [ ] 로직 구현 및 폴더 쓰기 검증 완료
- [ ] 권한 에러 핸들링 추가

## :construction: Dependencies & Blockers
- **Depends on:** M-002, N-002
