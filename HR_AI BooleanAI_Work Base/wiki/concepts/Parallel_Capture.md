---
tags: [wiki/concept, HR_AI, Architecture, UX]
---
**Path:** [[index]] > [[_Concepts_MOC]] > 현재문서

# 원본/조회본 병렬 캡처 (Parallel Capture)

## 📌 개념 정의
인사 담당자나 감사관이 지원자의 과거 이력을 검증할 때, **지원자가 제출한 스캔 파일(원본)**과 시스템이 백그라운드 RPA를 통해 조회한 **공공기관 전산 데이터(조회본)**를 분할 화면(Split View) 혹은 하나의 패키지 리포트 안에서 동시에 시각적으로 보여주는 아키텍처 및 UX 방법론입니다.

## 🚀 비즈니스적 가치 (The Moat)
단순 OCR 판독 솔루션들이 결과값(True/False)만을 전달할 때, 실무자는 판독에 대한 확신을 갖기 위해 결국 다시 정부24 등 공공기관 사이트에 들어가 이중 확인을 하게 됩니다.
그러나 "병렬 캡처" 기능은 **시각적 증빙(Visual Proof)** 자산을 시스템 내부에서 즉시 확보하도록 돕습니다.
이 과정에서 시스템 로그를 동반한 타임스탬프가 개입되어 [[Audit_Trail]]을 완성하게 만들며, 추후 소송이나 감사원 제출을 위한 법적 면책권으로 작용합니다.

## 🔗 연관 워크플로우
- [[Triple_Check_Loop]] 로직의 마지막 결과물을 시각화하는 필수 요소.
- 주요 수혜자: [[Public_Institutions_B2G]], [[HR_Manager_Persona]]

---
**관련 노드 탐색 (Related Nodes):**
- 연관 개념: [[Audit_Trail]], [[Triple_Check_Loop]]
- 파생 출처: [[source_1_porters_forces]], [[source_3_value_chain]], [[source_9_aos_dos_analysis]]
