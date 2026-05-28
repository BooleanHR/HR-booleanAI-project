/**
 * 스모크 테스트 스크립트
 * 암호화, 유효기간 판정, 경력 매칭 로직을 검증합니다.
 * 실행: npx ts-node --esm scripts/smoke-test.ts
 * 또는: npx tsx scripts/smoke-test.ts
 */

import { encrypt, decrypt } from '../src/lib/crypto/credentials';
import { checkExpiry } from '../src/lib/verification/expiry-check';
import {
  matchCareerToInsurance,
  summarizeMatchResults,
  type CareerRecord,
  type InsuranceRecord,
} from '../src/lib/verification/career-records-matching';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ─────────────────────────────────────────────
// 1. 암호화/복호화 테스트
// ─────────────────────────────────────────────
console.log('\n🔐 [1] 암호화/복호화 테스트');

// 임시 키 설정
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

const testPassword = 'P@ssw0rd!2026';
const encrypted = encrypt(testPassword);
const decrypted = decrypt(encrypted);

assert('암호화 결과가 원본과 달라야 한다', encrypted !== testPassword);
assert('복호화 결과가 원본과 같아야 한다', decrypted === testPassword, `got: ${decrypted}`);
assert('암호화 형식이 iv:tag:ciphertext여야 한다', encrypted.split(':').length === 3);

// 다른 평문은 다른 암호문을 생성해야 한다
const encrypted2 = encrypt(testPassword);
assert('동일 평문이지만 매번 다른 암호문(랜덤 IV)', encrypted !== encrypted2);

// ─────────────────────────────────────────────
// 2. 유효기간 판정 테스트
// ─────────────────────────────────────────────
console.log('\n📅 [2] 유효기간 판정 테스트');

const today = new Date('2026-05-28');

// OPIc - 730일 (2년)
const opicValid = checkExpiry('2025-06-01', 'OPIC', today);
assert('OPIc 1년 이내: 유효', opicValid.isValid, `daysRemaining: ${opicValid.daysRemaining}`);

const opicExpired = checkExpiry('2024-01-01', 'OPIC', today);
assert('OPIc 2년 초과: 만료', opicExpired.isExpired, `daysRemaining: ${opicExpired.daysRemaining}`);

// 졸업증명서 - 180일
const gradValid = checkExpiry('2026-01-01', 'GRADUATION', today);
assert('졸업증명서 4개월: 유효', gradValid.isValid);

const gradExpired = checkExpiry('2025-10-01', 'GRADUATION', today);
assert('졸업증명서 7개월: 만료', gradExpired.isExpired);

// 영구 자격증
const permanent = checkExpiry('2010-01-01', 'QNET_PERMANENT', today);
assert('영구 자격증: 항상 유효', permanent.isValid && !permanent.isExpired);

// ─────────────────────────────────────────────
// 3. 경력 매칭 테스트
// ─────────────────────────────────────────────
console.log('\n💼 [3] 경력 매칭 테스트 (Jaro-Winkler)');

const careers: CareerRecord[] = [
  {
    companyName: '삼성전자주식회사',
    startDate: '2020-01-01',
    endDate: '2022-12-31',
  },
  {
    companyName: '네이버',
    startDate: '2023-01-01',
    endDate: null, // 재직 중
  },
  {
    companyName: '존재하지않는회사',
    startDate: '2019-01-01',
    endDate: '2019-12-31',
  },
];

const insurances: InsuranceRecord[] = [
  {
    companyName: '삼성전자(주)',
    acquisitionDate: '2020-01-01',
    lossDate: '2023-01-01',
  },
  {
    companyName: '네이버주식회사',
    acquisitionDate: '2023-01-01',
    lossDate: null,
  },
];

const results = careers.map((c) => matchCareerToInsurance(c, insurances));

assert('삼성전자 (유사도 매칭)', results[0].verdict === 'MATCH' || results[0].verdict === 'PARTIAL',
  `verdict: ${results[0].verdict}, similarity: ${results[0].similarity.toFixed(3)}`);
assert('네이버 (유사도 매칭)', results[1].verdict === 'MATCH' || results[1].verdict === 'PARTIAL',
  `verdict: ${results[1].verdict}, similarity: ${results[1].similarity.toFixed(3)}`);
assert('존재하지않는회사: MISMATCH', results[2].verdict === 'MISMATCH',
  `verdict: ${results[2].verdict}`);

const summary = summarizeMatchResults(results);
assert('불일치 1건이 있으므로 REJECT', summary.overallVerdict === 'REJECT',
  `verdict: ${summary.overallVerdict}, mismatch: ${summary.mismatchCount}`);

// ─────────────────────────────────────────────
// 결과 요약
// ─────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`총 ${passed + failed}개 테스트: ✅ ${passed}개 통과, ❌ ${failed}개 실패`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 모든 테스트를 통과했습니다!');
}
