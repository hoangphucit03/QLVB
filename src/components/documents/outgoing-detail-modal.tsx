'use client';

import React from 'react';
import {
  FileText,
  Calendar,
  Building,
  User,
  Send,
  ExternalLink,
  Edit,
  Tag,
  Share2,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { VanBanDi } from '@/lib/types';
import { formatDateVN, getStatusBadgeClass } from '@/lib/utils';

interface OutgoingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VanBanDi | null;
  onEdit?: (doc: VanBanDi) => void;
}

export function OutgoingDetailModal({
  isOpen,
  onClose,
  document,
  onEdit,
}: OutgoingDetailModalProps) {
  if (!document) return null;

  const statusStyle = getStatusBadgeClass(document.trang_thai);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết văn bản đi"
      subtitle={`Mã hệ thống: ${document.id}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Header Information Card */}
        <div className="p-4.5 bg-linear-to-r from-indigo-50/70 via-white to-slate-50 rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-xs shadow-xs">
                Số đi: {document.so_di} / {document.nam}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                Số, Ký hiệu: {document.so_ky_hieu}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ngày phát hành: <span className="text-slate-800 font-semibold">{formatDateVN(document.ngay_phat_hanh)}</span> • Ngày ký: <span className="text-slate-800 font-semibold">{formatDateVN(document.ngay_ky)}</span>
            </p>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full border font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {document.trang_thai}
          </span>
        </div>

        {/* Trích yếu nội dung */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Trích yếu nội dung văn bản
          </span>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {document.trich_yeu}
          </p>
        </div>

        {/* 2-Column Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cột trái: Soạn thảo & Ký duyệt */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Soạn thảo & Ban hành
            </h4>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Đơn vị soạn thảo:
              </span>
              <span className="font-semibold text-slate-800">{document.don_vi_soan_thao}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Người ký duyệt:
              </span>
              <span className="font-semibold text-blue-900">{document.nguoi_ky}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Chức vụ người ký:
              </span>
              <span className="font-semibold text-slate-800">{document.chuc_vu_nguoi_ky || 'Chỉ huy'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Loại văn bản:
              </span>
              <span className="font-semibold text-slate-800">{document.loai_van_ban}</span>
            </div>
          </div>

          {/* Cột phải: Nơi nhận & Hình thức gửi */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Phát hành & Nơi nhận
            </h4>

            <div className="text-xs space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-slate-400" />
                Nơi nhận văn bản:
              </span>
              <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {document.noi_nhan}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Hình thức chuyển phát:
              </span>
              <span className="font-semibold text-slate-800">{document.hinh_thuc_gui || 'Trực tiếp'}</span>
            </div>
          </div>
        </div>

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
              <span className="font-semibold text-slate-700 block">Ghi chú phát hành:</span>
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
                Sửa văn bản đi
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
