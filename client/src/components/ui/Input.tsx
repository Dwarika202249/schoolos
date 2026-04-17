import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400
            transition-all duration-200 outline-none
            focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-rose-200 bg-rose-50 focus:border-rose-300 focus:ring-rose-500/5' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-rose-500 ml-1">{error}</p>}
    </div>
  );
};
