import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getVanBanDenList, getVanBanDiList } from '@/lib/google-sheets';

export async function GET() {
  if (!await getCurrentSession()) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }
  try {
    const [incoming, outgoing] = await Promise.all([getVanBanDenList(), getVanBanDiList()]);
    const unique = new Map<string, string>();
    for (const value of [...incoming.data.map(doc => doc.co_quan_gui), ...outgoing.data.map(doc => doc.noi_nhan)]) {
      const name = value?.trim();
      if (name) unique.set(name.toLocaleLowerCase('vi'), name);
    }
    return NextResponse.json({ success: true, agencies: [...unique.values()].sort((a, b) => a.localeCompare(b, 'vi')) });
  } catch {
    return NextResponse.json({ success: false, message: 'Không thể tải danh sách gợi ý' }, { status: 503 });
  }
}
