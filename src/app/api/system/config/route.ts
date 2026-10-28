import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getCauHinhList, getThongKeSystemList } from '@/lib/google-sheets';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const [cauHinhRes, thongKeRes] = await Promise.all([
    getCauHinhList(),
    getThongKeSystemList(),
  ]);

  return NextResponse.json({
    success: true,
    cau_hinh: cauHinhRes.data,
    thong_ke: thongKeRes.data,
    isDemo: cauHinhRes.isDemo || thongKeRes.isDemo,
  });
}
