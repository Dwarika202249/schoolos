import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-background/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/schoolos-logo.png" alt="School OS" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-black tracking-tight text-foreground">School OS</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-semibold text-slate-400 hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm font-semibold text-slate-400 hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="text-sm font-semibold text-slate-400 hover:text-foreground transition-colors">About</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="shadow-lg shadow-primary/20">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-foreground">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
