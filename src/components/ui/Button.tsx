import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'cyan' | 'magenta' | 'pink' | 'purple' | 'green';
    children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'cyan', className = '', children, ...props }, ref) => {
        const variantClass = `pixel-btn-${variant}`;

        return (
            <button
                ref={ref}
                className={`pixel-btn ${variantClass} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
