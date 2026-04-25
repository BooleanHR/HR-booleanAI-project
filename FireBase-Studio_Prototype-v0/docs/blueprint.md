# **App Name**: HR BooleanAI

## Core Features:

- AI-Powered Document Verification: Utilize Gemini Vision OCR to scan and extract data from uploaded HR documents, automatically comparing it for authenticity and consistency with reference information or databases.
- Dynamic Verification Dashboard: Provide a comprehensive dashboard with real-time statistics, status breakdowns (PASS, FAIL, MANUAL_REVIEW, PENDING), filtering options, and a detailed table of all verification results.
- Detailed Verification Review: Enable administrators to inspect individual verification cases, displaying OCR-extracted values against reference database responses and clearly highlighting any discrepancies.
- Admin Decision Workflow: Allow administrators to approve or reject verification results, particularly for 'MANUAL_REVIEW' cases, providing options to add custom reasons or comments which are stored.
- Applicant Discrepancy Notification Tool: Generate and manage customizable email notifications for applicants regarding verification discrepancies, using AI as a tool to draft initial message content based on identified issues.
- Comprehensive Reporting & Export: Facilitate the generation and download of detailed audit logs and statistical reports (PDF and Excel) from the stored verification data.
- Secure Multi-Role User Access: Implement robust user authentication and session management with distinct role-based access control for OPERATOR, ADMIN, and AUDITOR functionalities.

## Style Guidelines:

- Color Scheme: Primarily light mode, with dark mode toggle support. Emphasis on professionalism and clarity, with status colors for quick recognition.
- Primary brand color: Deep Indigo (#4F46E5) to convey trust and reliability. This specific color is from the user's explicit request.
- Background color: A very light, desaturated blue-purple (#EAECEE), visibly of the same hue as the primary but subtle enough to provide a clean canvas in a light scheme.
- Accent color: A bright sky blue (#6ECFF6), chosen as an analogous hue to the primary but with significantly different saturation and brightness for visual contrast.
- Body and headline fonts: 'Pretendard' for Korean text and 'Inter' for English text, both sans-serif, to ensure clear readability and a modern aesthetic. Note: currently only Google Fonts are supported.
- Utilize a clean and modern iconography set (e.g., Lucide or Feather icons style) compatible with shadcn/ui to convey functionality clearly across the system, such as upload (cloud/document icons) and data status.
- Layout features a prominent left-side navigation with content areas structured using `shadcn/ui` style cards, tables, and dialogs. Login and upload pages employ central card layouts, optimized for a desktop-first experience (min 1024px width).
- Incorporate subtle animations for loading states using Skeleton UI for tables and loading spinners for process indicators. Toast notifications provide concise visual feedback for successful operations, errors, or alerts.