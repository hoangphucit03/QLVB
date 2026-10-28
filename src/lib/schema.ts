import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(1, 'Vui lòng nhập mật khẩu quản trị'),
});

export const vanBanDenSchema = z.object({
  nam: z.coerce.number().int().min(2000, 'Năm không hợp lệ').max(2099, 'Năm không hợp lệ'),
  so_den: z.coerce.number().int().min(1, 'Số đến phải là số nguyên dương lớn hơn 0'),
  ngay_den: z.string().min(1, 'Vui lòng chọn ngày đến'),
  so_ky_hieu: z.string().min(1, 'Vui lòng nhập số, ký hiệu văn bản'),
  ngay_ban_hanh: z.string().min(1, 'Vui lòng chọn ngày ban hành'),
  co_quan_gui: z.string().min(1, 'Vui lòng nhập hoặc chọn cơ quan gửi'),
  loai_van_ban: z.string().min(1, 'Vui lòng chọn loại văn bản'),
  trich_yeu: z.string().min(3, 'Trích yếu nội dung phải có ít nhất 3 ký tự'),
  lanh_dao_chi_dao: z.string().optional().default(''),
  nguoi_xu_ly: z.string().min(1, 'Vui lòng chọn hoặc chỉ định người chủ trì xử lý chính'),
  noi_dung_chi_dao: z.string().optional().default(''),
  han_xu_ly: z.string().optional().default(''),
  trang_thai: z.enum(['Chưa xử lý', 'Đang xử lý', 'Đã hoàn thành', 'Quá hạn']).default('Chưa xử lý'),
  ngay_hoan_thanh: z.string().optional().default(''),
  ket_qua_xu_ly: z.string().optional().default(''),
  muc_do_uu_tien: z.enum(['Thường', 'Khẩn', 'Thượng khẩn', 'Hỏa tốc']).default('Thường'),
  link_dinh_kem: z.string().url('Đường dẫn tệp đính kèm phải là URL hợp lệ (VD: https://drive.google.com/...)').or(z.literal('')).optional().default(''),
  ghi_chu: z.string().optional().default(''),
});

export const vanBanDiSchema = z.object({
  nam: z.coerce.number().int().min(2000, 'Năm không hợp lệ').max(2099, 'Năm không hợp lệ'),
  so_di: z.coerce.number().int().min(1, 'Số đi phải là số nguyên dương lớn hơn 0'),
  ngay_phat_hanh: z.string().min(1, 'Vui lòng chọn ngày phát hành'),
  so_ky_hieu: z.string().min(1, 'Vui lòng nhập số, ký hiệu văn bản đi'),
  ngay_ky: z.string().min(1, 'Vui lòng chọn ngày ký duyệt'),
  loai_van_ban: z.string().min(1, 'Vui lòng chọn loại văn bản'),
  trich_yeu: z.string().min(3, 'Trích yếu nội dung phải có ít nhất 3 ký tự'),
  don_vi_soan_thao: z.string().min(1, 'Vui lòng nhập đơn vị soạn thảo'),
  nguoi_ky: z.string().min(1, 'Vui lòng nhập họ tên người ký duyệt'),
  chuc_vu_nguoi_ky: z.string().min(1, 'Vui lòng nhập chức vụ người ký'),
  noi_nhan: z.string().min(1, 'Vui lòng nhập nơi nhận văn bản'),
  hinh_thuc_gui: z.string().optional().default('Trực tiếp'),
  trang_thai: z.enum(['Dự thảo', 'Chờ ký', 'Đã ký duyệt', 'Đã phát hành']).default('Đã phát hành'),
  link_dinh_kem: z.string().url('Đường dẫn tệp đính kèm phải là URL hợp lệ').or(z.literal('')).optional().default(''),
  ghi_chu: z.string().optional().default(''),
});
