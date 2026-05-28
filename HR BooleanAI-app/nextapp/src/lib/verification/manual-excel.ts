import { prisma } from '../db';
import ExcelJS from 'exceljs';

/**
 * 특정 배치의 수동 검증 대상(status가 MANUAL인 검증 작업) 목록을 포함한 엑셀 파일 버퍼를 생성합니다.
 */
export async function generateManualVerificationExcel(batchId: string): Promise<Buffer> {
  const jobs = await prisma.verificationJob.findMany({
    where: {
      applicant: {
        batchId: batchId
      },
      // 수동 검증 대상인 건만 추출
      OR: [
        { status: 'MANUAL' },
        { siteCode: 'EDUPURE' },
        { siteCode: 'WINSPACK' }
      ]
    },
    include: {
      applicant: true
    }
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('수동 검증 대상');

  // 컬럼 헤더 정의
  sheet.columns = [
    { header: '검증 ID', key: 'id', width: 28 },
    { header: '지원자명', key: 'name', width: 15 },
    { header: '생년월일', key: 'birthDate', width: 15 },
    { header: '제출서류 유형', key: 'documentType', width: 20 },
    { header: 'RPA 대상 사이트', key: 'siteCode', width: 15 },
    { header: '검증 결과', key: 'verdict', width: 15 }, // 사용자 입력 컬럼 ('승인', '반려', '에스컬레이션')
    { header: '불일치 사유', key: 'reason', width: 35 } // 사용자 입력 컬럼
  ];

  // 데이터 추가
  jobs.forEach(job => {
    sheet.addRow({
      id: job.id,
      name: job.applicant.name,
      birthDate: job.applicant.birthDate,
      documentType: job.documentType,
      siteCode: job.siteCode,
      verdict: job.geminiVerdict === 'APPROVE' ? '승인' : job.geminiVerdict === 'REJECT' ? '반려' : job.geminiVerdict === 'ESCALATE' ? '에스컬레이션' : '대기',
      reason: job.geminiReason || ''
    });
  });

  // 헤더 스타일링 (볼드 및 연한 그레이 배경)
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F2F2F2' }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
}

/**
 * 사용자가 작성한 수동 검증 결과 엑셀 파일을 파싱하여 DB에 반영합니다.
 */
export async function uploadManualVerificationExcel(buffer: Buffer): Promise<{ successCount: number; failCount: number }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.getWorksheet(1);
  if (!sheet) {
    throw new Error('엑셀 시트를 로드할 수 없습니다.');
  }

  let successCount = 0;
  let failCount = 0;

  // 2번째 줄부터 데이터 처리
  const rowCount = sheet.rowCount;
  for (let i = 2; i <= rowCount; i++) {
    const row = sheet.getRow(i);
    const jobId = row.getCell(1).value?.toString();
    const verdictText = row.getCell(6).value?.toString()?.trim();
    const reason = row.getCell(7).value?.toString()?.trim() || '';

    if (!jobId || !verdictText) {
      continue;
    }

    let dbVerdict = '';
    if (verdictText === '승인') {
      dbVerdict = 'APPROVE';
    } else if (verdictText === '반려') {
      dbVerdict = 'REJECT';
    } else if (verdictText === '에스컬레이션' || verdictText === '수동검토') {
      dbVerdict = 'ESCALATE';
    } else {
      // 대기 상태이거나 처리하지 않은 경우 건너뜀
      continue;
    }

    try {
      // DB 업데이트
      await prisma.verificationJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          geminiVerdict: dbVerdict,
          geminiReason: reason,
          completedAt: new Date()
        }
      });

      // 만약 지원자의 모든 검증 작업이 완료되었다면 지원자 상태도 완료로 업데이트 시도
      const job = await prisma.verificationJob.findUnique({
        where: { id: jobId },
        select: { applicantId: true }
      });

      if (job) {
        const remainingJobsCount = await prisma.verificationJob.count({
          where: {
            applicantId: job.applicantId,
            status: {
              in: ['PENDING', 'RUNNING', 'MANUAL']
            }
          }
        });

        if (remainingJobsCount === 0) {
          // 모든 검증 작업이 끝났으므로 지원자 상태 갱신
          const allJobs = await prisma.verificationJob.findMany({
            where: { applicantId: job.applicantId }
          });
          
          let applicantStatus = 'COMPLETED';
          if (allJobs.some(j => j.geminiVerdict === 'ESCALATE')) {
            applicantStatus = 'ESCALATE';
          } else if (allJobs.some(j => j.geminiVerdict === 'REJECT')) {
            applicantStatus = 'REJECT'; // 하나라도 반려가 있으면 최종 반려
          }
          
          await prisma.applicant.update({
            where: { id: job.applicantId },
            data: { status: applicantStatus }
          });
        }
      }

      successCount++;
    } catch (err) {
      console.error(`[uploadManualVerificationExcel] Failed to update job: ${jobId}`, err);
      failCount++;
    }
  }

  return { successCount, failCount };
}
