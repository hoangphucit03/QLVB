'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Calendar, Link as LinkIcon, User, Shield } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { VanBanDen } from '@/lib/types';
import { getTodayDateString } from '@/lib/utils';

interface IncomingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Partial<VanBanDen>) => Promise<boolean>;
  initialData?: VanBanDen | null;
  categories?: {
    loaiVanBan: string[];
    coQuanGui: string[];
    nguoiXuLy: string[];
    lanhDao: string[];
    mucDoUuTien: string[];
    trangThai: string[];
  };
}

export function IncomingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}: IncomingModalProps) {
  const [formData, setFormData] = useState({
    nam: 2025,
    so_den: 0,
    ngay_den: '2025-01-01',
    so_ky_hieu: '',
    ngay_ban_hanh: '2025-01-01',
    co_quan_gui: '',
    loai_van_ban: 'Công văn',
    trich_yeu: '',
    lanh_dao_chi_dao: '',
    nguoi_xu_ly: '',
    noi_dung_chi_dao: '',
    han_xu_ly: '',
    trang_thai: 'Chưa xử lý',
    ngay_hoan_thanh: '',
    ket_qua_xu_ly: '',
    muc_do_uu_tien: 'Thường',
    link_dinh_kem: '',
    ghi_chu: '',
  });

  const [showAssignee, setShowAssignee] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const todayStr = getTodayDateString();

    if (initialData) {
      setFormData({
        nam: initialData.nam || currentYear,
        so_den: initialData.so_den || 0,
        ngay_den: initialData.ngay_den || todayStr,
        so_ky_hieu: initialData.so_ky_hieu || '',
        ngay_ban_hanh: initialData.ngay_ban_hanh || todayStr,
        co_quan_gui: initialData.co_quan_gui || '',
        loai_van_ban: initialData.loai_van_ban || 'Công văn',
        trich_yeu: initialData.trich_yeu || '',
        lanh_dao_chi_dao: initialData.lanh_dao_chi_dao || '',
        nguoi_xu_ly: initialData.nguoi_xu_ly || '',
        noi_dung_chi_dao: initialData.noi_dung_chi_dao || '',
        han_xu_ly: initialData.han_xu_ly || '',
        trang_thai: initialData.trang_thai || 'Chưa xử lý',
        ngay_hoan_thanh: initialData.ngay_hoan_thanh || '',
        ket_qua_xu_ly: initialData.ket_qua_xu_ly || '',
        muc_do_uu_tien: initialData.muc_do_uu_tien || 'Thường',
        link_dinh_kem: initialData.link_dinh_kem || '',
        ghi_chu: initialData.ghi_chu || '',
      });
    } else {
      setFormData({
        nam: currentYear,
        so_den: 0,
        ngay_den: todayStr,
        so_ky_hieu: '',
        ngay_ban_hanh: todayStr,
        co_quan_gui: 'Ban CHQS Huyện',
        loai_van_ban: 'Công văn',
        trich_yeu: '',
        lanh_dao_chi_dao: '',
        nguoi_xu_ly: '',
        noi_dung_chi_dao: '',
        han_xu_ly: '',
        trang_thai: 'Chưa xử lý',
        ngay_hoan_thanh: '',
        ket_qua_xu_ly: '',
        muc_do_uu_tien: 'Thường',
        link_dinh_kem: '',
        ghi_chu: '',
      });
    }
    setShowAssignee(Boolean(initialData?.nguoi_xu_ly));
    setErrors({});
    setSubmitError('');
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nam || formData.nam < 2000 || formData.nam > 2099) {
      newErrors.nam = 'Năm không hợp lệ';
    }
    if (!formData.ngay_den) {
      newErrors.ngay_den = 'Vui lòng chọn ngày đến';
    }
    if (!formData.so_ky_hieu.trim()) {
      newErrors.so_ky_hieu = 'Vui lòng nhập số, ký hiệu văn bản';
    }
    if (!formData.co_quan_gui.trim()) {
      newErrors.co_quan_gui = 'Vui lòng nhập cơ quan gửi';
    }
    if (!formData.loai_van_ban.trim()) {
      newErrors.loai_van_ban = 'Vui lòng chọn loại văn bản';
    }
    if (!formData.trich_yeu.trim() || formData.trich_yeu.trim().length < 3) {
      newErrors.trich_yeu = 'Trích yếu nội dung phải có ít nhất 3 ký tự';
    }
    if (formData.link_dinh_kem.trim()) {
      try {
        const url = new URL(formData.link_dinh_kem.trim());
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
      } catch {
        newErrors.link_dinh_kem = 'Đường dẫn tệp phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra khi lưu văn bản');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Danh mục mặc định nếu chưa tải được từ system
  const defaultLoaiVanBan = categories?.loaiVanBan || [
    'Quyết định',
    'Kế hoạch',
    'Công văn',
    'Chỉ thị',
    'Hướng dẫn',
    'Thông báo',
    'Báo cáo',
    'Tờ trình',
    'Công điện',
  ];

  const defaultCoQuan = categories?.coQuanGui || [
    'Ban CHQS Huyện',
    'Bộ CHQS Tỉnh',
    'UBND Huyện',
    'UBND Xã Xuân Sơn',
    'Đảng ủy Xã Xuân Sơn',
    'Công an Xã Xuân Sơn',
    'Thanh tra Quốc phòng Tỉnh',
  ];

  const defaultNguoiXuLy = ['CTV', 'CTVP', 'NV', 'PV', 'Khác'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa văn bản đến' : 'Tiếp nhận văn bản đến mới'}
      subtitle="Quản lý và cập nhật tiến độ xử lý văn bản đến tại Ban CHQS xã Xuân Sơn"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Section 1: Thông tin cơ bản & Đăng ký số */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            1. Thông tin đăng ký và phân loại văn bản
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Năm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm tiếp nhận <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.nam}
                onChange={(e) => setFormData({ ...formData, nam: parseInt(e.target.value, 10) || formData.nam })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.nam && <p className="text-[11px] text-rose-600 mt-0.5">{errors.nam}</p>}
            </div>

            {/* Số đến (nhập thủ công) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số đến (tự động)
              </label>
              <input
                type="number"
                min="1"
                value={formData.so_den || ''}
                readOnly
                placeholder="Tự cấp khi lưu"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-blue-900"
              />
              {errors.so_den && <p className="text-[11px] text-rose-600 mt-0.5">{errors.so_den}</p>}
            </div>

            {/* Ngày đến */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày đến <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.ngay_den}
                onChange={(e) => setFormData({ ...formData, ngay_den: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.ngay_den && <p className="text-[11px] text-rose-600 mt-0.5">{errors.ngay_den}</p>}
            </div>

            {/* Mức độ ưu tiên */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Độ ưu tiên
              </label>
              <select
                value={formData.muc_do_uu_tien}
                onChange={(e) => setFormData({ ...formData, muc_do_uu_tien: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Thường">Thường</option>
                <option value="Khẩn">Khẩn</option>
                <option value="Thượng khẩn">Thượng khẩn</option>
                <option value="Hỏa tốc">Hỏa tốc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            {/* Số, ký hiệu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số, ký hiệu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.so_ky_hieu}
                onChange={(e) => setFormData({ ...formData, so_ky_hieu: e.target.value })}
                placeholder="VD: 45/KH-BCH"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {errors.so_ky_hieu && <p className="text-[11px] text-rose-600 mt-0.5">{errors.so_ky_hieu}</p>}
            </div>

            {/* Ngày ban hành */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày ban hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.ngay_ban_hanh}
                onChange={(e) => setFormData({ ...formData, ngay_ban_hanh: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.ngay_ban_hanh && <p className="text-[11px] text-rose-600 mt-0.5">{errors.ngay_ban_hanh}</p>}
            </div>

            {/* Loại văn bản */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại văn bản <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.loai_van_ban}
                onChange={(e) => setFormData({ ...formData, loai_van_ban: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {defaultLoaiVanBan.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.loai_van_ban && <p className="text-[11px] text-rose-600 mt-0.5">{errors.loai_van_ban}</p>}
            </div>
          </div>

          {/* Cơ quan gửi */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cơ quan gửi <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                list="co-quan-list"
                value={formData.co_quan_gui}
                onChange={(e) => setFormData({ ...formData, co_quan_gui: e.target.value })}
                placeholder="Nhập hoặc chọn cơ quan gửi"
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <datalist id="co-quan-list">
                {defaultCoQuan.map((cq) => (
                  <option key={cq} value={cq} />
                ))}
              </datalist>
            </div>
            {errors.co_quan_gui && <p className="text-[11px] text-rose-600 mt-0.5">{errors.co_quan_gui}</p>}
          </div>

          {/* Trích yếu nội dung */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trích yếu nội dung văn bản <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.trich_yeu}
              onChange={(e) => setFormData({ ...formData, trich_yeu: e.target.value })}
              placeholder="Ghi vắn tắt nội dung chính của văn bản..."
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.trich_yeu && <p className="text-[11px] text-rose-600 mt-0.5">{errors.trich_yeu}</p>}
          </div>
        </div>

        {/* Section 2: Chỉ đạo & Phân công xử lý */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            2. Theo dõi xử lý
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <button type="button" aria-expanded={showAssignee} onClick={() => setShowAssignee(!showAssignee)} className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer">
                {showAssignee ? 'Thu gọn người chủ trì' : '+ Thêm người chủ trì xử lý (không bắt buộc)'}
              </button>
            </div>
            {showAssignee && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người chủ trì xử lý chính (không bắt buộc)
              </label>
              <select
                value={formData.nguoi_xu_ly}
                onChange={(e) => setFormData({ ...formData, nguoi_xu_ly: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
              >
                <option value="">Chưa phân công</option>
                {initialData?.nguoi_xu_ly && !defaultNguoiXuLy.includes(initialData.nguoi_xu_ly) && (
                  <option value={initialData.nguoi_xu_ly}>{initialData.nguoi_xu_ly} (đã lưu)</option>
                )}
                {defaultNguoiXuLy.map((cb) => (
                  <option key={cb} value={cb}>{cb}</option>
                ))}
              </select>
              {errors.nguoi_xu_ly && <p className="text-[11px] text-rose-600 mt-0.5">{errors.nguoi_xu_ly}</p>}
            </div>
            )}
          </div>

          {/* Nội dung chỉ đạo */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ý kiến chỉ đạo cụ thể của lãnh đạo
            </label>
            <textarea
              rows={2}
              value={formData.noi_dung_chi_dao}
              onChange={(e) => setFormData({ ...formData, noi_dung_chi_dao: e.target.value })}
              placeholder="Nội dung giao việc, yêu cầu thời hạn, biện pháp triển khai..."
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            {/* Hạn xử lý */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn xử lý (nếu có)
              </label>
              <input
                type="date"
                value={formData.han_xu_ly}
                onChange={(e) => setFormData({ ...formData, han_xu_ly: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Trạng thái xử lý */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái tiến độ
              </label>
              <select
                value={formData.trang_thai}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    trang_thai: val,
                    ngay_hoan_thanh: val === 'Đã hoàn thành' && !formData.ngay_hoan_thanh ? getTodayDateString() : formData.ngay_hoan_thanh,
                  });
                }}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              >
                <option value="Không">Không</option>
                <option value="Chưa xử lý">Chưa xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Quá hạn">Quá hạn</option>
              </select>
            </div>

            {/* Ngày hoàn thành */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày hoàn thành
              </label>
              <input
                type="date"
                value={formData.ngay_hoan_thanh}
                onChange={(e) => setFormData({ ...formData, ngay_hoan_thanh: e.target.value })}
                disabled={formData.trang_thai !== 'Đã hoàn thành'}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Kết quả xử lý */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kết quả xử lý / Báo cáo thực hiện
            </label>
            <input
              type="text"
              value={formData.ket_qua_xu_ly}
              onChange={(e) => setFormData({ ...formData, ket_qua_xu_ly: e.target.value })}
              placeholder="VD: Đã hoàn thành Kế hoạch số 03 và báo cáo UBND xã"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 3: Tệp đính kèm & Ghi chú */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            3. Liên kết tệp đính kèm & Ghi chú
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đường dẫn tệp đính kèm (URL Google Drive / Cloud)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={formData.link_dinh_kem}
                onChange={(e) => setFormData({ ...formData, link_dinh_kem: e.target.value })}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Hệ thống chỉ lưu liên kết URL tệp đính kèm, không lưu trữ tệp trực tiếp trên máy chủ.
            </p>
            {errors.link_dinh_kem && <p className="text-[11px] text-rose-600 mt-0.5">{errors.link_dinh_kem}</p>}
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú bổ sung
            </label>
            <input
              type="text"
              value={formData.ghi_chu}
              onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
              placeholder="Lưu ý về số lượng bản in, nơi lưu trữ bản cứng..."
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{initialData ? 'Cập nhật văn bản' : 'Lưu vào sổ văn bản'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
