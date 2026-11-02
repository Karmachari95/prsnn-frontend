"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const router = useRouter();

    // Synchronously initialize auth state from localStorage on client
    const [token, setToken] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token') || null;
        }
        return null;
    });

    const [userData, setUserData] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('userData');
                return stored ? JSON.parse(stored) : null;
            } catch {
                return null;
            }
        }
        return null;
    });

    const [loading, setLoading] = useState(false);

    const logout = () => {
        setToken(null);
        setUserData(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
        }
        router.push('/login');
    };

    const fetchProfile = async (authToken, fallbackUser) => {
        if (!authToken) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
            const res = await axios.get(`${apiUrl}/api/profile`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
                timeout: 15000
            });
            if (res.data) {
                const fullUserData = { ...(fallbackUser || {}), ...res.data };
                setUserData(fullUserData);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('userData', JSON.stringify(fullUserData));
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token explicitly invalid or expired
                logout();
            } else {
                console.warn("Could not sync profile in background:", error?.message);
            }
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedToken = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('userData');
        let parsedUser = null;

        if (storedUserData) {
            try {
                parsedUser = JSON.parse(storedUserData);
                setUserData(parsedUser);
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }

        if (storedToken) {
            setToken(storedToken);
            fetchProfile(storedToken, parsedUser);
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (newToken, user) => {
        setToken(newToken);
        setUserData(user);
        setLoading(false);

        if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
            if (user) {
                localStorage.setItem('userData', JSON.stringify(user));
            }
        }

        // Clean role-based navigation
        if (user?.role === 'superadmin') {
            router.push('/super-admin');
        } else if (user?.role === 'admin') {
            router.push('/admin');
        } else if (user?.role === 'companion') {
            router.push('/companion/dashboard');
        } else {
            router.push('/');
        }

        // Background profile sync
        if (newToken) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
            axios.get(`${apiUrl}/api/profile`, {
                headers: { 'Authorization': `Bearer ${newToken}` },
                timeout: 15000
            }).then(res => {
                if (res.data) {
                    const fullUserData = { ...(user || {}), ...res.data };
                    setUserData(fullUserData);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('userData', JSON.stringify(fullUserData));
                    }
                }
            }).catch(() => {});
        }
    };

    return (
        <AuthContext.Provider value={{ token, setToken, userData, setUserData, loading, login, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
