const fs = require('fs');
let html = fs.readFileSync('hr-booleanai-v0.9.1.html', 'utf8');

// 1. SITE_DATA additions
const siteDataAdd = `      },
      korcham: {
        img: IMG_GOV24,
        url: 'license.korcham.net / 자격증 진위확인',
        title: '🏢 대한상공회의소 — 자격증 진위확인',
        desc: '대한상공회의소 자격평가사업단에서 발급된 자격증(컴퓨터활용능력, 워드프로세서 등)의 진위를 확인합니다. 기업 계정 로그인 후 자격번호와 성명으로 조회합니다.',
        note: '⚠️ 기업 계정 로그인 필요 — 계정 설정에 ID/PW 등록 필수',
        fields: [
          { k:'자격번호', v:'23-K9-002039', res:'23-K9-002039', ok:true },
          { k:'성명', v:'유용완', res:'유용완', ok:true },
        ],
        result: 'ok',
        resultMsg: '✅ 자격증 진위 확인 완료 — 유효한 자격증',
        hlBox: { top:'35%', left:'5%', width:'90%', height:'25%' },
      },
      certpia: {
        img: IMG_GOV24,
        url: 'www.certpia.com / 졸업증명서 진위확인',
        title: '📜 써트피아 — 졸업증명서 진위확인',
        desc: '써트피아에서 발급된 졸업증명서의 진위를 Internet No(문서확인번호)로 확인합니다. 발급일로부터 180일 이내 조회 가능합니다.',
        note: '✅ 실제 연동: www.certpia.com — Internet No 입력 방식',
        fields: [
          { k:'문서확인번호', v:'3730997267993160', res:'3730997267993160', ok:true },
        ],
        result: 'ok',
        resultMsg: '✅ 졸업증명서 진위 확인 완료 — 정상 발급 문서',
        hlBox: { top:'30%', left:'5%', width:'90%', height:'15%' },
      },
      webminwon: {
        img: IMG_GOV24,
        url: 'www.webminwon.com / 졸업증명서 진위확인',
        title: '🖥️ 웹민원센터 — 인터넷 발급문서 진위확인',
        desc: '웹민원센터에서 발급된 졸업증명서·성적증명서의 진위를 문서확인번호(XD02 형식)로 확인합니다. 발급일로부터 180일 이내 유효합니다.',
        note: '✅ 실제 연동: www.webminwon.com — 문서확인번호 4개 블록 입력',
        fields: [
          { k:'문서확인번호', v:'XD02-B55A-0BB1-74BB', res:'XD02-B55A-0BB1-74BB', ok:true },
        ],
        result: 'ok',
        resultMsg: '✅ 발급문서 진위 확인 완료 — 유효한 문서',
        hlBox: { top:'25%', left:'5%', width:'90%', height:'15%' },
      }
    };`;

html = html.replace(/      \},(\r?\n)    \};/, siteDataAdd);

// 2. Add 3 tabs to .site-tabs
const originalTabs = /<div class="site-tab" onclick="switchSiteTab\('nhis',this\)">[\s\S]*?<\/div>/;

const newTabs = `<div class="site-tab" onclick="switchSiteTab('nhis',this)">
            <div class="site-tab-ico">🏥</div>
            <div class="site-tab-lbl">국민건강보험<br><span style="font-size:9px;opacity:.7">자격득실확인서</span></div>
          </div>
          <div class="site-tab" onclick="switchSiteTab('korcham',this)">
            <div class="site-tab-ico">🏢</div>
            <div class="site-tab-lbl">대한상공회의소<br><span style="font-size:9px;opacity:.7">자격증 진위확인</span></div>
          </div>
          <div class="site-tab" onclick="switchSiteTab('certpia',this)">
            <div class="site-tab-lbl">써트피아<br><span style="font-size:9px;opacity:.7">졸업증명서</span></div>
          </div>
          <div class="site-tab" onclick="switchSiteTab('webminwon',this)">
            <div class="site-tab-lbl">웹민원센터<br><span style="font-size:9px;opacity:.7">성적/졸업증명서</span></div>
          </div>`;

html = html.replace(originalTabs, newTabs);

// 3. AI Reviewer Panel
const aiModalTab = `<div class="mtab" onclick="switchModalTab('human',this)">⚠️ 휴먼에러 vs AI 비교</div>
          <div class="mtab" onclick="switchModalTab('ai-review',this)">🤖 AI 검토</div>`;
