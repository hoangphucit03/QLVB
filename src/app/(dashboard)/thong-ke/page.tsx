'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  BarChart3,
  Calendar,
  FileCheck,
  TrendingUp,
  PieChart,
  Printer,
  Download,
  Shield,
  Layers,
  Inbox,
  Send,
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';

function ThongKeContent() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [breakdown, setBreakdown] = useState<{ types: Record<string, number>; agencies: Record<string, number>; assignees: Record<string, number> }>({ types: {}, agencies: {}, assignees: {} });
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setStats(null);
    setBreakdown({ types: {}, agencies: {}, assignees: {} });
    (async () => {
      try {
        const response = await fetch('/api/statistics?nam=' + selectedYear, { signal: controller.signal, cache: 'no-store' });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Không thể tải báo cáo');
        if (!controller.signal.aborted) { setStats(result.data); setBreakdown(result.breakdown); setIsDemo(result.isDemo); }
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Không thể tải báo cáo');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [selectedYear]);
  const typeCountsDen = breakdown.types;
  const agencyCounts = breakdown.agencies;
  const assigneeCounts = breakdown.assignees;
  const totalDen = stats?.tong_den || 0;
  const daHoanThanh = stats?.da_hoan_thanh || 0;
  const completionRate = totalDen > 0 ? Math.round((daHoanThanh / totalDen) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Báo Cáo Thống Kê Văn Bản
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu lưu chuyển, phân tích cơ cấu và đánh giá tiến độ thực hiện nhiệm vụ văn bản
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i).map(year => <option key={year} value={year}>Năm {year}</option>)}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {loading && <p role="status" className="text-sm text-slate-500">Đang tải thống kê...</p>}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {!loading && !error && isDemo && <p className="text-sm text-amber-700">Đang xem dữ liệu demo, không phải dữ liệu Google Sheets.</p>}
      {!loading && !error && <>
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Văn bản đến</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalDen}</div>
          <p className="text-[11px] text-slate-400 mt-1">Văn bản tiếp nhận trong năm {selectedYear}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Văn bản đi</span>
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats?.tong_di || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tất cả trạng thái văn bản đi</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Đã hoàn thành</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{daHoanThanh}</div>
          <p className="text-[11px] text-slate-400 mt-1">Văn bản đã xử lý xong kết quả</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Tỷ lệ hoàn thành</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{completionRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Tiến độ thực hiện nhiệm vụ</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            Cơ Cấu Theo Loại Văn Bản Đến
          </h3>

          <div className="space-y-3">
            {Object.entries(typeCountsDen).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có dữ liệu phân loại</p>
            ) : (
              Object.entries(typeCountsDen).map(([typeName, count]) => {
                const percent = Math.round((count / totalDen) * 100);
                return (
                  <div key={typeName} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{typeName}</span>
                      <span className="font-bold text-slate-900">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Văn Bản Đến Theo Cơ Quan Ban Hành
          </h3>

          <div className="space-y-3">
            {Object.entries(agencyCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có dữ liệu cơ quan</p>
            ) : (
              Object.entries(agencyCounts).map(([agency, count]) => {
                const percent = Math.round((count / totalDen) * 100);
                return (
                  <div key={agency} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="truncate max-w-[240px]">{agency}</span>
                      <span className="font-bold text-slate-900">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Phân công cán bộ xử lý */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Phân Công Chủ Trì Xử Lý Cho Cán Bộ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(assigneeCounts).map(([assignee, count]) => (
            <div
              key={assignee}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{assignee}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Văn bản chủ trì</p>
              </div>
              <span className="text-lg font-black text-blue-700 px-3 py-1 bg-white rounded-lg border border-slate-200">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
      </>}
    </div>
  );
}

export default function ThongKePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải báo cáo thống kê...</div>}>
      <ThongKeContent />
    </Suspense>
  );
}
