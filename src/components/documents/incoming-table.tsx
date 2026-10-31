'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { VanBanDen } from '@/lib/types';
import { safeAttachmentUrl, formatDateVN, getPriorityBadgeClass, getStatusBadgeClass, getDeadlineStatus } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IncomingTableProps {
  documents: VanBanDen[];
  loading: boolean;
  onAdd: () => void;
  onView: (doc: VanBanDen) => void;
  onEdit: (doc: VanBanDen) => void;
  onDelete: (doc: VanBanDen) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories?: {
    loaiVanBan: string[];
    coQuanGui: string[];
    trangThai: string[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
}

export function IncomingTable({
  documents,
  loading,
  onAdd,
  onView,
  onEdit,
  onDelete,
  selectedYear,
  onYearChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  categories,
  pagination,
  onPageChange,
}: IncomingTableProps) {
  const yearOptions = [2025, 2024, 2023, 2022];

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm theo số ký hiệu, trích yếu, cán bộ xử lý, cơ quan gửi..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Button: Add New Document */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAdd}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tiếp nhận văn bản đến</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Lọc Năm */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Năm tiếp nhận
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="all">Tất cả các năm</option>
              {yearOptions.map((y) => (
                <option key={y} value={y.toString()}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Lọc Loại văn bản */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Loại văn bản
            </label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="all">Tất cả loại văn bản</option>
              {(categories?.loaiVanBan || ['Quyết định', 'Kế hoạch', 'Công văn', 'Chỉ thị', 'Hướng dẫn', 'Thông báo', 'Báo cáo', 'Tờ trình']).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Trạng thái xử lý
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Không">Không</option>
              <option value="Chưa xử lý">Chưa xử lý</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Quá hạn">Quá hạn</option>
            </select>
          </div>

          {/* Tổng số kết quả */}
          <div className="flex flex-col justify-end">
            <div className="text-[11px] text-slate-500 font-medium pb-1.5">
              Tổng số: <span className="font-bold text-blue-900">{pagination.total}</span> văn bản
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-16 text-center">Số đến</th>
                <th className="py-3 px-3.5 w-24">Ngày đến</th>
                <th className="py-3 px-3.5 w-36">Số, ký hiệu</th>
                <th className="py-3 px-3.5 w-32">Cơ quan gửi</th>
                <th className="py-3 px-3.5 w-28">Loại VB</th>
                <th className="py-3 px-4 min-w-[280px]">Trích yếu nội dung</th>
                <th className="py-3 px-3.5 w-36">Người xử lý</th>
                <th className="py-3 px-3.5 w-28">Hạn xử lý</th>
                <th className="py-3 px-3.5 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-3.5 w-20 text-center">Đính kèm</th>
                <th className="py-3 px-3.5 w-24 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Đang tải dữ liệu văn bản...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Không tìm thấy văn bản phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const priorityClass = getPriorityBadgeClass(doc.muc_do_uu_tien);
                  const statusClass = getStatusBadgeClass(doc.trang_thai);
                  const deadlineStatus = getDeadlineStatus(doc.han_xu_ly, doc.trang_thai);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Số đến */}
                      <td className="py-3 px-3.5 text-center font-bold text-blue-900 bg-slate-50/50">
                        {doc.so_den}
                      </td>

                      {/* Ngày đến */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {formatDateVN(doc.ngay_den)}
                      </td>

                      {/* Số, ký hiệu & Độ ưu tiên */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800">{doc.so_ky_hieu}</div>
                        {doc.muc_do_uu_tien !== 'Thường' && (
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.2 rounded mt-0.5 border ${priorityClass.bg} ${priorityClass.text} ${priorityClass.border}`}
                          >
                            {doc.muc_do_uu_tien}
                          </span>
                        )}
                      </td>

                      {/* Cơ quan gửi */}
                      <td className="py-3 px-3.5 font-medium text-slate-700">
                        {doc.co_quan_gui}
                      </td>

                      {/* Loại văn bản */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {doc.loai_van_ban}
                      </td>

                      {/* Trích yếu nội dung */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onView(doc)}
                          className="font-medium text-slate-800 line-clamp-2 hover:text-blue-600 cursor-pointer"
                          title={doc.trich_yeu}
                        >
                          {doc.trich_yeu}
                        </div>
                        {doc.noi_dung_chi_dao && (
                          <div className="text-[11px] text-blue-700 line-clamp-1 mt-0.5 italic">
                            Chỉ đạo: {doc.noi_dung_chi_dao}
                          </div>
                        )}
                      </td>

                      {/* Người xử lý chính */}
                      <td className="py-3 px-3.5 text-slate-700">
                        <span className="font-medium truncate block max-w-[140px]" title={doc.nguoi_xu_ly}>
                          {doc.nguoi_xu_ly}
                        </span>
                      </td>

                      {/* Hạn xử lý */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {doc.han_xu_ly ? (
                          <span
                            className={
                              deadlineStatus === 'overdue'
                                ? 'text-rose-600 font-bold'
                                : deadlineStatus === 'due_today'
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-600'
                            }
                          >
                            {formatDateVN(doc.han_xu_ly)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-semibold ${statusClass.bg} ${statusClass.text} ${statusClass.border}`}
                        >
                          {doc.trang_thai}
                        </span>
                      </td>

                      {/* Link đính kèm */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {doc.link_dinh_kem ? (
                          <a
                            href={safeAttachmentUrl(doc.link_dinh_kem)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded inline-block transition-colors"
                            title="Mở tệp đính kèm liên kết"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onView(doc)}
                            title="Xem chi tiết"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(doc)}
                            title="Chỉnh sửa văn bản"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(doc)}
                            title="Xóa văn bản"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Hiển thị trang <span className="font-bold text-slate-800">{pagination.page}</span> /{' '}
            <span className="font-bold text-slate-800">{pagination.totalPages}</span> ({pagination.total} bản ghi)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold bg-white border border-slate-200 rounded-lg text-blue-900">
              {pagination.page}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Trang tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
