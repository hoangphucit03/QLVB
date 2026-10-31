import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getVanBanDiList, addVanBanDi } from '@/lib/google-sheets';
import { vanBanDiSchema } from '@/lib/schema';

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const nam = searchParams.get('nam');
  const loaiVanBan = searchParams.get('loai_van_ban');
  const trangThai = searchParams.get('trang_thai');
  const donViSoanThao = searchParams.get('don_vi_soan_thao');
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '25');

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 1000) {
    return NextResponse.json({ success: false, message: 'Phân trang không hợp lệ (limit 1–1000)' }, { status: 400 });
  }
  const { data: rawList, isDemo } = await getVanBanDiList();

  let filtered = rawList;

  if (nam && nam !== 'all') {
    filtered = filtered.filter((d) => String(d.nam) === nam);
  }

  if (loaiVanBan && loaiVanBan !== 'all') {
    filtered = filtered.filter((d) => d.loai_van_ban === loaiVanBan);
  }

  if (trangThai && trangThai !== 'all') {
    filtered = filtered.filter((d) => d.trang_thai === trangThai);
  }

  if (donViSoanThao && donViSoanThao !== 'all') {
    filtered = filtered.filter((d) => d.don_vi_soan_thao === donViSoanThao);
  }

  if (search) {
    filtered = filtered.filter(
      (d) =>
        (d.so_ky_hieu && d.so_ky_hieu.toLowerCase().includes(search)) ||
        (d.trich_yeu && d.trich_yeu.toLowerCase().includes(search)) ||
        (d.nguoi_ky && d.nguoi_ky.toLowerCase().includes(search)) ||
        (d.noi_nhan && d.noi_nhan.toLowerCase().includes(search)) ||
        String(d.so_di) === search
    );
  }

  // Sắp xếp: số đi giảm dần theo năm
  filtered.sort((a, b) => {
    if (b.nam !== a.nam) return b.nam - a.nam;
    return b.so_di - a.so_di;
  });

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    data: paginatedData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    isDemo,
  });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = vanBanDiSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join('; ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const res = await addVanBanDi(parseResult.data as any);

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Thêm văn bản đi thành công',
      data: res.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
