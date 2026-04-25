/**
 * 파일명: app.js
 * 개요: HR AI 서류 진위확인 솔루션 Prototype의 클라이언트 사이드 비즈니스 로직
 * 
 * [함수 호출 구조 및 순서]
 * 1. 초기화: DOMContentLoaded -> showScreen('login')
 * 2. 로그인 플로우: handleLogin() -> showScreen('dashboard') -> renderDashboard() -> (renderStatGrid(), renderTable())
 * 3. 탭 전환: switchTab() -> renderTable()
 * 4. 모달 플로우: 
 *    - 상세검증 모달: openDetailModal(id) -> renderCapturePanel(), buildCompareRows() -> toggleModal()
 *    - 알림 모달: openNotiModal() -> renderBadge() -> toggleModal() -> handleSendNotifications()
 *    - 설정 모달: openSiteSettings() -> toggleModal() -> saveSiteSettings()
 * 5. 유틸리티: toggleModal(), showToast(), getConfidenceColor(), renderBadge()
 */

// ── App Constants (RF-07) ──────────────────────────────
const APP_NAME = '🛡️ HR BooleanAI';

// RF-02: SITES 배열 — SiteRow 하드코딩 5개를 데이터로 추출
const SITES = [
  { icon: '🏛️', name: '정부24' },
  { icon: '📜', name: 'Q-Net' },
  { icon: '🏥', name: '건강보험' },
  { icon: '🌐', name: 'OPIC' },
  { icon: '📝', name: 'TOEIC' },
];

// Step 5: 카드 테마 레지스트리 — 색상을 CSS 클래스가 아닌 prop(theme 객체)으로 관리
// 새 테마 추가 시 이 객체만 확장하면 될, 컴포넌트 코드 수정 불필요
const CARD_THEMES = {
  blue:   { valueColor: 'var(--primary)', accentColor: '#818cf8', badgeColor: 'var(--primary-light)' },
  green:  { valueColor: 'var(--success)', accentColor: '#10b981', badgeColor: 'var(--success-bg)' },
  yellow: { valueColor: 'var(--warning)', accentColor: '#f59e0b', badgeColor: 'var(--warning-bg)' },
  red:    { valueColor: 'var(--danger)',  accentColor: '#ef4444', badgeColor: 'var(--danger-bg)' },
};

// CP-01 + Step 5: StatCard 데이터 — modifier 클래스 의존 → theme prop 으로 교체
const STATS_CONFIG = [
  { theme: 'blue',   icon: '📊', label: '총 검증 서류', value: '1,245', sub: '전체 처리 대상' },
  { theme: 'green',  icon: '✅', label: '검증 완료',    value: '1,130', sub: '정상 확인 완료' },
  { theme: 'yellow', icon: '⚠️', label: '확인 필요',    value: '115',   sub: '불일치 또는 미확인' },
  { theme: 'red',    icon: '🔍', label: '수동 리뷰 큐', value: '12',    sub: '저화질/OCR 실패' },
];

// ── State (RF-06: 미사용 selectedRows 제거) ────────────
const STATE = {
  currentScreen: 'login',   // login | dashboard
  loggedInUser: null,        // { email, role }
  activeTab: 'all',          // all | fail | manual
  folderScanned: false,
};

const CREDENTIALS = {
  'test_admin@hrboolean.ai':    { pw: 'Admin123!', role: 'ADMIN' },
  'test_operator@hrboolean.ai': { pw: 'Oper123!',  role: 'OPERATOR' },
};

const MOCK_DATA = [
  { id:'V001', examNo:'2026-0001', name:'홍길동', docType:'졸업증명서',      fileName:'2026-0001_졸업증명서.pdf',  confidence:95, method:'문서확인번호', result:'완료',    status:'PASS' },
  { id:'V002', examNo:'2026-0002', name:'김철수', docType:'자격증',          fileName:'2026-0002_정보처리기사.jpg', confidence:88, method:'자격번호',    result:'완료',    status:'PASS' },
  { id:'V003', examNo:'2026-0003', name:'이영희', docType:'토익성적표',      fileName:'2026-0003_토익성적표.jpg',  confidence:72, method:'내용일치',    result:'확인필요', status:'FAIL' },
  { id:'V004', examNo:'2026-0004', name:'박지민', docType:'경력증명서',      fileName:'2026-0004_경력증명서.pdf', confidence:91, method:'문서확인번호', result:'완료',    status:'PASS' },
  { id:'V005', examNo:'2026-0005', name:'최유진', docType:'건강보험자격득실', fileName:'2026-0005_건강보험.pdf',   confidence:45, method:'수동검토',    result:'확인필요', status:'MANUAL_REVIEW' },
  { id:'V006', examNo:'2026-0006', name:'정성훈', docType:'졸업증명서',      fileName:'2026-0006_졸업증명서.pdf', confidence:83, method:'내용일치',    result:'확인필요', status:'FAIL' },
];

