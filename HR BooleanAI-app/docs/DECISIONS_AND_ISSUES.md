# 📝 HR AI 서류 진위확인 솔루션 — 의사결정 및 이슈 관리 (DECISIONS_AND_ISSUES.md)

이 문서는 2026-05-27 `/grill-me` 세션을 통해 도출된 핵심 의사결정 사항 및 각 이슈의 히스토리를 관리하기 위한 문서입니다. 이 결정 사항들은 향후 Next.js 14 App Router 구현의 기준점이 됩니다.

---

## 📌 1. 핵심 의사결정 사항 (2026-05-27 확정)

| ID | 영역 | 의사결정 사항 (Decision) | 상세 내용 및 배경 |
|---|---|---|---|
| **D-01** | **아키텍처** | **Next.js 14 App Router 클린 스타트** | 기존 단일 HTML 프로토타입(v0.9.x)은 단순 레퍼런스 및 데모용으로 유지(코드 수정 금지). 신규 기능 및 대시보드는 Next.js 기반으로 새로 구현함. |
| **D-02** | **인증 (Auth)** | **개발 단계 하드코딩 계정 우선 적용** | MVP 검증 속도를 위해 Supabase Auth 대신 하드코딩된 두 개의 계정(Admin/Operator) 세션/쿠키 기반으로 시작. MVP 이후 단계에서 정식 인증 교체 예정. |
| **D-03** | **데이터베이스** | **로컬 SQLite (Prisma) 전용 사용** | Supabase Postgres 및 Storage 연동을 배제하고, SQLite 로컬 파일 기반 DB 및 로컬 File System을 활용하여 로컬 퍼스트 아키텍처 구현. |
| **D-04** | **RPA 실행 환경** | **Server Action에서 Puppeteer 직접 실행** | 별도의 백그라운드 Worker 서비스 없이 Next.js Server Action 내에서 Puppeteer(stealth plugin 적용)를 동기/비동기식으로 직접 호출 및 캡처 수행. |
| **D-05** | **입사지원서 입력** | **엑셀/CSV 업로드 + OCR 파싱 이중 지원** | 채용 플랫폼에서 다운로드한 지원서 엑셀/CSV 파일을 배치 단위로 업로드하는 방식과, 제출된 증빙서류 이미지에서 OCR로 지원자 정보를 파싱하는 하이브리드 방식 채택. |
| **D-06** | **기관 설정 UI** | `/settings/agencies` **독립 페이지 구현** | 비개발자 PM이 진위확인 대상 기관 및 셀렉터를 설정할 수 있도록 사이드바에 독립된 `/settings/agencies` 페이지를 제공하고, JSON hot-load와 연동. |
| **D-07** | **ESCALATE 처리** | **대시보드 카운터 + 수동검토 큐 분리** | AI Reviewer가 애매하다고 판단(ESCALATE)한 건은 대시보드 배너 및 전용 필터에 수치로 표기하고, 최종 승인/반려 결과는 통합 폴더에 합산 저장. |
| **D-08** | **권한 관리 (RBAC)** | **Operator (1차 수행) vs Admin (최종 승인)** | Operator는 검증 시작 및 1차 확인(권고)만 가능하며, Admin만이 최종 승인/반려, 에스컬레이션 처리, 기관 설정, 배치 삭제 권한을 가짐. |
| **D-09** | **알림/재제출** | **이메일(Resend API) 발송 및 실제 동작** | 지원자의 이메일로 불일치 사유 및 72시간 유효한 재제출 링크(`https://verify.hrboolean.ai/resubmit/{tokenId}`)를 실제 전송할 수 있도록 Resend API 적용. |

---

## 🛠️ 2. 태스크 및 설계 영향성 (Impact)

### 2.1 연기 및 제외되는 태스크
인증 및 데이터베이스 간소화 결정에 따라, 기존 `tasks/` 폴더 내의 아래 태스크들은 **Phase 2 (추후 적용)**로 분류하여 연기 처리합니다.
- `[E-AUTH]_FR-034_supabase-auth-setup_v0_1.md` (Supabase Auth 설정)
- `[E-AUTH]_FR-035_nextjs-middleware-rbac_v0_1.md` (Supabase Middleware RBAC)
- `[E-AUTH]_FR-036_supabase-rls-policies_v0_1.md` (Supabase RLS 규칙)
- `[E-FILE]_FR-043_supabase-storage-upload_v0_1.md` (Supabase Storage 업로드 - 로컬 저장소로 대체)

### 2.2 신규 추가 예정 태스크 (SRS v1.3 §6 & §9 반영)
- `RY-001` ~ `RY-007` 에 해당하는 신규 태스크 생성 및 구체화 (기관 설정 hot-load, PM 설정 UI, Gemini DOM 분석, 진위확인 불가 서류 엑셀 생성, 서류 유효기간 판정, OCR 프롬프트 분기, 경력 매칭 등).

---

## 📅 3. 변경 이력 (History)
- **2026-05-27**: `/grill-me` 인터뷰 세션을 기반으로 최초 작성 (작성자: Antigravity)
