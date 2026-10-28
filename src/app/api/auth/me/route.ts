import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: session,
  });
}
