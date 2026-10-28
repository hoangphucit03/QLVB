import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getVanBanDenList, addVanBanDen } from '@/lib/google-sheets';
import { vanBanDenSchema } from '@/lib/schema';

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
  const mucDoUuTien = searchParams.get('muc_do_uu_tien');
  const coQuanGui = searchParams.get('co_quan_gui');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '25', 10);

  const { data: rawList, isDemo } = await getVanBanDenList();

  let filtered = rawList;

  // Lọc theo năm
  if (nam && nam !== 'all') {
    filtered = filtered.filter((d) => String(d.nam) === nam);
  }

  // Lọc theo loại văn bản
  if (loaiVanBan && loaiVanBan !== 'all') {
    filtered = filtered.filter((d) => d.loai_van_ban === loaiVanBan);
  }

  // Lọc theo trạng thái
  if (trangThai && trangThai !== 'all') {
    filtered = filtered.filter((d) => d.trang_thai === trangThai);
  }

  // Lọc theo mức độ ưu tiên
  if (mucDoUuTien && mucDoUuTien !== 'all') {
    filtered = filtered.filter((d) => d.muc_do_uu_tien === mucDoUuTien);
  }

  // Lọc theo cơ quan gửi
  if (coQuanGui && coQuanGui !== 'all') {
    filtered = filtered.filter((d) => d.co_quan_gui === coQuanGui);
  }

  // Tìm kiếm theo số, ký hiệu và trích yếu
  if (search) {
    filtered = filtered.filter(
      (d) =>
        (d.so_ky_hieu && d.so_ky_hieu.toLowerCase().includes(search)) ||
        (d.trich_yeu && d.trich_yeu.toLowerCase().includes(search)) ||
        (d.co_quan_gui && d.co_quan_gui.toLowerCase().includes(search)) ||
        (d.nguoi_xu_ly && d.nguoi_xu_ly.toLowerCase().includes(search)) ||
        String(d.so_den) === search
    );
  }

  // Sắp xếp: số đến giảm dần theo năm
  filtered.sort((a, b) => {
    if (b.nam !== a.nam) return b.nam - a.nam;
    return b.so_den - a.so_den;
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
    const parseResult = vanBanDenSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join('; ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const res = await addVanBanDen(parseResult.data as any);

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Thêm văn bản đến thành công',
      data: res.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
