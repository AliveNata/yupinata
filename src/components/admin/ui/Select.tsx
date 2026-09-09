import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2 rounded-lg border border-gray-200
          focus:ring-2 focus:ring-sky-light focus:border-sky
          outline-none transition-all
          ${error ? 'border-pink-accent' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-pink-accent">{error}</p>
      )}
    </div>
  );
}