'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Calendar, Link as LinkIcon, User } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { VanBanDi } from '@/lib/types';
import { getTodayDateString } from '@/lib/utils';

interface OutgoingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Partial<VanBanDi>) => Promise<boolean>;
  initialData?: VanBanDi | null;
  categories?: {
    loaiVanBan: string[];
    donViSoanThao: string[];
    hinhThucGui: string[];
    trangThai: string[];
  };
}

export function OutgoingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}: OutgoingModalProps) {
  const [formData, setFormData] = useState({
    nam: 2025,
    so_di: 0,
    ngay_phat_hanh: '2025-01-01',
    so_ky_hieu: '',
    ngay_ky: '2025-01-01',
    loai_van_ban: 'Báo cáo',
    trich_yeu: '',
    don_vi_soan_thao: 'Phòng Chính trị',
    nguoi_ky: 'Vũ Đức Hướng',
    chuc_vu_nguoi_ky: 'Chính trị viên',
    noi_nhan: 'Ban CHQS Huyện',
    hinh_thuc_gui: 'Trực tiếp',
    trang_thai: 'Đã phát hành',
    link_dinh_kem: '',
    ghi_chu: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const todayStr = getTodayDateString();

    if (initialData) {
      setFormData({
        nam: initialData.nam || currentYear,
        so_di: initialData.so_di || 0,
        ngay_phat_hanh: initialData.ngay_phat_hanh || todayStr,
        so_ky_hieu: initialData.so_ky_hieu || '',
        ngay_ky: initialData.ngay_ky || todayStr,
        loai_van_ban: initialData.loai_van_ban || 'Báo cáo',
        trich_yeu: initialData.trich_yeu || '',
        don_vi_soan_thao: initialData.don_vi_soan_thao || 'Phòng Chính trị',
        nguoi_ky: initialData.nguoi_ky || '',
        chuc_vu_nguoi_ky: initialData.chuc_vu_nguoi_ky || '',
        noi_nhan: initialData.noi_nhan || '',
        hinh_thuc_gui: initialData.hinh_thuc_gui || 'Trực tiếp',
        trang_thai: initialData.trang_thai || 'Đã phát hành',
        link_dinh_kem: initialData.link_dinh_kem || '',
        ghi_chu: initialData.ghi_chu || '',
      });
    } else {
      setFormData({
        nam: currentYear,
        so_di: 0,
        ngay_phat_hanh: todayStr,
        so_ky_hieu: '',
        ngay_ky: todayStr,
        loai_van_ban: 'Báo cáo',
        trich_yeu: '',
        don_vi_soan_thao: 'Phòng Chính trị',
        nguoi_ky: 'Vũ Đức Hướng',
        chuc_vu_nguoi_ky: 'Chính trị viên',
        noi_nhan: 'Ban CHQS Huyện',
        hinh_thuc_gui: 'Trực tiếp',
        trang_thai: 'Đã phát hành',
        link_dinh_kem: '',
        ghi_chu: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nam || formData.nam < 2000 || formData.nam > 2099) {
      newErrors.nam = 'Năm không hợp lệ';
    }
    if (formData.trang_thai === 'Đã phát hành' && (!formData.so_di || Number(formData.so_di) <= 0)) {
      newErrors.so_di = 'Số đi phải là số nguyên dương lớn hơn 0';
    }
    if (!formData.ngay_phat_hanh) {
      newErrors.ngay_phat_hanh = 'Vui lòng chọn ngày phát hành';
    }
    if (formData.trang_thai === 'Đã phát hành' && !formData.so_ky_hieu.trim()) {
      newErrors.so_ky_hieu = 'Vui lòng nhập số, ký hiệu văn bản đi';
    }
    if (!formData.ngay_ky) {
      newErrors.ngay_ky = 'Vui lòng chọn ngày ký';
    }
    if (!formData.loai_van_ban.trim()) {
      newErrors.loai_van_ban = 'Vui lòng chọn loại văn bản';
    }
    if (!formData.trich_yeu.trim() || formData.trich_yeu.trim().length < 3) {
      newErrors.trich_yeu = 'Trích yếu nội dung phải có ít nhất 3 ký tự';
    }
    if (!formData.nguoi_ky.trim()) {
      newErrors.nguoi_ky = 'Vui lòng nhập người ký duyệt';
    }
    if (!formData.noi_nhan.trim()) {
      newErrors.noi_nhan = 'Vui lòng nhập nơi nhận văn bản';
    }
    if (formData.link_dinh_kem.trim()) {
      try {
        const url = new URL(formData.link_dinh_kem.trim());
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
      } catch {
        newErrors.link_dinh_kem = 'Đường dẫn tệp phải là URL hợp lệ';
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
      setSubmitError(err?.message || 'Có lỗi xảy ra khi lưu văn bản đi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultLoaiVanBan = categories?.loaiVanBan || [
    'Báo cáo',
    'Kế hoạch',
    'Công văn',
    'Tờ trình',
    'Quyết định',
    'Thông báo',
    'Chỉ thị',
    'Hướng dẫn',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa văn bản đi' : 'Đăng ký phát hành văn bản đi'}
      subtitle="Quản lý và cấp số văn bản đi tại Ban CHQS xã Xuân Sơn"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Section 1: Thông tin cấp số & Văn bản */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            1. Cấp số đi & Phân loại văn bản
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Năm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm phát hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.nam}
                onChange={(e) => setFormData({ ...formData, nam: parseInt(e.target.value, 10) || formData.nam })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.nam && <p className="text-[11px] text-rose-600 mt-0.5">{errors.nam}</p>}
            </div>

            {/* Số đi (nhập thủ công) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số đi {formData.trang_thai === 'Đã phát hành' ? <span className="text-rose-500">*</span> : '(không bắt buộc)'}
              </label>
              <input
                type="number"
                min="1"
                value={formData.so_di || ''}
                onChange={(e) => setFormData({ ...formData, so_di: parseInt(e.target.value, 10) || 0 })}
                placeholder="VD: 10"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-blue-900"
              />
              {errors.so_di && <p className="text-[11px] text-rose-600 mt-0.5">{errors.so_di}</p>}
            </div>

            {/* Ngày phát hành */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày phát hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.ngay_phat_hanh}
                onChange={(e) => setFormData({ ...formData, ngay_phat_hanh: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.ngay_phat_hanh && <p className="text-[11px] text-rose-600 mt-0.5">{errors.ngay_phat_hanh}</p>}
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {/* Số, ký hiệu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số, ký hiệu văn bản {formData.trang_thai === 'Đã phát hành' ? <span className="text-rose-500">*</span> : '(không bắt buộc)'}
              </label>
              <input
                type="text"
                value={formData.so_ky_hieu}
                onChange={(e) => setFormData({ ...formData, so_ky_hieu: e.target.value })}
                placeholder="VD: 05/BC-BCH"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {errors.so_ky_hieu && <p className="text-[11px] text-rose-600 mt-0.5">{errors.so_ky_hieu}</p>}
            </div>

            {/* Ngày ký */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày ký duyệt <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.ngay_ky}
                onChange={(e) => setFormData({ ...formData, ngay_ky: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.ngay_ky && <p className="text-[11px] text-rose-600 mt-0.5">{errors.ngay_ky}</p>}
            </div>
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
              placeholder="Ghi tóm tắt nội dung chính của văn bản ban hành..."
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.trich_yeu && <p className="text-[11px] text-rose-600 mt-0.5">{errors.trich_yeu}</p>}
          </div>
        </div>

        {/* Section 2: Đơn vị soạn thảo & Ký duyệt */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            2. Người ký & Nơi nhận
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Người ký */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên người ký <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nguoi_ky}
                onChange={(e) => setFormData({ ...formData, nguoi_ky: e.target.value })}
                placeholder="Vũ Đức Hướng"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {errors.nguoi_ky && <p className="text-[11px] text-rose-600 mt-0.5">{errors.nguoi_ky}</p>}
            </div>

            {/* Chức vụ người ký */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chức vụ người ký
              </label>
              <input
                type="text"
                list="chuc-vu-list"
                value={formData.chuc_vu_nguoi_ky}
                onChange={(e) => setFormData({ ...formData, chuc_vu_nguoi_ky: e.target.value })}
                placeholder="Chính trị viên"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <datalist id="chuc-vu-list">
                <option value="Chỉ huy trưởng" />
                <option value="Phó Chỉ huy trưởng" />
                <option value="Chính trị viên" />
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            {/* Nơi nhận */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nơi nhận văn bản <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.noi_nhan}
                onChange={(e) => setFormData({ ...formData, noi_nhan: e.target.value })}
                placeholder="VD: Ban CHQS Huyện, UBND Xã Xuân Sơn, Các thôn"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.noi_nhan && <p className="text-[11px] text-rose-600 mt-0.5">{errors.noi_nhan}</p>}
            </div>

            {/* Hình thức gửi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hình thức gửi
              </label>
              <select
                value={formData.hinh_thuc_gui}
                onChange={(e) => setFormData({ ...formData, hinh_thuc_gui: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Trực tiếp">Trực tiếp</option>
                <option value="Đường truyền">Đường truyền</option>
                <option value="Khác">Khác</option>
                <option value="Nội bộ">Nội bộ</option>
                {initialData?.hinh_thuc_gui && !['Trực tiếp', 'Đường truyền', 'Khác', 'Nội bộ'].includes(initialData.hinh_thuc_gui) && (
                  <option value={initialData.hinh_thuc_gui}>{initialData.hinh_thuc_gui}</option>
                )}
              </select>
            </div>
          </div>

          {/* Trạng thái phát hành */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trạng thái phát hành
            </label>
            <select
              value={formData.trang_thai}
              onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            >
              <option value="Dự thảo">Dự thảo</option>
              <option value="Chờ ký">Chờ ký</option>
              <option value="Đã ký duyệt">Đã ký duyệt</option>
              <option value="Đã phát hành">Đã phát hành</option>
            </select>
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
            {errors.link_dinh_kem && <p className="text-[11px] text-rose-600 mt-0.5">{errors.link_dinh_kem}</p>}
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú thêm
            </label>
            <input
              type="text"
              value={formData.ghi_chu}
              onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
              placeholder="VD: Lưu văn thư 02 bản cứng..."
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
                <span>{initialData ? 'Cập nhật văn bản đi' : (formData.trang_thai === 'Đã phát hành' ? 'Lưu và phát hành' : 'Lưu văn bản')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
