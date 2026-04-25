/* ===== HR AI Verification — Opus Prototype v0 — App Logic ===== */

// ── State ──────────────────────────────────────────────
const STATE = {
  currentScreen: 'login',        // login | dashboard
  loggedInUser: null,             // { email, role }
  activeTab: 'all',              // all | fail | manual
  selectedRows: new Set(),
  folderScanned: false,
};

const CREDENTIALS = {
  'test_admin@hrboolean.ai':    { pw: 'Admin123!', role: 'ADMIN' },
  'test_operator@hrboolean.ai': { pw: 'Oper123!',  role: 'OPERATOR' },
};

const MOCK_DATA = [
  { id:'V001', examNo:'2026-0001', name:'홍길동', docType:'졸업증명서',   fileName:'2026-0001_졸업증명서.pdf', confidence:95, method:'문서확인번호', result:'완료',    status:'PASS' },
  { id:'V002', examNo:'2026-0002', name:'김철수', docType:'자격증',       fileName:'2026-0002_정보처리기사.jpg', confidence:88, method:'자격번호',    result:'완료',    status:'PASS' },
  { id:'V003', examNo:'2026-0003', name:'이영희', docType:'토익성적표',   fileName:'2026-0003_토익성적표.jpg',  confidence:72, method:'내용일치',    result:'확인필요', status:'FAIL' },
  { id:'V004', examNo:'2026-0004', name:'박지민', docType:'경력증명서',   fileName:'2026-0004_경력증명서.pdf', confidence:91, method:'문서확인번호', result:'완료',    status:'PASS' },
  { id:'V005', examNo:'2026-0005', name:'최유진', docType:'건강보험자격득실', fileName:'2026-0005_건강보험.pdf', confidence:45, method:'수동검토',    result:'확인필요', status:'MANUAL_REVIEW' },
  { id:'V006', examNo:'2026-0006', name:'정성훈', docType:'졸업증명서',   fileName:'2026-0006_졸업증명서.pdf', confidence:83, method:'내용일치',    result:'확인필요', status:'FAIL' },
];

// ── DOM Helpers ────────────────────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── Screen Switching ──────────────────────────────────
function showScreen(name) {
  STATE.currentScreen = name;
  $$('.screen').forEach(el => el.classList.add('hidden'));
  $(`#screen-${name}`)?.classList.remove('hidden');
}

// ── Login Logic ───────────────────────────────────────
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

// ── Dashboard Render ─────────────────────────────────
function renderDashboard() {
  if (!STATE.loggedInUser) return;
  $('#nav-user-email').textContent = STATE.loggedInUser.email.split('@')[0];
  $('#nav-user-role').textContent  = STATE.loggedInUser.role;
  renderTable();
}

