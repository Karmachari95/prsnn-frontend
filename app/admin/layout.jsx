"use client";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../components/common/Loading";

export default function AdminLayout({ children }) {
    const { token, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const effectiveToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const storedUser = userData || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null);

        // 1. If not logged in at all, go to login
        if (!effectiveToken) {
            router.push("/login");
            return;
        }

        // 2. Role Check: only admin or superadmin allowed
        if (storedUser && !['admin', 'superadmin'].includes(storedUser.role)) {
            router.push("/");
            return;
        }
    }, [token, userData, loading, router]);

    if (loading) {
        return <Loading message="Verifying admin access..." />;
    }

    const effectiveToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!effectiveToken) {
        return <Loading message="Redirecting to login..." />;
    }

    return <>{children}</>;
}
