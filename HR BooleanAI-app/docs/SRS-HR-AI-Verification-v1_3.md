# HR AI 서류 진위확인 솔루션
# Software Requirements Specification (SRS) v1.3

**Document ID:** SRS-001  
**Revision:** 1.3  
**Date:** 2026-05-12  
**Status:** MVP PoC 기준 — 제출서류 유형 전수 정의 + 커스텀 기관 URL 설정 반영  
**Tech Stack:** Next.js (App Router) · 로컬 SQLite (Prisma) · 로컬 File System · Gemini API · exceljs · sharp · Puppeteer

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.1 | 2026-04-18 | 병렬 캡처, 엑셀 내보내기, 선택적 알림, 파일 변환, 자동 명명 반영 |
| 1.2 | 2026-04-25 | 로컬 퍼스트 아키텍처, 대량 폴더 스캔, AI Reviewer Agent 추가 |
| **1.3** | **2026-05-12** | **① 제출서류 전체 유형·Key·Value 스키마 정의 (PDF 참조 전수 반영)** **② 기관 URL 커스텀 설정 기능 (PM 셀프서비스)** **③ 진위확인 불가 서류 처리 정책 명세** **④ 경력사항 4대보험 다중 기관 매핑** |

---

## v1.3 변경 핵심 요약

> **왜 v1.3인가?**  
> 실제 업무 현장에서 사용되는 서류는 동일한 "졸업증명서"라도 **웹민원센터, 써트피아, 정부24, 아이써티** 4개 사이트에서 각기 다른 Key 구조로 발급됩니다. 기존 SRS는 이를 단일 "졸업증명서" 타입으로 추상화했으나, OCR 추출 및 진위확인 사이트 매핑이 실제 불가능한 수준이었습니다.  
> v1.3은 **제출서류 PDF 분석 결과를 전수 반영**하여 서류 유형별 Key 스키마, 진위확인 URL, 대체 확인 방법을 완전 명세합니다.  
> 또한 **코딩 없이 PM이 직접 기관 URL을 추가/수정**할 수 있는 셀프서비스 설정 시스템을 추가합니다.

---

## 1. 제출서류 전체 유형 정의 (v1.3 신규)

### 1.1 서류 분류 체계

```
서류 대분류
├── 1. 졸업/학위 증명서
│   ├── 1-1. 웹민원센터 발급
│   ├── 1-2. 써트피아 발급
│   ├── 1-3. 정부24 발급
│   └── 1-4. 아이써티 발급 (일부 대학 전용)
├── 2. 자격증
│   ├── 2-1. 수첩형 (한국산업인력공단)
│   ├── 2-2. 상장형 (한국산업인력공단)
│   ├── 2-3. 확인서 (한국산업인력공단 HRDK)
│   └── 2-4. 카드형 (대한상공회의소 등)
├── 3. 경력사항 (4대보험)
│   ├── 3-1. 건강보험자격득실확인서 (국민건강보험공단)
│   ├── 3-2. 국민연금 가입증명서
│   ├── 3-3. 고용보험 자격이력내역서
│   ├── 3-4. 산업재해보상보험 자격이력내역서
│   └── 3-5. 4대사회보험 가입자 가입내역 확인서 (정부24)
├── 4. 가점사항
│   ├── 4-1. 보훈 취업지원대상자 증명서 (정부24)
│   ├── 4-2. 장애인증명서 (정부24)
│   └── 4-3. 기타 가점 서류
├── 5. 교육사항
│   ├── 5-1. 성적증명서_웹민원센터 (*OCR 불가 가능성 높음)
│   ├── 5-2. 성적증명서_써트피아
│   ├── 5-3. 성적증명서_정부24
│   ├── 5-4-A. 수료증_에듀퓨어
│   ├── 5-4-B. 수료증_윈스팩
│   └── 5-4-C. 직업훈련이력확인원_고용24
└── 6. 어학사항
    ├── 6-1. TOEIC (YBM)
    ├── 6-2. OPIc (ACTFL)
    └── 6-3. 기타 (FLEX, TEPS, JPT, 新HSK, DELF, DELE, Goethe 등)
```

---

### 1.2 서류 유형별 OCR Key 스키마 및 진위확인 정보

> **범례:** `*` = 필수 추출 항목 | `()` = 해당 없을 수 있음 | `진위확인` = API/RPA/수동 분류

---

#### 📄 1-1. 졸업증명서_웹민원센터

| Key | Value 예시 | 필수 | 진위확인 활용 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | XD02-B55A-0BB1-74BB | ✅ | 정부24 API 입력값 |
| `name` (성명) | 이지호 | ✅ | 대조 |
| `birth_date` (생년월일) | 2001년 03월 04일 | ✅ | 대조 |
| `college` (대학 및 학부) | 글로벌인문·지역대학 | ✅ | 대조 |
| `major` (학과/전공/학위) | 한국역사학과(문학사) | ✅ | 대조 |
| `sub_major` (부전공) | 경역학전공 | ○ | 참고 |
| `graduation_date` (졸업일) | 2025년 02월 19일 | ✅ | 대조 |
| `degree_number` (학위번호) | 국민대학2024(학)0143 | ○ | 참고 |
| `issue_date` (발급일자) | 2025년 03월 10일 | ✅ | 유효기간 확인 |
| `school_name` (학교명) | 국민대학교 교무처장 | ✅ | 대조 |

**진위확인 방법:** 정부24 문서확인번호 API  
**URL:** `https://www.gov.kr/mw/EgovPageLink.do?link=confirm/AA040_confirm_id`  
**유효기간:** 발급일로부터 180일

