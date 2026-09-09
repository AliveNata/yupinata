import { useState } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-sky hover:bg-sky-dark text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-pink-accent/20 hover:bg-pink-accent text-pink-deep hover:text-white',
}

export function Button({ children, onClick, variant = 'primary', icon: Icon, disabled, className = '', type = 'button', title }: {
  children?: ReactNode; onClick?: () => void; variant?: Variant; icon?: LucideIcon
  disabled?: boolean; className?: string; type?: 'button' | 'submit'; title?: string
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${VARIANTS[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

const fieldCls = (error?: string, extra = '') =>
  `w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-light focus:border-sky outline-none transition-all text-black ${error ? 'border-pink-accent' : ''} ${extra}`

export function Input({ label, error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input className={fieldCls(error, className)} {...props} />
      {error && <p className="text-sm text-pink-accent">{error}</p>}
    </div>
  )
}

export function TextArea({ label, error, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea className={fieldCls(error, className)} {...props} />
      {error && <p className="text-sm text-pink-accent">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select className={fieldCls(error, className)} {...props}>{children}</select>
      {error && <p className="text-sm text-pink-accent">{error}</p>}
    </div>
  )
}

export function PasswordInput({ label, error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input type={show ? 'text' : 'password'} className={fieldCls(error, `pr-10 ${className}`)} {...props} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-sm text-pink-accent">{error}</p>}
    </div>
  )
}
