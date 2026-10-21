
"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const router = useRouter();

    const logout = () => {
        setToken(null);
        setUserData(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    const fetchProfile = async (authToken, fallbackUser) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            // Merge basic user data with profile data (isVerified, etc)
            const fullUserData = { ...fallbackUser, ...res.data };
            setUserData(fullUserData);
            localStorage.setItem('userData', JSON.stringify(fullUserData));
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // User profile not found. 
                // If it's a superadmin, this is expected as they don't have a profile document in 'profiles' collection usually (or maybe they do? depends on implementation).
                // If we want to support profile updates for superadmin, we need that endpoint to work.
                // For now, let's just ignore 404 for superadmin to avoid console spam.
                if (fallbackUser?.role === 'superadmin') return;

                // For others, likely needs onboarding
            } else if (error.response && error.response.status === 401) {
                // Token invalid or expired
                logout();
            } else {
                console.error("Could not fetch profile", error);
            }
        }
    };

    useEffect(() => {
        // Check for token in localStorage on mount
        const storedToken = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('userData');
        
        if (storedToken) {
            setToken(storedToken);
            // Fetch latest profile data to get verification status
            fetchProfile(storedToken, storedUserData ? JSON.parse(storedUserData) : null);
        }
        
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (newToken, user) => {
        setToken(newToken);
        setUserData(user);
        localStorage.setItem('token', newToken);
        if (user) {
            localStorage.setItem('userData', JSON.stringify(user));
        }

        // 1. Initial Role-Based Redirect
        if (user?.role === 'superadmin') {
            router.push('/super-admin');
        } else if (user?.role === 'admin') {
            if (user?.is_verified) {
                router.push('/admin');
            } else {
                router.push('/admin/onboarding');
            }
        } else if (user?.role === 'companion' && !user?.is_verified) {
            router.push('/onboarding?role=companion');
        } else {
            router.push('/');
        }

        // 2. Fetch latest profile in background and sync
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${newToken}` }
            });
            const fullUserData = { ...user, ...res.data };
            setUserData(fullUserData);
            localStorage.setItem('userData', JSON.stringify(fullUserData));

            // Optional: Re-check redirect if background data differs significantly
            if (!user?.is_verified && fullUserData.is_verified && fullUserData.role === 'admin') {
                router.push('/admin');
            }
        } catch {
            // Background profile check failed, silent error
        }
    };

    return (
        <AuthContext.Provider value={{ token, setToken, userData, setUserData, login, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
