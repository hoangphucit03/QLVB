'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Send,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { MonthlyChart } from '@/components/dashboard/monthly-chart';
import { UrgentDocs } from '@/components/dashboard/urgent-docs';
import { IncomingDetailModal } from '@/components/documents/incoming-detail-modal';
import { DashboardStats, VanBanDen } from '@/lib/types';
import { formatDateVN } from '@/lib/utils';

function DashboardContent() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDoc, setSelectedDoc] = useState<VanBanDen | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  useEffect(() => {
    // Đọc năm hiện tại an toàn phía client
    const currentYear = new Date().getFullYear();
    setSelectedYear(currentYear);
  }, []);

  const fetchStats = async (year: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/statistics?nam=${year}`);
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
        setIsDemo(data.isDemo);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedYear);
  }, [selectedYear]);

  const handleSelectUrgentDoc = (doc: VanBanDen) => {
    setSelectedDoc(doc);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Demo Warning Banner if running in demo mode */}
      {isDemo && (
        <div className="p-4 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Database className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold">Đang hoạt động với Dữ liệu Mẫu (Chưa kết nối Google Service Account)</span>
              <p className="text-amber-700 mt-0.5">
                Các thao tác CRUD đang lưu trữ trên bộ nhớ hệ thống. Để kết nối với Google Sheets thực tế, hãy cấu hình Service Account trong mục Cài đặt.
              </p>
            </div>
          </div>
          <Link
            href="/cai-dat"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shrink-0 transition-colors"
          >
            Cấu hình kết nối
          </Link>
        </div>
      )}

      {/* Top Banner: Greeting & Year Selection */}
      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-md shadow-blue-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-blue-700 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
              Báo cáo điều hành
            </span>
            <span className="text-xs text-blue-200">
              Nhiệm vụ quân sự - quốc phòng địa phương
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Trung Tâm Chỉ Đạo & Điều Hành Văn Bản
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
            Theo dõi, xử lý và lưu chuyển văn bản hành chính theo quy chế bảo mật Ban Chỉ huy Quân sự xã Xuân Sơn.
          </p>
        </div>

        {/* Year Filter Control */}
        <div className="flex items-center gap-2 bg-blue-950/60 p-2 rounded-xl border border-blue-700/60">
          <Calendar className="w-4 h-4 text-blue-300 ml-1" />
          <span className="text-xs font-semibold text-blue-200">Năm công tác:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="text-xs font-bold bg-blue-800 text-white border border-blue-600 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            <option value={selectedYear}>Năm {selectedYear}</option>
            <option value={selectedYear - 1}>Năm {selectedYear - 1}</option>
            <option value={selectedYear - 2}>Năm {selectedYear - 2}</option>
          </select>
        </div>
      </div>

      {/* 6 Core Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Tổng văn bản đến"
          value={loading ? '...' : stats?.tong_den || 0}
          subtitle="Tiếp nhận"
          icon={Inbox}
          variant="blue"
        />
        <StatCard
          title="Tổng văn bản đi"
          value={loading ? '...' : stats?.tong_di || 0}
          subtitle="Đã phát hành"
          icon={Send}
          variant="indigo"
        />
        <StatCard
          title="Chưa xử lý"
          value={loading ? '...' : stats?.chua_xu_ly || 0}
          subtitle="Chờ chỉ đạo"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Đang xử lý"
          value={loading ? '...' : stats?.dang_xu_ly || 0}
          subtitle="Trong tiến độ"
          icon={RefreshCw}
          variant="sky"
        />
        <StatCard
          title="Đã hoàn thành"
          value={loading ? '...' : stats?.da_hoan_thanh || 0}
          subtitle="Có kết quả"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Quá hạn"
          value={loading ? '...' : stats?.qua_han || 0}
          subtitle="Cần gấp"
          icon={AlertTriangle}
          variant="rose"
        />
      </div>

      {/* Middle Section: Monthly Chart & Urgent Docs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {stats ? (
            <MonthlyChart
              data={stats.thong_ke_thang}
              selectedYear={selectedYear}
            />
          ) : (
            <div className="h-80 bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center text-slate-400 text-xs">
              Đang tải biểu đồ...
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <UrgentDocs
            documents={stats?.van_ban_den_moi_nhat || []}
            onSelectDoc={handleSelectUrgentDoc}
          />
        </div>
      </div>

      {/* Bottom Section: Recent Outgoing Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Văn Bản Đi Phát Hành Gần Đây</h3>
              <p className="text-xs text-slate-500">Các văn bản do Ban CHQS xã ban hành trong năm {selectedYear}</p>
            </div>
          </div>

          <Link
            href="/van-ban-di"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            <span>Vào sổ văn bản đi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2.5 px-3 w-16 text-center">Số đi</th>
                <th className="py-2.5 px-3 w-28">Số, ký hiệu</th>
                <th className="py-2.5 px-3 w-24">Ngày phát hành</th>
                <th className="py-2.5 px-3">Trích yếu nội dung</th>
                <th className="py-2.5 px-3 w-32">Người ký</th>
                <th className="py-2.5 px-3 w-36">Nơi nhận</th>
                <th className="py-2.5 px-3 w-24 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.van_ban_di_moi_nhat && stats.van_ban_di_moi_nhat.length > 0 ? (
                stats.van_ban_di_moi_nhat.map((di) => (
                  <tr key={di.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-indigo-900 bg-slate-50/50">
                      {di.so_di}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {di.so_ky_hieu}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {formatDateVN(di.ngay_phat_hanh)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 line-clamp-1 max-w-md">
                      {di.trich_yeu}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {di.nguoi_ky}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                      {di.noi_nhan}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {di.trang_thai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Chưa có văn bản đi nào trong năm {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Detail */}
      <IncomingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        document={selectedDoc}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải trung tâm điều hành...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
