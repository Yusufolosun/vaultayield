import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-xl shadow-neutral-200/20 ${className}`}>
            {children}
        </div>
    );
};
