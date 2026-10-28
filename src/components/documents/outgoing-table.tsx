'use client';

import React from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
} from 'lucide-react';
import { VanBanDi } from '@/lib/types';
import { formatDateVN, getStatusBadgeClass } from '@/lib/utils';

interface OutgoingTableProps {
  documents: VanBanDi[];
  loading: boolean;
  onAdd: () => void;
  onView: (doc: VanBanDi) => void;
  onEdit: (doc: VanBanDi) => void;
  onDelete: (doc: VanBanDi) => void;
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

export function OutgoingTable({
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
}: OutgoingTableProps) {
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
              placeholder="Tìm kiếm theo số ký hiệu, trích yếu, người ký, nơi nhận..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Button: Add New Document */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAdd}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng ký văn bản đi</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Lọc Năm */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Năm phát hành
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
              {(categories?.loaiVanBan || ['Báo cáo', 'Kế hoạch', 'Công văn', 'Tờ trình', 'Quyết định', 'Thông báo']).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Trạng thái phát hành
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Dự thảo">Dự thảo</option>
              <option value="Chờ ký">Chờ ký</option>
              <option value="Đã ký duyệt">Đã ký duyệt</option>
              <option value="Đã phát hành">Đã phát hành</option>
            </select>
          </div>

          {/* Tổng số kết quả */}
          <div className="flex flex-col justify-end">
            <div className="text-[11px] text-slate-500 font-medium pb-1.5">
              Tổng số: <span className="font-bold text-indigo-900">{pagination.total}</span> văn bản
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
                <th className="py-3 px-3.5 w-16 text-center">Số đi</th>
                <th className="py-3 px-3.5 w-24">Ngày PH</th>
                <th className="py-3 px-3.5 w-32">Số, ký hiệu</th>
                <th className="py-3 px-3.5 w-24">Ngày ký</th>
                <th className="py-3 px-3.5 w-28">Loại VB</th>
                <th className="py-3 px-4 min-w-[280px]">Trích yếu nội dung</th>
                <th className="py-3 px-3.5 w-32">Người ký</th>
                <th className="py-3 px-3.5 w-36">Nơi nhận</th>
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
                      <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Đang tải dữ liệu văn bản đi...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Không tìm thấy văn bản đi phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Vui lòng thử điều chỉnh lại bộ lọc hoặc thêm mới văn bản đi.
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const statusClass = getStatusBadgeClass(doc.trang_thai);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Số đi */}
                      <td className="py-3 px-3.5 text-center font-bold text-indigo-900 bg-slate-50/50">
                        {doc.so_di}
                      </td>

                      {/* Ngày phát hành */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {formatDateVN(doc.ngay_phat_hanh)}
                      </td>

                      {/* Số, ký hiệu */}
                      <td className="py-3 px-3.5 font-semibold text-slate-800">
                        {doc.so_ky_hieu}
                      </td>

                      {/* Ngày ký */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {formatDateVN(doc.ngay_ky)}
                      </td>

                      {/* Loại văn bản */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {doc.loai_van_ban}
                      </td>

                      {/* Trích yếu nội dung */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onView(doc)}
                          className="font-medium text-slate-800 line-clamp-2 hover:text-indigo-600 cursor-pointer"
                          title={doc.trich_yeu}
                        >
                          {doc.trich_yeu}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Đv soạn: {doc.don_vi_soan_thao}
                        </div>
                      </td>

                      {/* Người ký */}
                      <td className="py-3 px-3.5 text-slate-700">
                        <div className="font-medium">{doc.nguoi_ky}</div>
                        <div className="text-[10px] text-slate-400">{doc.chuc_vu_nguoi_ky}</div>
                      </td>

                      {/* Nơi nhận */}
                      <td className="py-3 px-3.5 text-slate-700">
                        <span className="truncate block max-w-[140px]" title={doc.noi_nhan}>
                          {doc.noi_nhan}
                        </span>
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
                            href={doc.link_dinh_kem}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded inline-block transition-colors"
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
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
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

            <span className="px-3 py-1 font-semibold bg-white border border-slate-200 rounded-lg text-indigo-900">
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
