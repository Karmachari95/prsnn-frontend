"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
    const pathname = usePathname();
    const { token, userData } = useAuth();

    // Do not show on auth pages or admin panels
    if (["/login", "/verify-email", "/forgot-password", "/reset-password"].includes(pathname)) {
        return null;
    }
    if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
        return null;
    }

    const navItems = [
        {
            label: 'Home',
            path: '/',
            icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E3A2F]' : 'text-gray-400'}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            label: 'Explore',
            path: '/companions',
            icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E3A2F]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            label: 'Bookings',
            path: token ? '/my-bookings' : '/login',
            icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E3A2F]' : 'text-gray-400'}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            label: 'Safety',
            path: '/safety',
            icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E3A2F]' : 'text-gray-400'}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            label: token ? (userData?.displayName || 'Profile') : 'Sign In',
            path: token ? '/profile' : '/login',
            icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E3A2F]' : 'text-gray-400'}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    return (
        <nav 
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
        >
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.label}
                            href={item.path}
                            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors relative ${
                                isActive ? 'text-[#1E3A2F]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {item.icon(isActive)}
                            <span className={`text-[10px] mt-1 font-semibold tracking-tight truncate max-w-[64px] ${isActive ? 'text-[#1E3A2F] font-bold' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D97757]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
