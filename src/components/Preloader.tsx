'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Preloader() {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const pathname = usePathname();
    const isFirstLoad = useRef(true);

    useEffect(() => {
        let frame: number | null = null;
        let exitDelay: ReturnType<typeof setTimeout> | null = null;
        let hideDelay: ReturnType<typeof setTimeout> | null = null;

        frame = window.requestAnimationFrame(() => {
            setIsVisible(true);
            setIsExiting(false);

            const minDuration = isFirstLoad.current ? 1200 : 800;
            exitDelay = setTimeout(() => setIsExiting(true), minDuration);
            hideDelay = setTimeout(() => setIsVisible(false), minDuration + 500);
            isFirstLoad.current = false;
        });

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            if (exitDelay) clearTimeout(exitDelay);
            if (hideDelay) clearTimeout(hideDelay);
        };
    }, [pathname]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`preloader ${isExiting ? 'preloader--exit' : ''}`}>
            <div className="preloader__content">
                <div className="preloader__orbit">
                    <span className="preloader__monkey" role="img" aria-label="Jumping monkey">
                        🐒
                    </span>
                </div>
                <p className="preloader__text">Booting gallery AI...</p>
            </div>
        </div>
    );
}