// ── DOM Helpers ────────────────────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── UI Helpers ─────────────────────────────────────────

/**
 * 개요: 신뢰도 수치에 따른 테마 색상(CSS 변수) 반환
 * @param {number} confidence - OCR/AI 신뢰도 점수 (0~100)
 * @returns {string} 테마 색상 CSS 변수 문자열
 */
function getConfidenceColor(confidence) {
  if (confidence >= 80) return 'var(--success)';
  if (confidence >= 70) return 'var(--warning)';
  return 'var(--danger)';
}

/**
 * 개요: 상태 텍스트에 맞는 뱃지 UI(HTML 문자열) 생성
 * 데이터 플로우: 검증 상태 문자열 -> 뱃지 UI HTML 반환 -> renderTable() 및 openNotiModal()에서 주입
 * @param {string} text - 뱃지에 표시할 텍스트
 * @param {string} type - 뱃지 스타일 타입 (success, warning, danger 등)
 * @returns {string} 뱃지 HTML 문자열
 */
function renderBadge(text, type = 'warning') {
  return `<span class="badge badge-${type}">${text}</span>`;
}

/**
 * 개요: 증빙 서류 및 캡처 화면을 보여주기 위한 패널 UI 렌더링
 * @param {Object} props - { title: 패널 제목, icon: 문서 아이콘, label: 패널 라벨, subtitle: 부가설명 }
 * @returns {string} 캡처 패널 HTML 문자열
 */
function renderCapturePanel({ title, icon, label, subtitle }) {
  return `
    <div class="capture-panel">
      <div class="panel-title">
        ${title}
        <div class="zoom-controls">
          <button>−</button><button>+</button><button>↻</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="mock-doc">
          <span class="text-2xl" aria-hidden="true">${icon}</span>
          <span class="sr-only">${label} 문서 미리보기</span>
          <span>${label}</span>
          <span class="text-[10px]">${subtitle}</span>
        </div>
      </div>
    </div>`;
}

// ── Screen Switching ───────────────────────────────────
function showScreen(name) {
  STATE.currentScreen = name;
  $$('.screen').forEach(el => el.classList.add('hidden'));
  $(`#screen-${name}`)?.classList.remove('hidden');
}

// ── Login Logic ────────────────────────────────────────

/**
 * 개요: 로그인 폼 제출 이벤트 핸들러
 * 데이터 플로우: 사용자 입력 -> CREDENTIALS 객체와 매칭 -> STATE.loggedInUser 업데이트 -> 화면 전환
 * @param {Event} e - 폼 제출 이벤트 객체
 */
function handleLogin(e) {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const pw    = $('#login-password').value;
  const errEl = $('#login-error');

  const account = CREDENTIALS[email];
  if (account && account.pw === pw) {
    STATE.loggedInUser = { email, role: account.role };
    errEl.classList.remove('show');
    showScreen('dashboard');
    renderDashboard();
  } else {
    errEl.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
    errEl.classList.add('show');
  }
}

function handleLogout() {
  STATE.loggedInUser = null;
  showScreen('login');
  $('#login-email').value = '';
  $('#login-password').value = '';
}

// ── Dashboard Render ───────────────────────────────────
function renderDashboard() {
  if (!STATE.loggedInUser) return;
  $('#nav-user-email').textContent = STATE.loggedInUser.email.split('@')[0];
  $('#nav-user-role').textContent  = STATE.loggedInUser.role;
  renderStatGrid();
  renderTable();
}

/**
 * 개요: 통계 카드 섹션 렌더링 (CP-01 컴포넌트 패턴)
 * 데이터 플로우: CARD_THEMES 레지스트리 기반 테마 적용 -> STATS_CONFIG 배열 순회 -> DOM(#stats-grid) 주입
 */
