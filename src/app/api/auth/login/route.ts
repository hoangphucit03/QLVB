import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schema';
import { verifyAdminPassword, setSessionCookie } from '@/lib/auth';

// Process-wide ceiling; use a shared gateway limiter when running multiple instances.
let windowStarted = Date.now();
let attempts = 0;

export async function POST(request: Request) {
  const now = Date.now();
  if (now - windowStarted >= 60_000) { windowStarted = now; attempts = 0; }
  if (++attempts > 30) return NextResponse.json(
    { success: false, message: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau một phút.' },
    { status: 429, headers: { 'Retry-After': '60' } }
  );
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    const { password } = parseResult.data;
    const isValid = verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu quản trị không chính xác' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      username: 'admin',
      name: 'Văn thư Ban CHQS Xã',
      role: 'Quản trị viên',
      unit: 'Ban CHQS xã Xuân Sơn',
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: sessionPayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ trong quá trình xác thực' },
      { status: 500 }
    );
  }
}
