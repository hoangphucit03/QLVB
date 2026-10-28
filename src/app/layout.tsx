import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quản lý văn bản 1.0 - Ban CHQS Xã Xuân Sơn',
  description: 'Hệ thống Quản lý và Điều hành Văn bản Ban Chỉ huy Quân sự xã Xuân Sơn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
