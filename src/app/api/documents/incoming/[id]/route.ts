import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { updateVanBanDen, deleteVanBanDen, getVanBanDenList } from '@/lib/google-sheets';
import { vanBanDenSchema } from '@/lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const { id } = await params;
  const { data: list } = await getVanBanDenList();
  const found = list.find((d) => d.id === id);

  if (!found) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy văn bản' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: found });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parseResult = vanBanDenSchema.partial().safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join('; ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const res = await updateVanBanDen(id, parseResult.data as any);

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật văn bản đến thành công',
      data: res.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const { id } = await params;
  const res = await deleteVanBanDen(id);

  if (!res.success) {
    return NextResponse.json({ success: false, message: res.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: 'Xóa văn bản đến thành công',
  });
}
