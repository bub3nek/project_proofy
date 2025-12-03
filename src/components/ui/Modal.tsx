'use client';

import { useEffect, HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative pixel-card glow-cyan max-w-4xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[var(--neon-cyan)]">
                        <h3 className="text-glow-cyan">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors p-2"
                        >
                            <X size={24} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
}
