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
  if (yearParam && yearParam !== 'all' && (!/^\d{4}$/.test(yearParam) || Number(yearParam) < 2000 || Number(yearParam) > 2099)) {
    return NextResponse.json({ success: false, message: 'Năm không hợp lệ' }, { status: 400 });
  }
  const selectedYear = yearParam && yearParam !== 'all' ? Number(yearParam) : undefined;

  try {
  const result = await getDashboardData(selectedYear);

  return NextResponse.json({
    success: true,
    data: result.stats,
    isDemo: result.isDemo,
    breakdown: result.breakdown,
  });
  } catch {
    return NextResponse.json({ success: false, message: 'Không thể tải thống kê từ Google Sheets. Vui lòng thử lại.' }, { status: 503 });
  }
}
