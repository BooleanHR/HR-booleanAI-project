import os
import sys
import subprocess
import threading
import webbrowser
import time
import tkinter as tk
from tkinter import messagebox, scrolledtext, ttk

# 실행 파일 혹은 스크립트가 위치한 경로 탐색
if getattr(sys, 'frozen', False):
    base_dir = os.path.dirname(sys.executable)
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

app_dir = os.path.join(base_dir, "HR BooleanAI-app", "nextapp")

class AppLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("불리언 진위확인 실행기 (HR BooleanAI)")
        self.root.geometry("820x680")
        self.root.configure(bg="#1e1e2e")
        self.root.resizable(True, True)
        
        self.server_process = None
        self.active_thread = None
        
        # ttk 스타일 구성 (다크 테마 느낌)
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # 색상 세팅
        self.bg_main = '#1e1e2e'
        self.bg_panel = '#313244'
        self.fg_main = '#cdd6f4'
        self.fg_accent = '#89b4fa'
        
        self.style.configure('TFrame', background=self.bg_main)
        self.style.configure('Panel.TFrame', background=self.bg_panel)
        self.style.configure('TLabel', background=self.bg_main, foreground=self.fg_main, font=('Malgun Gothic', 10))
        self.style.configure('Title.TLabel', background=self.bg_panel, foreground=self.fg_accent, font=('Malgun Gothic', 16, 'bold'))
        self.style.configure('Status.TLabel', background=self.bg_panel, foreground='#f9e2af', font=('Malgun Gothic', 11, 'bold'))
        
        # 버튼 커스텀 스타일
        self.style.configure('Accent.TButton', font=('Malgun Gothic', 11, 'bold'), background=self.fg_accent, foreground='#11111b', borderwidth=0)
        self.style.map('Accent.TButton', background=[('active', '#b4befe')])
        
        self.style.configure('Normal.TButton', font=('Malgun Gothic', 10), background='#45475a', foreground=self.fg_main, borderwidth=0)
        self.style.map('Normal.TButton', background=[('active', '#585b70')])
        
        self.style.configure('Danger.TButton', font=('Malgun Gothic', 10, 'bold'), background='#f38ba8', foreground='#11111b', borderwidth=0)
        self.style.map('Danger.TButton', background=[('active', '#f8a2b8')])
        
        # UI 구성요소 생성
        self.create_widgets()
        
        # Node.js 유무 사전 확인
        self.check_node()
        
        # 종료 이벤트 바인딩
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        
    def check_node(self):
        try:
            res = subprocess.run(["node", "-v"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True, shell=True)
            self.log(f"Node.js 버전 감지: {res.stdout.strip()}\n")
        except Exception:
            self.log("[경고] 시스템에서 Node.js를 감지하지 못했습니다.\n서버 구동을 위해서는 Node.js(v18 이상) 설치가 필요합니다.\n\n")
            messagebox.showerror("Node.js 감지 실패", "시스템에 Node.js (v18 이상)가 설치되어 있지 않습니다.\n웹 대시보드를 켜려면 Node.js를 먼저 설치해 주시기 바랍니다.")

    def create_widgets(self):
        # 상단 헤더 패널
        header = ttk.Frame(self.root, padding=15, style='Panel.TFrame')
        header.pack(fill=tk.X, padx=15, pady=10)
        
        title_label = ttk.Label(header, text="불리언 진위확인 실행기 (HR BooleanAI)", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        self.status_var = tk.StringVar(value="서버 상태: 대기 중")
        self.status_label = ttk.Label(header, textvariable=self.status_var, style='Status.TLabel')
        self.status_label.pack(side=tk.RIGHT)
        
        # 중앙 버튼 컨트롤 패널
        controls = ttk.Frame(self.root, padding=10)
        controls.pack(fill=tk.X, padx=15, pady=5)
        
        self.btn_start = ttk.Button(controls, text="웹 대시보드 서버 시작", command=self.start_server, style='Accent.TButton', width=22)
        self.btn_start.pack(side=tk.LEFT, padx=5)
        
        self.btn_stop = ttk.Button(controls, text="서버 중지", command=self.stop_server, state=tk.DISABLED, style='Danger.TButton', width=12)
        self.btn_stop.pack(side=tk.LEFT, padx=5)
        
        self.btn_test = ttk.Button(controls, text="기능 자가 검증 (스모크 테스트)", command=self.run_smoke_tests, style='Normal.TButton', width=26)
        self.btn_test.pack(side=tk.LEFT, padx=5)
        
        self.btn_db = ttk.Button(controls, text="DB 설정 및 동기화", command=self.setup_db, style='Normal.TButton', width=18)
        self.btn_db.pack(side=tk.LEFT, padx=5)
        
        # 하단 터미널 로그창 패널
        log_frame = ttk.Frame(self.root, padding=5)
        log_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=10)
        
        log_title = ttk.Label(log_frame, text="실행 로그", font=('Malgun Gothic', 11, 'bold'))
        log_title.pack(anchor=tk.W, pady=2)
        
        self.log_area = scrolledtext.ScrolledText(
            log_frame, 
            background="#11111b", 
            foreground="#cdd6f4", 
            insertbackground="#cdd6f4",
            font=("Consolas", 10), 
            borderwidth=0, 
            highlightthickness=1,
            highlightcolor="#313244",
            highlightbackground="#11111b"
        )
        self.log_area.pack(fill=tk.BOTH, expand=True)
        self.log_area.configure(state=tk.DISABLED)
        
        # 최하단 안내 바
        footer = ttk.Frame(self.root, padding=10)
        footer.pack(fill=tk.X, side=tk.BOTTOM)
        
        footer_label = ttk.Label(
            footer, 
            text="로컬 웹 서버 주소: http://localhost:3000 | 본 실행기는 Next.js 개발 서버와 데이터베이스 작업을 자동으로 처리합니다.", 
            foreground="#a6adc8", 
            font=('Malgun Gothic', 9)
        )
        footer_label.pack(side=tk.LEFT)

    def log(self, text):
        self.log_area.configure(state=tk.NORMAL)
        self.log_area.insert(tk.END, text)
        self.log_area.see(tk.END)
        self.log_area.configure(state=tk.DISABLED)
        
    def run_cmd_thread(self, cmd, on_finish=None, check_env=True):
        if check_env and not os.path.exists(app_dir):
            self.log(f"[오류] 프로젝트 디렉터리를 찾을 수 없습니다: {app_dir}\n")
            return
            
        def target():
            self.log(f"[실행] { ' '.join(cmd) }\n")
            try:
                proc = subprocess.Popen(
                    cmd,
                    cwd=app_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    shell=True,
                    bufsize=1
                )
                
                while True:
                    line = proc.stdout.readline()
                    if not line:
                        break
                    self.log(line)
                    
                proc.wait()
                self.log(f"[완료] 프로세스가 종료되었습니다 (종료 코드: {proc.returncode})\n\n")
            except Exception as e:
                self.log(f"[오류] 명령 실행 중 예외가 발생했습니다: {e}\n\n")
                
            if on_finish:
                self.root.after(0, on_finish)
                
        thread = threading.Thread(target=target, daemon=True)
        thread.start()
        return thread

    def start_server(self):
        if self.server_process:
            # 이미 작동 중인 상태라면 웹 브라우저만 다시 띄워줍니다.
            webbrowser.open("http://localhost:3000")
            return
            
        if not os.path.exists(app_dir):
            self.log(f"[오류] 프로젝트 디렉터리를 찾을 수 없습니다: {app_dir}\n")
            return
            
        self.btn_start.configure(state=tk.DISABLED)
        self.btn_stop.configure(state=tk.NORMAL)
        self.btn_test.configure(state=tk.DISABLED)
        self.btn_db.configure(state=tk.DISABLED)
        self.status_var.set("서버 상태: 구동 중...")
        self.status_label.configure(foreground="#a6e3a1")
        
        def run_server():
            # node_modules 설치 확인
            if not os.path.exists(os.path.join(app_dir, "node_modules")):
                self.log("[정보] 의존성 패키지가 존재하지 않습니다. 최초 설치를 시작합니다 (npm install)...\n")
                proc_install = subprocess.run("npm install", cwd=app_dir, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(proc_install.stdout)
                
            # SQLite 파일 존재 및 마이그레이션 확인
            if not os.path.exists(os.path.join(app_dir, "dev.db")):
                self.log("[정보] 데이터베이스 파일이 존재하지 않습니다. 초기 생성을 수행합니다...\n")
                proc_migrate = subprocess.run("npx prisma migrate deploy", cwd=app_dir, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(proc_migrate.stdout)
                proc_gen = subprocess.run("npx prisma generate", cwd=app_dir, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(proc_gen.stdout)
                
            self.log("[실행] 웹 대시보드 서버를 시작합니다 (npm run dev)...\n")
            try:
                self.server_process = subprocess.Popen(
                    "npm run dev",
                    cwd=app_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    shell=True,
                    bufsize=1
                )
                
                # 웹 브라우저 열기 딜레이
                time.sleep(2)
                webbrowser.open("http://localhost:3000")
                
                while self.server_process:
                    line = self.server_process.stdout.readline()
                    if not line:
                        break
                    self.log(line)
            except Exception as e:
                self.log(f"[오류] 서버 구동 중 에러 발생: {e}\n")
                
            self.root.after(0, self.on_server_stop)

        threading.Thread(target=run_server, daemon=True).start()

    def on_server_stop(self):
        self.server_process = None
        self.btn_start.configure(state=tk.NORMAL)
        self.btn_stop.configure(state=tk.DISABLED)
        self.btn_test.configure(state=tk.NORMAL)
        self.btn_db.configure(state=tk.NORMAL)
        self.status_var.set("서버 상태: 중지됨")
        self.status_label.configure(foreground="#f38ba8")
        self.log("[정보] 웹 서버 구동이 중지되었습니다.\n\n")

    def stop_server(self):
        if not self.server_process:
            return
            
        self.log("[정보] 웹 서버 종료 중...\n")
        # 윈도우 환경에서 하위 자식 프로세스까지 전체 트리 강제 종료 (포트 3000 점유 해제 목적)
        try:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(self.server_process.pid)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception as e:
            self.log(f"[오류] 서버 강제 종료 중 실패: {e}\n")
            if self.server_process:
                self.server_process.terminate()
                
        self.server_process = None

    def run_smoke_tests(self):
        self.btn_start.configure(state=tk.DISABLED)
        self.btn_test.configure(state=tk.DISABLED)
        self.btn_db.configure(state=tk.DISABLED)
        self.status_var.set("서버 상태: 검증 테스트 진행 중")
        self.status_label.configure(foreground="#f9e2af")
        
        def finish():
            self.btn_start.configure(state=tk.NORMAL)
            self.btn_test.configure(state=tk.NORMAL)
            self.btn_db.configure(state=tk.NORMAL)
            self.status_var.set("서버 상태: 대기 중")
            self.status_label.configure(foreground="#f9e2af")
            
        self.run_cmd_thread(["npm", "run", "test:smoke"], on_finish=finish)

    def setup_db(self):
        if messagebox.askyesno("DB 재설정 확인", "데이터베이스 마이그레이션 및 재생성을 진행하시겠습니까?\n기존에 로컬 DB에 저장된 내역은 유지되거나 정비됩니다."):
            self.btn_start.configure(state=tk.DISABLED)
            self.btn_test.configure(state=tk.DISABLED)
            self.btn_db.configure(state=tk.DISABLED)
            self.status_var.set("서버 상태: DB 마이그레이션 중")
            self.status_label.configure(foreground="#f9e2af")
            
            def finish():
                self.btn_start.configure(state=tk.NORMAL)
                self.btn_test.configure(state=tk.NORMAL)
                self.btn_db.configure(state=tk.NORMAL)
                self.status_var.set("서버 상태: 대기 중")
                self.status_label.configure(foreground="#f9e2af")
                
            def run_prisma():
                self.log("[실행] prisma migrate dev 실행 중...\n")
                p1 = subprocess.run("npx prisma migrate dev", cwd=app_dir, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(p1.stdout)
                self.log("[실행] prisma generate 실행 중...\n")
                p2 = subprocess.run("npx prisma generate", cwd=app_dir, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                self.log(p2.stdout)
                self.log("[완료] DB 설정 완료.\n\n")
                self.root.after(0, finish)
                
            threading.Thread(target=run_prisma, daemon=True).start()

    def on_close(self):
        if self.server_process:
            if messagebox.askyesno("종료 확인", "서버가 현재 구동 중입니다. 서버를 종료하고 프로그램을 끝내시겠습니까?"):
                self.stop_server()
                self.root.destroy()
        else:
            self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = AppLauncher(root)
    root.mainloop()
