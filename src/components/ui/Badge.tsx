import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'cyan' | 'magenta' | 'green' | 'pink';
    children: React.ReactNode;
}

export function Badge({ variant = 'cyan', className = '', children, ...props }: BadgeProps) {
    const variantClass = `cyber-badge-${variant}`;

    return (
        <span className={`cyber-badge ${variantClass} ${className}`} {...props}>
            {children}
        </span>
    );
}
