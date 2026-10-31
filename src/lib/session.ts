import { jwtVerify } from 'jose';
import type { UserSession } from './types';

export const SESSION_COOKIE_NAME = 'docflow_session';
export function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  return new TextEncoder().encode(secret);
}
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'], requiredClaims: ['exp', 'iat'] });
    if (payload.username !== 'admin' || payload.role !== 'Quản trị viên' || typeof payload.name !== 'string' || typeof payload.unit !== 'string') return null;
    return payload as unknown as UserSession;
  } catch { return null; }
}
