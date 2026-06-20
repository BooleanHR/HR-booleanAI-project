---
tags: [wiki/concept, HR_AI, Architecture, Logic]
---
**Path:** [[index]] > [[_Concepts_MOC]] > 현재문서

# 3중 교차 검증 (Triple Check Loop)

## 📌 개념 정의
지원자의 단일 이력을 신뢰하기 위해 다음의 3가지 데이터 포인트를 시스템 내부에서 동기화하여 교차 대조하는 검증 메커니즘을 뜻합니다.
1. **User Input:** 지원자가 이력서 및 웹사이트에 직접 타이핑한 값
2. **OCR Parsing:** 지원자가 함께 제출한 증명서 스캔본/PDF에서 AI가 읽어들인 텍스트
3. **Public API / RPA DB:** 시스템이 정부24, Q-Net 등 외부 공공 신뢰 기관에서 문서확인번호를 조회해 파싱한 무결성 원본 데이터

## 🚀 왜 이것이 강력한가?
기존의 단순 OCR 솔루션이 '사진의 화질'과 '양식의 다양성' 때문에 발생하는 문제를 인간 실무자에게 떠넘기는 것과 달리, 이 로직은 3개 레이어를 대조함으로써 신뢰성을 기하급수적으로 끌어올립니다. 
셋 중 하나라도 정합성이 틀어질 경우, 인간 실무자를 호출하기 전에 **[[Self_Service_Fallback]]** 시스템을 트리거하여 지원자에게 재확인을 요구할 수 있습니다. 

이를 통해 무오성(Zero Error)에 가까운 신뢰 자본(Trust Capital)을 쌓을 수 있으며, 이는 Q3(채용 플랫폼 등) 파트너사에게도 가장 매력적인 세일즈 포인트가 됩니다.

---
**관련 노드 탐색 (Related Nodes):**
- 연관 개념: [[Self_Service_Fallback]], [[Parallel_Capture]]
- 파생 출처: [[source_3_value_chain]], [[source_5_problem_definition]]
- 주요 타겟: [[High_Growth_IT_Finance]]
- 성장 검증: [[Day51_ARRR_and_Hypothesis]]

