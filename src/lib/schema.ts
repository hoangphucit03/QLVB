import { z } from 'zod';
const attachmentUrl = z.string().max(2048).refine(value => {
  if (value === '') return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}, 'Đường dẫn phải dùng http:// hoặc https://').optional().default('');

export const loginSchema = z.object({
  password: z.string().min(1, 'Vui lòng nhập mật khẩu quản trị').max(256),
});

export const vanBanDenSchema = z.object({
  nam: z.coerce.number().int().min(2000, 'Năm không hợp lệ').max(2099, 'Năm không hợp lệ'),
  so_den: z.coerce.number().int().min(0).default(0),
  ngay_den: z.string().min(1, 'Vui lòng chọn ngày đến'),
  so_ky_hieu: z.string().min(1, 'Vui lòng nhập số, ký hiệu văn bản'),
  ngay_ban_hanh: z.string().min(1, 'Vui lòng chọn ngày ban hành'),
  co_quan_gui: z.string().min(1, 'Vui lòng nhập hoặc chọn cơ quan gửi'),
  loai_van_ban: z.string().min(1, 'Vui lòng chọn loại văn bản'),
  trich_yeu: z.string().min(3, 'Trích yếu nội dung phải có ít nhất 3 ký tự'),
  lanh_dao_chi_dao: z.string().optional().default(''),
  nguoi_xu_ly: z.string().optional().default(''),
  noi_dung_chi_dao: z.string().optional().default(''),
  han_xu_ly: z.string().optional().default(''),
  trang_thai: z.enum(['Không', 'Chưa xử lý', 'Đang xử lý', 'Đã hoàn thành', 'Quá hạn']).default('Chưa xử lý'),
  ngay_hoan_thanh: z.string().optional().default(''),
  ket_qua_xu_ly: z.string().optional().default(''),
  muc_do_uu_tien: z.enum(['Thường', 'Khẩn', 'Thượng khẩn', 'Hỏa tốc']).default('Thường'),
  link_dinh_kem: attachmentUrl,
  ghi_chu: z.string().optional().default(''),
});

export const vanBanDiSchema = z.object({
  nam: z.coerce.number().int().min(2000, 'Năm không hợp lệ').max(2099, 'Năm không hợp lệ'),
  so_di: z.coerce.number().int().min(0, 'Số đi không hợp lệ').default(0),
  ngay_phat_hanh: z.string().min(1, 'Vui lòng chọn ngày phát hành'),
  so_ky_hieu: z.string().trim().default(''),
  ngay_ky: z.string().min(1, 'Vui lòng chọn ngày ký duyệt'),
  loai_van_ban: z.string().min(1, 'Vui lòng chọn loại văn bản'),
  trich_yeu: z.string().min(3, 'Trích yếu nội dung phải có ít nhất 3 ký tự'),
  don_vi_soan_thao: z.string().default('Phòng Chính trị'),
  nguoi_ky: z.string().min(1, 'Vui lòng nhập họ tên người ký duyệt'),
  chuc_vu_nguoi_ky: z.string().min(1, 'Vui lòng nhập chức vụ người ký'),
  noi_nhan: z.string().min(1, 'Vui lòng nhập nơi nhận văn bản'),
  hinh_thuc_gui: z.string().optional().default('Trực tiếp'),
  trang_thai: z.enum(['Dự thảo', 'Chờ ký', 'Đã ký duyệt', 'Đã phát hành']).default('Đã phát hành'),
  link_dinh_kem: attachmentUrl,
  ghi_chu: z.string().optional().default(''),
}).superRefine((doc, ctx) => {
  if (doc.trang_thai !== 'Đã phát hành') return;
  if (!doc.so_ky_hieu) ctx.addIssue({ code: 'custom', path: ['so_ky_hieu'], message: 'Vui lòng nhập số, ký hiệu khi phát hành' });
});
