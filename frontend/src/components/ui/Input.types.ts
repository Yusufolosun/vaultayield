import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'underline';
    sizeVariant?: 'sm' | 'md' | 'lg';
    error?: boolean;
    success?: boolean;
    label?: string;
    helperText?: string;
}
