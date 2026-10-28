'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Plus, RefreshCw } from 'lucide-react';
import { OutgoingTable } from '@/components/documents/outgoing-table';
import { OutgoingModal } from '@/components/documents/outgoing-modal';
import { OutgoingDetailModal } from '@/components/documents/outgoing-detail-modal';
import { DeleteConfirmModal } from '@/components/documents/delete-confirm-modal';
import { VanBanDi } from '@/lib/types';

function VanBanDiContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [documents, setDocuments] = useState<VanBanDi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<VanBanDi | null>(null);
  const [viewingDoc, setViewingDoc] = useState<VanBanDi | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<VanBanDi | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories cache
  const [categories, setCategories] = useState<{
    loaiVanBan: string[];
    donViSoanThao: string[];
    hinhThucGui: string[];
    trangThai: string[];
  }>({
    loaiVanBan: [],
    donViSoanThao: [],
    hinhThucGui: [],
    trangThai: [],
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetch('/api/system/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.grouped) {
          const g = data.grouped;
          setCategories({
            loaiVanBan: g.LOAI_VAN_BAN?.map((i: any) => i.ten) || [],
            donViSoanThao: ['Ban CHQS Xã Xuân Sơn', 'Bộ phận Tác huấn', 'Bộ phận Quân lực', 'Bộ phận Chính trị'],
            hinhThucGui: ['Trực tiếp', 'Trục liên thông văn bản', 'Email công vụ', 'Bưu điện'],
            trangThai: g.TRANG_THAI_DI?.map((i: any) => i.ten) || [],
          });
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedYear !== 'all') params.set('nam', selectedYear);
      if (selectedStatus !== 'all') params.set('trang_thai', selectedStatus);
      if (selectedType !== 'all') params.set('loai_van_ban', selectedType);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/documents/outgoing?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setDocuments(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        showNotification('error', data.message || 'Không thể tải danh sách văn bản đi');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối khi tải danh sách văn bản đi');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedYear, selectedStatus, selectedType, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (doc: VanBanDi) => {
    setEditingDoc(doc);
    setIsAddEditOpen(true);
  };

  const handleOpenView = (doc: VanBanDi) => {
    setViewingDoc(doc);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (doc: VanBanDi) => {
    setDeletingDoc(doc);
    setIsDeleteOpen(true);
  };

  const handleSaveDocument = async (docData: Partial<VanBanDi>): Promise<boolean> => {
    try {
      let res;
      if (editingDoc) {
        res = await fetch(`/api/documents/outgoing/${editingDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData),
        });
      } else {
        res = await fetch('/api/documents/outgoing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData),
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotification('success', editingDoc ? 'Cập nhật văn bản đi thành công' : 'Đăng ký phát hành văn bản đi thành công');
        fetchDocuments();
        return true;
      } else {
        showNotification('error', data.message || 'Thao tác không thành công');
        return false;
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Lỗi khi gửi yêu cầu lưu văn bản đi');
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/documents/outgoing/${deletingDoc.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Đã xóa văn bản đi thành công');
        setIsDeleteOpen(false);
        setDeletingDoc(null);
        fetchDocuments();
      } else {
        showNotification('error', data.message || 'Không thể xóa văn bản đi');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối khi xóa văn bản đi');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Sổ Quản Lý Văn Bản Đi
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cấp số, đăng ký phát hành, lưu trữ và quản lý nơi nhận văn bản đi của Ban CHQS xã Xuân Sơn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDocuments()}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Floating Notification Alert */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table */}
      <OutgoingTable
        documents={documents}
        loading={loading}
        onAdd={handleOpenAdd}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />

      {/* Modal Add / Edit */}
      <OutgoingModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveDocument}
        initialData={editingDoc}
        categories={categories}
      />

      {/* Modal View Detail */}
      <OutgoingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        document={viewingDoc}
        onEdit={(doc) => {
          setIsDetailOpen(false);
          handleOpenEdit(doc);
        }}
      />

      {/* Modal Delete Confirm */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        documentTitle={deletingDoc?.trich_yeu || ''}
        documentCode={deletingDoc?.so_ky_hieu}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function VanBanDiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải sổ văn bản đi...</div>}>
      <VanBanDiContent />
    </Suspense>
  );
}
