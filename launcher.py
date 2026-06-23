import os
import sys
import subprocess
import threading
import webbrowser
import time
import json
import tkinter as tk
from tkinter import messagebox, scrolledtext, ttk
from urllib.request import urlopen, Request
from urllib.error import URLError

# ─────────────────────────────────────────────────
# 경로 설정
# ─────────────────────────────────────────────────
if getattr(sys, 'frozen', False):
    base_dir = os.path.dirname(sys.executable)
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

app_dir = os.path.join(base_dir, "HR BooleanAI-app", "nextapp")
env_local_path = os.path.join(app_dir, ".env.local")

# ─────────────────────────────────────────────────
# 디자인 토큰 (Next.js globals.css 일치)
# ─────────────────────────────────────────────────
COLORS = {
    'bg':    '#06080f',
    's1':    '#0b0f1a',
    's2':    '#101522',
    's3':    '#161d2e',
    's4':    '#1c2438',
    'tx0':   '#dce4f0',
    'tx1':   '#a0adc4',
    'tx2':   '#5c6b82',
    'tx3':   '#3a4558',
    'acc':   '#00d4aa',
    'acc_d': '#00a886',
    'red':   '#ff4d6d',
    'red_d': '#cc3e57',
    'yel':   '#f5c842',
    'blu':   '#4d8fff',
    'pur':   '#a78bfa',
    'bd':    '#1f2a3e',
}


class AppLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("HR BooleanAI — 진위확인 실행기 v2.0")
        self.root.geometry("960x760")
        self.root.configure(bg=COLORS['bg'])
        self.root.resizable(True, True)
        self.root.minsize(780, 600)

        self.server_process = None
        self.active_thread = None
        self.env_data = {}  # parsed .env.local

        # ttk 스타일
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self._setup_styles()

        # UI 구성
        self.create_header()
        self.create_ai_status_panel()
        self.create_controls()
        self.create_log_area()
        self.create_footer()

        # 초기 점검
        self.parse_env_local()
        self.check_node()
        self.refresh_ai_status()

        # 종료 핸들러
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    # ═══════════════════════════════════════════════
    # 스타일 설정
    # ═══════════════════════════════════════════════
    def _setup_styles(self):
        s = self.style
        s.configure('TFrame', background=COLORS['bg'])
        s.configure('Header.TFrame', background=COLORS['s2'])
        s.configure('StatusPanel.TFrame', background=COLORS['s1'])
        s.configure('Controls.TFrame', background=COLORS['bg'])

        s.configure('TLabel', background=COLORS['bg'], foreground=COLORS['tx0'], font=('Malgun Gothic', 10))
        s.configure('Title.TLabel', background=COLORS['s2'], foreground=COLORS['acc'], font=('Malgun Gothic', 15, 'bold'))
        s.configure('Version.TLabel', background=COLORS['s2'], foreground=COLORS['tx2'], font=('Consolas', 9))
        s.configure('Status.TLabel', background=COLORS['s2'], foreground=COLORS['yel'], font=('Malgun Gothic', 11, 'bold'))
        s.configure('Panel.TLabel', background=COLORS['s1'], foreground=COLORS['tx1'], font=('Malgun Gothic', 9))
        s.configure('PanelTitle.TLabel', background=COLORS['s1'], foreground=COLORS['tx0'], font=('Malgun Gothic', 10, 'bold'))

        # 버튼 스타일
        s.configure('Accent.TButton', font=('Malgun Gothic', 10, 'bold'), padding=8,
                     background=COLORS['acc'], foreground='#000000')
        s.map('Accent.TButton', background=[('active', COLORS['acc_d']), ('disabled', COLORS['s3'])])

        s.configure('Danger.TButton', font=('Malgun Gothic', 10, 'bold'), padding=8,
                     background=COLORS['red'], foreground='#000000')
        s.map('Danger.TButton', background=[('active', COLORS['red_d']), ('disabled', COLORS['s3'])])

        s.configure('Normal.TButton', font=('Malgun Gothic', 9), padding=7,
                     background=COLORS['s4'], foreground=COLORS['tx0'])
        s.map('Normal.TButton', background=[('active', COLORS['s3']), ('disabled', COLORS['s3'])])

        s.configure('Blue.TButton', font=('Malgun Gothic', 9), padding=7,
                     background=COLORS['blu'], foreground='#000000')
        s.map('Blue.TButton', background=[('active', '#3a7ae6'), ('disabled', COLORS['s3'])])

        s.configure('Purple.TButton', font=('Malgun Gothic', 9), padding=7,
                     background=COLORS['pur'], foreground='#000000')
        s.map('Purple.TButton', background=[('active', '#8b6fdf'), ('disabled', COLORS['s3'])])

    # ═══════════════════════════════════════════════
    # 상단 헤더
    # ═══════════════════════════════════════════════
    def create_header(self):
        header = ttk.Frame(self.root, padding=(18, 14), style='Header.TFrame')
        header.pack(fill=tk.X, padx=0, pady=0)

        left = ttk.Frame(header, style='Header.TFrame')
        left.pack(side=tk.LEFT)

        ttk.Label(left, text="HR BooleanAI — 진위확인 실행기", style='Title.TLabel').pack(anchor=tk.W)
        ttk.Label(left, text="v2.0 · Claude Agent + MVP Pipeline · Next.js Dashboard", style='Version.TLabel').pack(anchor=tk.W, pady=(2, 0))

        right = ttk.Frame(header, style='Header.TFrame')
        right.pack(side=tk.RIGHT)

        self.status_var = tk.StringVar(value="⏸ 서버 대기 중")
        self.status_label = ttk.Label(right, textvariable=self.status_var, style='Status.TLabel')
        self.status_label.pack(anchor=tk.E)

    # ═══════════════════════════════════════════════
    # AI 엔진 상태 패널 (신규)
    # ═══════════════════════════════════════════════
    def create_ai_status_panel(self):
        wrapper = ttk.Frame(self.root, style='TFrame')
        wrapper.pack(fill=tk.X, padx=14, pady=(10, 0))

        panel = ttk.Frame(wrapper, padding=(16, 10), style='StatusPanel.TFrame')
        panel.pack(fill=tk.X)
        panel.configure(borderwidth=1, relief='solid')

        ttk.Label(panel, text="🤖 AI 엔진 상태", style='PanelTitle.TLabel').grid(row=0, column=0, columnspan=8, sticky=tk.W, pady=(0, 8))

        # 상태 인디케이터 저장용
        self.ai_indicators = {}
        items = [
            ('claude', 'Claude API', 0),
            ('gemini', 'Gemini API', 2),
            ('resend', 'Resend Mail', 4),
            ('db',     'SQLite DB',  6),
        ]

        for key, label, col in items:
            dot = tk.Label(panel, text="●", font=('Consolas', 11), bg=COLORS['s1'], fg=COLORS['tx3'])
            dot.grid(row=1, column=col, padx=(0, 3), sticky=tk.W)

            lbl = ttk.Label(panel, text=label, style='Panel.TLabel')
            lbl.grid(row=1, column=col + 1, padx=(0, 20), sticky=tk.W)

            self.ai_indicators[key] = dot

        # 활성 모델 표시
        self.model_var = tk.StringVar(value="모델: 점검 중...")
        model_label = ttk.Label(panel, textvariable=self.model_var, style='Panel.TLabel')
        model_label.grid(row=2, column=0, columnspan=8, sticky=tk.W, pady=(6, 0))

    # ═══════════════════════════════════════════════
    # 버튼 컨트롤 (2줄 그리드)
    # ═══════════════════════════════════════════════
    def create_controls(self):
        wrapper = ttk.Frame(self.root, padding=(14, 8), style='TFrame')
        wrapper.pack(fill=tk.X)

        # Row 1: 서버 제어
        row1 = ttk.Frame(wrapper, style='TFrame')
        row1.pack(fill=tk.X, pady=(0, 6))

        ttk.Label(row1, text="서버 제어", foreground=COLORS['tx2'], font=('Malgun Gothic', 9, 'bold')).pack(side=tk.LEFT, padx=(4, 12))

        self.btn_start = ttk.Button(row1, text="▶  서버 시작", command=self.start_server, style='Accent.TButton', width=14)
        self.btn_start.pack(side=tk.LEFT, padx=3)

        self.btn_stop = ttk.Button(row1, text="■  서버 중지", command=self.stop_server, state=tk.DISABLED, style='Danger.TButton', width=14)
        self.btn_stop.pack(side=tk.LEFT, padx=3)

        self.btn_browser = ttk.Button(row1, text="🌐  브라우저 열기", command=lambda: webbrowser.open("http://localhost:3000"), style='Normal.TButton', width=16)
        self.btn_browser.pack(side=tk.LEFT, padx=3)

        # Row 2: 도구 & 검증
        row2 = ttk.Frame(wrapper, style='TFrame')
        row2.pack(fill=tk.X)

        ttk.Label(row2, text="도구 · 검증", foreground=COLORS['tx2'], font=('Malgun Gothic', 9, 'bold')).pack(side=tk.LEFT, padx=(4, 12))

        self.btn_health = ttk.Button(row2, text="🔍  환경 점검", command=self.run_health_check, style='Blue.TButton', width=14)
        self.btn_health.pack(side=tk.LEFT, padx=3)

        self.btn_db = ttk.Button(row2, text="🗄  DB 동기화", command=self.setup_db, style='Normal.TButton', width=14)
        self.btn_db.pack(side=tk.LEFT, padx=3)

        self.btn_mvp = ttk.Button(row2, text="🚀  MVP 테스트", command=self.run_mvp_test, style='Purple.TButton', width=14)
        self.btn_mvp.pack(side=tk.LEFT, padx=3)

        self.btn_test = ttk.Button(row2, text="🧪  스모크 테스트", command=self.run_smoke_tests, style='Normal.TButton', width=16)
        self.btn_test.pack(side=tk.LEFT, padx=3)

    # ═══════════════════════════════════════════════
    # 로그 영역 (컬러 하이라이팅)
    # ═══════════════════════════════════════════════
    def create_log_area(self):
        log_frame = ttk.Frame(self.root, padding=(14, 4), style='TFrame')
        log_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(log_frame, text="실행 로그", font=('Malgun Gothic', 10, 'bold'),
                  foreground=COLORS['tx1']).pack(anchor=tk.W, pady=(0, 4))

        self.log_area = scrolledtext.ScrolledText(
            log_frame,
            background=COLORS['bg'],
            foreground=COLORS['tx1'],
            insertbackground=COLORS['tx0'],
            selectbackground=COLORS['acc'],
            selectforeground='#000000',
            font=("Consolas", 10),
            borderwidth=1,
            highlightthickness=1,
            highlightcolor=COLORS['bd'],
            highlightbackground=COLORS['s2'],
            relief='solid',
            padx=10,
            pady=8,
        )
        self.log_area.pack(fill=tk.BOTH, expand=True)
        self.log_area.configure(state=tk.DISABLED)

        # 컬러 태그 설정
        self.log_area.tag_configure('success', foreground=COLORS['acc'])
        self.log_area.tag_configure('error',   foreground=COLORS['red'])
        self.log_area.tag_configure('warn',    foreground=COLORS['yel'])
        self.log_area.tag_configure('info',    foreground=COLORS['blu'])
        self.log_area.tag_configure('purple',  foreground=COLORS['pur'])
        self.log_area.tag_configure('dim',     foreground=COLORS['tx3'])
        self.log_area.tag_configure('bold',    font=('Consolas', 10, 'bold'))

    # ═══════════════════════════════════════════════
    # 푸터
    # ═══════════════════════════════════════════════
    def create_footer(self):
        footer = ttk.Frame(self.root, padding=(14, 8), style='TFrame')
        footer.pack(fill=tk.X, side=tk.BOTTOM)

        ttk.Label(
            footer,
            text="🌐 http://localhost:3000  ·  Claude Agent + Gemini Fallback  ·  MVP Pipeline /api/verify-mvp",
            foreground=COLORS['tx3'],
            font=('Consolas', 9),
        ).pack(side=tk.LEFT)

    # ═══════════════════════════════════════════════
    # 로깅 유틸리티 (컬러 하이라이팅)
    # ═══════════════════════════════════════════════
    def log(self, text, tag=None):
        self.log_area.configure(state=tk.NORMAL)
        if tag:
            self.log_area.insert(tk.END, text, tag)
        else:
            # 자동 태그 감지
            if text.startswith('[성공]') or text.startswith('[완료]') or '✅' in text:
                self.log_area.insert(tk.END, text, 'success')
            elif text.startswith('[오류]') or text.startswith('[실패]') or '❌' in text:
                self.log_area.insert(tk.END, text, 'error')
            elif text.startswith('[경고]') or '⚠' in text:
                self.log_area.insert(tk.END, text, 'warn')
            elif text.startswith('[정보]') or text.startswith('[실행]'):
                self.log_area.insert(tk.END, text, 'info')
            elif text.startswith('[MVP]') or text.startswith('[Claude]'):
                self.log_area.insert(tk.END, text, 'purple')
            else:
                self.log_area.insert(tk.END, text)
        self.log_area.see(tk.END)
        self.log_area.configure(state=tk.DISABLED)

    def log_separator(self, title=""):
        self.log("─" * 60 + "\n", 'dim')
        if title:
            self.log(f"  {title}\n", 'bold')
            self.log("─" * 60 + "\n", 'dim')

    # ═══════════════════════════════════════════════
    # .env.local 파싱
    # ═══════════════════════════════════════════════
    def parse_env_local(self):
        self.env_data = {}
        if not os.path.exists(env_local_path):
            return
        try:
            with open(env_local_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, _, val = line.partition('=')
                        self.env_data[key.strip()] = val.strip().strip('"').strip("'")
        except Exception:
            pass

    def _is_key_real(self, key):
        """API 키가 실제 유효한 값인지 (your-...-here 패턴이 아닌지)"""
        val = self.env_data.get(key, '')
        return bool(val) and not val.startswith('your-') and val != ''

    # ═══════════════════════════════════════════════
    # AI 상태 패널 새로고침
    # ═══════════════════════════════════════════════
    def refresh_ai_status(self):
        self.parse_env_local()

        # Claude
        claude_ok = self._is_key_real('CLAUDE_API_KEY')
        self.ai_indicators['claude'].configure(fg=COLORS['acc'] if claude_ok else COLORS['yel'])

        # Gemini
        gemini_ok = self._is_key_real('GEMINI_API_KEY')
        self.ai_indicators['gemini'].configure(fg=COLORS['acc'] if gemini_ok else COLORS['yel'])

        # Resend
        resend_ok = self._is_key_real('RESEND_API_KEY')
        self.ai_indicators['resend'].configure(fg=COLORS['acc'] if resend_ok else COLORS['yel'])

        # DB
        db_ok = os.path.exists(os.path.join(app_dir, 'dev.db'))
        self.ai_indicators['db'].configure(fg=COLORS['acc'] if db_ok else COLORS['red'])

        # 모델명
        model = self.env_data.get('CLAUDE_MODEL', 'claude-opus-4-5')
        if claude_ok:
            self.model_var.set(f"활성 모델: {model}  ·  Gemini 폴백 {'✅' if gemini_ok else '⚠ Mock'}")
        else:
            if gemini_ok:
                self.model_var.set("활성 모델: gemini-1.5-flash (Claude 미설정 → Gemini 우선)")
            else:
                self.model_var.set("⚠ 모든 AI Key 미설정 → Mock 모드로 동작합니다")

    # ═══════════════════════════════════════════════
    # Node.js 확인
    # ═══════════════════════════════════════════════
    def check_node(self):
        try:
            res = subprocess.run(["node", "-v"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True, shell=True)
            self.log(f"[성공] Node.js 감지: {res.stdout.strip()}\n")
        except Exception:
            self.log("[오류] Node.js를 감지하지 못했습니다. v18 이상이 필요합니다.\n")
            messagebox.showerror("Node.js 감지 실패", "시스템에 Node.js (v18 이상)가 설치되어 있지 않습니다.\n웹 대시보드를 켜려면 Node.js를 먼저 설치해 주시기 바랍니다.")

    # ═══════════════════════════════════════════════
    # 환경 점검 (헬스체크) — 신규
    # ═══════════════════════════════════════════════
    def run_health_check(self):
        self.parse_env_local()
        self.log_separator("🔍 환경 점검 (Health Check)")

        checks = [
            ("프로젝트 디렉토리", os.path.exists(app_dir)),
            ("node_modules 설치됨", os.path.exists(os.path.join(app_dir, 'node_modules'))),
            ("dev.db 존재", os.path.exists(os.path.join(app_dir, 'dev.db'))),
            (".env.local 존재", os.path.exists(env_local_path)),
            ("DATABASE_URL 설정", bool(self.env_data.get('DATABASE_URL'))),
            ("CLAUDE_API_KEY 설정", self._is_key_real('CLAUDE_API_KEY')),
            ("GEMINI_API_KEY 설정", self._is_key_real('GEMINI_API_KEY')),
            ("RESEND_API_KEY 설정", self._is_key_real('RESEND_API_KEY')),
            ("SESSION_SECRET 설정", bool(self.env_data.get('SESSION_SECRET'))),
            ("ENCRYPTION_KEY 설정", bool(self.env_data.get('ENCRYPTION_KEY'))),
        ]

        pass_count = 0
        for label, ok in checks:
            icon = "✅" if ok else "⚠️"
            status = "설정됨" if ok else "미설정 (Mock/기본값 사용)"
            tag = 'success' if ok else 'warn'
            self.log(f"  {icon}  {label:30s} — {status}\n", tag)
            if ok:
                pass_count += 1

        self.log(f"\n  결과: {pass_count}/{len(checks)} 항목 통과\n")

        # Claude 모드 판별
        if not self._is_key_real('CLAUDE_API_KEY'):
            self.log("  [경고] CLAUDE_API_KEY 미설정 → MVP 테스트 시 Mock 모드로 동작합니다.\n")
            if not self._is_key_real('GEMINI_API_KEY'):
                self.log("  [경고] GEMINI_API_KEY도 미설정 → 모든 AI 판정이 Mock 결과를 반환합니다.\n")
        else:
            model = self.env_data.get('CLAUDE_MODEL', 'claude-opus-4-5')
            self.log(f"  [성공] Claude 모델: {model} · API 키 설정 확인 완료\n")

        self.log("\n")
        self.refresh_ai_status()

    # ═══════════════════════════════════════════════
    # 명령 실행 유틸
    # ═══════════════════════════════════════════════
    def run_cmd_thread(self, cmd, on_finish=None, check_env=True):
        if check_env and not os.path.exists(app_dir):
            self.log(f"[오류] 프로젝트 디렉터리를 찾을 수 없습니다: {app_dir}\n")
            return

        def target():
            self.log(f"[실행] {' '.join(cmd)}\n")
            try:
                proc = subprocess.Popen(
                    cmd, cwd=app_dir, stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT, text=True, shell=True, bufsize=1
                )
                while True:
                    line = proc.stdout.readline()
                    if not line:
                        break
                    self.log(line)
                proc.wait()
                self.log(f"[완료] 프로세스 종료 (코드: {proc.returncode})\n\n")
            except Exception as e:
                self.log(f"[오류] 명령 실행 중 예외: {e}\n\n")
            if on_finish:
                self.root.after(0, on_finish)

        threading.Thread(target=target, daemon=True).start()

    # ═══════════════════════════════════════════════
    # 서버 시작/중지
    # ═══════════════════════════════════════════════
    def start_server(self):
        if self.server_process:
            webbrowser.open("http://localhost:3000")
            return

        if not os.path.exists(app_dir):
            self.log(f"[오류] 프로젝트 디렉터리를 찾을 수 없습니다: {app_dir}\n")
            return

        self._set_controls_server_running()
        self.log_separator("▶ 웹 대시보드 서버 시작")

        def run_server():
            # node_modules 자동 설치
            if not os.path.exists(os.path.join(app_dir, "node_modules")):
                self.log("[정보] 의존성 패키지 설치 중 (npm install)...\n")
                proc_install = subprocess.run("npm install", cwd=app_dir, shell=True,
                                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(proc_install.stdout)

            # DB 자동 마이그레이션
            if not os.path.exists(os.path.join(app_dir, "dev.db")):
                self.log("[정보] 데이터베이스 초기 생성 중...\n")
                proc_m = subprocess.run("npx prisma migrate deploy", cwd=app_dir, shell=True,
                                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(proc_m.stdout)
                proc_g = subprocess.run("npx prisma generate", cwd=app_dir, shell=True,
                                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(proc_g.stdout)

            self.log("[실행] npm run dev 시작...\n")
            try:
                self.server_process = subprocess.Popen(
                    "npm run dev", cwd=app_dir, stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT, text=True, shell=True, bufsize=1
                )

                time.sleep(3)
                webbrowser.open("http://localhost:3000")
                self.refresh_ai_status()

                while self.server_process:
                    line = self.server_process.stdout.readline()
                    if not line:
                        break
                    self.log(line)
            except Exception as e:
                self.log(f"[오류] 서버 구동 에러: {e}\n")

            self.root.after(0, self.on_server_stop)

        threading.Thread(target=run_server, daemon=True).start()

    def _set_controls_server_running(self):
        self.btn_start.configure(state=tk.DISABLED)
        self.btn_stop.configure(state=tk.NORMAL)
        self.btn_db.configure(state=tk.DISABLED)
        self.status_var.set("▶ 서버 구동 중")
        self.status_label.configure(foreground=COLORS['acc'])

    def on_server_stop(self):
        self.server_process = None
        self.btn_start.configure(state=tk.NORMAL)
        self.btn_stop.configure(state=tk.DISABLED)
        self.btn_db.configure(state=tk.NORMAL)
        self.status_var.set("■ 서버 중지됨")
        self.status_label.configure(foreground=COLORS['red'])
        self.log("[정보] 웹 서버가 중지되었습니다.\n\n")

    def stop_server(self):
        if not self.server_process:
            return
        self.log("[정보] 웹 서버 종료 중...\n")
        try:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(self.server_process.pid)],
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception as e:
            self.log(f"[오류] 서버 강제 종료 실패: {e}\n")
            if self.server_process:
                self.server_process.terminate()
        self.server_process = None

    # ═══════════════════════════════════════════════
    # MVP 파이프라인 테스트 — 신규
    # ═══════════════════════════════════════════════
    def run_mvp_test(self):
        self.log_separator("🚀 MVP 파이프라인 테스트 (POST /api/verify-mvp)")

        # 서버 구동 확인
        if not self.server_process:
            self.log("[경고] 서버가 구동 중이 아닙니다. 먼저 서버를 시작해주세요.\n\n")
            messagebox.showwarning("서버 미구동", "MVP 테스트를 실행하려면 먼저 서버를 시작해주세요.")
            return

        def do_test():
            try:
                # Mock 테스트 페이로드 (API Key 없이도 동작하는 Mock 모드 테스트)
                payload = json.dumps({
                    "applicantId": "test-applicant-mvp",
                    "documentType": "TOEIC",
                }).encode('utf-8')

                req = Request(
                    "http://localhost:3000/api/verify-mvp",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )

                self.log("[MVP] 요청 전송 중...\n")
                resp = urlopen(req, timeout=30)
                body = json.loads(resp.read().decode('utf-8'))

                self.log("[MVP] 응답 수신 완료:\n", 'purple')
                self.log(f"  ├─ success:    {body.get('success')}\n")
                self.log(f"  ├─ decision:   {body.get('decision')}\n",
                         'success' if body.get('decision') == 'APPROVE' else
                         'error' if body.get('decision') == 'REJECT' else 'warn')
                self.log(f"  ├─ score:      {body.get('score')}\n")
                self.log(f"  ├─ reason:     {body.get('reason')}\n")
                self.log(f"  ├─ isMockMode: {body.get('isMockMode')}\n",
                         'warn' if body.get('isMockMode') else 'success')
                self.log(f"  ├─ fallback:   {body.get('usedFallback')}\n")
                self.log(f"  └─ jobId:      {body.get('verificationJobId')}\n")

                if body.get('isMockMode'):
                    self.log("\n  ⚠ Mock 모드로 실행됨 (CLAUDE_API_KEY 미설정). 실제 AI 판정은 API Key 설정 후 가능합니다.\n", 'warn')
                else:
                    self.log("\n  ✅ 실제 Claude AI 에이전트 판정이 완료되었습니다!\n", 'success')

                self.log("\n")

            except URLError as e:
                if hasattr(e, 'read'):
                    err_body = json.loads(e.read().decode('utf-8'))
                    self.log(f"[오류] API 응답 에러: {err_body.get('error', str(e))}\n\n")
                else:
                    self.log(f"[오류] 서버 연결 실패: {e.reason}\n  서버가 정상 구동 중인지 확인하세요.\n\n")
            except Exception as e:
                self.log(f"[오류] MVP 테스트 실패: {e}\n\n")

        threading.Thread(target=do_test, daemon=True).start()

    # ═══════════════════════════════════════════════
    # 스모크 테스트
    # ═══════════════════════════════════════════════
    def run_smoke_tests(self):
        self.log_separator("🧪 기능 자가 검증 (스모크 테스트)")
        self._disable_tool_buttons()
        self.status_var.set("🧪 테스트 진행 중")
        self.status_label.configure(foreground=COLORS['yel'])

        def finish():
            self._enable_tool_buttons()
            if not self.server_process:
                self.status_var.set("⏸ 서버 대기 중")
                self.status_label.configure(foreground=COLORS['yel'])

        self.run_cmd_thread(["npm", "run", "test:smoke"], on_finish=finish)

    # ═══════════════════════════════════════════════
    # DB 설정 및 동기화
    # ═══════════════════════════════════════════════
    def setup_db(self):
        if messagebox.askyesno("DB 재설정 확인", "데이터베이스 마이그레이션 및 재생성을 진행하시겠습니까?\n기존 로컬 DB 데이터는 유지됩니다."):
            self.log_separator("🗄 DB 마이그레이션 및 동기화")
            self._disable_tool_buttons()
            self.status_var.set("🗄 DB 마이그레이션 중")
            self.status_label.configure(foreground=COLORS['yel'])

            def run_prisma():
                self.log("[실행] prisma migrate dev...\n")
                p1 = subprocess.run("npx prisma migrate dev", cwd=app_dir, shell=True,
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(p1.stdout)
                self.log("[실행] prisma generate...\n")
                p2 = subprocess.run("npx prisma generate", cwd=app_dir, shell=True,
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(p2.stdout)
                self.log("[완료] DB 동기화 완료.\n\n")
                self.root.after(0, self._enable_tool_buttons)
                self.root.after(0, self.refresh_ai_status)
                if not self.server_process:
                    self.root.after(0, lambda: self.status_var.set("⏸ 서버 대기 중"))

            threading.Thread(target=run_prisma, daemon=True).start()

    # ═══════════════════════════════════════════════
    # 버튼 상태 헬퍼
    # ═══════════════════════════════════════════════
    def _disable_tool_buttons(self):
        for btn in [self.btn_test, self.btn_db, self.btn_health]:
            btn.configure(state=tk.DISABLED)

    def _enable_tool_buttons(self):
        for btn in [self.btn_test, self.btn_db, self.btn_health]:
            btn.configure(state=tk.NORMAL)

    # ═══════════════════════════════════════════════
    # 종료
    # ═══════════════════════════════════════════════
    def on_close(self):
        if self.server_process:
            if messagebox.askyesno("종료 확인", "서버가 현재 구동 중입니다.\n서버를 종료하고 프로그램을 끝내시겠습니까?"):
                self.stop_server()
                self.root.destroy()
        else:
            self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = AppLauncher(root)
    root.mainloop()
