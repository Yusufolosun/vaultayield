import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'underline';
    sizeVariant?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', variant = 'default', sizeVariant = 'md', ...props }, ref) => {
        const baseStyles = "w-full outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            default: "bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            underline: "bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 rounded-none focus:border-blue-500 px-0"
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-4 text-lg",
            lg: "px-8 py-5 text-2xl font-bold"
        };

        return (
            <input
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[sizeVariant]} ${className}`}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';
