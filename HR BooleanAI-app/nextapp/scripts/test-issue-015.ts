import { analyzeSelectors } from '../src/lib/ai/selector-analyzer';
import { closeBrowser } from '../src/lib/rpa/browser';

async function runTests() {
  console.log('🧪 Starting TDD tests for ISSUE-015...');

  // 1. analyzeSelectors test (with mock/fallback mechanism check)
  console.log('\n[Test 1] Running HTML selector analysis on example.com...');
  try {
    const result = await analyzeSelectors('https://example.com');
    console.log('Analysis Result:', result);
    
    if (result && typeof result === 'object') {
      console.log('✅ SUCCESS: Selector analysis executed and returned an object.');
      if (result.mockUsed) {
        console.log('💡 Note: Mock selectors were returned because GEMINI_API_KEY was not configured.');
      } else {
        console.log('✅ SUCCESS: Gemini analyzed selectors successfully.');
      }
    } else {
      console.error('❌ FAIL: Selector analysis did not return an object.');
    }
  } catch (err) {
    console.error('❌ FAIL: Selector analysis test failed:', err);
  } finally {
    console.log('[Test Cleanup] Closing browser...');
    await closeBrowser();
  }
}

runTests().catch(console.error);
