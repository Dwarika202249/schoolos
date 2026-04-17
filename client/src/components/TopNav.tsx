import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, Search } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

export const TopNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-background/60 px-4 backdrop-blur-xl lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 overflow-hidden">
        <Link to="/dashboard" className="text-slate-500 hover:text-primary transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <React.Fragment key={to}>
              <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              <Link 
                to={to} 
                className={`text-sm font-bold capitalize truncate max-w-[120px] sm:max-w-none transition-colors ${isLast ? 'text-foreground' : 'text-slate-500 hover:text-primary'}`}
              >
                {value.replace(/-/g, ' ')}
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group px-2">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-primary" />
           <input 
             type="text" 
             placeholder="Search anything..." 
             className="w-64 bg-card/50 border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-xs outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
           />
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
};
