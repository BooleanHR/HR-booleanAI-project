/**
 * 서류 유효기간 판정 엔진
 * 각 서류 유형별 유효기간 기준:
 * - OPIc: 발급일로부터 730일 (2년)
 * - TOEIC Speaking: 발급일로부터 730일 (2년)
 * - TOEIC: 발급일로부터 730일 (2년)
 * - Q-Net 자격증: 발급일로부터 영구 (단, 갱신 필요 자격증은 90일 이내 갱신서류 필요)
 * - 정부24 졸업증명서: 발급일로부터 180일
 * - 건강보험득실확인서 (4대보험): 발급일로부터 90일
 * - 재직증명서: 발급일로부터 90일
 */

export interface ExpiryCheckResult {
  isValid: boolean;
  isExpired: boolean;
  expiryDate: Date | null;
  daysRemaining: number | null;
  documentType: string;
  message: string;
}

// 유효기간 기준 (일수, null = 영구)
const EXPIRY_DAYS_MAP: Record<string, number | null> = {
  OPIC: 730,
  TOEIC_SPEAKING: 730,
  TOEIC: 730,
  QNET_RENEWABLE: 90,    // 갱신 필요 자격증
  QNET_PERMANENT: null,  // 영구 자격증
  GRADUATION: 180,       // 정부24 졸업증명서
  INSURANCE_4: 90,       // 4대보험 득실확인서
  CAREER_CERT: 90,       // 재직증명서
  LANGUAGE_ETC: 730,     // 기타 어학 성적
};

/**
 * 발급일 기준으로 서류 유효기간을 판정합니다.
 * @param issuedAt 서류 발급일
 * @param documentType 서류 유형 코드 (EXPIRY_DAYS_MAP 키)
 * @param referenceDate 판정 기준일 (기본값: 현재 날짜)
 */
export function checkExpiry(
  issuedAt: Date | string,
  documentType: string,
  referenceDate?: Date
): ExpiryCheckResult {
  const issued = new Date(issuedAt);
  const reference = referenceDate ?? new Date();
  const expiryDays = EXPIRY_DAYS_MAP[documentType];

  if (isNaN(issued.getTime())) {
    return {
      isValid: false,
      isExpired: false,
      expiryDate: null,
      daysRemaining: null,
      documentType,
      message: '발급일을 파싱할 수 없습니다.',
    };
  }

  // 영구 유효 서류
  if (expiryDays === null) {
    return {
      isValid: true,
      isExpired: false,
      expiryDate: null,
      daysRemaining: null,
      documentType,
      message: '영구 유효 자격증입니다.',
    };
  }

  const expiryDate = new Date(issued);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  const diffMs = expiryDate.getTime() - reference.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining <= 0;

  let message: string;
  if (isExpired) {
    message = `유효기간이 만료되었습니다. (만료일: ${expiryDate.toLocaleDateString('ko-KR')}, ${Math.abs(daysRemaining)}일 초과)`;
  } else if (daysRemaining <= 30) {
    message = `유효기간이 ${daysRemaining}일 남았습니다. (곧 만료 예정)`;
  } else {
    message = `유효기간 내 서류입니다. (만료일: ${expiryDate.toLocaleDateString('ko-KR')}, ${daysRemaining}일 남음)`;
  }

  return {
    isValid: !isExpired,
    isExpired,
    expiryDate,
    daysRemaining,
    documentType,
    message,
  };
}

/**
 * 여러 서류의 유효기간을 일괄 판정합니다.
 */
export function checkExpiryBatch(
  documents: Array<{ issuedAt: Date | string; documentType: string }>,
  referenceDate?: Date
): ExpiryCheckResult[] {
  return documents.map((doc) =>
    checkExpiry(doc.issuedAt, doc.documentType, referenceDate)
  );
}

/**
 * 서류 유형명(한국어)을 반환합니다.
 */
export function getDocumentTypeName(documentType: string): string {
  const names: Record<string, string> = {
    OPIC: 'OPIc 성적표',
    TOEIC_SPEAKING: 'TOEIC Speaking 성적표',
    TOEIC: 'TOEIC 성적표',
    QNET_RENEWABLE: '갱신 자격증 (Q-Net)',
    QNET_PERMANENT: '영구 자격증 (Q-Net)',
    GRADUATION: '졸업(학위)증명서',
    INSURANCE_4: '건강보험 득실확인서 (4대보험)',
    CAREER_CERT: '재직증명서',
    LANGUAGE_ETC: '기타 어학 성적표',
  };
  return names[documentType] ?? documentType;
}
