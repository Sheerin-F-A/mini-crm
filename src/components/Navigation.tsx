'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Zap, BarChart3, Minus, Square, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Audience Builder', href: '/audience', icon: Users },
  { name: 'Campaign Copilot', href: '/campaign', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[var(--retro-bg)] border-r-2 border-[var(--retro-border)] min-h-screen flex flex-col z-10 relative">
      <div className="retro-window-header border-b-2 border-[var(--retro-border)]">
        <span>XENO.EXE</span>
        <div className="flex gap-1">
          <div className="retro-dot bg-yellow-400"></div>
          <div className="retro-dot bg-green-400"></div>
          <div className="retro-dot bg-red-400"></div>
        </div>
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">
          Mini CRM
        </h1>
        <div className="h-1 w-full bg-black mb-6"></div>
      </div>
      
      <nav className="flex-1 px-4 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 border-2 border-transparent transition-all ${
                isActive 
                  ? 'retro-box bg-[#ffcf54] text-[var(--retro-text)] border-[var(--retro-border)]' 
                  : 'text-slate-700 hover:border-[var(--retro-border)] hover:bg-[var(--retro-header)]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="text-[var(--retro-text)]" />
              <span className={`font-bold ${isActive ? 'tracking-wide' : ''}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 m-4 retro-box bg-[var(--retro-panel)]">
        <p className="font-bold text-sm uppercase mb-1">System Status</p>
        <div className="flex items-center gap-2 text-xs font-bold text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse border border-[var(--retro-border)]"></span>
          ONLINE
        </div>
        <p className="mt-2 text-xs text-[var(--retro-text-muted)] font-mono">v1.0-RETRO</p>
      </div>
    </div>
  );
}
