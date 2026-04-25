# HR AI Verification - Firebase Studio UI Prototype Prompt

아래 내용을 복사하여 Firebase Studio (또는 v0, Lovable 등 다른 AI UI 제너레이터)에 입력하세요.

---

## 🎯 System Role & Objective
You are an expert Frontend Developer and UI/UX Designer.
Please generate a fully functional React (Next.js/Tailwind CSS/shadcn ui) prototype for the **"HR AI Verification Solution"**.
This is a Local-First B2B HR Dashboard used by HR administrators to automatically verify thousands of applicant documents (degrees, certificates, etc.) using OCR, Vision LLM, and Local RPA.
The prototype must look premium, modern, and highly professional, utilizing a clean layout, subtle micro-animations, and a cohesive color palette (slate/indigo/blue).

## 🔑 Authentication (Test Login)
Since this is a prototype, bypass actual backend authentication and use a hardcoded state-based login.
Provide a Login Page as the first screen.
**Hardcoded Credentials:**
- ADMIN Account: `test_admin@hrboolean.ai` / `Admin123!`
- OPERATOR Account: `test_operator@hrboolean.ai` / `Oper123!`
*If the user inputs these credentials, simulate a successful login and navigate to the Dashboard. Otherwise, show an error message.*

## 📱 Core Screens to Implement

### 1. Login Page
- Professional, trustworthy B2B SaaS design.
- Email and Password inputs.
- Login button.

### 2. Main Dashboard (After Login)
- **Top Navigation:** App Logo, User Profile (Role: Admin/Operator), "Logout" button.
- **Top Action Bar:** 
  - "📂 채용공고 폴더 경로 입력 (Job Posting Folder Scan)" input field and a "Scan" button. 
  - "⚙️ 사이트 계정 설정 (TOEIC 등)" button. Opens a modal to input ID/PW for sites that require login for verification.

### 2-1. Folder Scan Result Modal & Tree View (Crucial Feature)
- When the user clicks the "Scan" button for the Job Posting Folder, open a **Folder Structure Modal** or a side panel.
- **Tree View Content:** Must visually render a mock directory tree:
  - 📁 `C:\JobPostings\2026_상반기_공채`
    - 📁 `1001_홍길동` (Applicant Folder)
      - 📁 `1. 입사지원서` -> 📄 `이력서.pdf`
      - 📁 `2. 자격증` -> 📄 `정보처리기사.jpg`
      - 📁 `3. 경력증명서` -> 📄 `건강보험자격득실.pdf`
      - 📁 `4. 어학사항` -> 📄 `토익성적표.jpg`
    - 📁 `1002_김철수` ...
- Include a "Start Verification (검증 시작)" button at the bottom of this tree view, which updates the main Data Table.
- **Statistics Cards (Top Row):**
  - 총 검증 서류 (Total): 1,245건
  - 검증 완료 (Completed): 1,130건
  - 확인 필요 (Needs Review): 115건
  - 저화질/수동 검토 큐 (Manual Queue): 12건
- **Tab Navigation:** "전체 보기 (All)" / "확인 필요 (Failures)" / "수동 리뷰 큐 (Manual Review)"
- **Data Table (Verification Results):**
  - Columns: 수험번호(Exam Number), 지원자명(Name), 서류종류(Doc Type), 파일명(File Name), 신뢰도(Confidence), 확인방법(Method), 검증결과(Final Result), 액션(Action).
  - Include 5-6 rows of mock data representing different statuses.
  - Final Result should be badge styles: "완료" (Green/Success) or "확인필요" (Red/Warning).
  - Action column should have a "상세 보기 (Detail)" button.
- **Export Action Bar (Bottom/Top Right):**
  - "📥 엑셀 결과 다운로드" button.
  - "📄 감사 PDF 리포트 다운로드" button.

### 2-1. Multi-Page Reorder & Split Modal
- Triggered when a user clicks a "페이지 순서 변경/분리" button on a multi-page document.
- Shows thumbnails of a multi-page PDF/Image.
- Allows user to drag and drop to reorder the pages, or select specific pages to 'Split/Extract' before verification.

### 3. Verification Detail View (Modal or Separate Page)
- Triggered by clicking "상세 보기" on a "확인필요 (Needs Review)" row.
- **Top Section: Parallel Capture Viewer (병렬 캡처 이미지 뷰어)**
  - A side-by-side image viewer showing the submitted document and the agency result.
  - **Left Image:** "지원자 제출 원본 서류 (Original Submitted Document)"
  - **Right Image:** "기관조회 로컬 RPA 캡처 (Agency RPA Capture)"
  - Add zooming/panning controls for the images.
- **Bottom Section: Triple Check Data Table & AI Assessment**
  - **Data Comparison Table:** Columns for [항목(Field), 1.입사지원서 기재내용(Resume Claim), 증빙서류 OCR 추출(Document OCR), 기관 조회 결과(Agency API)]. Highlight discrepancies in red text or with warning icons.
  - **Vision LLM AI Assessment Panel:** A section below the table showing the AI's cross-check reasoning (e.g., "입사지원서의 토익 점수와 실제 어학성적표의 점수는 일치하나, 기관 조회 화면의 발급번호가 다릅니다.").
- **Action Buttons (Bottom):** 
  - "✅ 승인 (Approve & 로컬 '5. 진위확인결과' 폴더에 저장)" - clicking this simulates saving the verification report into the applicant's local folder.
  - "❌ 반려 (Reject)" - clicking this opens a prompt to input reject reason.

### 4. Notification Management Modal
- A button on the Dashboard "불일치 알림 발송 (Send Notifications)" opens this modal.
- Shows a list of applicants with "확인필요" status.
- Checkboxes to select specific applicants.
- **Preview Panel:** Shows the generated email content: "[서류명]의 [불일치 항목]이 일치하지 않습니다. 정부24에서 재발급받아 제출해주세요."
- "선택 발송 (Send Selected)" button.

## 🎨 Design System & Constraints
- **Framework:** React, Tailwind CSS. Use `lucide-react` for icons.
- **Components:** Emulate `shadcn/ui` components (Card, Button, Input, Table, Badge, Dialog/Modal, Tabs).
- **Aesthetics:** Use a white/slate-50 background, with borders in slate-200. Primary brand color is Indigo-600. Add subtle hover states (`hover:bg-slate-100`) and transitions.
- **State Management:** Use React `useState` to make the prototype fully interactive (Login -> Dashboard -> Open Detail Modal -> Approve/Reject -> Update Table Status).
- **Language:** UI text must be in Korean (한국어).

## 🚀 Execution Instructions
Generate the complete, single-file React component code that encapsulates all these screens and logic. Make sure it renders perfectly without any missing imports.
