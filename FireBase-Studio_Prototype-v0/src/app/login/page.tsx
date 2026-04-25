'use client';

import { LoginForm } from '@/components/login-form';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
            <Icons.logo className="h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-center">HR AI Verification Solution</h1>
            <p className="text-muted-foreground text-center">관리자 또는 오퍼레이터 계정으로 로그인하세요.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}