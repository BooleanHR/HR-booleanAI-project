import { sendRejectionEmail } from '../src/lib/verification/notifications';

async function runTests() {
  console.log('🧪 Starting TDD tests for ISSUE-013...');

  // 1. sendRejectionEmail test (with mock/missing API key fallback)
  console.log('\n[Test 1] Sending rejection email...');
  try {
    const result = await sendRejectionEmail(
      'applicant@example.com',
      '홍길동',
      '졸업증명서',
      '문서확인번호 XD02-B55A-0BB1-74BB 가 국립대학교 졸업생 명단과 일치하지 않습니다.'
    );
    
    console.log('Send Email Result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS: Email send function executed and returned success.');
      if (result.mockUsed) {
        console.log('💡 Note: Mock mail was printed because RESEND_API_KEY was not configured.');
      }
    } else {
      console.error('❌ FAIL: Email send function returned failure status.');
    }
  } catch (err) {
    console.error('❌ FAIL: sendRejectionEmail test failed:', err);
  }
}

runTests().catch(console.error);
