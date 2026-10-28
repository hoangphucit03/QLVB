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
import { DashboardStats, VanBanDen, VanBanDi } from '@/lib/types';
import { formatDateVN } from '@/lib/utils';

function ThongKeContent() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [denList, setDenList] = useState<VanBanDen[]>([]);
  const [diList, setDiList] = useState<VanBanDi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setSelectedYear(currentYear);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, denRes, diRes] = await Promise.all([
          fetch(`/api/statistics?nam=${selectedYear}`).then((r) => r.json()),
          fetch(`/api/documents/incoming?nam=${selectedYear}&limit=1000`).then((r) => r.json()),
          fetch(`/api/documents/outgoing?nam=${selectedYear}&limit=1000`).then((r) => r.json()),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (denRes.success) setDenList(denRes.data || []);
        if (diRes.success) setDiList(diRes.data || []);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const typeCountsDen: Record<string, number> = {};
  denList.forEach((d) => {
    typeCountsDen[d.loai_van_ban] = (typeCountsDen[d.loai_van_ban] || 0) + 1;
  });

  const agencyCounts: Record<string, number> = {};
  denList.forEach((d) => {
    agencyCounts[d.co_quan_gui] = (agencyCounts[d.co_quan_gui] || 0) + 1;
  });

  const assigneeCounts: Record<string, number> = {};
  denList.forEach((d) => {
    if (d.nguoi_xu_ly) {
      assigneeCounts[d.nguoi_xu_ly] = (assigneeCounts[d.nguoi_xu_ly] || 0) + 1;
    }
  });

  const totalDen = denList.length;
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
              <option value={selectedYear}>Năm {selectedYear}</option>
              <option value={selectedYear - 1}>Năm {selectedYear - 1}</option>
              <option value={selectedYear - 2}>Năm {selectedYear - 2}</option>
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
          <div className="text-2xl font-bold text-slate-800">{diList.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Văn bản do đơn vị phát hành</p>
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
