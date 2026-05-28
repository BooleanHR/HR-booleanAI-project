/**
 * 세션/쿠키 기반 인증 유틸리티 (MVP: 하드코딩 계정)
 * Jose를 사용한 JWT 서명 방식
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const SESSION_COOKIE = 'hr_session';
const EXPIRY = '8h';

// ─────────────────────────────────────────────
// 하드코딩된 계정 (MVP)
// ─────────────────────────────────────────────

export const HARDCODED_USERS: SessionUser[] = [
  {
    id: 'admin-001',
    email: process.env.ADMIN_EMAIL ?? 'admin@hr-booleanai.com',
    name: '관리자',
    role: 'ADMIN',
  },
  {
    id: 'operator-001',
    email: process.env.OPERATOR_EMAIL ?? 'operator@hr-booleanai.com',
    name: '운영자',
    role: 'OPERATOR',
  },
];

const HARDCODED_PASSWORDS: Record<string, string> = {
  [process.env.ADMIN_EMAIL ?? 'admin@hr-booleanai.com']: process.env.ADMIN_PASSWORD ?? 'Admin1234!',
  [process.env.OPERATOR_EMAIL ?? 'operator@hr-booleanai.com']: process.env.OPERATOR_PASSWORD ?? 'Operator1234!',
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? 'hr-booleanai-fallback-secret-key-32ch';
  return new TextEncoder().encode(secret);
}

// ─────────────────────────────────────────────
// 로그인 검증
// ─────────────────────────────────────────────

export function validateCredentials(email: string, password: string): SessionUser | null {
  const user = HARDCODED_USERS.find((u) => u.email === email);
  if (!user) return null;
  const expectedPassword = HARDCODED_PASSWORDS[email];
  if (password !== expectedPassword) return null;
  return user;
}

// ─────────────────────────────────────────────
// JWT 토큰 발급 / 검증
// ─────────────────────────────────────────────

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// 쿠키 기반 세션 관리
// ─────────────────────────────────────────────

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieConfig(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8, // 8시간
    path: '/',
  };
}

export function getClearSessionCookieConfig() {
  return {
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
}
