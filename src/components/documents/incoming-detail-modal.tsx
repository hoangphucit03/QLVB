'use client';

import React from 'react';
import {
  FileText,
  Calendar,
  Building,
  User,
  Clock,
  ExternalLink,
  Edit,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { VanBanDen } from '@/lib/types';
import { formatDateVN, getPriorityBadgeClass, getStatusBadgeClass } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IncomingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VanBanDen | null;
  onEdit?: (doc: VanBanDen) => void;
}

export function IncomingDetailModal({
  isOpen,
  onClose,
  document,
  onEdit,
}: IncomingDetailModalProps) {
  if (!document) return null;

  const priorityStyle = getPriorityBadgeClass(document.muc_do_uu_tien);
  const statusStyle = getStatusBadgeClass(document.trang_thai);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết văn bản đến"
      subtitle={`Mã hệ thống: ${document.id}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Header Information Card */}
        <div className="p-4.5 bg-linear-to-r from-blue-50/70 via-white to-slate-50 rounded-2xl border border-blue-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs shadow-xs">
                Số đến: {document.so_den} / {document.nam}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                Số, Ký hiệu: {document.so_ky_hieu}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Tiếp nhận ngày: <span className="text-slate-800 font-semibold">{formatDateVN(document.ngay_den)}</span> • Ban hành ngày: <span className="text-slate-800 font-semibold">{formatDateVN(document.ngay_ban_hanh)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {document.muc_do_uu_tien}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {document.trang_thai}
            </span>
          </div>
        </div>

        {/* Trích yếu nội dung */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Trích yếu nội dung
          </span>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {document.trich_yeu}
          </p>
        </div>

        {/* 2-Column Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cột trái: Phân loại & Cơ quan */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Thông tin nguồn gốc
            </h4>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Cơ quan ban hành:
              </span>
              <span className="font-semibold text-slate-800">{document.co_quan_gui}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Loại văn bản:
              </span>
              <span className="font-semibold text-slate-800">{document.loai_van_ban}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Thời hạn giải quyết:
              </span>
              <span className="font-semibold text-slate-800">
                {document.han_xu_ly ? formatDateVN(document.han_xu_ly) : 'Không có'}
              </span>
            </div>
          </div>

          {/* Cột phải: Phân công & Kết quả */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Chỉ huy & Thực hiện
            </h4>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Lãnh đạo chỉ đạo:
              </span>
              <span className="font-semibold text-slate-800">
                {document.lanh_dao_chi_dao || 'Chưa chỉ đạo'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Chủ trì xử lý:
              </span>
              <span className="font-semibold text-blue-900">{document.nguoi_xu_ly}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Ngày hoàn thành:
              </span>
              <span className="font-semibold text-slate-800">
                {document.ngay_hoan_thanh ? formatDateVN(document.ngay_hoan_thanh) : 'Đang xử lý'}
              </span>
            </div>
          </div>
        </div>

        {/* Nội dung chỉ đạo & Kết quả xử lý */}
        {(document.noi_dung_chi_dao || document.ket_qua_xu_ly) && (
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-3">
            {document.noi_dung_chi_dao && (
              <div>
                <span className="text-xs font-bold text-blue-900 block mb-1">
                  Ý kiến chỉ đạo cụ thể:
                </span>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-blue-100 leading-relaxed">
                  {document.noi_dung_chi_dao}
                </p>
              </div>
            )}

            {document.ket_qua_xu_ly && (
              <div>
                <span className="text-xs font-bold text-emerald-900 block mb-1">
                  Kết quả xử lý:
                </span>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed">
                  {document.ket_qua_xu_ly}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tệp đính kèm & Ghi chú */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs space-y-1">
            <span className="font-semibold text-slate-700 block">Tệp tài liệu đính kèm:</span>
            {document.link_dinh_kem ? (
              <a
                href={document.link_dinh_kem}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold underline truncate max-w-md"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{document.link_dinh_kem}</span>
              </a>
            ) : (
              <span className="text-slate-400 italic">Không có tệp đính kèm</span>
            )}
          </div>

          {document.ghi_chu && (
            <div className="text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
              <span className="font-semibold text-slate-700 block">Ghi chú:</span>
              <span>{document.ghi_chu}</span>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-3 gap-2">
          <span>Ngày tạo: {document.ngay_tao} • Lần sửa cuối: {document.ngay_cap_nhat}</span>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(document);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Sửa văn bản
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
