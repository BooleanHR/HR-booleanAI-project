# 위키 변경 로그 (Wiki Changelog)

본 문서는 `llm-wiki` 스키마 룰에 따라 위키의 전반적인 변경 및 유지보수, 수집 내역을 연대기순으로(append-only) 로깅합니다.

## [2026-04-22] WIKI 일괄 구축 단계 I (Sources & Core Concepts/Entities Ingest)
- ingest | raw/assets의 PRD, SRS 제외한 시장/기획 문서 10종 Source 노드 구축 완료 (source_1 ~ source_10)
- ingest | 핵심 개념 노드 4개 생성: `Audit_Trail`, `Parallel_Capture`, `Self_Service_Fallback`, `Triple_Check_Loop`
- ingest | 핵심 엔티티 노드 3개 생성: `HR_Manager_Persona`, `Public_Institutions_B2G`, `High_Growth_IT_Finance`
- rule update | 그래프 뷰(Graph View) 최적화를 위해 모든 문서 생성 시 최상단/최하단에 양방향 참조 링크(Bi-directional Markdown Links) 자동 주입 템플릿 적용.
