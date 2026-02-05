import React from 'react';

export const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({
    children,
    className = '',
    shadow = 'xl'
}) => {
        const shadows = {
            none: '',
            sm: 'shadow-sm',
            md: 'shadow-md',
            lg: 'shadow-lg',
            xl: 'shadow-xl shadow-neutral-200/20'
        };

        return (
            <div className={`bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 ${shadows[shadow]} ${className}`}>
                {children}
            </div>
        );
    };

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`px-8 py-6 border-b border-neutral-100 dark:border-neutral-700/50 ${className}`}>
            {children}
        </div>
    );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`px-8 py-6 ${className}`}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`px-8 py-6 border-t border-neutral-100 dark:border-neutral-700/50 ${className}`}>
            {children}
        </div>
    );
};
