'use client';

import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  RefreshCw,
  Search,
  Pencil,
  Save,
  AlertCircle,
} from 'lucide-react';
import { DanhMucItem } from '@/lib/types';
import { Modal } from '@/components/ui/modal';

export default function DanhMucPage() {
  const [categories, setCategories] = useState<DanhMucItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<DanhMucItem | null>(null);
  const [editForm, setEditForm] = useState<DanhMucItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEdit = (item: DanhMucItem) => {
    setEditingItem(item);
    setEditForm({ ...item });
    setSaveError('');
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem || !editForm) return;

    setSaving(true);
    setSaveError('');
    try {
      const response = await fetch('/api/system/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: {
            nhom_danh_muc: editingItem.nhom_danh_muc,
            ma: editingItem.ma,
          },
          updates: editForm,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể cập nhật danh mục.');
      }

      setCategories((current) =>
        current.map((item) =>
          item.nhom_danh_muc === editingItem.nhom_danh_muc && item.ma === editingItem.ma
            ? result.data
            : item
        )
      );
      setEditingItem(null);
      setEditForm(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Không thể cập nhật danh mục.');
    } finally {
      setSaving(false);
    }
  };

  // Danh sách các nhóm danh mục
  const groups = Array.from(new Set(categories.map((c) => c.nhom_danh_muc)));

  // Lọc theo nhóm và tìm kiếm
  const filteredCategories = categories.filter((c) => {
    const matchGroup = selectedGroup === 'all' || c.nhom_danh_muc === selectedGroup;
    const matchSearch =
      search === '' ||
      c.ten_gia_tri.toLowerCase().includes(search.toLowerCase()) ||
      c.ma.toLowerCase().includes(search.toLowerCase()) ||
      c.ghi_chu.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const getGroupLabel = (group: string) => {
    switch (group) {
      case 'LOAI_VAN_BAN':
        return 'Loại văn bản';
      case 'MUC_DO_UU_TIEN':
        return 'Mức độ ưu tiên';
      case 'TRANG_THAI_DEN':
        return 'Trạng thái văn bản đến';
      case 'TRANG_THAI_DI':
        return 'Trạng thái văn bản đi';
      case 'CO_QUAN_GUI':
        return 'Cơ quan gửi';
      case 'CAN_BO_XU_LY':
        return 'Cán bộ xử lý';
      default:
        return group;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <ListOrdered className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Danh Mục Dữ Liệu Hệ Thống
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đọc tự động từ Google Sheets DOCFLOW_SYSTEM (Sheet DANH_MUC)
          </p>
        </div>

        <button
          onClick={fetchCategories}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Đồng bộ từ Google Sheets</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Nhóm danh mục buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedGroup === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({categories.length})
          </button>
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getGroupLabel(grp)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, mã danh mục..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4 w-44">Nhóm danh mục</th>
                <th className="py-3 px-4 w-36">Mã tham chiếu</th>
                <th className="py-3 px-4 min-w-[200px]">Tên / Giá trị hiển thị</th>
                <th className="py-3 px-4">Ghi chú & Ý nghĩa nghiệp vụ</th>
                <th className="py-3 px-4 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Đang tải danh mục...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy mục danh mục nào
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, idx) => (
                  <tr key={`${item.nhom_danh_muc}_${item.ma}_${idx}`} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                        {getGroupLabel(item.nhom_danh_muc)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {item.ma}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {item.ten_gia_tri}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.ghi_chu || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700 transition-colors hover:bg-blue-100 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Boolean(editingItem && editForm)}
        onClose={() => {
          if (!saving) {
            setEditingItem(null);
            setEditForm(null);
            setSaveError('');
          }
        }}
        title="Chỉnh sửa danh mục"
        subtitle="Thay đổi sẽ được ghi trực tiếp vào Google Sheets"
        maxWidth="lg"
      >
        {editForm && (
          <form onSubmit={saveCategory} className="space-y-4">
            {saveError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                <span>Nhóm danh mục</span>
                <input
                  required
                  value={editForm.nhom_danh_muc}
                  onChange={(event) => setEditForm({ ...editForm, nhom_danh_muc: event.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                <span>Mã tham chiếu</span>
                <input
                  required
                  value={editForm.ma}
                  onChange={(event) => setEditForm({ ...editForm, ma: event.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
              <span>Tên / Giá trị hiển thị</span>
              <input
                required
                value={editForm.ten_gia_tri}
                onChange={(event) => setEditForm({ ...editForm, ten_gia_tri: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
              <span>Ghi chú</span>
              <textarea
                rows={3}
                value={editForm.ghi_chu}
                onChange={(event) => setEditForm({ ...editForm, ghi_chu: event.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditingItem(null);
                  setEditForm(null);
                }}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
