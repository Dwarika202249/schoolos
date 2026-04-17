import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Moon, 
  Sun
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../providers/ThemeProvider';
import { Link } from 'react-router-dom';

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, school, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-card border border-transparent hover:border-white/5 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/20 group-hover:scale-105 transition-transform">
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
        <div className="hidden sm:block text-left">
           <p className="text-xs font-bold leading-none">{user?.firstName} {user?.lastName}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 rounded-2xl bg-card border border-white/10 shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5">
               <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Workspace</p>
               <p className="text-sm font-bold truncate">{school?.name}</p>
               <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{user?.email}</p>
            </div>

            {/* Links */}
            <div className="p-2">
               <Link 
                 to="/settings" 
                 onClick={() => setIsOpen(false)}
                 className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
               </Link>
               
               <button 
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
               >
                 {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                 {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
               </button>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-white/5">
               <button 
                 onClick={() => logout()}
                 className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
               >
                 <LogOut className="w-4 h-4" />
                 Logout Session
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
