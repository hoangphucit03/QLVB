import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { testGoogleConnection } from '@/lib/google-sheets';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const result = await testGoogleConnection();

  return NextResponse.json({
    success: true,
    data: result,
  });
}