---

#### 📄 1-2. 졸업증명서_써트피아

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `name` (성명) | 장은솔 | ✅ | |
| `birth_date` (생년월일) | 1993년 4월 20일 | ✅ | |
| `admission_date` (입학일자) | 2012년 3월 2일 | ✅ | |
| `graduation_date` (졸업년월일) | 2017년 8월 25일 | ✅ | |
| `college` (대학) | 사범대학 | ○ | |
| `major` (학과 및 전공) | 윤리교육과 | ✅ | |
| `double_major` (복수전공) | 역사교육과 | ○ | |
| `degree_reg_number` (학위 등록 번호) | 공주대2016학 2893 | ○ | |
| `issue_date` (발급일자) | 2025년 5월 7일 | ✅ | |
| `school_name` (학교명) | 국립공주대학교 총장 | ✅ | |
| `doc_confirm_number` (문서확인번호/Internet no) | 3730997267993160 | ✅ | 써트피아 자체 진위확인 |

**진위확인 방법:** 써트피아 자체 진위확인 사이트  
**URL:** `https://www.certpia.com/`  
**대체:** 정부24 문서확인번호 API (병행 가능)

---

#### 📄 1-3. 졸업증명서_정부24

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | 1749-8000-2066-3246 | ✅ | |
| `school_name` (학교명) | 진주전문대학 | ✅ | |
| `name` (성명) | 한여진 | ✅ | |
| `resident_number` (주민등록번호) | 830721-2829518 | ✅ | 마스킹 처리 필수 |
| `course` (과정) | 전문학사 | ✅ | |
| `department` (학부(과)/계열) | 관광과 | ✅ | |
| `major` (전공) | 호텔경영 | ✅ | |
| `admission_date` (입학일자) | 2002년 02월 28일 | ✅ | |
| `graduation_date` (졸업일자) | 2024년 02월 20일 | ✅ | |
| `degree_name` (학위명) | 관광전문학사 | ✅ | |
| `degree_reg_number` (학위등록번호) | 2004-0518 | ○ | |
| `issue_date` (발급일자) | 2025년 06월 07일 | ✅ | |
| `issuer` (발급처) | 한국사학진흥재단 이사장 | ✅ | |

**진위확인 방법:** 정부24 문서확인번호 API (직접 연동 가능)

---

#### 📄 1-4. 졸업증명서_아이써티 (일부 대학 전용)

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | 7C1B-A8B4E-3EF6-0E3CB | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `birth_date` (생년월일) | 1998년 01월 04일 | ✅ | |
| `admission_date` (입학일자) | 2016년 02월 26일 | ✅ | |
| `graduation_date` (졸업년월일) | 2022년 02월 18일 | ✅ | |
| `degree_name` (학위명) | 산업심리학사 | ✅ | |
| `cert_number` (졸업증서번호) | 67216 | ○ | |
| `degree_reg_number` (학위등록번호) | 호서대2021(학) 0317 | ○ | |
| `college` (대학) | 인문사회대학 | ○ | |
| `major` (주전공) | 산업심리학과 | ✅ | |
| `double_major` (복수전공) | 응용통계학과, 통계학사 | ○ | |
| `issue_date` (발급일자) | 2025년 07월 03일 | ✅ | |
| `school_name` (학교명) | 호서대학교 총장 | ✅ | |

**진위확인 방법:** 아이써티 자체 진위확인 (`https://cert.hoseo.ac.kr/certi/compare.jsp` 등 학교별 URL 상이)  
**주의:** 학교마다 진위확인 URL이 다름 → **커스텀 URL 설정** 필요 (§2 참조)

---

#### 🏆 2-1. 자격증_수첩형 (Q-Net)

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `inner_number` (내지번호) | 22-01-140727 | ✅ | |
| `cert_number` (자격번호) | 22202132156P | ✅ | Q-Net 조회 핵심 키 |
| `cert_name` (자격종목) | 사회조사분석사2급 | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `birth_date` (생년월일) | 1998. 01. 04 | ✅ | |
| `pass_date` (합격 연원일) | 2022년 09월 02일 | ✅ | |
| `issue_date` (발급 연월일) | 2022년 09월 02일 | ✅ | |

**진위확인 방법:** Q-Net 자격증 진위확인 (수첩형)  
**URL:** `https://www.q-net.or.kr/qlf006.do?id=qlf00601&gSite=Q&gId=`  
**주의:** 2001년 이전 발급 자격증 → 실인·인장 날인 확인 필요 (자동화 불가)

---

#### 🏆 2-2. 자격증_상장형 (Q-Net)

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `mgmt_number` (관리번호) | 202507081552-08-715-116 | ✅ | |
| `cert_number` (자격번호) | 22202132156P | ✅ | |
| `cert_name` (자격종목) | 사회조사분석사2급 | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `birth_date` (생년월일) | 1998. 01. 04 | ✅ | |
| `pass_date` (합격 연원일) | 2022년 09월 02일 | ✅ | |
| `issue_date` (발급 연월일) | 2025년 07월 08일 | ✅ | |

**진위확인 방법:** Q-Net 자격증 진위확인 (상장형)  
**URL:** `https://www.q-net.or.kr/qlf006.do?id=qlf00601&gSite=Q&gId=` (수첩형과 동일)

---

