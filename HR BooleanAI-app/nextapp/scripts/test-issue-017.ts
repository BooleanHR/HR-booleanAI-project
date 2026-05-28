import { prisma } from '../src/lib/db';
import { captureWithFallback } from '../src/lib/rpa/capture';
import { reviewDocument, mockReviewDocument } from '../src/lib/ai/reviewer-agent';
import { sendRejectionEmail } from '../src/lib/verification/notifications';
import { generateManualVerificationExcel, uploadManualVerificationExcel } from '../src/lib/verification/manual-excel';
import { closeBrowser } from '../src/lib/rpa/browser';
import ExcelJS from 'exceljs';

async function runE2ETests() {
  console.log('🏁 Starting E2E Integration Pipeline Test (ISSUE-017)...');

  const batchId = 'e2e-test-batch-id';
  const app1Id = 'e2e-app-pass-id';
  const app2Id = 'e2e-app-fail-id';
  const app3Id = 'e2e-app-manual-id';

  const job1Id = 'e2e-job-pass-id';
  const job2Id = 'e2e-job-fail-id';
  const job3Id = 'e2e-job-manual-id';

  try {
    // ─────────────────────────────────────────────
    // 1. Setup Test Data in Database
    // ─────────────────────────────────────────────
    console.log('\n[Phase 1] Setting up database test data...');
    
    // Cleanup any legacy test data first
    await cleanupTestData(batchId, [app1Id, app2Id, app3Id], [job1Id, job2Id, job3Id]);

    // Create Batch
    const batch = await prisma.batch.create({
      data: {
        id: batchId,
        name: 'E2E 통합 테스트 배치',
        description: 'E2E 파이프라인 자동 검증용 임시 배치',
        status: 'RUNNING',
        totalCount: 3,
        passCount: 0,
        failCount: 0,
        escalateCount: 0,
      },
    });

    // Create Applicants
    const applicant1 = await prisma.applicant.create({
      data: {
        id: app1Id,
        batchId: batchId,
        name: '이순신',
        birthDate: '19850428',
        email: 'yi_sun_sin@example.com',
        phone: '010-1234-5678',
        status: 'PROCESSING',
      },
    });

    const applicant2 = await prisma.applicant.create({
      data: {
        id: app2Id,
        batchId: batchId,
        name: '홍길동',
        birthDate: '19950505',
        email: 'hong_gildong@example.com',
        phone: '010-5678-1234',
        status: 'PROCESSING',
      },
    });

    const applicant3 = await prisma.applicant.create({
      data: {
        id: app3Id,
        batchId: batchId,
        name: '김선달',
        birthDate: '19900909',
        email: 'kim_seondal@example.com',
        phone: '010-9999-8888',
        status: 'PROCESSING',
      },
    });

    // Create Documents
    await prisma.document.createMany({
      data: [
        {
          id: 'doc-pass-id',
          applicantId: app1Id,
          category: 'LANGUAGE',
          filePath: 'uploads/e2e/yi_toeic.png',
          fileName: 'yi_toeic.png',
        },
        {
          id: 'doc-fail-id',
          applicantId: app2Id,
          category: 'LANGUAGE',
          filePath: 'uploads/e2e/hong_opic.png',
          fileName: 'hong_opic.png',
        },
        {
          id: 'doc-manual-id',
          applicantId: app3Id,
          category: 'CERTIFICATE',
          filePath: 'uploads/e2e/kim_edupure.png',
          fileName: 'kim_edupure.png',
        },
      ],
    });

    // Create Verification Jobs
    const job1 = await prisma.verificationJob.create({
      data: {
        id: job1Id,
        applicantId: app1Id,
        documentType: 'TOEIC',
        siteCode: 'toeic_ybm',
        status: 'PENDING',
      },
    });

    const job2 = await prisma.verificationJob.create({
      data: {
        id: job2Id,
        applicantId: app2Id,
        documentType: 'OPIC',
        siteCode: 'opic_actfl',
        status: 'PENDING',
      },
    });

    const job3 = await prisma.verificationJob.create({
      data: {
        id: job3Id,
        applicantId: app3Id,
        documentType: 'CERTIFICATE',
        siteCode: 'EDUPURE', // Manual verification site
        status: 'MANUAL', // Marked as manual immediately
      },
    });

    console.log('✅ Setup completed. Batch, Applicants, Documents, and Jobs are in the database.');

    // ─────────────────────────────────────────────
    // 2. Execute Automated Pipeline (RPA + AI)
    // ─────────────────────────────────────────────
    console.log('\n[Phase 2] Executing Automated Pipeline...');

    // Job 1 (TOEIC - Expected PASS)
    console.log('\n--> Processing Job 1 (TOEIC): Expecting PASS');
    await prisma.verificationJob.update({
      where: { id: job1Id },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    // 1) RPA Capture (with Fallback)
    const captureResult1 = await captureWithFallback({
      siteCode: job1.siteCode,
      targetUrl: 'https://exam.toeic.co.kr/common/commonPreLogin.php?returnUrl=/result/truthInput.php',
      applicantData: { name: applicant1.name, birthDate: applicant1.birthDate, registrationNumber: '123456' },
      outputDir: 'public/screenshots/e2e',
    });
    console.log('   - RPA Capture Result:', captureResult1);

    // 2) AI Review (Gemini or Mock)
    const geminiKey = process.env.GEMINI_API_KEY;
    const hasRealKey = geminiKey && geminiKey !== 'your-gemini-api-key-here';
    
    let reviewResult1;
    if (hasRealKey) {
      console.log('   - GEMINI_API_KEY found, running real AI review...');
      reviewResult1 = await reviewDocument({
        documentType: 'TOEIC',
        applicantName: applicant1.name,
        applicantBirthDate: applicant1.birthDate,
        documentImagePath: 'public/placeholder.png', // Fallback placeholder if none exists
        rpaCapturePath: captureResult1.screenshotPath,
        applicationData: { score: '990', registrationNumber: '123456' },
      });
    } else {
      console.log('   - Using Mock AI review (GEMINI_API_KEY missing/default)...');
      reviewResult1 = mockReviewDocument({
        documentType: 'TOEIC',
        applicantName: applicant1.name,
        applicantBirthDate: applicant1.birthDate,
        documentImagePath: 'public/placeholder.png',
        applicationData: { score: '990' },
      });
      // Force it to APPROVE for test coverage check
      reviewResult1.verdict = 'APPROVE';
      reviewResult1.score = 0.95;
      reviewResult1.reason = 'RPA 결과와 지원서가 일치하여 승인처리합니다. (Mock)';
    }
    console.log('   - AI Review Verdict:', reviewResult1.verdict, `(Score: ${reviewResult1.score})`);

    // 3) Update DB
    await prisma.verificationJob.update({
      where: { id: job1Id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        tierUsed: captureResult1.tierUsed,
        mockUsed: captureResult1.mockUsed || !hasRealKey,
        captureUrl: captureResult1.screenshotPath,
        geminiVerdict: reviewResult1.verdict,
        geminiScore: reviewResult1.score,
        geminiReason: reviewResult1.reason,
      },
    });

    await prisma.applicant.update({
      where: { id: app1Id },
      data: { status: 'COMPLETED' },
    });

    // Job 2 (OPIc - Expected REJECT)
    console.log('\n--> Processing Job 2 (OPIC): Expecting REJECT');
    await prisma.verificationJob.update({
      where: { id: job2Id },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    // 1) RPA Capture
    const captureResult2 = await captureWithFallback({
      siteCode: job2.siteCode,
      targetUrl: 'https://www.opic.or.kr/opics/servlet/controller.opic.site.certi.CertiServlet?p_process=select-certicontrast',
      applicantData: { name: applicant2.name, birthDate: applicant2.birthDate, searchQuery: '9999-9999' },
      outputDir: 'public/screenshots/e2e',
    });
    console.log('   - RPA Capture Result:', captureResult2);

    // 2) AI Review
    let reviewResult2;
    if (hasRealKey) {
      reviewResult2 = await reviewDocument({
        documentType: 'OPIC',
        applicantName: applicant2.name,
        applicantBirthDate: applicant2.birthDate,
        documentImagePath: 'public/placeholder.png',
        rpaCapturePath: captureResult2.screenshotPath,
        applicationData: { score: 'IM2' }, // mismatched from actual RPA
      });
    } else {
      reviewResult2 = mockReviewDocument({
        documentType: 'OPIC',
        applicantName: applicant2.name,
        applicantBirthDate: applicant2.birthDate,
        documentImagePath: 'public/placeholder.png',
        applicationData: { score: 'IM2' },
      });
      // Force it to REJECT for test coverage check
      reviewResult2.verdict = 'REJECT';
      reviewResult2.score = 0.2;
      reviewResult2.reason = 'RPA 결과(AL)와 지원서 기재 성적(IM2)이 불일치합니다. (Mock)';
      reviewResult2.discrepancies = ['성적 등급 불일치'];
    }
    console.log('   - AI Review Verdict:', reviewResult2.verdict, `(Score: ${reviewResult2.score})`);

    // 3) Update DB
    await prisma.verificationJob.update({
      where: { id: job2Id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        tierUsed: captureResult2.tierUsed,
        mockUsed: captureResult2.mockUsed || !hasRealKey,
        captureUrl: captureResult2.screenshotPath,
        geminiVerdict: reviewResult2.verdict,
        geminiScore: reviewResult2.score,
        geminiReason: reviewResult2.reason,
        discrepancies: JSON.stringify(reviewResult2.discrepancies),
      },
    });

    await prisma.applicant.update({
      where: { id: app2Id },
      data: { status: 'COMPLETED' },
    });

    // 4) Send notification on REJECT
    if (reviewResult2.verdict === 'REJECT') {
      console.log('   - Verdict is REJECT. Sending email notification...');
      const emailResult = await sendRejectionEmail(
        applicant2.email!,
        applicant2.name,
        '오픽 성적 증명서',
        reviewResult2.reason
      );
      console.log('   - Email Result:', emailResult);
    }

    console.log('\n✅ Automated pipeline executed successfully.');

    // ─────────────────────────────────────────────
    // 3. Execute Excel Manual Verification Pipeline
    // ─────────────────────────────────────────────
    console.log('\n[Phase 3] Executing Manual Verification Excel Flow...');

    // 1) Export Excel for this batch
    console.log('   - Exporting manual verification list...');
    const excelBuffer = await generateManualVerificationExcel(batchId);
    
    // 2) Parse and verify structure
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer as any);
    const sheet = workbook.getWorksheet(1);
    
    if (!sheet) throw new Error('Excel sheet creation failed');
    
    console.log('   - Excel contains rows:', sheet.rowCount);
    
    // Find the manual job row
    let foundManualJob = false;
    sheet.eachRow((row, rowNumber) => {
      const jobIdInExcel = row.getCell(1).value;
      if (jobIdInExcel === job3Id) {
        foundManualJob = true;
        console.log(`   - Found manual job at row ${rowNumber}: name=${row.getCell(3).value}`);
        // Modify to APPROVE (승인)
        row.getCell(6).value = '승인';
        row.getCell(7).value = '수동 에듀퓨어 확인번호 진위확인 통과';
        row.commit();
      }
    });

    if (!foundManualJob) {
      throw new Error('E2E manual job was not included in the exported Excel');
    }

    // 3) Write to a modified buffer
    const modifiedBuffer = await workbook.xlsx.writeBuffer() as any;

    // 4) Upload Excel and verify DB updates
    console.log('   - Uploading modified Excel...');
    const uploadResult = await uploadManualVerificationExcel(modifiedBuffer);
    console.log('   - Upload Result:', uploadResult);

    // Verify DB update
    const updatedJob3 = await prisma.verificationJob.findUnique({
      where: { id: job3Id },
    });
    console.log('   - Updated Manual Job in DB:', {
      status: updatedJob3?.status,
      geminiVerdict: updatedJob3?.geminiVerdict,
      geminiReason: updatedJob3?.geminiReason,
    });

    if (updatedJob3?.status !== 'COMPLETED' || updatedJob3?.geminiVerdict !== 'APPROVE') {
      throw new Error('Database was not updated correctly from manual excel upload');
    }

    console.log('✅ Manual verification Excel flow succeeded.');

    // ─────────────────────────────────────────────
    // 4. Summarize and Update Batch
    // ─────────────────────────────────────────────
    console.log('\n[Phase 4] Summarizing and finishing batch...');

    // Calculate final counts
    const allJobs = await prisma.verificationJob.findMany({
      where: { applicant: { batchId } },
    });

    let passCount = 0;
    let failCount = 0;
    let escalateCount = 0;

    for (const job of allJobs) {
      if (job.geminiVerdict === 'APPROVE') passCount++;
      else if (job.geminiVerdict === 'REJECT') failCount++;
      else escalateCount++;
    }

    await prisma.batch.update({
      where: { id: batchId },
      data: {
        status: 'COMPLETED',
        passCount,
        failCount,
        escalateCount,
      },
    });

    const finalBatch = await prisma.batch.findUnique({ where: { id: batchId } });
    console.log('Final Batch Stats in DB:', {
      id: finalBatch?.id,
      status: finalBatch?.status,
      totalCount: finalBatch?.totalCount,
      passCount: finalBatch?.passCount,
      failCount: finalBatch?.failCount,
      escalateCount: finalBatch?.escalateCount,
    });

    // Assertions
    if (finalBatch?.passCount !== 2 || finalBatch?.failCount !== 1 || finalBatch?.escalateCount !== 0) {
      throw new Error(`Assertion failed: expected 2 pass, 1 fail, 0 escalate. Got: pass=${finalBatch?.passCount}, fail=${finalBatch?.failCount}, escalate=${finalBatch?.escalateCount}`);
    }

    console.log('\n🎉 ALL E2E VERIFICATION PIPELINE TESTS PASSED!');
    
  } catch (error) {
    console.error('\n❌ E2E Integration Pipeline Test FAILED:', error);
    process.exit(1);
  } finally {
    // ─────────────────────────────────────────────
    // 5. Cleanup Test Data
    // ─────────────────────────────────────────────
    console.log('\n[Cleanup] Cleaning up database records...');
    await cleanupTestData(batchId, [app1Id, app2Id, app3Id], [job1Id, job2Id, job3Id]);
    console.log('✅ Cleanup finished.');

    console.log('[Cleanup] Closing browser instance and DB client...');
    await closeBrowser();
    await prisma.$disconnect();
  }
}

async function cleanupTestData(batchId: string, applicantIds: string[], jobIds: string[]) {
  try {
    // Delete verification jobs
    await prisma.verificationJob.deleteMany({
      where: { id: { in: jobIds } },
    });
    // Delete documents
    await prisma.document.deleteMany({
      where: { applicantId: { in: applicantIds } },
    });
    // Delete applicants
    await prisma.applicant.deleteMany({
      where: { id: { in: applicantIds } },
    });
    // Delete batch
    await prisma.batch.deleteMany({
      where: { id: batchId },
    });
  } catch (e) {
    console.error('[cleanupTestData] Warning: cleanup failed:', e);
  }
}

runE2ETests().catch((err) => {
  console.error(err);
  process.exit(1);
});
