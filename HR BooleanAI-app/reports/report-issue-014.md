# 📊 TDD Report: ISSUE-014 (구버전 수첩형 자격증 실인 시각 검증)

- **이슈 ID**: `ISSUE-014`
- **브랜치명**: `feat/issue-014`
- **구현 상태**: ✅ TDD 검증 통과 (Green)
- **작성 일자**: 2026-05-28

---

## 🛠️ 1. 구현 및 변경 내역

1. **테스트 가독성 개선 (함수 Export)**
   - [nextapp/src/lib/ai/reviewer-agent.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/src/lib/ai/reviewer-agent.ts) 내에서 캡슐화되어 있던 `buildPrompt` 함수를 외부로 export하도록 변경하여 프롬프트의 동적 분기 로직을 정밀하게 테스트할 수 있도록 구조 개방.
2. **구버전 자격증 판별 분기 구현**
   - 전달받은 서류 유형이 Q-Net 자격증(`QNET` 또는 `CERTIFICATE`)인 경우, 지원 데이터에 기록된 합격일자(`passDate`)를 정규식으로 분석해 **2001년 이전(passYear < 2001)인지 자동 감지**하는 판별기 구축.
3. **Gemini Vision 전용 지침 추가**
   - 구버전 자격증에 해당할 경우, 프롬프트 하단에 `## ⚠️ 2001년 이전 발급 자격증 검토 지침` 섹션을 동적으로 덧붙임.
   - 대한민국 한국산업인력공단 이사장의 **붉은색 실인(도장/관인)이 이미지에 육안으로 선명하게 날인되어 있는지** 여부를 시각적으로 판독하도록 세부 지침(미날인 시 REJECT, 선명 시 APPROVE, 흐릿 시 ESCALATE)을 프롬프트에 주입.

---

## 🧪 2. TDD 테스트 결과

[nextapp/scripts/test-issue-014.ts](file:///c:/Users/user/Desktop/vibe%20codeing/HR-booleanAI-project/HR%20BooleanAI-app/nextapp/scripts/test-issue-014.ts) 검증용 테스트 데이터를 통해 프롬프트 조합 정합성을 완벽하게 확인하였습니다:

* **[Test 1] 2001년 이후 자격증 테스트**: 성공 (2015년 합격건 전달 시, `2001년 이전` 실인 전용 안내 가이드가 본문에 포함되지 않는 정상 상태 대조 완료)
* **[Test 2] 2001년 이전 자격증 테스트**: 성공 (1999년 합격건 전달 시, `2001년 이전 발급 자격증 검토 지침`과 `관인`, `인장` 키워드가 정상적으로 삽입된 최종 프롬프트 출력 확인)

---

## 📝 3. 의사결정 사항 (Decision Log)

- **M-02**: 2001년 이전 발급 자격증을 판별하기 위해 지원 데이터의 합격일자(passDate) 연도가 2001년 미만인 경우 Gemini Vision 관인 날인 분석 프롬프트를 추가 적용하도록 분기 처리.
