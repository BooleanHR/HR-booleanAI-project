/**
 * 경력사항 1:N 매칭 알고리즘
 * 4대보험 가입 이력 vs 지원서 기재 경력 대조
 * - 회사명 유사도: Jaro-Winkler >= 0.85
 * - 재직기간 겹침(Overlap) 계산
 */

export interface CareerRecord {
  companyName: string;
  startDate: Date | string; // 입사일
  endDate: Date | string | null; // 퇴사일 (null = 재직 중)
  position?: string;
  department?: string;
}

export interface InsuranceRecord {
  companyName: string;
  acquisitionDate: Date | string; // 취득일
  lossDate: Date | string | null; // 상실일 (null = 현재)
  insuredType?: string; // 건강/고용/국민/산재
}

export interface MatchResult {
  careerRecord: CareerRecord;
  matchedInsurance: InsuranceRecord | null;
  similarity: number;
  overlapDays: number;
  overlapRatio: number; // 경력 기간 대비 겹침 비율
  verdict: 'MATCH' | 'PARTIAL' | 'MISMATCH';
  reason: string;
}

// ─────────────────────────────────────────────
// Jaro-Winkler 유사도 계산
// ─────────────────────────────────────────────

function jaro(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const matchDist = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (
    matches / len1 +
    matches / len2 +
    (matches - transpositions / 2) / matches
  ) / 3;
}

function jaroWinkler(s1: string, s2: string, p = 0.1): number {
  const jaroSim = jaro(s1, s2);
  let prefixLen = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefixLen++;
    else break;
  }
  return jaroSim + prefixLen * p * (1 - jaroSim);
}

/**
 * 회사명을 정규화합니다 (주식회사, (주), Inc 등 제거, 공백 제거, 소문자화)
 */
function normalizeCompanyName(name: string): string {
  return name
    .replace(/\(주\)|\(유\)|\(합\)|\(사\)/g, '')
    .replace(/주식회사|유한회사|합자회사|사단법인|재단법인/g, '')
    .replace(/Co\.,?\s*Ltd\.?|Inc\.?|Corp\.?|LLC/gi, '')
    .replace(/[^\w가-힣]/g, '')
    .toLowerCase()
    .trim();
}

// ─────────────────────────────────────────────
// 기간 겹침(Overlap) 계산
// ─────────────────────────────────────────────

function toDate(d: Date | string | null): Date | null {
  if (d === null) return null;
  return new Date(d);
}

function calcOverlapDays(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): number {
  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
  if (overlapEnd < overlapStart) return 0;
  return Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────
// 경력 1:N 매칭 메인 함수
// ─────────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.85;
const PARTIAL_THRESHOLD = 0.70;

/**
 * 지원서 기재 경력 하나를 4대보험 이력 목록과 매칭합니다.
 */
export function matchCareerToInsurance(
  career: CareerRecord,
  insuranceRecords: InsuranceRecord[]
): MatchResult {
  const now = new Date();
  const careerStart = toDate(career.startDate)!;
  const careerEnd = toDate(career.endDate) ?? now;
  const careerDays = Math.max(
    1,
    Math.ceil((careerEnd.getTime() - careerStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  const normalizedCareer = normalizeCompanyName(career.companyName);

  let bestMatch: InsuranceRecord | null = null;
  let bestSimilarity = 0;
  let bestOverlapDays = 0;

  for (const ins of insuranceRecords) {
    const normalizedIns = normalizeCompanyName(ins.companyName);
    const sim = jaroWinkler(normalizedCareer, normalizedIns);
    if (sim < PARTIAL_THRESHOLD) continue;

    const insStart = toDate(ins.acquisitionDate)!;
    const insEnd = toDate(ins.lossDate) ?? now;
    const overlap = calcOverlapDays(careerStart, careerEnd, insStart, insEnd);

    if (sim > bestSimilarity || (sim === bestSimilarity && overlap > bestOverlapDays)) {
      bestSimilarity = sim;
      bestOverlapDays = overlap;
      bestMatch = ins;
    }
  }

  const overlapRatio = bestOverlapDays / careerDays;

  let verdict: MatchResult['verdict'];
  let reason: string;

  if (!bestMatch || bestSimilarity < PARTIAL_THRESHOLD) {
    verdict = 'MISMATCH';
    reason = `4대보험 이력에서 "${career.companyName}" 관련 기록을 찾을 수 없습니다.`;
  } else if (bestSimilarity >= SIMILARITY_THRESHOLD && overlapRatio >= 0.8) {
    verdict = 'MATCH';
    reason = `회사명 유사도 ${(bestSimilarity * 100).toFixed(1)}%, 재직기간 겹침 ${(overlapRatio * 100).toFixed(1)}%로 일치합니다.`;
  } else {
    verdict = 'PARTIAL';
    reason = `회사명 유사도 ${(bestSimilarity * 100).toFixed(1)}%, 재직기간 겹침 ${(overlapRatio * 100).toFixed(1)}% — 수동 검토가 필요합니다.`;
  }

  return {
    careerRecord: career,
    matchedInsurance: bestMatch,
    similarity: bestSimilarity,
    overlapDays: bestOverlapDays,
    overlapRatio,
    verdict,
    reason,
  };
}

/**
 * 지원서 전체 경력 목록을 4대보험 이력과 일괄 매칭합니다.
 */
export function matchAllCareers(
  careers: CareerRecord[],
  insuranceRecords: InsuranceRecord[]
): MatchResult[] {
  return careers.map((career) => matchCareerToInsurance(career, insuranceRecords));
}

/**
 * 매칭 결과 전체에 대한 종합 판정을 내립니다.
 */
export function summarizeMatchResults(results: MatchResult[]): {
  overallVerdict: 'APPROVE' | 'ESCALATE' | 'REJECT';
  matchCount: number;
  partialCount: number;
  mismatchCount: number;
  summary: string;
} {
  const matchCount = results.filter((r) => r.verdict === 'MATCH').length;
  const partialCount = results.filter((r) => r.verdict === 'PARTIAL').length;
  const mismatchCount = results.filter((r) => r.verdict === 'MISMATCH').length;
  const total = results.length;

  let overallVerdict: 'APPROVE' | 'ESCALATE' | 'REJECT';
  let summary: string;

  if (mismatchCount === 0 && partialCount === 0) {
    overallVerdict = 'APPROVE';
    summary = `전체 ${total}건 경력 모두 4대보험 이력과 일치합니다.`;
  } else if (mismatchCount > 0) {
    overallVerdict = 'REJECT';
    summary = `${mismatchCount}건의 경력이 4대보험 이력에서 확인되지 않습니다.`;
  } else {
    overallVerdict = 'ESCALATE';
    summary = `${partialCount}건의 경력이 부분 일치로 수동 검토가 필요합니다.`;
  }

  return { overallVerdict, matchCount, partialCount, mismatchCount, summary };
}
