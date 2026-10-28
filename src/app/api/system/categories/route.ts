import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getDanhMucList, updateDanhMucItem } from '@/lib/google-sheets';
import { z } from 'zod';

const updateCategorySchema = z.object({
  original: z.object({
    nhom_danh_muc: z.string().trim().min(1),
    ma: z.string().trim().min(1),
  }),
  updates: z.object({
    nhom_danh_muc: z.string().trim().min(1).max(100),
    ma: z.string().trim().min(1).max(100),
    ten_gia_tri: z.string().trim().min(1).max(500),
    ghi_chu: z.string().trim().max(1000),
  }),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  const { data, isDemo } = await getDanhMucList();

  // Nhóm danh mục theo nhóm
  const grouped: Record<string, { ma: string; ten: string; ghi_chu: string }[]> = {};
  data.forEach((item) => {
    if (!grouped[item.nhom_danh_muc]) {
      grouped[item.nhom_danh_muc] = [];
    }
    grouped[item.nhom_danh_muc].push({
      ma: item.ma,
      ten: item.ten_gia_tri,
      ghi_chu: item.ghi_chu,
    });
  });

  return NextResponse.json({
    success: true,
    data,
    grouped,
    isDemo,
  });
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yêu cầu đăng nhập' }, { status: 401 });
  }

  try {
    const payload = updateCategorySchema.parse(await request.json());
    const result = await updateDanhMucItem(payload.original, payload.updates);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu danh mục không hợp lệ.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Không thể xử lý yêu cầu cập nhật danh mục.' },
      { status: 500 }
    );
  }
}
