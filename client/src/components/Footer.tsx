import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 opacity-70">
          <img src="/schoolos-logo.png" alt="School OS" className="w-5 h-5 grayscale opacity-80" />
          <span className="text-sm font-bold tracking-tight text-foreground uppercase">School OS</span>
        </div>
        <p className="text-sm text-slate-500">© 2026 School OS. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/help" className="text-xs font-semibold text-slate-400 hover:text-slate-600">Help</Link>
          <Link to="/terms" className="text-xs font-semibold text-slate-400 hover:text-slate-600">Terms</Link>
          <Link to="/privacy" className="text-xs font-semibold text-slate-400 hover:text-slate-600">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};
