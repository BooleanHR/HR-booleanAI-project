import type { Verification, User, Discrepancy, Applicant, Notification } from '@/types';

export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'test_admin@hrboolean.ai', role: 'ADMIN', password: 'Admin123!' },
  { id: '2', name: 'Operator User', email: 'test_operator@hrboolean.ai', role: 'OPERATOR', password: 'Oper123!' },
]

export const applicants: Applicant[] = [
    { id: '1', name: '김민준', examNumber: '2026-0001' },
    { id: '2', name: '이서연', examNumber: '2026-0002' },
    { id: '3', name: '박재원', examNumber: '2026-0003' },
    { id: '4', name: '최유진', examNumber: '2026-0004' },
    { id: '5', name: '정하윤', examNumber: '2026-0005' },
    { id: '6', name: '강희찬', examNumber: '2026-0006' },
];

export const verificationDiscrepancies: Record<string, Discrepancy[]> = {
  '3': [
    { item: '성명', claimValue: '박재원', ocrValue: '박재원', dbValue: '박재원', match: true },
    { item: 'TOEIC 점수', claimValue: '950', ocrValue: '950', dbValue: '950', match: true },
    { item: '발급번호', claimValue: '12345-67890', ocrValue: '12345-67890', dbValue: '12345-ABCDE', match: false },
    { item: '시험일자', claimValue: '2024-02-18', ocrValue: '2024-02-18', dbValue: '2024-02-18', match: true },
  ],
  '6': [
    { item: '성명', claimValue: '강희찬', ocrValue: '강희찬', dbValue: '강희찬', match: true },
    { item: '발급번호', claimValue: '2024-CE-00457', ocrValue: '2024-CE-00456', dbValue: '2024-CE-00457', match: false },
    { item: '발급일자', claimValue: '2024.05.20', ocrValue: '2024.05.20', dbValue: '2024.05.20', match: true },
  ]
};

export const verifications: Verification[] = [
  { id: '1', examNumber: '2026-0001', applicantName: '김민준', documentType: '졸업증명서', fileName: '김민준_졸업증명서.pdf', confidence: 94, verificationMethod: '문서확인번호', finalResult: '완료', status: 'PASS', reviewDate: '2026-04-22 09:12', discrepancies: [
    { item: '성명', claimValue: '김민준', ocrValue: '김민준', dbValue: '김민준', match: true },
    { item: '학교명', claimValue: '한국대학교', ocrValue: '한국대학교', dbValue: '한국대학교', match: true },
    { item: '학위', claimValue: '공학사', ocrValue: '공학사', dbValue: '공학사', match: true },
  ]},
  { id: '2', examNumber: '2026-0002', applicantName: '이서연', documentType: '자격증', fileName: '이서연_정보처리기사.jpg', confidence: 88, verificationMethod: '자격번호', finalResult: '완료', status: 'PASS', reviewDate: '2026-04-22 09:45', discrepancies: [
     { item: '성명', claimValue: '이서연', ocrValue: '이서연', dbValue: '이서연', match: true },
     { item: '자격명', claimValue: '정보처리기사', ocrValue: '정보처리기사', dbValue: '정보처리기사', match: true },
  ]},
  { id: '3', examNumber: '2026-0003', applicantName: '박재원', documentType: '어학성적표', fileName: '박재원_토익.pdf', confidence: 91, verificationMethod: '문서확인번호', finalResult: '확인필요', status: 'FAIL', reviewDate: '2026-04-22 10:03', discrepancies: verificationDiscrepancies['3'] },
  { id: '4', examNumber: '2026-0004', applicantName: '최유진', documentType: '졸업증명서', fileName: '최유진_졸업.png', confidence: 62, verificationMethod: '—', finalResult: '확인필요', status: 'MANUAL_REVIEW', reviewDate: null, manualReviewReason: 'OCR 신뢰도 70% 미만', registrationDate: '2026-04-22 10:15' },
  { id: '5', examNumber: '2026-0005', applicantName: '정하윤', documentType: '자격증', fileName: '정하윤_SQLD.pdf', confidence: 96, verificationMethod: '자격번호', finalResult: '완료', status: 'PASS', reviewDate: '2026-04-22 10:30', discrepancies: [
    { item: '성명', claimValue: '정하윤', ocrValue: '정하윤', dbValue: '정하윤', match: true },
  ]},
  { id: '6', examNumber: '2026-0006', applicantName: '강희찬', documentType: '경력증명서', fileName: '강희찬_경력증명서_테크.pdf', confidence: 85, verificationMethod: '내용일치', finalResult: '확인필요', status: 'FAIL', reviewDate: '2026-04-22 11:00', discrepancies: verificationDiscrepancies['6'] },
];

export const applicantsWithFailures = verifications
  .filter(v => v.finalResult === '확인필요')
  .map(v => ({
    id: v.id,
    name: v.applicantName,
    docType: v.documentType,
    discrepancyItem: v.discrepancies?.find(d => !d.match)?.item || '확인 필요',
  }));

export const notifications: Notification[] = verifications
  .filter(v => v.status === 'FAIL')
  .map((v, index) => ({
    id: `notif-${v.id}`,
    applicantName: v.applicantName,
    email: `applicant${index+1}@email.com`,
    documentType: v.documentType,
    discrepancyItem: v.discrepancies?.find(d => !d.match)?.item || '항목 불일치',
    status: (index % 3 === 0 && index > 0) ? 'SENT' : (index === 5 ? 'FAILED' : 'DRAFT'),
  }));
