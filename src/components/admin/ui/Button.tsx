import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  title?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  icon: Icon,
  disabled,
  className = '',
  type = 'button',
  title
}: ButtonProps) {
  const baseStyles = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200';
  
  const variantStyles = {
    primary: 'bg-sky hover:bg-sky-dark text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-black hover:text-white',
    danger: 'bg-pink-accent/20 hover:bg-pink-accent text-black hover:text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}