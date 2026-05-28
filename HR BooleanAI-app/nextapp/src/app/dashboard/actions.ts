'use server';

import { generateManualVerificationExcel, uploadManualVerificationExcel } from '@/lib/verification/manual-excel';
import { revalidatePath } from 'next/cache';

/**
 * 수동 검증 명단 엑셀 파일을 생성하고 Base64로 인코딩하여 반환합니다.
 */
export async function downloadManualExcelAction(batchId: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const buffer = await generateManualVerificationExcel(batchId);
    const base64 = buffer.toString('base64');
    return { success: true, data: base64 };
  } catch (err: any) {
    console.error('[downloadManualExcelAction] Error:', err);
    return { success: false, error: err.message || '엑셀 파일 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * 업로드된 엑셀 파일(Base64)을 파싱하여 DB에 수동 검증 결과를 동기화합니다.
 */
export async function uploadManualExcelAction(base64Data: string): Promise<{ success: boolean; successCount?: number; failCount?: number; error?: string }> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const result = await uploadManualVerificationExcel(buffer);
    revalidatePath('/dashboard');
    return { success: true, ...result };
  } catch (err: any) {
    console.error('[uploadManualExcelAction] Error:', err);
    return { success: false, error: err.message || '엑셀 업로드 처리 중 오류가 발생했습니다.' };
  }
}
