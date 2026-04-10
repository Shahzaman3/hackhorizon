import React from 'react';

const variants = {
    primary: 'bg-primary text-white hover:bg-[#2a4128] shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-card/40',
    dark: 'bg-dark text-white hover:bg-[#1a3d2b] shadow-md',
    secondary: 'bg-secondary text-white hover:bg-[#5a7d5f]',
};

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
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
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : icon ? (
                <span className="flex-shrink-0">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}
