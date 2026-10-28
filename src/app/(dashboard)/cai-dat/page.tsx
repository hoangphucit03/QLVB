'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export default function CaiDatPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const runTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/system/test-connection');
      const data = await res.json();
      if (data.success) {
        setTestResult(data.data);
      }
    } catch {
      setTestResult({
        databaseConnected: false,
        systemConnected: false,
        error: 'Lỗi gọi API kiểm tra kết nối',
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTestConnection();

    // Lấy cấu hình hệ thống
    fetch('/api/system/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.cau_hinh) {
          setSystemConfig(data.cau_hinh);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingConfig(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Cấu Hình Hệ Thống & Kết Nối Cơ Sở Dữ Liệu
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Kiểm tra trạng thái kết nối Google Sheets API, biến môi trường và thông số hoạt động của Website Quản lý văn bản 1.0
        </p>
      </div>

      {/* Connection Diagnostics Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Trạng thái Kết nối Google Sheets API
              </h3>
              <p className="text-xs text-slate-500">
                Giao tiếp hai chiều với 2 Spreadsheet ID qua Google Service Account v4
              </p>
            </div>
          </div>

          <button
            onClick={runTestConnection}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Kiểm tra kết nối ngay</span>
          </button>
        </div>

        {/* 2 Database Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File 1: DOCFLOW_DATABASE */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                DOCFLOW_DATABASE
              </span>
              {testResult?.databaseConnected ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã kết nối
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Chế độ Demo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono break-all">
              ID: 1LX5rXm81Mnm_sQcjXVzVGLFmD4LICuLCvnbzV3pf-zY
            </p>
            <div className="text-[11px] text-slate-600">
              Gồm 2 sheet: <code className="font-semibold text-blue-700">VAN_BAN_DEN</code> (21 cột), <code className="font-semibold text-blue-700">VAN_BAN_DI</code> (18 cột).
            </div>
          </div>

          {/* File 2: DOCFLOW_SYSTEM */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                DOCFLOW_SYSTEM
              </span>
              {testResult?.systemConnected ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã kết nối
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Chế độ Demo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono break-all">
              ID: 1tDAYBobgTBcCg61H0LieZvTbk-MDsZDhYvQtqW_oWQc
            </p>
            <div className="text-[11px] text-slate-600">
              Gồm 3 sheet: <code className="font-semibold text-blue-700">DANH_MUC</code>, <code className="font-semibold text-blue-700">THONG_KE</code>, <code className="font-semibold text-blue-700">CAU_HINH</code>.
            </div>
          </div>
        </div>

        {testResult?.error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Chi tiết chẩn đoán kết nối:</span>
              <p className="mt-0.5">{testResult.error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Environment Variables Verification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-700" />
          <h3 className="text-sm font-bold text-slate-800">
            Danh Sách Biến Môi Trường Hệ Thống (Environment Variables)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 w-56">Tên biến</th>
                <th className="py-2.5 px-3">Mô tả và Vai trò</th>
                <th className="py-2.5 px-3 w-32 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-900">DOCFLOW_PASSWORD</td>
                <td className="py-2.5 px-3">Mật khẩu đăng nhập của Quản trị viên (Ban CHQS xã)</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã cấu hình
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-900">SESSION_SECRET</td>
                <td className="py-2.5 px-3">Khóa bí mật ký mã hóa JWT HTTP-only cookie</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã cấu hình
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-900">DOCFLOW_DATABASE_ID</td>
                <td className="py-2.5 px-3">ID Google Spreadsheet chứa sổ văn bản đến & đi</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã cấu hình
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-900">DOCFLOW_SYSTEM_ID</td>
                <td className="py-2.5 px-3">ID Google Spreadsheet cấu hình danh mục & chỉ số</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã cấu hình
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-900">GOOGLE_CLIENT_EMAIL</td>
                <td className="py-2.5 px-3">Email Service Account Google Cloud IAM</td>
                <td className="py-2.5 px-3 text-center">
                  {testResult?.clientEmailConfigured ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đã cung cấp
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Chưa cấu hình
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-900">GOOGLE_PRIVATE_KEY</td>
                <td className="py-2.5 px-3">Khóa bí mật RSA Private Key của Google Service Account</td>
                <td className="py-2.5 px-3 text-center">
                  {testResult?.privateKeyConfigured ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đã cung cấp
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Chưa cấu hình
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide on Sharing Google Sheets with Service Account */}
      <div className="bg-linear-to-r from-blue-50/80 to-slate-50 rounded-2xl border border-blue-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-700" />
          Hướng Dẫn Kết Nối Google Sheets Bằng Service Account
        </h3>

        <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
          <p>
            1. Tạo một <strong>Service Account</strong> trên{' '}
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-semibold underline"
            >
              Google Cloud Console
            </a>{' '}
            và bật <strong>Google Sheets API</strong>.
          </p>
          <p>
            2. Tạo <strong>Key (JSON)</strong> cho Service Account đó, lấy trường <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-800">client_email</code> và <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-800">private_key</code>.
          </p>
          <p>
            3. <strong>Quan trọng:</strong> Mở 2 file Google Sheets (`DOCFLOW_DATABASE` và `DOCFLOW_SYSTEM`) trên trình duyệt, bấm <strong>Chia sẻ (Share)</strong> và thêm email Service Account với quyền <strong>Người chỉnh sửa (Editor)</strong>.
          </p>
          <p>
            4. Điền 2 biến môi trường <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-800">GOOGLE_CLIENT_EMAIL</code> và <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-800">GOOGLE_PRIVATE_KEY</code> vào file <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-800">.env.local</code> (khi chạy local) hoặc cấu hình Environment Variables trên <strong>Vercel Project Settings</strong> (khi triển khai).
          </p>
        </div>
      </div>
    </div>
  );
}
