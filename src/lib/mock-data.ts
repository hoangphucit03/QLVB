import { VanBanDen, VanBanDi, DanhMucItem, ThongKeItem, CauHinhItem } from './types';

export const INITIAL_MOCK_VAN_BAN_DEN: VanBanDen[] = [];

export const INITIAL_MOCK_VAN_BAN_DI: VanBanDi[] = [];

export const INITIAL_MOCK_DANH_MUC: DanhMucItem[] = [
  // Loại văn bản
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_QD', ten_gia_tri: 'Quyết định', ghi_chu: 'Văn bản quy phạm/cá biệt' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_KH', ten_gia_tri: 'Kế hoạch', ghi_chu: 'Kế hoạch công tác năm, quý, tháng' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_CV', ten_gia_tri: 'Công văn', ghi_chu: 'Công văn trao đổi, chỉ đạo' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_CT', ten_gia_tri: 'Chỉ thị', ghi_chu: 'Chỉ thị công tác lãnh đạo' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_HD', ten_gia_tri: 'Hướng dẫn', ghi_chu: 'Hướng dẫn chuyên môn' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_TB', ten_gia_tri: 'Thông báo', ghi_chu: 'Thông báo kết luận, phân công' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_BC', ten_gia_tri: 'Báo cáo', ghi_chu: 'Báo cáo định kỳ, đột xuất' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_TTr', ten_gia_tri: 'Tờ trình', ghi_chu: 'Tờ trình phê duyệt' },
  { nhom_danh_muc: 'LOAI_VAN_BAN', ma: 'VB_CD', ten_gia_tri: 'Công điện', ghi_chu: 'Công điện khẩn cấp' },

  // Mức độ ưu tiên
  { nhom_danh_muc: 'MUC_DO_UU_TIEN', ma: 'UT_THUONG', ten_gia_tri: 'Thường', ghi_chu: 'Văn bản bình thường' },
  { nhom_danh_muc: 'MUC_DO_UU_TIEN', ma: 'UT_KHAN', ten_gia_tri: 'Khẩn', ghi_chu: 'Xử lý trong vòng 3 ngày' },
  { nhom_danh_muc: 'MUC_DO_UU_TIEN', ma: 'UT_THUONG_KHAN', ten_gia_tri: 'Thượng khẩn', ghi_chu: 'Xử lý trong vòng 24 giờ' },
  { nhom_danh_muc: 'MUC_DO_UU_TIEN', ma: 'UT_HOA_TOC', ten_gia_tri: 'Hỏa tốc', ghi_chu: 'Xử lý ngay lập tức' },

  // Trạng thái văn bản đến
  { nhom_danh_muc: 'TRANG_THAI_DEN', ma: 'TT_CHUA_XL', ten_gia_tri: 'Chưa xử lý', ghi_chu: 'Mới tiếp nhận, chưa phân công/bắt đầu' },
  { nhom_danh_muc: 'TRANG_THAI_DEN', ma: 'TT_DANG_XL', ten_gia_tri: 'Đang xử lý', ghi_chu: 'Đang trong quá trình giải quyết' },
  { nhom_danh_muc: 'TRANG_THAI_DEN', ma: 'TT_DA_HT', ten_gia_tri: 'Đã hoàn thành', ghi_chu: 'Đã xử lý xong và có báo cáo/kết quả' },
  { nhom_danh_muc: 'TRANG_THAI_DEN', ma: 'TT_QUA_HAN', ten_gia_tri: 'Quá hạn', ghi_chu: 'Quá thời hạn xử lý được giao' },

  // Trạng thái văn bản đi
  { nhom_danh_muc: 'TRANG_THAI_DI', ma: 'TT_DU_THAO', ten_gia_tri: 'Dự thảo', ghi_chu: 'Đang soạn thảo' },
  { nhom_danh_muc: 'TRANG_THAI_DI', ma: 'TT_CHO_KY', ten_gia_tri: 'Chờ ký', ghi_chu: 'Chờ chỉ huy ký duyệt' },
  { nhom_danh_muc: 'TRANG_THAI_DI', ma: 'TT_DA_KY', ten_gia_tri: 'Đã ký duyệt', ghi_chu: 'Đã ký, chờ phát hành' },
  { nhom_danh_muc: 'TRANG_THAI_DI', ma: 'TT_DA_PH', ten_gia_tri: 'Đã phát hành', ghi_chu: 'Đã đóng dấu và gửi nơi nhận' },

  // Cơ quan gửi thường gặp
  { nhom_danh_muc: 'CO_QUAN_GUI', ma: 'CQ_BCH_HUYEN', ten_gia_tri: 'Ban CHQS Huyện', ghi_chu: 'Cơ quan cấp trên trực tiếp' },
  { nhom_danh_muc: 'CO_QUAN_GUI', ma: 'CQ_BCH_TINH', ten_gia_tri: 'Bộ CHQS Tỉnh', ghi_chu: 'Cơ quan cấp tỉnh' },
  { nhom_danh_muc: 'CO_QUAN_GUI', ma: 'CQ_UBND_HUYEN', ten_gia_tri: 'UBND Huyện', ghi_chu: 'Cơ quan quản lý nhà nước' },
  { nhom_danh_muc: 'CO_QUAN_GUI', ma: 'CQ_UBND_XA', ten_gia_tri: 'UBND Xã Xuân Sơn', ghi_chu: 'Chính quyền địa phương' },
  { nhom_danh_muc: 'CO_QUAN_GUI', ma: 'CQ_DANG_UY_XA', ten_gia_tri: 'Đảng ủy Xã Xuân Sơn', ghi_chu: 'Cơ quan Đảng' },
  { nhom_danh_muc: 'CO_QUAN_GUI', ma: 'CQ_CA_XA', ten_gia_tri: 'Công an Xã Xuân Sơn', ghi_chu: 'Lực lượng phối hợp' },

  // Cán bộ xử lý chính
  { nhom_danh_muc: 'CAN_BO_XU_LY', ma: 'CB_TUAN_NV', ten_gia_tri: 'Đ/c Nguyễn Văn Tuấn - Chỉ huy trưởng', ghi_chu: 'Lãnh đạo chỉ huy' },
  { nhom_danh_muc: 'CAN_BO_XU_LY', ma: 'CB_THANG_TH', ten_gia_tri: 'Đ/c Trần Hữu Thắng - Chính trị viên', ghi_chu: 'Công tác Đảng - Chính trị' },
  { nhom_danh_muc: 'CAN_BO_XU_LY', ma: 'CB_NAM_LH', ten_gia_tri: 'Đ/c Lê Hồng Nam - Phó CHT', ghi_chu: 'Phó Chỉ huy trưởng' },
  { nhom_danh_muc: 'CAN_BO_XU_LY', ma: 'CB_DUC_HA', ten_gia_tri: 'Đ/c Hoàng Anh Đức - Cán bộ Tác huấn', ghi_chu: 'Phụ trách Tác huấn - Huấn luyện' },
  { nhom_danh_muc: 'CAN_BO_XU_LY', ma: 'CB_BAO_DQ', ten_gia_tri: 'Đ/c Đặng Quốc Bảo - Cán bộ Quân lực', ghi_chu: 'Phụ trách Tuyển quân - Quân số' },
];

