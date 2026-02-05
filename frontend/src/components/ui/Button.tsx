import { Loader2 } from 'lucide-react';

import { ButtonProps } from './Button.types';

/**
 * A highly customizable, accessible Button component for the VaultaYield UI.
 * Supports various variants, sizes, loading states, and icon integration.
 * 
 * @param props - Button properties including variant, size, isLoading, leftIcon, and rightIcon.
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}) => {
    const baseStyles = "rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25",
        secondary: "bg-neutral-200 hover:bg-neutral-300 text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white",
        outline: "bg-transparent border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-600 text-neutral-900 dark:text-white",
        ghost: "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-blue-600",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={props.disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : leftIcon ? (
                <span className="shrink-0">{leftIcon}</span>
            ) : null}
            {children}
            {!isLoading && rightIcon && (
                <span className="shrink-0">{rightIcon}</span>
            )}
        </button>
    );
};
