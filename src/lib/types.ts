export interface VanBanDen {
  id: string; // ID duy nhất (VD: VBD-2025-xxxxxx)
  nam: number; // Năm (VD: 2025)
  so_den: number; // Số đến (số thứ tự đến)
  ngay_den: string; // Ngày đến (YYYY-MM-DD)
  so_ky_hieu: string; // Số, ký hiệu văn bản (VD: 125/QĐ-BCH)
  ngay_ban_hanh: string; // Ngày ban hành (YYYY-MM-DD)
  co_quan_gui: string; // Cơ quan gửi (VD: Bộ CHQS Tỉnh, Ban CHQS Huyện, ...)
  loai_van_ban: string; // Loại văn bản (Quyết định, Công văn, Chỉ thị, Kế hoạch, ...)
  trich_yeu: string; // Trích yếu nội dung
  lanh_dao_chi_dao: string; // Lãnh đạo chỉ đạo (Chỉ huy trưởng, Chính trị viên, ...)
  nguoi_xu_ly: string; // Người chủ trì xử lý chính (Cán bộ Tác huấn, Quân lực, ...)
  noi_dung_chi_dao: string; // Nội dung chỉ đạo cụ thể
  han_xu_ly: string; // Hạn xử lý (YYYY-MM-DD)
  trang_thai: 'Không' | 'Chưa xử lý' | 'Đang xử lý' | 'Đã hoàn thành' | 'Quá hạn' | string;
  ngay_hoan_thanh: string; // Ngày hoàn thành (YYYY-MM-DD hoặc rỗng)
  ket_qua_xu_ly: string; // Kết quả xử lý (Báo cáo đã gửi, Đã lập kế hoạch, ...)
  muc_do_uu_tien: 'Thường' | 'Khẩn' | 'Thượng khẩn' | 'Hỏa tốc' | string;
  link_dinh_kem: string; // Link URL tệp đính kèm (Google Drive, Cloud storage, ...)
  ghi_chu: string; // Ghi chú thêm
  ngay_tao: string; // ISO String hoặc YYYY-MM-DD HH:mm:ss
  ngay_cap_nhat: string; // ISO String hoặc YYYY-MM-DD HH:mm:ss
}

export interface VanBanDi {
  id: string; // ID duy nhất (VD: VBDI-2025-xxxxxx)
  nam: number; // Năm (VD: 2025)
  so_di: number; // Số đi (số thứ tự đi)
  ngay_phat_hanh: string; // Ngày phát hành (YYYY-MM-DD)
  so_ky_hieu: string; // Số, ký hiệu phát hành (VD: 45/KH-BCH)
  ngay_ky: string; // Ngày ký duyệt (YYYY-MM-DD)
  loai_van_ban: string; // Loại văn bản
  trich_yeu: string; // Trích yếu nội dung
  don_vi_soan_thao: string; // Đơn vị soạn thảo (Ban CHQS Xã Xuân Sơn / Bộ phận Tham mưu)
  nguoi_ky: string; // Họ tên người ký
  chuc_vu_nguoi_ky: string; // Chức vụ (Chỉ huy trưởng, Phó Chỉ huy trưởng, ...)
  noi_nhan: string; // Nơi nhận văn bản
  hinh_thuc_gui: string; // Hình thức gửi (Trực tiếp, Bưu điện, Trục liên thông, Email công vụ)
  trang_thai: 'Dự thảo' | 'Chờ ký' | 'Đã ký duyệt' | 'Đã phát hành' | string;
  link_dinh_kem: string; // Link URL tệp đính kèm
  ghi_chu: string; // Ghi chú
  ngay_tao: string; // Ngày tạo
  ngay_cap_nhat: string; // Ngày cập nhật
}

export interface DanhMucItem {
  nhom_danh_muc: string; // LOAI_VAN_BAN, CO_QUAN_GUI, DON_VI_SOAN_THAO, TRANG_THAI, MUC_DO_UU_TIEN
  ma: string;
  ten_gia_tri: string;
  ghi_chu: string;
}

export interface ThongKeItem {
  chi_so: string;
  gia_tri: string | number;
  ghi_chu: string;
}

export interface CauHinhItem {
  tham_so: string;
  gia_tri: string;
  ghi_chu: string;
}

export interface DashboardStats {
  tong_den: number;
  tong_di: number;
  chua_xu_ly: number;
  khong_xu_ly: number;
  dang_xu_ly: number;
  da_hoan_thanh: number;
  qua_han: number;
  can_xu_ly_gap: number;
  thong_ke_thang: {
    thang: number;
    ten_thang: string;
    van_ban_den: number;
    van_ban_di: number;
  }[];
  van_ban_den_moi_nhat: VanBanDen[];
  van_ban_di_moi_nhat: VanBanDi[];
}

export interface UserSession {
  username: string;
  name: string;
  role: string;
  unit: string;
  iat?: number;
  exp?: number;
}
