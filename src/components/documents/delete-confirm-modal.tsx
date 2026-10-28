'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  documentTitle: string;
  documentCode?: string;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  documentTitle,
  documentCode,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa văn bản"
      subtitle="Hành động này sẽ xóa dữ liệu trên hệ thống"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs text-rose-800 leading-relaxed">
            <p className="font-bold text-sm text-rose-900 mb-1">Cảnh báo bảo toàn dữ liệu</p>
            Bạn có chắc chắn muốn xóa văn bản này khỏi cơ sở dữ liệu? Dữ liệu trên Google Sheets sẽ bị xóa hoặc làm trống dòng tương ứng.
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          {documentCode && (
            <div className="text-xs font-bold text-slate-700 mb-1">
              Số, ký hiệu: <span className="text-blue-700">{documentCode}</span>
            </div>
          )}
          <div className="text-xs text-slate-600 line-clamp-3 italic">
            &ldquo;{documentTitle}&rdquo;
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