#### 🏆 2-3. 자격증_확인서 (HRDK)

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | HRD-20250711101107-15290 | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `cert_info` (자격종목) | 22202132156P 사회조사분석사2급 | ✅ | |
| `pass_date` (합격일자) | 2022. 09. 02 | ✅ | |
| `cert_name_at_issue` (취득 당시 종목명) | 사회조사분석사2급 | ✅ | |
| `issue_date` (확인서 발급일) | 2025년 07월 11일 | ✅ | |

**진위확인 방법:** Q-Net 확인서 진위확인  
**URL:** `https://www.q-net.or.kr/iss004.do?id=iss00401&gSite=Q&gId=`  
**유효기간:** 발급일로부터 90일

---

#### 🏆 2-4. 자격증_카드형 (대한상공회의소 등)

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `cert_number` (자격번호) | 23-K9-002039 | ✅ | |
| `cert_name` (자격종목) | 컴퓨터활용능력 1급 | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `birth_date` (생년월일) | 1998. 01. 04 | ✅ | |
| `pass_date` (합격 연원일) | 2023년 01월 04일 | ✅ | |

**진위확인 방법:**  
- 대한상공회의소 발급: `https://license.korcham.net/mb/grplogin.do` (계정 필요)  
- 9개 국가기술자격 시행기관: 정부24 `https://www.gov.kr/mw/NisCertificateConfirm.do`

---

#### 💼 3-1. 건강보험자격득실확인서

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `issue_number` (발급번호) | G202507080112243062 | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `resident_number` (주민등록번호) | 980104-1****** | ✅ | 마스킹 필수 |
| `issue_date` (발급일자) | 2025. 07. 08 | ✅ | |
| `career_records` (이력 배열) | [{no:1, type:직장가입자, company:주식회사 에이디링크연구소, start:2024.07.02, end:}] | ✅ | 다중 레코드 |

**진위확인 방법:**  
- 기관 자체 API (없음) → **원본 서류 OCR + 지원서 기재 기간 대조**  
- 발급번호로 위변조 여부 간접 판단  
**주의:** 건강보험공단 사이트 자체 진위확인 서비스 없음 → 서류 내용 직접 대조 방식

---

#### 💼 3-2. 국민연금 가입증명서

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `issue_number` (발급번호) | 20250399948361 | ✅ | |
| `issue_datetime` (발급일시) | 2025. 08. 04. 10 09:30 | ✅ | |
| `verify_number` (검증번호) | ZRQDJFGM | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `career_records` (이력 배열) | [{period:2024.07.02~현재, company:주식회사에이디링크연구소}] | ✅ | |

**진위확인 방법:** 국민연금 자체 검증번호 확인  
**URL:** `https://www.nps.or.kr/elctcvlcpt/comm/getOHAC0000M5.do?menuId=MN24001054`

---

#### 💼 3-3. 고용보험 자격이력내역서

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `issue_number` (발급번호) | 0000-2025-08040-0707 | ✅ | |
| `issue_date` (발급일자) | 2025년 08월 04일 | ✅ | |
| `receipt_number` (접수번호) | 0000-2025-9u3528B | ✅ | |
| `name` (성명) | 유용완 | ✅ | |
| `birth_date` (생년월일) | 98년 01월 04일 | ✅ | |
| `career_records` (이력 배열) | [{company:㈜엑스퍼트컨설팅, start:2023-03-13, end:, type:근로자}] | ✅ | |

**진위확인 방법:** 근로복지공단 자체 사이트  
**URL:** `https://total.comwel.or.kr/`

---

#### 💼 3-5. 4대사회보험 가입내역 확인서_정부24

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | 1754-2710-6929-5185 | ✅ | |
| `issue_datetime` (발급일시) | 2025-08-04 10:05 | ✅ | |
| `resident_number` (주민등록번호) | 980104-1470613 | ✅ | 마스킹 필수 |
| `name` (성명) | 유용완 | ✅ | |
| `insurance_records` (4대보험 이력) | [{type:국민연금, name:유용완, class:사업장가입자, company:(주)엑스퍼트컨설팅, start:2023.03.13}] | ✅ | |

**진위확인 방법:** 정부24 문서확인번호 API

---

#### 🎖 4-1. 보훈 취업지원대상자 증명서

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | 1746-6688-7020-7732 | ✅ | |
| `bohun_number` (보훈번호) | 23-240867 | ✅ | |
| `relation` (국가유공자와 관계) | 김태경 의 자녀 | ✅ | |
| `name` (성명) | 김유진 | ✅ | |
| `birth_date` (생년월일) | 1998년 07월 14일 (여) | ✅ | |
| `bonus_rate` (가점 비율) | 5% | ✅ | |
| `issue_date` (발급일자) | 2025년 05월 08일 | ✅ | |
| `issuer` (발급처) | 충남동부보훈지청장 | ✅ | |

**진위확인 방법:** 정부24 문서확인번호 API  
**주의:** 보훈청 직접 발급 시 인터넷 조회 불가 → 정부24 재발급 요청 또는 공문 확인

---

#### 🎖 4-2. 장애인증명서

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | 1746-7492-3566-1666 | ✅ | |
| `issue_number` (발급번호) | 제 20250000000013845496 호 | ✅ | |
| `name` (성명) | 송범석 | ✅ | |
| `resident_number` (주민등록번호) | 701105-1068718 | ○ | 마스킹 필수 |
| `disability_type` (주장애 및 장애 정도) | 지체(하지기능) 심한 장애 | ✅ | |
| `reg_number` (등록번호) | 4570000199800287 | ✅ | |
| `first_reg_date` (최초 등록일자) | 1998/05/07 | ✅ | |
| `total_disability` (종합 장애 정도) | 심한 장애 | ✅ | |
| `issue_date` (발급일자) | 2025년 05월 09일 | ✅ | |

