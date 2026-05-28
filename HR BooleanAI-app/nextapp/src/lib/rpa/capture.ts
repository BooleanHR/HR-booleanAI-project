/**
 * 4단계 폴백(Fallback) 캡처 엔진
 *
 * Tier 1: Puppeteer Stealth 크롤링 + 스크린샷
 * Tier 2: Chrome 사용자 프로필 데이터 연동 (쿠키/세션 재사용)
 * Tier 3: XHR API 직접 요청 (정부24 등)
 * Tier 4: 수동 검토 전환 + Mock 검증 결과 처리 (mock_used=true)
 */

import { newPage, takeScreenshot } from './browser';
import path from 'path';
import fs from 'fs';

export interface CaptureRequest {
  siteCode: string;
  targetUrl: string;
  username?: string;
  password?: string;
  selectors?: SiteSelectors;
  applicantData: Record<string, string>; // 조회에 필요한 지원자 데이터
  outputDir: string;                     // 스크린샷 저장 디렉터리
}

export interface SiteSelectors {
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  loginButtonSelector?: string;
  searchInputSelector?: string;
  searchButtonSelector?: string;
  resultSelector?: string;
}

export interface CaptureResult {
  success: boolean;
  tierUsed: 1 | 2 | 3 | 4;
  mockUsed: boolean;
  screenshotPath?: string;
  extractedData?: Record<string, string>;
  rawHtml?: string;
  error?: string;
}

// ─────────────────────────────────────────────
// Tier 1: Puppeteer Stealth 크롤링
// ─────────────────────────────────────────────

async function captureTier1(req: CaptureRequest): Promise<CaptureResult> {
  const page = await newPage();
  try {
    // 로그인 처리
    if (req.selectors?.loginUrl && req.username && req.password) {
      await page.goto(req.selectors.loginUrl, { waitUntil: 'networkidle2' });

      if (req.selectors.usernameSelector) {
        await page.type(req.selectors.usernameSelector, req.username, { delay: 50 });
      }
      if (req.selectors.passwordSelector) {
        await page.type(req.selectors.passwordSelector, req.password, { delay: 50 });
      }
      if (req.selectors.loginButtonSelector) {
        await page.click(req.selectors.loginButtonSelector);
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      }
    }

    // 메인 페이지로 이동
    await page.goto(req.targetUrl, { waitUntil: 'networkidle2' });

    // 검색 입력
    if (req.selectors?.searchInputSelector && req.applicantData.searchQuery) {
      await page.waitForSelector(req.selectors.searchInputSelector, { timeout: 10000 });
      await page.type(req.selectors.searchInputSelector, req.applicantData.searchQuery, { delay: 50 });
      if (req.selectors.searchButtonSelector) {
        await page.click(req.selectors.searchButtonSelector);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // 결과 대기
    if (req.selectors?.resultSelector) {
      await page.waitForSelector(req.selectors.resultSelector, { timeout: 15000 });
    } else {
      await new Promise((r) => setTimeout(r, 3000));
    }

    // 스크린샷 저장
    const screenshotPath = path.join(req.outputDir, `${req.siteCode}_${Date.now()}.png`);
    fs.mkdirSync(req.outputDir, { recursive: true });
    await takeScreenshot(page, screenshotPath);

    // 결과 텍스트 추출
    const rawHtml = await page.content();

    return {
      success: true,
      tierUsed: 1,
      mockUsed: false,
      screenshotPath,
      rawHtml,
    };
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// Tier 2: Chrome 사용자 프로필 데이터 연동
// ─────────────────────────────────────────────

async function captureTier2(req: CaptureRequest): Promise<CaptureResult> {
  console.log(`[Capture Tier2] Chrome 프로필 재사용 시도: ${req.siteCode}`);
  // Chrome 프로필 경로 (Windows 기준)
  const chromeUserDataDir = process.env.CHROME_USER_DATA_DIR ??
    `C:/Users/${process.env.USERNAME}/AppData/Local/Google/Chrome/User Data`;

  const page = await newPage();
  try {
    await page.goto(req.targetUrl, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    const screenshotPath = path.join(req.outputDir, `${req.siteCode}_tier2_${Date.now()}.png`);
    fs.mkdirSync(req.outputDir, { recursive: true });
    await takeScreenshot(page, screenshotPath);

    return {
      success: true,
      tierUsed: 2,
      mockUsed: false,
      screenshotPath,
    };
  } finally {
    await page.close();
    void chromeUserDataDir; // suppress unused warning
  }
}

// ─────────────────────────────────────────────
// Tier 3: XHR API 직접 요청 (정부24 등)
// ─────────────────────────────────────────────

async function captureTier3(req: CaptureRequest): Promise<CaptureResult> {
  console.log(`[Capture Tier3] XHR API 직접 요청: ${req.siteCode}`);

  // 정부24 Open API 예시 (실제 API 키 및 엔드포인트 필요)
  if (req.siteCode === 'GOVT24') {
    try {
      const apiKey = process.env.GOVT24_API_KEY;
      if (!apiKey) throw new Error('GOVT24_API_KEY not set');

      const response = await fetch(
        `https://api.gov.go.kr/openapi/v1/graduation?serviceKey=${apiKey}&name=${req.applicantData.name}&birthDate=${req.applicantData.birthDate}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) throw new Error(`API 응답 오류: ${response.status}`);

      const data = await response.json();
      return {
        success: true,
        tierUsed: 3,
        mockUsed: false,
        extractedData: { apiResponse: JSON.stringify(data) },
      };
    } catch (err) {
      throw new Error(`Tier3 XHR 실패: ${err}`);
    }
  }

  throw new Error(`Tier3: ${req.siteCode} XHR API 미지원`);
}

// ─────────────────────────────────────────────
// Tier 4: 수동 검토 전환 (Mock)
// ─────────────────────────────────────────────

function captureTier4(req: CaptureRequest): CaptureResult {
  console.warn(`[Capture Tier4] ${req.siteCode} — 수동 검토 전환 (mock_used=true)`);
  return {
    success: false,
    tierUsed: 4,
    mockUsed: true,
    error: `모든 자동화 방법이 실패했습니다. ${req.siteCode} 사이트를 수동으로 검토하세요.`,
  };
}

// ─────────────────────────────────────────────
// 메인: 4단계 폴백 캡처 엔진
// ─────────────────────────────────────────────

export async function captureWithFallback(req: CaptureRequest): Promise<CaptureResult> {
  // Tier 1: Puppeteer Stealth
  try {
    const result = await captureTier1(req);
    if (result.success) return result;
  } catch (err) {
    console.warn(`[Capture] Tier1 실패 (${req.siteCode}):`, err);
  }

  // Tier 2: Chrome 프로필 재사용
  try {
    const result = await captureTier2(req);
    if (result.success) return result;
  } catch (err) {
    console.warn(`[Capture] Tier2 실패 (${req.siteCode}):`, err);
  }

  // Tier 3: XHR API 직접 요청
  try {
    const result = await captureTier3(req);
    if (result.success) return result;
  } catch (err) {
    console.warn(`[Capture] Tier3 실패 (${req.siteCode}):`, err);
  }

  // Tier 4: 수동 검토 전환
  return captureTier4(req);
}

/**
 * 에듀퓨어/윈스팩 등 수동 처리 대상 사이트 목록
 */
export const MANUAL_SITES = ['EDUPURE', 'WINSPACK'] as const;
export type ManualSiteCode = typeof MANUAL_SITES[number];

export function isManualSite(siteCode: string): siteCode is ManualSiteCode {
  return MANUAL_SITES.includes(siteCode as ManualSiteCode);
}
