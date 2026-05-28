import { buildPrompt } from '../src/lib/ai/reviewer-agent';

async function runTests() {
  console.log('🧪 Starting TDD tests for ISSUE-014...');

  // Case 1: Post-2001 Q-Net certification (should not have specialized stamp prompt)
  console.log('\n[Test 1] Post-2001 certification prompt test...');
  try {
    const prompt = buildPrompt({
      documentType: 'QNET',
      applicantName: '홍길동',
      applicantBirthDate: '19950505',
      documentImagePath: 'dummy.png',
      applicationData: {
        passDate: '2015-06-15',
        certName: '정보처리기사'
      }
    });

    if (!prompt.includes('2001년 이전')) {
      console.log('✅ SUCCESS: Prompt does not include pre-2001 special instructions.');
    } else {
      console.error('❌ FAIL: Prompt mistakenly included pre-2001 instructions.');
    }
  } catch (err) {
    console.error('❌ FAIL: Post-2001 prompt test failed:', err);
  }

  // Case 2: Pre-2001 Q-Net certification (should have specialized stamp prompt)
  console.log('\n[Test 2] Pre-2001 certification prompt test...');
  try {
    const prompt = buildPrompt({
      documentType: 'QNET',
      applicantName: '김철수',
      applicantBirthDate: '19700303',
      documentImagePath: 'dummy.png',
      applicationData: {
        passDate: '1999-10-24',
        certName: '전기기사'
      }
    });

    if (prompt.includes('2001년 이전') && prompt.includes('관인') && prompt.includes('인장')) {
      console.log('✅ SUCCESS: Prompt correctly includes pre-2001 stamp verification instructions.');
    } else {
      console.error('❌ FAIL: Prompt is missing pre-2001 stamp instructions.');
    }
  } catch (err) {
    console.error('❌ FAIL: Pre-2001 prompt test failed:', err);
  }
}

runTests().catch(console.error);
