'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  LogOut,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [globalSearch, setGlobalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    router.push(`/van-ban-den?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Logout failed');
      window.location.replace('/login');
    } catch {
      window.alert('Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Unit name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Mở Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-white border border-red-200 items-center justify-center overflow-hidden shadow-xs">
            <Image
              src="/logo-quan-dan-tu-ve-viet-nam.png"
              alt="Logo Dân quân tự vệ Việt Nam"
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wide text-blue-900 flex items-center gap-2">
              <span>Ban Chỉ huy Quân sự xã Xuân Sơn</span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Quân sự địa phương
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Website Quản lý văn bản 1.0
            </div>
          </div>
        </div>
      </div>

      {/* Middle / Right Actions */}
      <div className="flex items-center gap-3">
        {/* Global Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Tìm số ký hiệu, trích yếu..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl w-60 focus:w-72 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
          />
        </form>

        {/* Database Status Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
          <Database className="w-3.5 h-3.5" />
          <span>Google Sheets</span>
        </div>

        {/* User Quick Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
            QS
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
