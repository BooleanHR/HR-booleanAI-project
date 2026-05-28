'use server';

import { prisma } from '@/lib/db';
import { encryptPassword } from '@/lib/crypto/credentials';
import { saveAgency, Agency, testAgencyConnection } from '@/lib/rpa/agency-config';
import { revalidatePath } from 'next/cache';

export async function saveAgencyAction(data: {
  siteCode: string;
  siteName: string;
  siteUrl: string;
  username?: string;
  password?: string;
  selectorsJson: string;
  applicableDocTypes: string[];
  validDays: number | null;
  notes?: string;
}) {
  try {
    const { siteCode, siteName, siteUrl, username, password, selectorsJson, applicableDocTypes, validDays, notes } = data;
    
    // 1. Parse selectors
    let selectorsObj = {};
    try {
      selectorsObj = JSON.parse(selectorsJson);
    } catch (e: any) {
      throw new Error(`CSS selectors JSON 형식 분석 실패: ${e.message}`);
    }
    
    // 2. Encrypt password if provided
    let encPassword: string | undefined = undefined;
    if (password && password.trim() !== '') {
      encPassword = encryptPassword(password);
    }
    
    // 3. Save to database (SiteCredential)
    await prisma.siteCredential.upsert({
      where: { siteCode },
      update: {
        siteName,
        siteUrl,
        username: username || null,
        ...(encPassword ? { encPassword } : {}),
        selectors: selectorsJson,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        siteCode,
        siteName,
        siteUrl,
        username: username || null,
        encPassword: encPassword || null,
        selectors: selectorsJson,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // 4. Save to agency_config.json
    const agencyObj: Agency = {
      agency_id: siteCode.toLowerCase(),
      display_name: siteName,
      url: siteUrl,
      auth_required: !!(username || password),
      credential_key: siteCode.toLowerCase(),
      input_fields: [
        { field_key: 'doc_confirm_number', label: '문서확인번호' }
      ],
      applicable_doc_types: applicableDocTypes,
      rpa_selectors: selectorsObj,
      valid_days: validDays,
      notes
    };
    
    saveAgency(agencyObj);
    
    revalidatePath('/settings/agencies');
    return { success: true };
  } catch (err: any) {
    console.error('[saveAgencyAction] Error:', err);
    return { success: false, error: err.message || '저장에 실패했습니다.' };
  }
}

export async function testAgencyConnectionAction(siteCode: string, url: string) {
  try {
    const result = await testAgencyConnection(url);
    
    // Update DB with test result
    await prisma.siteCredential.updateMany({
      where: { siteCode },
      data: {
        lastTestedAt: new Date(),
        lastTestResult: result.success ? 'SUCCESS' : 'FAILED'
      }
    });
    
    revalidatePath('/settings/agencies');
    return result;
  } catch (err: any) {
    console.error('[testAgencyConnectionAction] Error:', err);
    return { success: false, message: `테스트 중 오류 발생: ${err.message}` };
  }
}

import { analyzeSelectors } from '@/lib/ai/selector-analyzer';

export async function analyzeSelectorsAction(url: string) {
  try {
    const result = await analyzeSelectors(url);
    return { success: true, recommendation: result };
  } catch (err: any) {
    console.error('[analyzeSelectorsAction] Error:', err);
    return { success: false, error: err.message || '셀렉터 분석 중 오류가 발생했습니다.' };
  }
}
