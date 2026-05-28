import fs from 'fs';
import path from 'path';
import { getBrowser } from './browser';

export interface Agency {
  agency_id: string;
  display_name: string;
  url: string;
  auth_required: boolean;
  credential_key?: string;
  input_fields: Array<{
    field_key: string;
    label: string;
    format?: string;
    type?: string;
    options?: string[];
  }>;
  applicable_doc_types: string[];
  rpa_selectors: {
    submit?: string[];
    result?: string[];
    [key: string]: string[] | undefined;
  };
  valid_days: number | null;
  notes?: string;
}

const configPath = path.join(process.cwd(), 'config', 'agency_config.json');

/**
 * config/agency_config.json 파일에서 기관 목록을 로드합니다 (Hot-load 지원).
 */
export function loadAgencies(): Agency[] {
  try {
    if (!fs.existsSync(configPath)) {
      // 디렉터리 생성 및 기본 구조 쓰기
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify({ agencies: [] }, null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.agencies || [];
  } catch (err) {
    console.error('[loadAgencies] Error reading config file:', err);
    return [];
  }
}

/**
 * 신규 기관 정보를 config/agency_config.json에 추가하거나 기존 기관 정보를 수정합니다.
 */
export function saveAgency(agency: Agency): void {
  try {
    const agencies = loadAgencies();
    const idx = agencies.findIndex((a) => a.agency_id === agency.agency_id);
    if (idx >= 0) {
      agencies[idx] = agency;
    } else {
      agencies.push(agency);
    }
    
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify({ agencies }, null, 2), 'utf8');
    console.log(`[saveAgency] Successfully saved agency: ${agency.agency_id}`);
  } catch (err) {
    console.error('[saveAgency] Error saving config file:', err);
    throw err;
  }
}

/**
 * Puppeteer를 사용하여 주어진 URL에 접속하고 연결 상태를 점검합니다 (RPA 테스트).
 */
export async function testAgencyConnection(url: string): Promise<{ success: boolean; message: string }> {
  let browser = null;
  let page = null;
  try {
    browser = await getBrowser();
    page = await browser.newPage();
    
    const timeout = parseInt(process.env.RPA_TIMEOUT ?? '10000', 10);
    page.setDefaultNavigationTimeout(timeout);
    
    console.log(`[testAgencyConnection] Connecting to: ${url}`);
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    if (!response) {
      return { success: false, message: '서버로부터 응답이 없습니다.' };
    }
    
    const status = response.status();
    if (status >= 200 && status < 400) {
      return { success: true, message: `연결 성공 (HTTP Status: ${status})` };
    } else {
      return { success: false, message: `연결 오류 (HTTP Status: ${status})` };
    }
  } catch (err: any) {
    console.error('[testAgencyConnection] Connection failed:', err);
    return { success: false, message: `연결 실패: ${err.message || err}` };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {}
    }
  }
}