function renderStatGrid() {
  const grid = $('#stats-grid');
  if (!grid) return;
  grid.innerHTML = STATS_CONFIG.map(s => {
    const t = CARD_THEMES[s.theme] ?? CARD_THEMES.blue;
    return `
      <div class="stat-card" style="border-left:4px solid ${t.accentColor};">
        <div class="stat-label">${s.icon} ${s.label}</div>
        <div class="stat-value" style="color:${t.valueColor}">${s.value}</div>
        <div class="stat-sub">${s.sub}</div>
      </div>`;
  }).join('');
}

// ── Table Render ───────────────────────────────────────

/**
 * 개요: 지원자 검증 결과 데이터(MOCK_DATA)를 테이블 화면에 렌더링
 * 데이터 플로우: STATE.activeTab 탭 조건에 맞추어 MOCK_DATA 필터링 -> HTML 테이블 row(tr) 문자열 생성 -> DOM 주입
 */
function renderTable() {
  const tbody = $('#results-tbody');
  if (!tbody) return;

  let data = MOCK_DATA;
  if (STATE.activeTab === 'fail')   data = MOCK_DATA.filter(r => r.status === 'FAIL');
  if (STATE.activeTab === 'manual') data = MOCK_DATA.filter(r => r.status === 'MANUAL_REVIEW');

  tbody.innerHTML = data.map(r => `
    <tr data-id="${r.id}">
      <td>${r.examNo}</td>
      <td><strong>${r.name}</strong></td>
      <td>${r.docType}</td>
      <td class="text-xs text-slate-500">${r.fileName}</td>
      <td>
        <span class="font-semibold" style="color:${getConfidenceColor(r.confidence)}">
          ${r.confidence}%
        </span>
      </td>
      <td>${r.method}</td>
      <td>${renderBadge(r.result, r.status === 'PASS' ? 'success' : 'warning')}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openDetailModal('${r.id}')">상세 보기</button>
      </td>
    </tr>
  `).join('');
}

// ── Tab Switch ─────────────────────────────────────────
function switchTab(tab) {
  STATE.activeTab = tab;
  $$('.tab').forEach(el => el.classList.remove('active'));
  $(`.tab[data-tab="${tab}"]`).classList.add('active');
  renderTable();
}

// ── Folder Scan (RF-09: 불필요한 hidden 토글 제거) ─────
function handleFolderScan() {
  const path = $('#folder-path').value.trim();
  if (!path) { showToast('⚠️ 폴더 경로를 입력해주세요.'); return; }
  STATE.folderScanned = true;
  $('#scan-status').textContent = '✅ 스캔 완료';
  showToast('📂 폴더 스캔 완료 — 6명의 지원자 서류 발견');
}

// ── Detail Modal (RF-01, RF-03 적용) ──────────────────

/**
 * 개요: 선택된 데이터의 상세 정보(모달)를 화면에 출력
 * 데이터 플로우: 파라미터 id 수신 -> MOCK_DATA 검색 -> 모달 요소별 데이터 바인딩 -> 캡처뷰어 및 비교테이블 렌더링
 * @param {string} id - 지원자 검증 데이터 ID
 */
function openDetailModal(id) {
  const row = MOCK_DATA.find(r => r.id === id);
  if (!row) return;

  $('#detail-applicant').textContent = `${row.examNo} ${row.name} — ${row.docType}`;
  $('#detail-filename').textContent  = row.fileName;

  // RF-01: renderCapturePanel()로 두 패널 동적 생성
  $('#capture-viewer').innerHTML =
    renderCapturePanel({ title: '📋 지원자 제출 원본 서류', icon: '📄', label: '원본 서류',   subtitle: 'PDF / JPG' }) +
    renderCapturePanel({ title: '🖥️ 기관조회 로컬 RPA 캡처', icon: '🖥️', label: 'RPA 캡처 화면', subtitle: '정부24 / Q-Net' });

  // RF-03: 판별 기준을 한국어 문자열 '완료' → status 필드 'PASS'로 일원화
  const isMatch = row.status === 'PASS';
  $('#compare-tbody').innerHTML = buildCompareRows(row, isMatch);

  $('#ai-assessment-text').textContent = isMatch
    ? `입사지원서의 ${row.docType} 관련 기재내용과 실제 ${row.docType} OCR 추출값, 기관 조회 결과가 모두 일치합니다. 신뢰도 ${row.confidence}%로 정상 확인되었습니다.`
    : `입사지원서의 ${row.docType} 기재내용과 기관 조회 결과에 불일치가 발견되었습니다. 발급번호 또는 취득일자를 재확인하시기 바랍니다. (신뢰도 ${row.confidence}%)`;

  toggleModal('detail-modal', true);
}

