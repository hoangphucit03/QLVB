import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserSession } from './types';

const SESSION_COOKIE_NAME = 'docflow_session';
const DEFAULT_SECRET = 'docflow_xuan_son_military_session_secret_key_2025_secure_random';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 ngày

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

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
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

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
  const configuredPassword = process.env.DOCFLOW_PASSWORD || 'admin@xuan_son_2025';
  if (!inputPassword) return false;
  
  // So sánh chuỗi an toàn
  if (inputPassword.length !== configuredPassword.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < inputPassword.length; i++) {
    result |= inputPassword.charCodeAt(i) ^ configuredPassword.charCodeAt(i);
  }
  return result === 0;
}

export { SESSION_COOKIE_NAME };