export const INITIAL_MOCK_THONG_KE: ThongKeItem[] = [
  { chi_so: 'TONG_VAN_BAN_DEN', gia_tri: '0', ghi_chu: 'Tổng số văn bản đến đã vào sổ' },
  { chi_so: 'TONG_VAN_BAN_DI', gia_tri: '0', ghi_chu: 'Tổng số văn bản đi đã phát hành' },
  { chi_so: 'VAN_BAN_HOAN_THANH', gia_tri: '0', ghi_chu: 'Số văn bản đã xử lý hoàn thành' },
  { chi_so: 'VAN_BAN_DANG_XU_LY', gia_tri: '0', ghi_chu: 'Số văn bản đang trong tiến độ' },
  { chi_so: 'VAN_BAN_QUA_HAN', gia_tri: '0', ghi_chu: 'Số văn bản bị quá hạn' },
  { chi_so: 'TY_LE_HOAN_THANH_DUNG_HAN', gia_tri: '0%', ghi_chu: 'Tỷ lệ hoàn thành đúng thời hạn giao' },
];

export const INITIAL_MOCK_CAU_HINH: CauHinhItem[] = [
  { tham_so: 'TEN_DON_VI', gia_tri: 'Ban Chỉ huy Quân sự xã Xuân Sơn', ghi_chu: 'Tên đơn vị sử dụng phần mềm' },
  { tham_so: 'PHAN_MEM', gia_tri: 'Quản lý văn bản 1.0', ghi_chu: 'Phiên bản hệ thống' },
  { tham_so: 'QUAN_TRI_VIEN', gia_tri: 'Văn thư Ban CHQS Xã', ghi_chu: 'Người phụ trách vận hành hệ thống' },
  { tham_so: 'NAM_HIEN_TAI', gia_tri: '2025', ghi_chu: 'Năm công tác mặc định' },
  { tham_so: 'CHE_DO_LUU_TRU', gia_tri: 'Google Sheets API Server-side', ghi_chu: 'Hạ tầng cơ sở dữ liệu' },
];
