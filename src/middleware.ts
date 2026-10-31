import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== request.nextUrl.origin)) {
      return NextResponse.json({ success: false, message: 'Nguồn yêu cầu không hợp lệ' }, { status: 403 });
    }
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      return NextResponse.json({ success: false, message: 'Yêu cầu dữ liệu JSON' }, { status: 415 });
    }
    if (Number(request.headers.get('content-length') || 0) > 65536) {
      return NextResponse.json({ success: false, message: 'Dữ liệu quá lớn' }, { status: 413 });
    }
  }

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
  const isAuthenticated = token ? Boolean(await verifySessionToken(token)) : false;

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
  if (pathname.startsWith('/api/') && pathname !== '/api/auth/login') {
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
