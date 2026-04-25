# HR AI Verification - Figma UI Prototype Prompt

아래 내용을 복사하여 Figma의 AI UI 생성 기능이나 플러그인에 입력하세요.

---

## 🎨 Design System & Style Guidelines (공통)
- **Style:** Modern B2B SaaS Dashboard, clean, highly professional, highly usable.
- **Theme:** shadcn/ui component style (minimalist). Light mode with slate-50 background.
- **Color Palette:** Primary Brand Color is Indigo-600. Borders in slate-200.
- **Typography:** Pretendard or Inter.
- **Layout:** Responsive desktop-first dashboard.

---

## 🚀 [전체 화면 통합 프롬프트]
*한 번에 전체 흐름을 생성할 때 사용하세요. (영문으로 입력하는 것이 AI 인식률이 더 높습니다.)*

**Prompt:**
```text
Generate a multi-screen B2B SaaS dashboard for an "HR AI Verification Solution". The design should follow a minimalist, modern shadcn/ui style using an Indigo and Slate color palette. Include the following 5 screens/modals, with UI text in Korean:

1. Login Page: Professional B2B SaaS login with Email, Password inputs, and a Login button.
2. Main Dashboard: Top navigation with Logo, User Profile, and Logout. A top action bar with a "Job Posting Folder Scan" input field and "Scan" button, plus a "Site Account Settings" button.
3. Folder Scan Result & Data Table (Main View): A left sidebar showing a directory tree view of applicant folders (e.g., C:\JobPostings\2026_Recruit\Applicant). The main content area has 4 statistics cards (Total, Completed, Needs Review, Manual Queue). Below the cards, a data table showing Verification Results with columns: Exam Number, Name, Doc Type, File Name, Confidence, Method, Final Result (Status Badge: Success/Warning), and an Action button (Detail). Include top-right export buttons for Excel and PDF.
4. Verification Detail Modal: A split-screen modal. The top half is a Parallel Capture Image Viewer (left: Original Document, right: Agency API Capture) with zoom controls. The bottom half is a Data Comparison Table comparing Resume Claim, Document OCR, and Agency API. Below the table, an "AI Assessment Panel" with text reasoning. Bottom sticky action bar with "Approve" (Green) and "Reject" (Red) buttons.
5. Notification Management Modal: A modal showing a list of applicants needing review with checkboxes. A preview panel showing a template email text for discrepancies. A "Send Selected" primary action button.
```

---

## 📱 [화면별 세부 프롬프트] 
*Figma AI가 한 번에 복잡한 화면을 그리기 어려워할 경우, 화면 단위로 나누어 프롬프트를 입력하는 것을 권장합니다.*

### 1. Main Dashboard & Data Table
**Prompt:**
```text
Generate a B2B SaaS Dashboard screen for HR document verification in a clean, shadcn/ui style (Indigo/Slate). UI text must be in Korean.
- Top Nav: Logo, User Profile, Settings.
- Header Actions: An input for "Folder Path (폴더 경로)" with a "Scan (스캔)" button. An "Export Excel (엑셀 다운로드)" and "Export PDF" button.
- Left Panel: A file directory tree showing "Applicant Folders" and "Documents" inside them.
- Top Metrics: 4 summary cards: 총 검증 서류 (1,245), 검증 완료 (1,130), 확인 필요 (115), 수동 리뷰 (12).
- Main Content: A data table with columns: 수험번호(Exam Number), 지원자명(Name), 서류종류(Doc Type), 파일명(File Name), 신뢰도(Confidence), 확인방법(Method), 검증결과(Badge), 액션(Action). Fill with 5 rows of mock data in Korean.
```

### 2. Verification Detail View (Split Screen)
**Prompt:**
```text
Generate a detail view for document verification in a modern B2B SaaS style. UI text must be in Korean.
- Top Section (Side-by-side images): Left image titled "지원자 제출 원본 서류 (Original)", Right image titled "기관조회 RPA 캡처 (Agency Capture)".
- Bottom Section (Table & AI): A 3-column comparison table: [항목(Field), 입사지원서(Resume), 기관결과(Agency)]. Highlight discrepancies in red text or warning icons. 
- AI Panel: A text box titled "Vision LLM Assessment (AI 종합 검토)" showing discrepancy reasoning.
- Footer: "승인 (Approve)" and "반려 (Reject)" buttons.
```

### 3. Notification & Export Modal
**Prompt:**
```text
Generate a modal window for sending discrepancy notifications in a B2B SaaS style. UI text must be in Korean.
- List: Checkbox list of applicants with "확인필요 (Needs Review)" status.
- Preview Box: A text area showing the email template: "[서류명]의 [불일치 항목]이 일치하지 않습니다. 정부24에서 재발급받아 제출해주세요."
- Bottom: "선택 발송 (Send Selected)" button.
```