/**
 * 개요: 서류 간(입사지원서, OCR, 기관조회) Triple Check 비교 결과 테이블 HTML 생성
 * @param {Object} row - 지원자 단일 데이터 레코드
 * @param {boolean} isMatch - 최종 일치 여부
 * @returns {string} 비교 테이블 tbody용 HTML
 */
function buildCompareRows(row, isMatch) {
  const fields = [
    { label: '성명',     resume: row.name,                         ocr: row.name,                        agency: row.name },
    { label: '서류종류', resume: row.docType,                      ocr: row.docType,                     agency: row.docType },
    { label: '발급번호', resume: 'GV-2026-'+row.examNo.slice(-4),  ocr: 'GV-2026-'+row.examNo.slice(-4), agency: isMatch ? 'GV-2026-'+row.examNo.slice(-4) : 'GV-2025-9999' },
    { label: '취득일자', resume: '2025-08-15',                     ocr: '2025-08-15',                    agency: isMatch ? '2025-08-15' : '2024-03-10' },
    { label: '발급기관', resume: '한국대학교',                     ocr: '한국대학교',                    agency: '한국대학교' },
  ];
  return fields.map(f => {
    const mismatch = f.ocr !== f.agency;
    return `<tr>
      <td class="font-semibold">${f.label}</td>
      <td>${f.resume}</td>
      <td>${f.ocr}</td>
      <td class="${mismatch ? 'mismatch' : 'match'}">${f.agency} ${mismatch ? '⚠️' : '✓'}</td>
    </tr>`;
  }).join('');
}

function handleApprove() {
  showToast('✅ 승인 완료 — 로컬 "5. 진위확인결과" 폴더에 저장되었습니다.');
  toggleModal('detail-modal', false);
}

function handleReject() {
  const reason = prompt('반려 사유를 입력해주세요:');
  if (reason !== null) {
    showToast('❌ 반려 처리 완료 — 사유: ' + (reason || '(미입력)'));
    toggleModal('detail-modal', false);
  }
}

// ── Notification Modal (RF-05: renderBadge 사용) ───────
function openNotiModal() {
  const failRows = MOCK_DATA.filter(r => r.status === 'FAIL' || r.status === 'MANUAL_REVIEW');
  $('#noti-list').innerHTML = failRows.map(r => `
    <li class="noti-item">
      <input type="checkbox" id="noti-${r.id}" checked>
      <div class="info">
        <div class="name">${r.examNo} ${r.name}</div>
        <div class="detail">${r.docType} — ${r.result} (신뢰도 ${r.confidence}%)</div>
      </div>
      ${renderBadge(r.result)}
    </li>
  `).join('');
  toggleModal('noti-modal', true);
}

function handleSendNotifications() {
  const checked = $$('#noti-list input[type="checkbox"]:checked').length;
  showToast(`📧 ${checked}건의 불일치 안내가 발송되었습니다.`);
  toggleModal('noti-modal', false);
}

// ── Site Settings Modal (RF-02: SITES 배열로 동적 렌더링) ─
function openSiteSettings() {
  $('#site-rows-container').innerHTML = SITES.map(site => `
    <div class="site-row">
      <span class="site-name">${site.icon} ${site.name}</span>
      <input class="form-input max-w-[160px]" placeholder="아이디">
      <input class="form-input max-w-[160px]" type="password" placeholder="비밀번호">
    </div>
  `).join('');
  toggleModal('site-modal', true);
}

function saveSiteSettings() {
  showToast('⚙️ 사이트 계정 설정이 저장되었습니다.');
  toggleModal('site-modal', false);
}

// ── Modal Toggle ───────────────────────────────────────
function toggleModal(id, show) {
  const overlay = $(`#${id}`);
  if (!overlay) return;
  if (show) { overlay.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  else      { overlay.classList.add('hidden');    document.body.style.overflow = ''; }
}

// ── Export Actions ─────────────────────────────────────
function exportExcel() { showToast('📥 엑셀 파일(verification_results.xlsx)을 다운로드합니다.'); }
function exportPDF()   { showToast('📄 감사 PDF 리포트를 다운로드합니다.'); }

// ── Toast ──────────────────────────────────────────────
function showToast(msg) {
  const existing = $('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showScreen('login');

  $('#login-form')?.addEventListener('submit', handleLogin);

  $$('.tab').forEach(el => el.addEventListener('click', () => switchTab(el.dataset.tab)));

  $$('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) toggleModal(el.id, false); });
  });
});
