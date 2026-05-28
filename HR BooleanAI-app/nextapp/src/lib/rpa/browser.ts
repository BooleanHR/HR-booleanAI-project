/**
 * Puppeteer Stealth 브라우저 싱글톤 팩토리
 * Note: Puppeteer는 서버 컴포넌트 / Server Action에서만 사용합니다.
 * puppeteer-extra와 stealth 플러그인이 설치되어 있을 때 적용,
 * 없으면 일반 puppeteer로 폴백합니다.
 */

import type { Browser, Page, LaunchOptions } from 'puppeteer';

let browserInstance: Browser | null = null;

function getLaunchOptions(): LaunchOptions {
  return {
    headless: process.env.RPA_HEADLESS !== 'false',
    slowMo: parseInt(process.env.RPA_SLOW_MO ?? '0', 10),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1366,768',
      '--lang=ko-KR,ko',
    ],
    defaultViewport: { width: 1366, height: 768 },
  };
}

/**
 * Stealth 플러그인이 적용된 Puppeteer 브라우저 인스턴스를 반환합니다.
 * 싱글톤 패턴: 이미 실행 중인 브라우저가 있으면 재사용합니다.
 */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  try {
    // puppeteer-extra + stealth 시도 (선택적 패키지, 타입 정의 없음)
    // @ts-ignore
    const puppeteerExtra = await import('puppeteer-extra');
    // @ts-ignore
    const StealthPlugin = await import('puppeteer-extra-plugin-stealth');
    // @ts-ignore
    puppeteerExtra.default.use(StealthPlugin.default());
    // @ts-ignore
    browserInstance = await puppeteerExtra.default.launch(getLaunchOptions()) as unknown as Browser;
    console.log('[Browser] Puppeteer Stealth 모드로 시작');
  } catch {
    // 폴백: 일반 puppeteer
    try {
      const puppeteer = await import('puppeteer');
      browserInstance = await puppeteer.default.launch(getLaunchOptions());
      console.log('[Browser] 일반 Puppeteer 모드로 시작');
    } catch (err) {
      throw new Error(`Puppeteer 브라우저 시작 실패: ${err}`);
    }
  }

  // 브라우저 종료 이벤트 처리
  browserInstance.on('disconnected', () => {
    console.warn('[Browser] 브라우저가 종료되었습니다. 다음 요청 시 재시작합니다.');
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * 새 페이지를 열고 기본 설정을 적용합니다.
 */
export async function newPage(): Promise<Page> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // 기본 타임아웃
  const timeout = parseInt(process.env.RPA_TIMEOUT ?? '30000', 10);
  page.setDefaultTimeout(timeout);
  page.setDefaultNavigationTimeout(timeout);

  // 한국어 Accept-Language 헤더
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  });

  // 불필요한 리소스 차단 (이미지/폰트/미디어 제외하고 필요시 활성화)
  // await page.setRequestInterception(true);

  return page;
}

/**
 * 브라우저 인스턴스를 명시적으로 닫습니다.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('[Browser] 브라우저가 종료되었습니다.');
  }
}

/**
 * 페이지에서 스크린샷을 찍고 파일로 저장합니다.
 * @returns 저장된 파일의 절대 경로
 */
export async function takeScreenshot(page: Page, savePath: string): Promise<string> {
  await page.screenshot({ path: savePath as `${string}.png`, fullPage: false });
  return savePath;
}