html = html.replace(/<div class="mtab" onclick="switchModalTab\('human',this\)">⚠️ 휴먼에러 vs AI 비교<\/div>/, aiModalTab);

// 4. Modal Pane
const aiModalPane = `
        <div class="mtab-pane" id="tab-ai-review">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div>
              <div style="font-size:14px;font-weight:700;margin-bottom:6px">🤖 AI Reviewer Agent</div>
              <p style="font-size:13px;color:var(--tx2)">Gemini 1.5 기반으로 서류의 맥락을 분석하고 이상 징후를 탐지합니다.</p>
            </div>
            <button class="btn btn-acc" onclick="runAIReview()" id="btn-run-ai" style="padding:8px 16px;font-size:13px">▶️ AI 심층 검토 실행</button>
          </div>

          <div style="background:var(--s2);border:1px solid var(--bd2);border-radius:10px;padding:16px;min-height:200px">
            <div id="ai-review-status" style="font-family:var(--mono);font-size:11px;color:var(--tx2);margin-bottom:12px;display:flex;align-items:center;gap:8px">
              <span id="ai-status-badge" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--tx3)"></span>
              <span id="ai-status-text">대기 중 — 우측 상단의 실행 버튼을 클릭하세요.</span>
            </div>
            
            <div id="ai-review-content" style="font-size:13px;line-height:1.7;color:var(--tx1);display:none">
              <!-- JS Injected Content -->
            </div>
          </div>
        </div>
`;

html = html.replace(/<\/div><!-- \/modal-body -->/, aiModalPane + `\n      </div><!-- /modal-body -->`);

// 5. CSS change
html = html.replace(/\.infograph-layout \{[\s\S]*?\}/, `.infograph-layout {\n      display: grid;\n      grid-template-columns: 1fr 1.2fr;\n      gap: 40px;\n      align-items: start;\n      margin-top: 52px;\n    }`);

// 6. JS functions (runAIReview)
const aiJs = `
    function runAIReview() {
      const btn = document.getElementById('btn-run-ai');
      const badge = document.getElementById('ai-status-badge');
      const stext = document.getElementById('ai-status-text');
      const cont = document.getElementById('ai-review-content');

      if (btn.disabled) return;
      btn.disabled = true;
      btn.innerHTML = '⏳ 분석 중...';
      btn.style.opacity = '0.7';

      badge.style.background = 'var(--acc)';
      badge.style.boxShadow = '0 0 8px var(--acc)';
      stext.innerText = 'Gemini 1.5 Pro 모델이 문서 맥락과 교차 검증 데이터를 분석하고 있습니다...';
      cont.style.display = 'none';

      setTimeout(() => {
        badge.style.background = 'var(--red)';
        badge.style.boxShadow = 'none';
        stext.innerText = '분석 완료 — 특이사항이 발견되었습니다.';
        
        cont.style.display = 'block';
        cont.innerHTML = \`
          <div style="border-left:3px solid var(--red);padding-left:12px;margin-bottom:16px">
            <strong style="color:var(--red);font-size:14px">⚠️ 요주의: 학위명 불일치 및 발급일자 이상</strong>
          </div>
          <ul style="margin-left:20px;margin-bottom:16px;display:flex;flex-direction:column;gap:8px">
            <li><strong>문서 유형 불일치:</strong> 제출된 문서는 '졸업증명서'이나, 이력서에는 '석사 수료'로 기재됨.</li>
            <li><strong>발급 번호 확인 불가:</strong> 써트피아(Certpia) 연동 결과, 해당 문서확인번호(3730-9972-6799-3160)는 유효 기간이 만료되었거나 존재하지 않음.</li>
            <li><strong>시각적 위변조 징후:</strong> 직인 부분의 해상도(DPI)가 주변 텍스트와 불일치함 (합성 의심).</li>
          </ul>
          <div style="background:rgba(255,77,109,0.1);padding:12px;border-radius:6px;font-weight:700;color:var(--red)">
            💡 AI 권고: 담당자 수동 반려 및 지원자 소명 요청 요망
          </div>
        \`;
        
        btn.innerHTML = '🔄 재실행';
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 2500);
    }
`;

html = html.replace(/function switchModalTab\(tab, el\) \{/, aiJs + `\n    function switchModalTab(tab, el) {`);

fs.writeFileSync('hr-booleanai-v0.9.2.html', html, 'utf8');
console.log('Done 2!');
