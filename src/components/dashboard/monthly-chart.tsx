'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';

interface MonthlyStatItem {
  thang: number;
  ten_thang: string;
  van_ban_den: number;
  van_ban_di: number;
}

interface MonthlyChartProps {
  data: MonthlyStatItem[];
  selectedYear: number;
}

export function MonthlyChart({ data, selectedYear }: MonthlyChartProps) {
  // Tìm giá trị lớn nhất để căn tỉ lệ cột
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.van_ban_den, d.van_ban_di, 5))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">
              Biểu đồ Lưu chuyển Văn bản Theo Tháng (Năm {selectedYear})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh số lượng văn bản đến tiếp nhận và văn bản đi đã phát hành trong năm
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block shadow-xs" />
            <span className="text-slate-700">Văn bản đến</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block shadow-xs" />
            <span className="text-slate-700">Văn bản đi</span>
          </div>
        </div>
      </div>

      {/* Chart Bars Grid */}
      <div className="h-64 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-100">
        {data.map((item) => {
          const denHeightPercent = (item.van_ban_den / maxValue) * 100;
          const diHeightPercent = (item.van_ban_di / maxValue) * 100;

          return (
            <div
              key={item.thang}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-all">
                <span className="font-semibold">{item.ten_thang}</span>
                <span>Đến: {item.van_ban_den} | Đi: {item.van_ban_di}</span>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-0.5" />
              </div>

              {/* Bars container */}
              <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-full">
                {/* Bar Den */}
                <div className="w-1/2 flex flex-col items-center justify-end h-full">
                  {item.van_ban_den > 0 && (
                    <span className="text-[10px] font-semibold text-blue-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.van_ban_den}
                    </span>
                  )}
                  <div
                    style={{ height: `${Math.max(denHeightPercent, 4)}%` }}
                    className="w-full bg-linear-to-t from-blue-700 to-blue-500 rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-xs"
                  />
                </div>

                {/* Bar Di */}
                <div className="w-1/2 flex flex-col items-center justify-end h-full">
                  {item.van_ban_di > 0 && (
                    <span className="text-[10px] font-semibold text-indigo-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.van_ban_di}
                    </span>
                  )}
                  <div
                    style={{ height: `${Math.max(diHeightPercent, 4)}%` }}
                    className="w-full bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-xs"
                  />
                </div>
              </div>

              {/* Month label */}
              <span className="text-[11px] font-medium text-slate-500 mt-2.5">
                {item.ten_thang}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>* Dữ liệu cập nhật tự động từ cơ sở dữ liệu Google Sheets</span>
        <span className="font-medium text-slate-700">
          Tổng cộng: {data.reduce((acc, cur) => acc + cur.van_ban_den, 0)} văn bản đến,{' '}
          {data.reduce((acc, cur) => acc + cur.van_ban_di, 0)} văn bản đi
        </span>
      </div>
    </div>
  );
}
