"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-xl font-['VT323']">
                AUTHENTICATION IN PROGRESS...
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            fallback || (
                <div className="min-h-[50vh] flex items-center justify-center text-xl font-['VT323']">
                    REDIRECTING TO LOGIN...
                </div>
            )
        );
    }

    return <>{children}</>;
}