**진위확인 방법:** 정부24 문서확인번호 API  
**주의:** 복지로·장애인고용공단 자체 조회는 현재 조회 불가 (전부 오류 반환) → 정부24 대체

---

#### 📝 6-1. TOEIC (YBM)

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `name` (이름) | 김가빈 | ✅ | |
| `birth_date` (생년월일) | 2000/01/11 | ✅ | |
| `test_date` (응시일자) | 2024/04/27 | ✅ | |
| `registration_number` (수험번호) | 125581 | ✅ | |
| `total_score` (TOTAL SCORE) | 985 | ✅ | |
| `issue_number` (발급번호) | 081155-0512001401 | ✅ | 진위확인 핵심 키 |

**진위확인 방법:** YBM 토익 성적 진위확인  
**URL:** `https://exam.toeic.co.kr/common/commonPreLogin.php?returnUrl=/result/truthInput.php`  
**주의:** 기업 회원 로그인 필요 → 계정 설정 필수 (§2 참조)

---

#### 📝 6-2. OPIc

| Key | Value 예시 | 필수 | 비고 |
|---|---|---|---|
| `doc_confirm_number` (문서확인번호) | M6WC-P6JG-E96X-B6TM-UBFM | ✅ | |
| `name` (성명) | 허창수 | ✅ | |
| `birth_date` (생년월일) | 1995/11/10 | ✅ | |
| `test_date` (시험일자) | 2023/06/19 | ✅ | |
| `test_type` (시험유형) | OPIc(ENGLISH) | ✅ | |
| `grade` (등급) | INTERMEDIATE HIGH – ENGLISH | ✅ | |
| `issue_date` (발급일자) | 2023/07/12 | ✅ | |
| `expire_date` (만료일자) | 2025/06/18 | ✅ | 유효기간 확인 필수 |

**진위확인 방법:** OPIc 인증서 진위확인  
**URL:** `https://www.opic.or.kr/opics/servlet/controller.opic.site.certi.CertiServlet?p_process=select-certicontrast`  
**주의:** 만료일자 경과 시 → 자동 FAIL 처리

---

### 1.3 진위확인 불가 서류 처리 정책 (v1.3 신규)

| 서류 유형 | 불가 사유 | 대체 처리 방법 |
|---|---|---|
| 장애인증명서 (복지로/장애인고용공단) | 시스템 오류 — 조회 불가 | 정부24 재발급본 제출 요청 |
| 보훈청 직접 발급 증명서 | 인터넷 진위확인 시스템 없음 | 공문 발송 또는 정부24 재발급 요청 |
| 성적증명서 (대부분) | 항목 과다, 레이아웃 복잡 | OCR 추출 후 문서확인번호만 API 대조 |
| 수첩형 자격증 (2001년 이전) | 인터넷 발급 이전 — DB 없음 | 실물 스캔본 실인·인장 AI 시각 검토 |
| 에듀퓨어 수료증 | 자체 대량 진위확인 이메일 요청 방식 | 에듀퓨어 자체 엑셀 양식 작성 후 메일 발송 |
| 윈스팩 수료증 | 자체 대량 진위확인 리스트 방식 | 윈스팩 양식 엑셀 작성 후 제출 |
| 카드형 자격증 (대한상공회의소) | 기업 계정 로그인 필요 | 계정 설정 UI에 ID/PW 입력 |

**처리 플래그:** `verification_possible: false` → `final_result: "확인불가"` → 대시보드에 대체 방법 안내

---

## 2. 기관 URL 커스텀 설정 시스템 (v1.3 신규 — PM 셀프서비스)

### 2.1 설계 목적

> **코딩 없이 PM이 직접** 새로운 진위확인 사이트 URL을 추가하거나 기존 URL을 수정할 수 있어야 합니다.  
> 예: 아이써티 발급 학교가 추가될 때, 개발자 없이 PM이 30초 안에 추가 가능해야 합니다.

### 2.2 `agency_config.json` — 기관 설정 파일

