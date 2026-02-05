import React from 'react';

import { InputProps } from './Input.types';

/**
 * A highly customizable, accessible Input component for the VaultaYield UI.
 * Supports various variants, sizes, validation states, and label integration.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', variant = 'default', sizeVariant = 'md', error, success, label, helperText, ...props }, ref) => {
        const baseStyles = "w-full outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            default: `bg-neutral-50 dark:bg-neutral-900 border rounded-2xl focus:ring-2 focus:border-transparent ${error ? 'border-red-500 focus:ring-red-500' :
                success ? 'border-emerald-500 focus:ring-emerald-500' :
                    'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500'
                }`,
            underline: `bg-transparent border-b-2 rounded-none px-0 ${error ? 'border-red-500' :
                success ? 'border-emerald-500' :
                    'border-neutral-200 dark:border-neutral-800 focus:border-blue-500'
                }`
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-4 text-lg",
            lg: "px-8 py-5 text-2xl font-bold"
        };

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`${baseStyles} ${variants[variant]} ${sizes[sizeVariant]} ${className}`}
                    {...props}
                />
                {helperText && (
                    <p className={`text-xs ml-1 ${error ? 'text-red-500' : success ? 'text-emerald-500' : 'text-neutral-500'}`}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
