'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get('redirect') || '';
  const redirectPath = ['/dashboard', '/van-ban-den', '/van-ban-di', '/thong-ke', '/danh-muc', '/cai-dat'].includes(requestedPath) ? requestedPath : '/dashboard';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Vui lòng nhập mật khẩu quản trị');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Mật khẩu không chính xác');
        setLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ xác thực');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="login-splash" aria-hidden="true">
        <div className="login-splash-glow" />
        <p className="login-splash-title">Ban Chỉ huy Quân sự xã Xuân Sơn</p>
        <div className="login-splash-loader"><span /></div>
      </div>

      {/* Background Military Gradient Accents */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Unit Branding Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white shadow-xl shadow-red-500/30 border-2 border-amber-300/70 mb-3 overflow-hidden">
            <Image
              src="/logo-bch-xuan-son.jpg"
              alt="Logo Ban Chỉ huy Quân sự xã Xuân Sơn"
              width={112}
              height={112}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase">
            Ban CHQS xã Xuân Sơn
          </h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Website Quản lý văn bản 1.0
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Đăng nhập Quản trị viên</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhập mật khẩu an toàn để truy cập cơ sở dữ liệu văn bản
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu hệ thống
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  autoFocus
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                * Phiên đăng nhập được mã hóa và bảo vệ bằng HTTP-only cookie.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-linear-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Security badge footer */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bảo mật dữ liệu cấp xã • Google Sheets Database v4</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
