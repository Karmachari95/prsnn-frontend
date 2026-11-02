"use client";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Loading from "../components/common/Loading";

export default function AdminLayout({ children }) {
    const { token, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (authLoading) return;

        // 1. If not logged in, go to login
        if (!token) {
            router.push("/login");
            return;
        }

        // 2. Role Check
        if (userData && !['admin', 'superadmin'].includes(userData.role)) {
            router.push("/");
            return;
        }
    }, [token, userData, authLoading, pathname, router]);

    if (authLoading) {
        return <Loading message="Verifying access..." />;
    }

    if (userData && !['admin', 'superadmin'].includes(userData.role)) {
        return <Loading message="Unauthorized. Redirecting..." />;
    }

    return <>{children}</>;
}
