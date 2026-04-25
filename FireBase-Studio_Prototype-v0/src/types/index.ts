export type VerificationStatus = 'PASS' | 'FAIL' | 'MANUAL_REVIEW' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type FinalResult = '완료' | '확인필요';
export type VerificationMethod = '문서확인번호' | '자격번호' | '내용일치' | '—';
export type DocumentType = '졸업증명서' | '자격증' | '경력증명서' | '성적증명서' | '기타';
export type UserRole = 'ADMIN' | 'OPERATOR';
export type NotificationStatus = 'DRAFT' | 'SENT' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only for mock data
}

export interface Verification {
  id:string;
  examNumber: string;
  applicantName: string;
  documentType: DocumentType;
  fileName: string;
  status: VerificationStatus;
  confidence: number | null;
  finalResult: FinalResult;
  verificationMethod: VerificationMethod;
  reviewDate: string | null;
  manualReviewReason?: string;
  registrationDate?: string;
  discrepancies?: Discrepancy[];
}

export interface Discrepancy {
  item: string;
  claimValue?: string;
  ocrValue: string;
  dbValue: string;
  match: boolean;
}

export interface Applicant {
  id: string;
  name: string;
  examNumber: string | null;
}

export interface Notification {
    id: string;
    applicantName: string;
    email: string;
    documentType: DocumentType;
    discrepancyItem: string;
    status: NotificationStatus;
}
