import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className = '', actions }) => {
  return (
    <div className={`bg-card rounded-3xl border border-white/10 shadow-xl shadow-black/20 hover:border-primary/20 transition-all duration-300 overflow-hidden ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-bold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
};