```json
{
  "agencies": [
    {
      "agency_id": "gov24_doc",
      "display_name": "정부24 — 인터넷 발급문서 진위확인",
      "url": "https://www.gov.kr/mw/EgovPageLink.do?link=confirm/AA040_confirm_id",
      "auth_required": false,
      "input_fields": [
        { "field_key": "doc_confirm_number", "label": "문서확인번호", "format": "####-####-####-####" }
      ],
      "applicable_doc_types": ["졸업증명서", "성적증명서", "보훈증명서", "장애인증명서", "4대보험가입내역"],
      "rpa_selectors": {
        "doc_confirm_number": ["#docNumber", "input[name='docNum']", "input[placeholder*='문서확인번호']"],
        "submit": ["#btnConfirm", "button[type='submit']"],
        "result": ["#resultArea", ".result-content"]
      },
      "valid_days": 180,
      "notes": "발급일로부터 180일 이내 유효"
    },
    {
      "agency_id": "qnet_cert",
      "display_name": "Q-Net — 자격증 진위확인 (수첩형/상장형)",
      "url": "https://www.q-net.or.kr/qlf006.do?id=qlf00601&gSite=Q&gId=",
      "auth_required": false,
      "input_fields": [
        { "field_key": "cert_type", "label": "자격증 종류", "type": "select", "options": ["수첩형 자격증", "상장형 자격증"] },
        { "field_key": "name", "label": "성명" },
        { "field_key": "cert_number", "label": "자격증번호", "format": "##-##-######" }
      ],
      "applicable_doc_types": ["자격증_수첩형", "자격증_상장형"],
      "rpa_selectors": {
        "cert_type": ["#certGb", "select[name='certGb']"],
        "name": ["#name", "input[name='name']"],
        "cert_number": ["#qlsnCd", "input[name='qlsnCd']"],
        "submit": ["#btnSearch", ".btn-search"],
        "result": ["#certResult", ".result-wrap"]
      },
      "valid_days": null,
      "notes": "90일 조회 가능 (발급일 기준)"
    },
    {
      "agency_id": "qnet_cert_confirm",
      "display_name": "Q-Net — 확인서 진위확인",
      "url": "https://www.q-net.or.kr/iss004.do?id=iss00401&gSite=Q&gId=",
      "auth_required": false,
      "input_fields": [
        { "field_key": "name", "label": "성명" },
        { "field_key": "doc_confirm_number", "label": "문서확인번호" }
      ],
      "applicable_doc_types": ["자격증_확인서"],
      "rpa_selectors": {
        "name": ["#nm", "input[name='nm']"],
        "doc_confirm_number": ["#docNo", "input[name='docNo']"],
        "submit": ["#btnSearch"],
        "result": ["#resultDiv"]
      },
      "valid_days": 90,
      "notes": "발급일로부터 90일 이내만 조회 가능"
    },
    {
      "agency_id": "toeic_ybm",
      "display_name": "YBM — TOEIC 성적 진위확인",
      "url": "https://exam.toeic.co.kr/common/commonPreLogin.php?returnUrl=/result/truthInput.php",
      "auth_required": true,
      "credential_key": "toeic_ybm",
      "input_fields": [
        { "field_key": "name", "label": "이름" },
        { "field_key": "birth_date", "label": "생년월일", "format": "YYYYMMDD" },
        { "field_key": "test_date", "label": "응시일자", "format": "YYYYMMDD" },
        { "field_key": "registration_number", "label": "수험번호" },
        { "field_key": "issue_number", "label": "발급번호" }
      ],
      "applicable_doc_types": ["토익"],
      "rpa_selectors": {
        "name": ["#nm", "input[name='nm']"],
        "birth_date": ["#birthDt"],
        "test_date": ["#testDt"],
        "registration_number": ["#regNo"],
        "issue_number": ["#issueNo"],
        "submit": ["#btnSearch", "button.btn-search"],
        "result": ["#resultWrap"]
      },
      "valid_days": null,
      "notes": "기업 회원 로그인 필수. 사이트 계정 설정 필요."
    },
    {
      "agency_id": "opic_actfl",
      "display_name": "OPIc — 인증서 진위확인",
      "url": "https://www.opic.or.kr/opics/servlet/controller.opic.site.certi.CertiServlet?p_process=select-certicontrast",
      "auth_required": false,
      "input_fields": [
        { "field_key": "doc_confirm_number", "label": "인증서 번호", "format": "####-####-####-####-####" }
      ],
      "applicable_doc_types": ["오픽"],
      "rpa_selectors": {
        "doc_confirm_number": ["#certNo", "input[name='certNo']"],
        "submit": ["#btnSearch"],
        "result": ["#resultArea"]
      },
      "valid_days": 730,
      "notes": "시험일로부터 2년 이내. 만료 시 자동 FAIL 처리."
    },
    {
      "agency_id": "korcham_cert",
      "display_name": "대한상공회의소 — 자격증 진위확인",
      "url": "https://license.korcham.net/mb/grplogin.do",
      "auth_required": true,
      "credential_key": "korcham",
      "input_fields": [
        { "field_key": "cert_number", "label": "자격번호" },
        { "field_key": "name", "label": "성명" }
      ],
      "applicable_doc_types": ["자격증_카드형_대한상공회의소"],
      "rpa_selectors": {
        "cert_number": ["#certNo"],
        "name": ["#nm"],
        "submit": ["#btnSearch"]
      },
      "valid_days": null,
      "notes": "계정 ID: exc20220 / PW: expt2020! (실제 운영 시 암호화 저장)"
    },
    {
      "agency_id": "certpia",
      "display_name": "써트피아 — 졸업증명서 진위확인",
      "url": "https://www.certpia.com/",
      "auth_required": false,
      "input_fields": [
        { "field_key": "doc_confirm_number", "label": "문서확인번호 (Internet no)" }
      ],
      "applicable_doc_types": ["졸업증명서_써트피아"],
      "rpa_selectors": {
        "doc_confirm_number": ["#internetNo", "input[name='internetNo']"],
        "submit": ["#btnSearch"]
      },
      "valid_days": 180,
      "notes": "써트피아 발급 서류 전용"
    },
    {
      "agency_id": "webminwon",
      "display_name": "웹민원센터 — 진위확인",
      "url": "https://www.webminwon.com/",
      "auth_required": false,
      "input_fields": [
        { "field_key": "doc_confirm_number", "label": "문서확인번호" }
      ],
      "applicable_doc_types": ["졸업증명서_웹민원센터", "성적증명서_웹민원센터"],
      "rpa_selectors": {
        "doc_confirm_number": ["#docConfirmNo"]
      },
      "valid_days": 180,
      "notes": "웹민원센터 발급 서류 전용"
    }
  ]
}
```

### 2.3 PM 셀프서비스 — 기관 추가 방법 (비개발자 가이드)

#### 방법 A: 대시보드 UI에서 직접 추가 (권장)

