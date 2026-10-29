import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, FileText, AlertTriangle,
  GitBranch, Search, Blocks, ClipboardList,
  Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Lock, Bell, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/helpers';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/reports/new', icon: AlertTriangle, label: 'Submit Report' },
  { to: '/analysis', icon: Search, label: 'Risk Analysis', roles: ['analyst', 'admin'] },
  { to: '/graph', icon: GitBranch, label: 'Scam Network', roles: ['analyst', 'admin'] },
  { to: '/blockchain', icon: Blocks, label: 'Blockchain' },
  { to: '/audit', icon: ClipboardList, label: 'Audit Log', roles: ['analyst', 'admin'] },
  { to: '/admin/users', icon: Users, label: 'User Management', roles: ['admin'] },
  { to: '/security', icon: Lock, label: 'Security Info' },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full bg-navy-950/95 border-r border-navy-700/50',
      mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64',
      'transition-all duration-300'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-700/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shield-blue to-shield-teal flex items-center justify-center flex-shrink-0 shadow-glow-blue">
          <Shield size={18} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="animate-fade-in">
            <div className="text-sm font-bold text-slate-100">FraudShield</div>
            <div className="text-[10px] text-shield-teal font-semibold tracking-widest uppercase">360</div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'nav-item',
              isActive && 'nav-item-active',
              collapsed && !mobile && 'justify-center px-2'
            )}
            title={collapsed && !mobile ? item.label : undefined}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && (
              <span className="animate-fade-in truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={cn(
        'p-3 border-t border-navy-700/50',
        collapsed && !mobile && 'flex justify-center'
      )}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-navy-700/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-shield-indigo to-shield-blue flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.display_name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.display_name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="ml-auto text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-2">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex-shrink-0 animate-slide-up">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-navy-700/50 bg-navy-950/60 backdrop-blur-sm flex-shrink-0">
          <button className="lg:hidden text-slate-400 hover:text-slate-200" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">System Online</span>
            </div>
            <div className="w-px h-4 bg-navy-600" />
            <button className="text-slate-400 hover:text-slate-200 transition-colors relative p-1">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-shield-indigo to-shield-blue flex items-center justify-center text-xs font-bold text-white">
              {user?.display_name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
