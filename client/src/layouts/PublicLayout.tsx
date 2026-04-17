import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Public Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">School OS</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/#features" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Features</Link>
              <Link to="/#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Pricing</Link>
              <Link to="/#about" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">About</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <BookOpen className="w-5 h-5 text-slate-900" />
            <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">School OS</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 School OS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-xs font-semibold text-slate-400 hover:text-slate-600">Terms</Link>
            <Link to="/privacy" className="text-xs font-semibold text-slate-400 hover:text-slate-600">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
