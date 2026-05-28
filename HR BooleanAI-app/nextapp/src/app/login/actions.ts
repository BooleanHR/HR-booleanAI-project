'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateCredentials, createSessionToken, getSessionCookieConfig, getClearSessionCookieConfig } from '@/lib/auth/session';

type State = { error?: string } | undefined;

export async function loginAction(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' };
  }

  const user = validateCredentials(email.trim(), password);
  if (!user) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  const token = await createSessionToken(user);
  const cookieConfig = getSessionCookieConfig(token);
  const cookieStore = await cookies();
  cookieStore.set(cookieConfig);

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieConfig = getClearSessionCookieConfig();
  const cookieStore = await cookies();
  cookieStore.set(cookieConfig);
  redirect('/login');
}
