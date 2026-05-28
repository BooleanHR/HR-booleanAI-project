'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from './actions';

type State = { error?: string } | undefined;

export default function LoginForm() {
  const [state, formAction] = useFormState<State, FormData>(
    loginAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6, letterSpacing: 0.5 }}
        >
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="admin@hr-booleanai.com"
          className="inp"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6, letterSpacing: 0.5 }}
        >
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="inp"
        />
      </div>

      {state?.error && (
        <div
          style={{
            background: 'var(--red2)',
            border: '1px solid var(--red3)',
            borderRadius: 'var(--r)',
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>⚠</span>
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />

      {/* Hint for MVP */}
      <div
        style={{
          background: 'rgba(77,143,255,.08)',
          border: '1px solid rgba(77,143,255,.2)',
          borderRadius: 'var(--r)',
          padding: '10px 14px',
          fontSize: 11,
          color: 'var(--tx2)',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.8,
        }}
      >
        <strong style={{ color: 'var(--blu)' }}>테스트 계정</strong><br />
        Admin: admin@hr-booleanai.com / Admin1234!<br />
        Operator: operator@hr-booleanai.com / Operator1234!
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      id="btn-login-submit"
      className="btn btn-acc btn-lg"
      style={{ marginTop: 4, justifyContent: 'center', width: '100%', opacity: pending ? 0.7 : 1 }}
    >
      {pending ? (
        <>
          <span
            style={{
              display: 'inline-block', width: 14, height: 14,
              border: '2px solid rgba(0,0,0,.3)', borderTopColor: '#000',
              borderRadius: '50%',
            }}
            className="animate-spin"
          />
          로그인 중...
        </>
      ) : (
        <>🔐 로그인</>
      )}
    </button>
  );
}
