import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-purple-600 text-white hover:bg-purple-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
  success: 'bg-green-600 text-white hover:bg-green-700',
  special: 'bg-orange-500 text-white hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg',
  pink: 'bg-pink-600 text-white hover:bg-pink-700',
  subtle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
  icon: 'p-2',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: React.ReactNode;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, icon, children, ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}`
        }
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 20} />}
        {!loading && icon}
        {!loading && children && <span>{children}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
