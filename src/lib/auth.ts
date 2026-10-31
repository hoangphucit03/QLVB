import { SignJWT } from 'jose';
import { timingSafeEqual, createHash } from 'node:crypto';
import { SESSION_COOKIE_NAME, getSecretKey, verifySessionToken } from './session';
export { verifySessionToken } from './session';
import { cookies } from 'next/headers';
import type { UserSession } from './types';

const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 ngày


/**
 * Tạo token JWT ký bảo mật cho phiên đăng nhập
 */
export async function createSessionToken(payload: UserSession): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

/**
 * Giải mã và kiểm tra tính hợp lệ của token session
 */

/**
 * Lấy phiên đăng nhập hiện tại từ Cookies
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }
    return await verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Thiết lập cookie đăng nhập HTTP-Only bảo mật
 */
export async function setSessionCookie(session: UserSession): Promise<void> {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Xóa cookie phiên làm việc khi đăng xuất
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Kiểm tra mật khẩu quản trị bảo mật (timing-safe)
 */
export function verifyAdminPassword(inputPassword: string): boolean {
  const configuredPassword = process.env.DOCFLOW_PASSWORD || 'PCTBCHQS';
  if (!inputPassword) return false;
  
  return timingSafeEqual(createHash('sha256').update(inputPassword).digest(), createHash('sha256').update(configuredPassword).digest());
}

export { SESSION_COOKIE_NAME };
