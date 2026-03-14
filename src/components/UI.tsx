import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Slot } from '@radix-ui/react-slot';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
};

export const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  asChild = false,
  ...props 
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-50 text-slate-900 hover:shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]', className)} {...props}>
    {children}
  </div>
);

export const Input = ({ className, label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
    <input
      className={twMerge(
        'w-full border rounded-lg px-3 py-2 text-gray-800 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);