```
1. 대시보드 좌측 메뉴 → "⚙️ 기관 설정" 클릭
2. "새 기관 추가" 버튼 클릭
3. 아래 항목을 양식에 입력:

   [필수 입력]
   - 기관 ID: 영문+숫자 (예: hoseo_univ_cert)
   - 기관명: 한글 표시명 (예: 호서대학교 — 졸업증명서 진위확인)
   - 진위확인 URL: 복사·붙여넣기 (예: https://cert.hoseo.ac.kr/certi/compare.jsp)
   - 로그인 필요 여부: 예/아니오 선택
   - 적용 서류 유형: 체크박스 선택 (졸업증명서_아이써티 등)
   
   [선택 입력]
   - 입력 필드 정의: + 버튼으로 추가
     예) 필드명: doc_confirm_number, 라벨: 문서확인번호
   - 유효기간: 일 단위 (예: 180)
   - 메모: 특이사항 기록

4. "저장" 클릭 → agency_config.json 자동 업데이트
5. "RPA 테스트" 버튼으로 즉시 동작 확인
```

#### 방법 B: JSON 파일 직접 편집

```
1. 프로젝트 폴더 → config/agency_config.json 파일 열기
2. agencies 배열 끝에 새 항목 추가 (위 §2.2 양식 참조)
3. 파일 저장
4. 앱 재시작 불필요 (hot-reload 적용)
```

#### 방법 C: URL 분석 자동화 (AI 지원)

```
1. 대시보드 → "🔍 URL 자동 분석" 기능 사용
2. 진위확인 사이트 URL 붙여넣기
3. AI가 해당 페이지를 분석하여 입력 필드 자동 탐지
4. 탐지된 셀렉터를 검토 후 "저장" 클릭
   (성공률: ~70%, 실패 시 수동 입력 안내)
```

---

## 3. Gemini OCR 프롬프트 — 서류 유형별 (v1.3 업데이트)

### 3.1 졸업증명서용 프롬프트

```typescript
const GRADUATION_CERT_PROMPT = `
당신은 한국 대학 졸업증명서에서 정보를 추출하는 전문 AI입니다.

첨부된 이미지는 한국 대학교 졸업증명서입니다.
다음 필드를 정확하게 추출하십시오.

## 추출 필드
- doc_confirm_number: 문서확인번호 (형식: XXXX-XXXX-XXXX-XXXX 또는 유사 형식)
  → 문서 상단 또는 하단에 위치. "문서확인번호", "Internet no", "원본파인번호" 등 라벨 탐색
- name: 성명 (한글)
  → "성 명" 또는 "성명" 라벨 옆 값. "성" "명"이 분리된 경우 합쳐서 반환
- birth_date: 생년월일
- school_name: 학교명
- major: 학과/전공
- graduation_date: 졸업일자/졸업년월일
- issue_date: 발급일자
- issuer: 발급기관/발급처

## 발급처 유형 판단 (doc_source)
문서 내용과 하단 문구를 보고 판단:
- "웹민원센터"가 있으면 → "webminwon"
- "써트피아"가 있으면 → "certpia"  
- "아이써티"가 있으면 → "icerts"
- "정부24" 또는 "gov.kr"이 있으면 → "gov24"
- 기타 → "university_direct"

## 주의사항
1. "성 명 : 유용완" 처럼 성/명이 분리된 경우 → name: "유용완" (공백 제거)
2. 문서확인번호가 없는 경우 → doc_confirm_number: null
3. 한자가 섞인 경우 한글로 변환하여 반환

JSON 형식으로만 응답하십시오:
{
  "doc_source": "webminwon",
  "doc_confirm_number": "XD02-B55A-0BB1-74BB",
  "name": "이지호",
  "birth_date": "2001년 03월 04일",
  "school_name": "국민대학교",
  "major": "한국역사학과(문학사)",
  "graduation_date": "2025년 02월 19일",
  "issue_date": "2025년 03월 10일",
  "issuer": "국민대학교 교무처장",
  "confidence_score": 95,
  "doc_category": "졸업증명서"
}
`;
```

### 3.2 자격증용 프롬프트

```typescript
const CERT_PROMPT = `
첨부된 이미지는 한국 국가기술자격증입니다.
다음 필드를 추출하십시오.

## 자격증 유형 판단 (cert_form_type)
- 수첩 형태 (내지번호 있음) → "수첩형"
- A4 상장 형태 → "상장형"
- 작은 카드 형태 → "카드형"
- A4 확인서 (HRDK 로고 + "취득사항 확인서") → "확인서"

## 추출 필드
- cert_form_type: 자격증 형태
- cert_number: 자격번호 (예: 22202132156P)
- cert_name: 자격종목 (예: 사회조사분석사2급)
- name: 성명
- birth_date: 생년월일
- pass_date: 합격 연원일
- issue_date: 발급 연월일
- inner_number: 내지번호 (수첩형만 해당, 없으면 null)
- mgmt_number: 관리번호 (상장형만 해당, 없으면 null)
- doc_confirm_number: 문서확인번호 (확인서만 해당)
- issuer: 발급기관 (예: 한국산업인력공단 이사장)

JSON 형식으로만 응답하십시오.
`;
```

### 3.3 경력사항(4대보험)용 프롬프트

```typescript
const CAREER_PROMPT = `
첨부된 이미지는 4대보험 관련 증명서입니다.
다음을 판단하고 추출하십시오.

## 서류 유형 판단 (doc_subtype)
- "건강보험자격득실확인서" → "health_insurance"
- "국민연금 가입자 가입증명" → "national_pension"
- "산재보험/고용보험 자격이력내역서" → "employment_insurance"
- "4대 사회보험 가입자 가입내역 확인서" → "four_insurance_gov24"

