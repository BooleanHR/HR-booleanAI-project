import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,170,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,.032) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 68%)',
        }}
      />
      {/* Background orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(0,212,170,.12) 0%, rgba(0,212,170,.04) 42%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm animate-fu-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 mb-4"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--acc)', letterSpacing: 2 }}
          >
            <span
              className="animate-blink"
              style={{
                display: 'inline-block', width: 8, height: 8,
                borderRadius: '50%', background: 'var(--acc)',
              }}
            />
            HR BOOLEANAI v1.0
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, color: 'var(--tx0)' }}>
            서류 진위확인 AI
          </h1>
          <p style={{ fontSize: 13, color: 'var(--tx1)', marginTop: 6 }}>
            관리자 포털에 로그인하세요
          </p>
        </div>

        {/* Login Card */}
        <div
          className="card"
          style={{
            padding: 28,
            boxShadow: '0 32px 80px rgba(0,0,0,.5)',
          }}
        >
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center mt-6" style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}>
          © 2026 HR BooleanAI. All rights reserved.
        </p>
      </div>
    </main>
  );
}
