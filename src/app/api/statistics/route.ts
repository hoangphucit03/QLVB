import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getDashboardData } from '@/lib/google-sheets';

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('nam');
  const selectedYear = yearParam && yearParam !== 'all' ? parseInt(yearParam, 10) : undefined;

  const result = await getDashboardData(selectedYear);

  return NextResponse.json({
    success: true,
    data: result.stats,
    isDemo: result.isDemo,
  });
}
