---
tags: [wiki/concept, HR_AI, Compliance, Legal]
---
**Path:** [[index]] > [[_Concepts_MOC]] > 현재문서

# Audit Trail (감사 추적 및 법적 면책권)

## 📌 개념 정의
Audit Trail(감사 추적)이란 특정 트랜잭션, 의사결정 프로세스의 처음부터 끝까지 추적 및 재현이 가능한 로그 기록을 의미합니다. 채용 공정성 시장에서는 시스템이 지원자의 데이터를 공공 기관에 조회하여 판별한 **의사 결정 과정의 명백한 증거**를 가리킵니다.

## 🚀 왜 이것이 핵심 해자(Moat)인가?
단순 OCR 및 RPA 결과 텍스트만 "일치함/불일치"로 남겨두었을 때, 시스템 장애나 AI의 오판으로 합격자가 바뀌게 되면 법적 책임은 최종 결정을 내린 '인사 담당자'에게 귀속됩니다.

*본 솔루션이 추구하는 혁신점:*
1. 담당자가 "나는 이 솔루션의 화면을 기반으로 판별했다"고 증빙할 수 있는 **법적 면책권**을 부여합니다.
2. 이를 달성하기 위해 [[Parallel_Capture]] (원본-조회본 병렬 캡처) 기술을 동반 사용하여, 감사원 국정감사 제출용 표준 PDF 리포트를 생성해줍니다.

## 🔗 관련 흐름
- 이 니즈를 가장 절실히 느끼는 타겟: [[Public_Institutions_B2G]] (공공기관 담당자) 및 소송 방어가 필요한 법무팀.
- 실현 수단: 실시간 API 대조 이후 결과화면과 이미지 스캔본을 하나로 묶어 타임스탬프 처리.

---
**관련 노드 탐색 (Related Nodes):**
- 출처 문서: [[source_1_porters_forces]], [[source_4_ksf_report]], [[source_9_aos_dos_analysis]]
- 유관 개념: [[Parallel_Capture]], [[Compliance_Risk_Management]]
- 핵심 타겟 엔티티: [[Public_Institutions_B2G]], [[HR_Manager_Persona]]
