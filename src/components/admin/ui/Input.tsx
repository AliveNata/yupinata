import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border border-gray-200
          focus:ring-2 focus:ring-sky-light focus:border-sky
          outline-none transition-all
          ${error ? 'border-pink-accent' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-pink-accent">{error}</p>
      )}
    </div>
  );
}