## 추출 필드 (공통)
- doc_subtype: 서류 유형
- issue_number: 발급번호
- issue_date: 발급일자
- name: 성명
- resident_number: 주민등록번호 (마스킹 처리하여 반환: 980104-1*****)

## 경력 이력 배열 (career_records)
각 직장/사업장 정보를 배열로 추출:
[
  {
    "record_no": 1,
    "insurer_type": "직장가입자",
    "company_name": "주식회사 에이디링크연구소",
    "start_date": "2024.07.02",
    "end_date": null
  }
]

JSON 형식으로만 응답하십시오.
`;
```

---

## 4. 서류 유형별 진위확인 매핑 테이블 (v1.3 완성본)

| 서류 유형 | 자동화 가능 | 연동 기관 ID | 핵심 입력 키 | 대체 방법 |
|---|---|---|---|---|
| 졸업증명서_웹민원센터 | ✅ | gov24_doc, webminwon | doc_confirm_number | - |
| 졸업증명서_써트피아 | ✅ | certpia, gov24_doc | doc_confirm_number | - |
| 졸업증명서_정부24 | ✅ | gov24_doc | doc_confirm_number | - |
| 졸업증명서_아이써티 | ⚠️ 부분 | (커스텀 URL) | doc_confirm_number | 학교별 URL 커스텀 설정 |
| 자격증_수첩형 | ✅ | qnet_cert | cert_number, name | - |
| 자격증_상장형 | ✅ | qnet_cert | cert_number, name | - |
| 자격증_확인서 | ✅ | qnet_cert_confirm | doc_confirm_number, name | - |
| 자격증_카드형(대한상공회의소) | ✅ | korcham_cert | cert_number, name | 계정 설정 필요 |
| 자격증_카드형(9개 기관) | ✅ | gov24_doc | doc_confirm_number | - |
| 자격증_수첩형(2001년 이전) | ❌ | - | - | AI 실인 시각 검토 |
| 건강보험자격득실확인서 | ⚠️ | - | - | OCR 대조만 가능 |
| 국민연금 가입증명서 | ⚠️ | - | verify_number | 검증번호 확인 |
| 고용보험 자격이력 | ⚠️ | - | - | OCR 대조만 가능 |
| 4대보험가입내역_정부24 | ✅ | gov24_doc | doc_confirm_number | - |
| 보훈 취업지원대상자 | ✅ | gov24_doc | doc_confirm_number | 보훈청 직접 발급 시 공문 |
| 장애인증명서 | ✅ | gov24_doc | doc_confirm_number | 복지로 조회 불가 |
| 성적증명서_웹민원센터 | ⚠️ | gov24_doc | doc_confirm_number | 교과목 정보 OCR 어려움 |
| 성적증명서_써트피아 | ⚠️ | certpia | doc_confirm_number | 교과목 OCR 어려움 |
| 성적증명서_정부24 | ✅ | gov24_doc | doc_confirm_number | - |
| 수료증_에듀퓨어 | ❌ | - | - | 에듀퓨어 이메일 대량요청 |
| 수료증_윈스팩 | ❌ | - | - | 윈스팩 양식 제출 |
| 직업훈련이력_고용24 | ⚠️ | - | issue_number | OCR 대조만 가능 |
| TOEIC | ✅ | toeic_ybm | issue_number, name | 기업 계정 필요 |
| OPIc | ✅ | opic_actfl | doc_confirm_number | 만료일 자동 확인 |
| 기타 어학 (FLEX, JPT 등) | ❌ | - | - | 해당 기관 개별 문의 |

**범례:** ✅ 완전 자동화 | ⚠️ 부분 자동화(일부 수동 필요) | ❌ 자동화 불가(수동 처리)

---

## 5. REQ-FUNC 업데이트 (v1.3 추가 요구사항)

### F11 — 기관 URL 커스텀 설정 (Must)

| ID | 요구사항 | Priority | AC |
|---|---|---|---|
| **REQ-FUNC-110** | 시스템은 `config/agency_config.json`을 런타임에 hot-load하여, 재시작 없이 새 기관 URL 적용이 가능해야 한다. | Must | Given 새 기관 추가 후 When 앱 재시작 없이 Then 해당 기관 RPA 즉시 실행 가능 |
| **REQ-FUNC-111** | 대시보드 UI에서 비개발자(PM)가 신규 기관을 추가할 수 있는 "기관 설정" 폼 UI를 제공해야 한다. | Must | Given PM이 URL 입력 When 저장 클릭 Then agency_config.json 자동 업데이트 |
| **REQ-FUNC-112** | 기관 설정 저장 시 "RPA 테스트" 버튼으로 해당 URL 접속 및 기본 셀렉터 동작을 즉시 검증할 수 있어야 한다. | Must | Given URL 입력 완료 When 테스트 클릭 Then 성공/실패 결과 10초 이내 반환 |
| **REQ-FUNC-113** | URL 자동 분석 기능: 진위확인 URL 입력 시 AI가 페이지를 분석하여 입력 필드 셀렉터를 자동 제안해야 한다. | Should | Given URL 입력 When 자동 분석 클릭 Then 셀렉터 후보 목록 반환 (성공률 ≥ 70%) |

### F12 — 진위확인 불가 서류 처리 (Must)

