import React from 'react';

export const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    border?: 'none' | 'subtle' | 'default' | 'vibrant';
    hover?: boolean;
}> = ({
    children,
    className = '',
    shadow = 'xl',
    border = 'default',
    hover = false
}) => {
        const shadows = {
            none: '',
            sm: 'shadow-sm',
            md: 'shadow-md',
            lg: 'shadow-lg',
            xl: 'shadow-xl shadow-neutral-200/20'
        };

        const borders = {
            none: 'border-0',
            subtle: 'border border-neutral-100 dark:border-neutral-800',
            default: 'border border-neutral-200 dark:border-neutral-700',
            vibrant: 'border-2 border-blue-500/20 dark:border-blue-500/30'
        };

        const hoverStyles = hover ? 'transition-all hover:scale-[1.01] cursor-pointer' : '';

        return (
            <div className={`bg-white dark:bg-neutral-800 rounded-3xl ${borders[border]} ${shadows[shadow]} ${hoverStyles} ${className}`}>
                {children}
            </div>
        );
    };

export const CardHeader: React.FC<{
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}> = ({
    children,
    className = '',
    padding = 'md'
}) => {
        const paddings = {
            none: 'p-0',
            sm: 'px-6 py-4',
            md: 'px-8 py-6',
            lg: 'px-10 py-8'
        };
        return (
            <div className={`border-b border-neutral-100 dark:border-neutral-700/50 ${paddings[padding]} ${className}`}>
                {children}
            </div>
        );
    };

export const CardContent: React.FC<{
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}> = ({
    children,
    className = '',
    padding = 'md'
}) => {
        const paddings = {
            none: 'p-0',
            sm: 'px-6 py-4',
            md: 'px-8 py-6',
            lg: 'px-10 py-8'
        };
        return (
            <div className={`${paddings[padding]} ${className}`}>
                {children}
            </div>
        );
    };

export const CardFooter: React.FC<{
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}> = ({
    children,
    className = '',
    padding = 'md'
}) => {
        const paddings = {
            none: 'p-0',
            sm: 'px-6 py-4',
            md: 'px-8 py-6',
            lg: 'px-10 py-8'
        };
        return (
            <div className={`border-t border-neutral-100 dark:border-neutral-700/50 ${paddings[padding]} ${className}`}>
                {children}
            </div>
        );
    };
