import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', children, glow = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`pixel-card ${glow ? 'pulse-glow' : ''} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
