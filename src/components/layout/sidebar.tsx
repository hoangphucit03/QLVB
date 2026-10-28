'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Send,
  BarChart3,
  ListOrdered,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Tổng quan',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Số liệu & Biểu đồ',
    },
    {
      label: 'Văn bản đến',
      href: '/van-ban-den',
      icon: Inbox,
      description: 'Tiếp nhận & Xử lý',
    },
    {
      label: 'Văn bản đi',
      href: '/van-ban-di',
      icon: Send,
      description: 'Phát hành & Lưu trữ',
    },
    {
      label: 'Thống kê',
      href: '/thong-ke',
      icon: BarChart3,
      description: 'Báo cáo & Tổng hợp',
    },
    {
      label: 'Danh mục',
      href: '/danh-muc',
      icon: ListOrdered,
      description: 'Phân loại dữ liệu',
    },
    {
      label: 'Cài đặt',
      href: '/cai-dat',
      icon: Settings,
      description: 'Cấu hình & Kết nối',
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Organization Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shadow-red-500/20 ring-1 ring-white/30 overflow-hidden">
              <Image
                src="/logo-quan-dan-tu-ve-viet-nam.png"
                alt="Logo Dân quân tự vệ Việt Nam"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight">Quản lý văn bản</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[145px]">
                Ban CHQS xã Xuân Sơn
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Hệ thống quản lý
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                )}
              >
                <Icon
                  className={cn(
                    'w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  )}
                />
                <div className="flex-1 truncate">
                  <div className="leading-none">{item.label}</div>
                  <div
                    className={cn(
                      'text-[10px] mt-1 truncate',
                      isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                  >
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <div className="w-1.5 h-6 bg-white rounded-full absolute right-2 opacity-80" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Database Link Info Card */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Google Sheets DB
            </span>
            <span className="text-[10px] text-slate-400">v4 API</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dữ liệu đồng bộ trực tiếp hai chiều với hệ thống Google Sheets.
          </p>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
                QS
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Văn thư Ban CHQS</p>
                <p className="text-[10px] text-slate-400 truncate">Quản trị viên</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Đăng xuất khỏi hệ thống"
              className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
