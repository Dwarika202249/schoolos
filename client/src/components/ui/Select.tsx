import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 appearance-none
          transition-all duration-200 outline-none
          focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5
          ${error ? 'border-rose-200 bg-rose-50 focus:border-rose-300 focus:ring-rose-500/5' : ''}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-rose-500 ml-1">{error}</p>}
    </div>
  );
};
