import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  CreditCard,
  Building2,
  CalendarDays,
  Menu,
  X,
  LogOut,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const getNavigation = (role: string) => {
  const base = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: CalendarDays },
    { name: 'Exams & Grades', href: '/exams', icon: GraduationCap },
  ];

  if (role === 'OWNER' || role === 'ADMIN') {
    base.push(
      { name: 'Staff', href: '/staff', icon: Users },
      { name: 'Academic', href: '/academic', icon: BookOpen },
      { name: 'Finance', href: '/finance', icon: CreditCard }
    );
  }

  if (role === 'OWNER') {
    base.push(
      { name: 'Branches', href: '/branches', icon: Building2 },
      { name: 'Settings', href: '/settings', icon: Settings }
    );
  }

  return base;
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, school, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-card border border-white/10 rounded-lg shadow-xl lg:hidden text-foreground"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-white/5 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform overflow-hidden font-black text-white">
                {school?.branding?.logoUrl ? (
                  <img src={school.branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{school?.name?.charAt(0) || 'S'}</span>
                )}
              </div>
              <span className="text-xl font-black tracking-tight text-foreground truncate max-w-[140px]">
                {school?.name || 'School OS'}
              </span>
            </Link>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-4 px-4">Menu</p>
            {getNavigation(user?.role || 'STAFF').map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/25'
                    : 'text-slate-500 hover:text-foreground hover:bg-white/5'}
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                <span className="font-bold text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-white/5">
             <button 
               onClick={logout}
               className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
             >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
             </button>
          </div>

          {/* Footer Card */}
          <div className="p-4 border-t border-white/5">
             <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                <Sparkles className="absolute -right-2 -bottom-2 w-12 h-12 text-primary opacity-10 group-hover:scale-125 transition-transform" />
                <p className="text-xs font-black text-primary uppercase mb-1 tracking-tight">Enterprise Nexus</p>
                <p className="text-[10px] text-slate-400 font-medium">Infinite seats enabled.</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
