# 위키 변경 로그 (Wiki Changelog)

본 문서는 `llm-wiki` 스키마 룰에 따라 위키의 전반적인 변경 및 유지보수, 수집 내역을 연대기순으로(append-only) 로깅합니다.

## [2026-04-22] WIKI 일괄 구축 단계 I (Sources & Core Concepts/Entities Ingest)
- ingest | raw/assets의 PRD, SRS 제외한 시장/기획 문서 10종 Source 노드 구축 완료 (source_1 ~ source_10)
- ingest | 핵심 개념 노드 4개 생성: `Audit_Trail`, `Parallel_Capture`, `Self_Service_Fallback`, `Triple_Check_Loop`
- ingest | 핵심 엔티티 노드 3개 생성: `HR_Manager_Persona`, `Public_Institutions_B2G`, `High_Growth_IT_Finance`
- rule update | 그래프 뷰(Graph View) 최적화를 위해 모든 문서 생성 시 최상단/최하단에 양방향 참조 링크(Bi-directional Markdown Links) 자동 주입 템플릿 적용.

## [2026-06-20] WIKI 확장 단계 II (Growth & Verification Phase Start)
- ingest | 성장 및 검증(Growth & Verification) 전용 폴더 `growth_verification/` 신규 생성 및 MOC(`_Growth_Verification_MOC`) 추가
- ingest | Day 51 기획 분석서 `Day51_ARRR_and_Hypothesis` 생성: ARRR 프레임워크 5단계 매핑, 핵심 가설 3종 수립 및 GA4 이벤트 수집 기본 전략 도출

## [2026-06-20] WIKI Lint 루프 #1 (Integrity Check)
- lint | `Day51_ARRR_and_Hypothesis` → `index.md`, `_Growth_Verification_MOC` 양방향 참조 정상 확인 ✅
- lint | `Day51_ARRR_and_Hypothesis` → `Triple_Check_Loop`, `Self_Service_Fallback`, `Audit_Trail` 정방향 참조 정상 확인 ✅
- lint | **역방향 back-link 누락 발견**: `Triple_Check_Loop`, `Self_Service_Fallback`, `Audit_Trail` 3개 개념 노드에 Day51 역참조 없음
- fix  | 위 3개 개념 노드 하단 Related Nodes 섹션에 `성장 검증: [[Day51_ARRR_and_Hypothesis]]` 역참조 추가 완료 ✅
- lint | `_Growth_Verification_MOC`에서 예정 문서 4건(Day52~Day55) 참조: 아직 물리 파일 미생성 (예정 상태) — 향후 작업 시 생성 필요

## [2026-06-23] WIKI 확장 단계 III (10주차·11주차 반영)
- ingest | `Day52_NSM_and_Experiment_Design` 생성: 북극성 지표(NSM) 정의, A/B 테스트 실험 2종 설계 완료
- impl  | **10주차 핵심 구현**: `src/lib/ai/claudeReviewerAgent.ts` 신규 생성
  - Claude 에이전트 패러다임: Boundaries + Context 프롬프팅 적용
  - 모델: `claude-opus-4-5` (메모의 비존재 모델 `claude-fable-5` 교정)
  - Extended Thinking: `{ type: 'enabled', budget_tokens: 10000 }` (메모의 `adaptive` 파라미터 교정)
  - Tool use: `send_to_user_escalation` (ESCALATE 시 담당자 실시간 요청)
  - Gemini 폴백: Claude API Key 미설정 또는 Refusal 발생 시 기존 Gemini 시스템으로 자동 전환
- impl  | **11주차 핵심 구현**: `src/app/api/verify-mvp/route.ts` 신규 생성
  - MVP 비즈니스 파이프라인 완성: Claude 검증 → DB 동기화 → Resend 이메일 자동 발송
  - Prisma 스키마 필드명 교정 (메모의 `verificationStatus`, `reviewedAt`, `errorMessage` → 실제 스키마의 `status`, `rejectReason`)
  - Batch 통계 자동 업데이트 (passCount / failCount / escalateCount)
- schema | `prisma/schema.prisma` 마이그레이션 (`add_claude_fields`): `VerificationJob`에 claudeVerdict/claudeScore/claudeReason/finalVerdict, `Applicant`에 rejectReason 필드 추가
- infra  | `@anthropic-ai/sdk` 패키지 설치 완료, `.env.local`에 CLAUDE_API_KEY/CLAUDE_MODEL/NEXT_PUBLIC_BASE_URL 추가
- verify | `next build` 성공 확인 ✅ — /api/verify-mvp 라우트 등록 완료



