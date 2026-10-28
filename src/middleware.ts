import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'docflow_session';
const DEFAULT_SECRET = 'docflow_xuan_son_military_session_secret_key_2025_secure_random';

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
    const secretKey = new TextEncoder().encode(secret);
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các file tĩnh, favicon, hình ảnh
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = sessionCookie?.value;
  const isAuthenticated = token ? await verifyToken(token) : false;

  // Nếu đang vào trang đăng nhập mà đã có phiên hợp lệ -> chuyển vào dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Chuyển hướng trang chủ / về /dashboard
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Danh sách các trang nghiệp vụ cần đăng nhập
  const protectedPages = ['/dashboard', '/van-ban-den', '/van-ban-di', '/thong-ke', '/danh-muc', '/cai-dat'];
  const isProtectedPage = protectedPages.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Bảo vệ các API nghiệp vụ (trừ /api/auth/login)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/login')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu phiên đăng nhập hợp lệ' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
