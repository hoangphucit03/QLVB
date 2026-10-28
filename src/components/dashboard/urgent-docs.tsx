'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, ArrowRight, Eye, Calendar, User, ExternalLink } from 'lucide-react';
import { VanBanDen } from '@/lib/types';
import { formatDateVN, getDeadlineStatus, getPriorityBadgeClass } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface UrgentDocsProps {
  documents: VanBanDen[];
  onSelectDoc?: (doc: VanBanDen) => void;
}

export function UrgentDocs({ documents, onSelectDoc }: UrgentDocsProps) {
  const pendingDocs = documents.filter((d) => d.trang_thai !== 'Đã hoàn thành');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Văn Bản Cần Xử Lý Gần Nhất</h3>
            <p className="text-xs text-slate-500">Các văn bản có thời hạn hoặc mức độ ưu tiên khẩn</p>
          </div>
        </div>

        <Link
          href="/van-ban-den?trang_thai=Chưa xử lý"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
        {pendingDocs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-sm font-medium text-slate-600">Hiện tại không có văn bản tồn đọng cần gấp</p>
            <p className="text-xs text-slate-400 mt-0.5">Tất cả văn bản đến đã được chỉ đạo và giải quyết đúng tiến độ.</p>
          </div>
        ) : (
          pendingDocs.map((doc) => {
            const priorityClass = getPriorityBadgeClass(doc.muc_do_uu_tien);
            const deadlineStatus = getDeadlineStatus(doc.han_xu_ly, doc.trang_thai);

            let deadlineBadge = null;
            if (deadlineStatus === 'overdue') {
              deadlineBadge = (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Quá hạn ({formatDateVN(doc.han_xu_ly)})
                </span>
              );
            } else if (deadlineStatus === 'due_today') {
              deadlineBadge = (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Đến hạn hôm nay
                </span>
              );
            } else if (doc.han_xu_ly) {
              deadlineBadge = (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Hạn: {formatDateVN(doc.han_xu_ly)}
                </span>
              );
            }

            return (
              <div
                key={doc.id}
                className="py-3.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Số đến: {doc.so_den}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {doc.so_ky_hieu}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${priorityClass.bg} ${priorityClass.text} ${priorityClass.border}`}
                    >
                      {doc.muc_do_uu_tien}
                    </span>
                  </div>

                  {deadlineBadge}
                </div>

                <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed">
                  {doc.trich_yeu}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-medium">{doc.co_quan_gui}</span>
                    {doc.nguoi_xu_ly && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <User className="w-3 h-3 text-slate-400" />
                        {doc.nguoi_xu_ly}
                      </span>
                    )}
                  </div>

                  {onSelectDoc && (
                    <button
                      onClick={() => onSelectDoc(doc)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
