import { getBrowser } from '../rpa/browser';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SelectorRecommendation {
  loginUrl: string;
  usernameSelector: string;
  passwordSelector: string;
  loginButtonSelector: string;
  searchInputSelector: string;
  searchButtonSelector: string;
  resultSelector: string;
  mockUsed?: boolean;
}

/**
 * 타겟 URL의 HTML DOM을 추출한 뒤 Gemini AI에 전달하여
 * 가장 유력한 CSS 셀렉터 후보를 분석 및 추천받습니다.
 */
export async function analyzeSelectors(url: string): Promise<SelectorRecommendation> {
  let browser = null;
  let page = null;
  let elements: any[] = [];

  try {
    browser = await getBrowser();
    page = await browser.newPage();
    
    const timeout = parseInt(process.env.RPA_TIMEOUT ?? '15000', 10);
    page.setDefaultNavigationTimeout(timeout);
    
    console.log(`[analyzeSelectors] Loading page to extract DOM: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // 주요 인터랙티브 엘리먼트 정보만 추출하여 컨텍스트 낭비 및 토큰 초과 방지
    elements = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('input, select, textarea, button, form, [id], [class]'));
      return nodes.map(node => {
        const tagName = node.tagName.toLowerCase();
        const id = node.getAttribute('id') || '';
        const name = node.getAttribute('name') || '';
        const type = node.getAttribute('type') || '';
        const placeholder = node.getAttribute('placeholder') || '';
        const text = node.textContent?.trim().slice(0, 30) || '';
        const className = node.getAttribute('class') || '';
        return { tagName, id, name, type, placeholder, text, className };
      }).slice(0, 80); // 상위 80개 엘리먼트로 제한
    });
  } catch (err) {
    console.warn('[analyzeSelectors] Failed to fetch page DOM via Puppeteer, running with empty DOM:', err);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {}
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.warn('[analyzeSelectors] GEMINI_API_KEY가 구성되지 않았으므로 Mock 기본 셀렉터를 추천합니다.');
    return {
      loginUrl: url,
      usernameSelector: '#userId',
      passwordSelector: '#userPw',
      loginButtonSelector: '#btnLogin',
      searchInputSelector: '#docNo',
      searchButtonSelector: '#btnSearch',
      resultSelector: '#resultDiv',
      mockUsed: true
    };
  }

  const prompt = `
당신은 웹 크롤링 및 RPA 자동화 스크립트 작성을 위한 CSS 셀렉터 분석 전문가입니다.
다음은 진위확인 사이트(${url})에서 추출한 주요 HTML DOM 엘리먼트 데이터입니다.

## DOM 엘리먼트 목록
${JSON.stringify(elements, null, 2)}

## 미션
위 DOM 엘리먼트의 태그명, ID, name, 클래스명, placeholder, 텍스트 등을 면밀히 검토하여, 다음 동작을 실행하기 위해 가장 적합한 CSS 셀렉터(Selector) 후보를 추천하십시오:
1. "usernameSelector": 아이디 또는 사용자명을 입력하는 input 필드 셀렉터
2. "passwordSelector": 패스워드를 입력하는 input 필드 셀렉터
3. "loginButtonSelector": 로그인 버튼 또는 submit 버튼 셀렉터
4. "searchInputSelector": 문서확인번호, 수험번호, 자격번호 등을 입력하는 검색창 input 필드 셀렉터
5. "searchButtonSelector": 조회/검색을 실행시키는 버튼 셀렉터
6. "resultSelector": 진위확인 결과 텍스트가 표시될 결과 컨테이너 또는 테이블 셀렉터
7. "loginUrl": 로그인 페이지 URL (만약 DOM 구조상 로그인 페이지 링크가 있거나 현재 URL과 동일할 경우 적절한 URL 권장)

## 주의사항
- 가장 가독성 좋고 고유한(unique) 셀렉터를 제안하세요. (예: 가능하면 ID 셀렉터 #id, 차선책으로 input[name='name'] 등)
- 데이터가 불충분하여 매칭되는 요소를 찾기 어려울 경우 빈 문자열("")을 넣으세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "loginUrl": "로그인 URL 또는 입력 URL",
  "usernameSelector": "CSS 셀렉터",
  "passwordSelector": "CSS 셀렉터",
  "loginButtonSelector": "CSS 셀렉터",
  "searchInputSelector": "CSS 셀렉터",
  "searchButtonSelector": "CSS 셀렉터",
  "resultSelector": "CSS 셀렉터"
}
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON formatted response not found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      loginUrl: parsed.loginUrl || url,
      usernameSelector: parsed.usernameSelector || '',
      passwordSelector: parsed.passwordSelector || '',
      loginButtonSelector: parsed.loginButtonSelector || '',
      searchInputSelector: parsed.searchInputSelector || '',
      searchButtonSelector: parsed.searchButtonSelector || '',
      resultSelector: parsed.resultSelector || ''
    };
  } catch (err: any) {
    console.error('[analyzeSelectors] Gemini generation failed, returning default:', err);
    return {
      loginUrl: url,
      usernameSelector: '',
      passwordSelector: '',
      loginButtonSelector: '',
      searchInputSelector: '',
      searchButtonSelector: '',
      resultSelector: ''
    };
  }
}
