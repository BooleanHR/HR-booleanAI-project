import { loadAgencies, saveAgency, testAgencyConnection } from '../src/lib/rpa/agency-config';
import { closeBrowser } from '../src/lib/rpa/browser';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('🧪 Starting TDD tests for ISSUE-011...');
  
  const testConfigPath = path.join(__dirname, '../config/agency_config.json');
  
  // 1. loadAgencies test
  console.log('\n[Test 1] Loading agencies...');
  try {
    const agencies = loadAgencies();
    console.log(`✅ SUCCESS: Loaded ${agencies.length} agencies.`);
  } catch (err) {
    console.error('❌ FAIL: loadAgencies failed:', err);
  }

  // 2. saveAgency test
  console.log('\n[Test 2] Saving new/modified agency...');
  try {
    const originalContent = fs.readFileSync(testConfigPath, 'utf8');
    const newAgency = {
      agency_id: 'test_temp_agency',
      display_name: '임시 테스트 기관',
      url: 'https://example.com',
      auth_required: false,
      input_fields: [],
      applicable_doc_types: ['졸업증명서'],
      rpa_selectors: {
        submit: ['#btn'],
        result: ['.result']
      },
      valid_days: 180,
      notes: '테스트용 임시 기관'
    };
    
    saveAgency(newAgency);
    
    const updatedAgencies = loadAgencies();
    const found = updatedAgencies.find(a => a.agency_id === 'test_temp_agency');
    
    if (found && found.display_name === '임시 테스트 기관') {
      console.log('✅ SUCCESS: Agency saved and loaded correctly.');
    } else {
      console.error('❌ FAIL: Agency was not saved or loaded correctly.');
    }
    
    // Restore original file
    fs.writeFileSync(testConfigPath, originalContent, 'utf8');
    console.log('✅ SUCCESS: Restored original config file.');
  } catch (err) {
    console.error('❌ FAIL: saveAgency test failed:', err);
  }

  // 3. testAgencyConnection test (Puppeteer navigation test)
  console.log('\n[Test 3] Testing agency connection via Puppeteer...');
  try {
    const result = await testAgencyConnection('https://example.com');
    if (result.success) {
      console.log('✅ SUCCESS: Puppeteer connection test passed.');
    } else {
      console.error('❌ FAIL: Puppeteer connection test returned failure status.');
    }
  } catch (err) {
    console.error('❌ FAIL: Puppeteer connection test threw exception:', err);
  } finally {
    console.log('[Test Cleanup] Closing browser...');
    await closeBrowser();
  }
}

runTests().catch(console.error);
