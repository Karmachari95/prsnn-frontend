"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../components/common/Loading';
import { useNotification } from '../context/NotificationContext';
import Link from 'next/link';

const timeAgo = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

const NotificationsPage = () => {
    const { token } = useAuth();
    const router = useRouter();
    const { showNotification } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'bookings', 'messages', 'offers'

    useEffect(() => {
        const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        if (!activeToken) {
            router.push('/login');
            return;
        }
        fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            } else {
                console.error("Failed to fetch notifications");
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (notifications.length === 0) return;
        
        setClearing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setNotifications([]);
                showNotification('success', 'All notifications cleared');
            } else {
                const data = await res.json();
                showNotification('error', data.message || 'Failed to clear notifications');
            }
        } catch (error) {
            console.error("Error clearing notifications:", error);
            showNotification('error', 'Something went wrong');
        } finally {
            setClearing(false);
        }
    };

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return notifications;
        if (activeTab === 'bookings') {
            return notifications.filter(n => 
                n.type?.includes('booking') || 
                n.type?.includes('companion') || 
                n.type?.includes('payment') ||
                n.type?.includes('refund') ||
                n.message?.toLowerCase().includes('booking')
            );
        }
        if (activeTab === 'offers') {
            return notifications.filter(n => 
                n.type?.includes('offer') || 
                n.message?.toLowerCase().includes('offer')
            );
        }
        if (activeTab === 'messages') {
            return notifications.filter(n => 
                n.type?.includes('message') || 
                n.message?.toLowerCase().includes('message')
            );
        }
        return notifications;
    }, [notifications, activeTab]);

    const getIconForNotification = (n) => {
        const text = (n.message || '').toLowerCase();
        const type = (n.type || '').toLowerCase();

        if (type.includes('confirmed') || text.includes('confirmed') || text.includes('accepted')) {
            return (
                <div className="w-10 h-10 rounded-full bg-[#E8EFE9] text-[#1E3A2F] flex items-center justify-center font-bold text-sm shrink-0">
                    ✓
                </div>
            );
        }
        if (type.includes('offer') || text.includes('offer')) {
            return (
                <div className="w-10 h-10 rounded-full bg-[#FEF7E6] text-[#996500] flex items-center justify-center text-sm shrink-0">
                    🤝
                </div>
            );
        }
        if (type.includes('refund') || text.includes('refund')) {
            return (
                <div className="w-10 h-10 rounded-full bg-[#E8EFE9] text-[#2F4A34] flex items-center justify-center text-sm shrink-0">
                    💳
                </div>
            );
        }
        return (
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm shrink-0">
                🔔
            </div>
        );
    };

    if (loading) {
        return <Loading message="Loading notifications..." />;
    }

    return (
        <div className="w-full min-h-screen pt-28 md:pt-32 pb-24 px-4 bg-[#FAF8F5] text-ink font-sans">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header matching Screen 16 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Stay updated on your sessions, offers, and reminders
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            disabled={clearing}
                            className="px-3.5 py-1.5 bg-white border border-[#EAE6DF] text-gray-600 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {clearing ? 'Clearing...' : 'Clear All'}
                        </button>
                    )}
                </div>

                {/* Filter Tabs matching Screen 16 */}
                <div className="flex gap-2 border-b border-[#EAE6DF] pb-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'bookings', label: 'Bookings' },
                        { key: 'messages', label: 'Messages' },
                        { key: 'offers', label: 'Offers' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                activeTab === tab.key
                                    ? 'bg-[#1E3A2F] text-white shadow-sm'
                                    : 'bg-white border border-[#EAE6DF] text-gray-600 hover:text-black'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-12 text-center shadow-sm">
                            <div className="w-16 h-16 mb-4 bg-[#FAF8F5] rounded-full flex items-center justify-center text-2xl mx-auto">
                                🔔
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications</h3>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                When companions accept your booking or send offers, they will appear here.
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div 
                                key={notification._id} 
                                className={`p-4 md:p-5 rounded-2xl border transition-all bg-white shadow-sm hover:shadow-md flex items-start gap-4 ${
                                    !notification.isRead 
                                        ? 'border-[#1E3A2F]/30 bg-emerald-50/20' 
                                        : 'border-[#EAE6DF]'
                                }`}
                            >
                                {getIconForNotification(notification)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                                            {notification.message}
                                        </p>
                                        <span className="text-[11px] font-medium text-gray-400 shrink-0">
                                            {timeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    {notification.bookingId && (
                                        <Link 
                                            href="/my-bookings" 
                                            className="inline-block mt-2 text-xs font-bold text-[#1E3A2F] hover:underline"
                                        >
                                            View booking details →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
