import React from 'react';

const variants = {
  primary:   'bg-[#4ade80] text-[#0a0f0d] hover:bg-[#86efac] shadow-lg shadow-[#4ade80]/20 hover:shadow-[#4ade80]/35',
  outline:   'border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 hover:border-[#4ade80]/50',
  ghost:     'text-[#6b8f76] hover:bg-[#192319] hover:text-white border border-[#243124] hover:border-[#2e4030]',
  dark:      'bg-[#192319] text-white border border-[#243124] hover:border-[#2e4030] hover:bg-[#243124] shadow-md',
  secondary: 'bg-[#243124] text-[#6b8f76] hover:bg-[#2e4030] hover:text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-bold rounded-xl
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}
      `}
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
