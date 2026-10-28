import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'indigo' | 'amber' | 'sky' | 'emerald' | 'rose';
  trend?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
}: StatCardProps) {
  const variantStyles = {
    blue: {
      card: 'border-blue-100 bg-linear-to-br from-white via-white to-blue-50/50 hover:border-blue-300',
      iconBox: 'bg-blue-600 text-white shadow-blue-500/20',
      value: 'text-blue-950',
      badge: 'bg-blue-50 text-blue-700',
    },
    indigo: {
      card: 'border-indigo-100 bg-linear-to-br from-white via-white to-indigo-50/50 hover:border-indigo-300',
      iconBox: 'bg-indigo-600 text-white shadow-indigo-500/20',
      value: 'text-indigo-950',
      badge: 'bg-indigo-50 text-indigo-700',
    },
    amber: {
      card: 'border-amber-100 bg-linear-to-br from-white via-white to-amber-50/50 hover:border-amber-300',
      iconBox: 'bg-amber-500 text-white shadow-amber-500/20',
      value: 'text-amber-950',
      badge: 'bg-amber-50 text-amber-700',
    },
    sky: {
      card: 'border-sky-100 bg-linear-to-br from-white via-white to-sky-50/50 hover:border-sky-300',
      iconBox: 'bg-sky-500 text-white shadow-sky-500/20',
      value: 'text-sky-950',
      badge: 'bg-sky-50 text-sky-700',
    },
    emerald: {
      card: 'border-emerald-100 bg-linear-to-br from-white via-white to-emerald-50/50 hover:border-emerald-300',
      iconBox: 'bg-emerald-600 text-white shadow-emerald-500/20',
      value: 'text-emerald-950',
      badge: 'bg-emerald-50 text-emerald-700',
    },
    rose: {
      card: 'border-rose-100 bg-linear-to-br from-white via-white to-rose-50/50 hover:border-rose-300',
      iconBox: 'bg-rose-600 text-white shadow-rose-500/20',
      value: 'text-rose-950',
      badge: 'bg-rose-50 text-rose-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg shadow-xs flex flex-col justify-between group',
        style.card
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <span className={cn('text-3xl font-bold tracking-tight mt-1.5 block', style.value)}>
            {value}
          </span>
        </div>

        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110',
            style.iconBox
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={cn('px-2 py-0.5 rounded-full font-medium', style.badge)}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
