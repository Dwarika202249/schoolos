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
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Academic', href: '/academic', icon: BookOpen },
  { name: 'Finance', href: '/finance', icon: CreditCard },
  { name: 'Branches', href: '/branches', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, school, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 px-6 py-8 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">School OS</span>
          </Link>

          {/* Nav links */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Logout</span>
          </button>

          {/* User profile footer */}
          <div className="p-4 bg-slate-800/50 mt-auto space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-primary uppercase">
                {user?.firstName?.charAt(0) || 'U'}
                {user?.lastName?.charAt(0) || ''}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{school?.name || 'School OS'}</p>
              </div>
            </div>


          </div>
        </div>
      </div>
    </>
  );
};