// ── Table Render ──────────────────────────────────────
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
      <td style="font-size:12px;color:var(--text-secondary)">${r.fileName}</td>
      <td>
        <span style="font-weight:600;color:${r.confidence >= 80 ? 'var(--success)' : r.confidence >= 70 ? 'var(--warning)' : 'var(--danger)'}">
          ${r.confidence}%
        </span>
      </td>
      <td>${r.method}</td>
      <td>
        <span class="badge ${r.result === '완료' ? 'badge-success' : 'badge-warning'}">
          ${r.result}
        </span>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openDetailModal('${r.id}')">상세 보기</button>
      </td>
    </tr>
  `).join('');
}

// ── Tab Switch ────────────────────────────────────────
function switchTab(tab) {
  STATE.activeTab = tab;
  $$('.tab').forEach(el => el.classList.remove('active'));
  $(`.tab[data-tab="${tab}"]`).classList.add('active');
  renderTable();
}

// ── Folder Scan ───────────────────────────────────────
function handleFolderScan() {
  const path = $('#folder-path').value.trim();
  if (!path) { showToast('⚠️ 폴더 경로를 입력해주세요.'); return; }
  STATE.folderScanned = true;
  $('#sidebar-tree').classList.remove('hidden');
  $('#scan-status').textContent = '✅ 스캔 완료';
  showToast('📂 폴더 스캔 완료 — 6명의 지원자 서류 발견');
}

// ── Detail Modal ──────────────────────────────────────
function openDetailModal(id) {
  const row = MOCK_DATA.find(r => r.id === id);
  if (!row) return;

  $('#detail-applicant').textContent = `${row.examNo} ${row.name} — ${row.docType}`;
  $('#detail-filename').textContent  = row.fileName;

  // Comparison table
  const isMatch = row.result === '완료';
  $('#compare-tbody').innerHTML = buildCompareRows(row, isMatch);

  // AI Assessment
  $('#ai-assessment-text').textContent = isMatch
    ? `입사지원서의 ${row.docType} 관련 기재내용과 실제 ${row.docType} OCR 추출값, 기관 조회 결과가 모두 일치합니다. 신뢰도 ${row.confidence}%로 정상 확인되었습니다.`
    : `입사지원서의 ${row.docType} 기재내용과 기관 조회 결과에 불일치가 발견되었습니다. 발급번호 또는 취득일자를 재확인하시기 바랍니다. (신뢰도 ${row.confidence}%)`;

  toggleModal('detail-modal', true);
}

function buildCompareRows(row, isMatch) {
  const fields = [
    { label: '성명',     resume: row.name,                        ocr: row.name,               agency: row.name },
    { label: '서류종류', resume: row.docType,                     ocr: row.docType,             agency: row.docType },
    { label: '발급번호', resume: 'GV-2026-'+row.examNo.slice(-4), ocr: 'GV-2026-'+row.examNo.slice(-4), agency: isMatch ? 'GV-2026-'+row.examNo.slice(-4) : 'GV-2025-9999' },
    { label: '취득일자', resume: '2025-08-15',                    ocr: '2025-08-15',            agency: isMatch ? '2025-08-15' : '2024-03-10' },
    { label: '발급기관', resume: '한국대학교',                    ocr: '한국대학교',            agency: '한국대학교' },
  ];
  return fields.map(f => {
    const mismatch = f.ocr !== f.agency;
    return `<tr>
      <td style="font-weight:600">${f.label}</td>
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

// ── Notification Modal ────────────────────────────────
function openNotiModal() {
  const failRows = MOCK_DATA.filter(r => r.status === 'FAIL' || r.status === 'MANUAL_REVIEW');
  const list = $('#noti-list');
  list.innerHTML = failRows.map(r => `
    <li class="noti-item">
      <input type="checkbox" id="noti-${r.id}" checked>
      <div class="info">
        <div class="name">${r.examNo} ${r.name}</div>
        <div class="detail">${r.docType} — ${r.result} (신뢰도 ${r.confidence}%)</div>
      </div>
      <span class="badge badge-warning">${r.result}</span>
    </li>
  `).join('');
  toggleModal('noti-modal', true);
}

function handleSendNotifications() {
  const checked = $$('#noti-list input[type="checkbox"]:checked').length;
  showToast(`📧 ${checked}건의 불일치 안내가 발송되었습니다.`);
  toggleModal('noti-modal', false);
}

// ── Site Settings Modal ───────────────────────────────
function openSiteSettings() {
  toggleModal('site-modal', true);
}
function saveSiteSettings() {
  showToast('⚙️ 사이트 계정 설정이 저장되었습니다.');
  toggleModal('site-modal', false);
}

// ── Modal Toggle ──────────────────────────────────────
function toggleModal(id, show) {
  const overlay = $(`#${id}`);
  if (!overlay) return;
  if (show) { overlay.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  else      { overlay.classList.add('hidden');    document.body.style.overflow = ''; }
}

// ── Export Actions ────────────────────────────────────
function exportExcel() { showToast('📥 엑셀 파일(verification_results.xlsx)을 다운로드합니다.'); }
function exportPDF()   { showToast('📄 감사 PDF 리포트를 다운로드합니다.'); }

// ── Toast ─────────────────────────────────────────────
function showToast(msg) {
  const existing = $('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showScreen('login');

  // Login
  $('#login-form')?.addEventListener('submit', handleLogin);

  // Tabs
  $$('.tab').forEach(el => el.addEventListener('click', () => switchTab(el.dataset.tab)));

  // Close modals on overlay click
  $$('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) toggleModal(el.id, false); });
  });
});