| ID | 요구사항 | Priority | AC |
|---|---|---|---|
| **REQ-FUNC-120** | 자동화 불가 서류(에듀퓨어, 윈스팩 등)는 `verification_possible: false` 플래그로 처리하고, 대시보드에 대체 처리 가이드를 표시해야 한다. | Must | Given 에듀퓨어 수료증 업로드 When 자동화 판단 Then "이메일 대량요청 필요" 안내 표시 |
| **REQ-FUNC-121** | 서류 유효기간이 경과한 경우(OPIc 만료, 90일 초과 확인서 등) 자동으로 `FAIL` 판정하고 만료 사유를 명시해야 한다. | Must | Given OPIc 만료일 2025/06/18, 검증일 2026/01/01 When 검증 실행 Then `FAIL: 성적 만료` 반환 |
| **REQ-FUNC-122** | 2001년 이전 수첩형 자격증은 Gemini Vision으로 실인·인장 날인 존재 여부를 시각 검토하고 결과를 반환해야 한다. | Should | Given 1999년 발급 수첩형 자격증 When 검증 Then `MANUAL_REVIEW: 인터넷 발급 이전 자격증 — 실인 확인 필요` |

### F13 — 서류 유형별 OCR 스키마 적용 (Must)

| ID | 요구사항 | Priority | AC |
|---|---|---|---|
| **REQ-FUNC-130** | Gemini OCR 프롬프트는 `doc_category`에 따라 서류 유형별 전용 프롬프트를 적용해야 한다. (졸업증명서/자격증/경력/어학 4종 이상) | Must | Given 자격증 이미지 When OCR 실행 Then `cert_number`, `cert_name`, `cert_form_type` 포함 JSON 반환 |
| **REQ-FUNC-131** | 졸업증명서 OCR 시 `doc_source`(발급처 유형: webminwon/certpia/gov24/icerts 등)를 자동 판별해야 한다. | Must | Given 써트피아 졸업증명서 When OCR Then `doc_source: "certpia"` 반환, certpia 진위확인 URL 자동 선택 |
| **REQ-FUNC-132** | 경력사항 4대보험 서류는 `career_records` 배열로 다중 이력을 추출하고, 지원서 기재 경력과 날짜·기업명을 1:N 대조해야 한다. | Must | Given 건강보험자격득실확인서 When Layer1 대조 Then 지원서 기재 회사명·기간 vs 보험 이력 매칭 결과 반환 |

---

## 6. 비개발자 PM을 위한 설정 가이드 (v1.3 신규)

### 6.1 새 대학 졸업증명서 진위확인 사이트 추가하는 법

> 상황: 특정 대학이 자체 진위확인 사이트를 운영 중이고, 지원자가 해당 사이트에서 발급한 졸업증명서를 제출함

```
Step 1. 해당 사이트 URL 확인
  → 예: https://cert.hoseo.ac.kr/certi/compare.jsp

Step 2. 대시보드 → 기관 설정 → 새 기관 추가

Step 3. 양식 작성:
  기관 ID:    hoseo_univ_cert
  기관명:     호서대학교 졸업증명서 진위확인
  URL:        https://cert.hoseo.ac.kr/certi/compare.jsp
  로그인 필요: 아니오
  
Step 4. 입력 필드 추가 (+ 버튼):
  필드 1: doc_confirm_number / 문서확인번호

Step 5. 적용 서류 유형: "졸업증명서_아이써티" 체크

Step 6. "RPA 테스트" → 해당 URL 접속 확인

Step 7. 저장 → 즉시 적용
```

### 6.2 진위확인 불가 서류 수동 처리 가이드

#### 에듀퓨어 수료증 처리

```
1. 대시보드에서 에듀퓨어 수료증 목록 확인 → "대량 엑셀 다운로드"
2. 다운로드된 엑셀:
   [번호] [성명] [생년월일] [발급번호] [발급일]
3. 에듀퓨어 담당자 이메일(edupure@...co.kr)에 엑셀 첨부 발송
4. 회신받은 진위확인 결과를 대시보드 "수동 업로드"로 입력
5. 자동으로 final_result 업데이트됨
```

#### 윈스팩 수료증 처리

```
1. 대시보드 → "윈스팩 진위확인 양식 생성" 버튼
2. 진위신청 대상자 명단 + 진위요청 직업교육 리스트 엑셀 자동 생성
3. 윈스팩 담당자에게 이메일 발송
4. 회신 결과 수동 입력
```

### 6.3 TOEIC 계정 설정 방법

```
1. 대시보드 → 계정 설정 → TOEIC(YBM) 항목
2. ID: (YBM 기업 회원 ID 입력)
3. PW: (비밀번호 입력) → AES-256 암호화 저장됨
4. "연결 테스트" 버튼으로 로그인 확인
5. 이후 TOEIC 서류 자동 조회 가능
```

---

## 7. 기술 스택 (v1.3 유지)

```
Frontend:   Next.js 14 (App Router), Tailwind CSS, shadcn/ui
Backend:    Next.js Server Actions, Route Handlers
Database:   SQLite (Prisma) — 로컬 전용
File:       로컬 File System (fs)
AI:         Google Gemini 1.5 Pro Vision (Vercel AI SDK)
RPA:        Puppeteer + puppeteer-extra-plugin-stealth
Config:     config/agency_config.json (hot-load)
Excel:      exceljs
Image:      sharp (변환, 회전 보정)
Email:      Resend API
Crypto:     Node.js crypto (AES-256-GCM)
Scheduler:  node-cron (헬스체크)
```

---

*Document Version: SRS v1.3 | 기반: SRS v1.2 + 제출서류 유형 PDF v0.2 | 작성: 2026-05-12*
