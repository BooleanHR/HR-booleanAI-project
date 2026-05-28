import { generateManualVerificationExcel, uploadManualVerificationExcel } from '../src/lib/verification/manual-excel';
import { prisma } from '../src/lib/db';
import ExcelJS from 'exceljs';

async function runTests() {
  console.log('🧪 Starting TDD tests for ISSUE-012...');

  // Setup test data
  console.log('\n[Setup] Inserting temporary test data...');
  const batch = await prisma.batch.create({
    data: {
      id: 'test-manual-batch-id',
      name: '임시 수동 검증 배치',
      status: 'PENDING',
    }
  });

  const applicant = await prisma.applicant.create({
    data: {
      id: 'test-manual-applicant-id',
      batchId: batch.id,
      name: '홍길동',
      birthDate: '19950505',
      status: 'PENDING',
    }
  });

  const job = await prisma.verificationJob.create({
    data: {
      id: 'test-manual-job-id',
      applicantId: applicant.id,
      documentType: '수료증_에듀퓨어',
      siteCode: 'EDUPURE',
      status: 'MANUAL',
    }
  });

  console.log('✅ Setup completed.');

  // 1. generateManualVerificationExcel test
  console.log('\n[Test 1] Generating Excel workbook...');
  let excelBuffer: Buffer | null = null;
  try {
    excelBuffer = await generateManualVerificationExcel(batch.id);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer as any);
    const sheet = workbook.getWorksheet(1);
    
    if (!sheet) throw new Error('Worksheet is empty');
    
    // Check header
    const headers = sheet.getRow(1).values as any[];
    console.log('Excel Headers:', headers);
    
    // Check data row
    const firstRow = sheet.getRow(2).values as any[];
    console.log('Excel First Row:', firstRow);

    if (headers.includes('검증 ID') && firstRow.includes('test-manual-job-id')) {
      console.log('✅ SUCCESS: Excel workbook generated with correct headers and test rows.');
    } else {
      console.error('❌ FAIL: Generated Excel does not have correct data.');
    }
  } catch (err) {
    console.error('❌ FAIL: generateManualVerificationExcel test failed:', err);
  }

  // 2. uploadManualVerificationExcel test
  console.log('\n[Test 2] Modifying generated Excel and uploading...');
  try {
    if (!excelBuffer) throw new Error('No buffer available to test upload');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer as any);
    const sheet = workbook.getWorksheet(1);
    if (!sheet) throw new Error('Worksheet is empty');
    
    // Fill the verification results: Result is in column 6 (검증 결과), Reason is in column 7 (불일치 사유)
    // Row 2 is our test row
    const row = sheet.getRow(2);
    row.getCell(6).value = '승인';
    row.getCell(7).value = '수동 대조 완료';
    await row.commit();
    
    const modifiedBuffer = await workbook.xlsx.writeBuffer() as any;
    
    // Upload
    const result = await uploadManualVerificationExcel(modifiedBuffer as any);
    console.log('Upload Result:', result);
    
    // Verify DB update
    const updatedJob = await prisma.verificationJob.findUnique({
      where: { id: 'test-manual-job-id' }
    });
    
    if (updatedJob && updatedJob.status === 'COMPLETED' && updatedJob.geminiVerdict === 'APPROVE' && updatedJob.geminiReason === '수동 대조 완료') {
      console.log('✅ SUCCESS: Database record updated successfully from uploaded Excel.');
    } else {
      console.error('❌ FAIL: DB was not updated correctly. Job status:', updatedJob?.status, 'verdict:', updatedJob?.geminiVerdict);
    }
  } catch (err) {
    console.error('❌ FAIL: uploadManualVerificationExcel test failed:', err);
  }

  // Cleanup test data
  console.log('\n[Cleanup] Removing temporary test data...');
  await prisma.verificationJob.deleteMany({ where: { id: 'test-manual-job-id' } });
  await prisma.applicant.deleteMany({ where: { id: 'test-manual-applicant-id' } });
  await prisma.batch.deleteMany({ where: { id: 'test-manual-batch-id' } });
  console.log('✅ Cleanup completed.');
}

runTests().catch(console.error);
