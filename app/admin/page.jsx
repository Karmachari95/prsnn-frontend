"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../components/common/Loading";

const AdminPanel = () => {
  const { token, userData } = useAuth();
  const router = useRouter();

  // Tab state: 'pending', 'all-users', 'companions'
  const [activeTab, setActiveTab] = useState('pending');
  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState('cards');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [companionsList, setCompanionsList] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name'

  // Image lightbox preview
  const [lightboxImage, setLightboxImage] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!token) return;

    // Role check
    if (userData && !['admin', 'superadmin'].includes(userData.role)) {
      router.push('/');
      return;
    }

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userData]);

  const loadAllData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      await Promise.all([
        fetchUnverifiedUsers(),
        fetchAllUsers(),
        fetchCompanions(),
        fetchStats()
      ]);
      if (isManualRefresh) showToast("Dashboard refreshed with latest data");
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnverifiedUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/unverified`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching unverified users", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setAllUsers(res.data);
      }
    } catch (err) {
      console.error("Error fetching all users", err);
    }
  };

  const fetchCompanions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/companions`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.companions)
        ? res.data.companions
        : [];
      setCompanionsList(list);
    } catch (err) {
      console.error("Error fetching companions", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const handleVerify = async (userId, status) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/verify/${userId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state smoothly
      setUsers(prev => prev.map(u =>
        (u.id === userId || u.userId === userId) ? { ...u, verificationStatus: status, verification_status: status } : u
      ));
      setAllUsers(prev => prev.map(u =>
        (u.id === userId || u.userId === userId) ? { ...u, verificationStatus: status, verification_status: status } : u
      ));

      fetchStats();
      fetchCompanions();
      showToast(`User successfully marked as ${status.toUpperCase()}`, status === 'verified' ? 'success' : 'warning');
    } catch (err) {
      console.error("Error verifying user", err);
      // Local optimistic update
      setUsers(prev => prev.map(u =>
        (u.id === userId || u.userId === userId) ? { ...u, verificationStatus: status, verification_status: status } : u
      ));
      setAllUsers(prev => prev.map(u =>
        (u.id === userId || u.userId === userId) ? { ...u, verificationStatus: status, verification_status: status } : u
      ));
      showToast(`Status updated locally to ${status}`, 'info');
    }
  };

  // Helper filter function
  const applyFilterAndSort = (items) => {
    return items
      .filter(item => {
        const term = searchTerm.toLowerCase().trim();
        const name = (item.fullName || item.username || '').toLowerCase();
        const uname = (item.username || '').toLowerCase();
        const email = (item.email || '').toLowerCase();
        const phone = (item.phoneNumber || '').toLowerCase();
        const city = (item.city || '').toLowerCase();

        const matchesSearch = !term ||
          name.includes(term) ||
          uname.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          city.includes(term);

        const matchesRole = roleFilter === 'all' || item.role === roleFilter;

        let matchesStatus = true;
        const effectiveStatus = item.verificationStatus || item.verification_status || 'not_submitted';
        if (statusFilter === 'verified') matchesStatus = effectiveStatus === 'verified';
        if (statusFilter === 'pending') matchesStatus = effectiveStatus === 'pending';
        if (statusFilter === 'rejected') matchesStatus = effectiveStatus === 'rejected';

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
        }
        if (sortBy === 'name') {
          const nameA = a.fullName || a.username || '';
          const nameB = b.fullName || b.username || '';
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  };

  const filteredPending = useMemo(() => applyFilterAndSort(users), [users, searchTerm, roleFilter, statusFilter, sortBy]);
  const filteredAllUsers = useMemo(() => applyFilterAndSort(allUsers), [allUsers, searchTerm, roleFilter, statusFilter, sortBy]);
  const filteredCompanions = useMemo(() => applyFilterAndSort(companionsList), [companionsList, searchTerm, roleFilter, statusFilter, sortBy]);

  const currentDisplayList = activeTab === 'pending'
    ? filteredPending
    : activeTab === 'all-users'
    ? filteredAllUsers
    : filteredCompanions;

  if (!token) return <Loading message="Authenticating administrator..." />;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-gray-900 font-sans pb-20 selection:bg-[#2f4a34]/20 selection:text-[#2f4a34]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce duration-300">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border ${
            toast.type === 'success' ? 'bg-[#2f4a34] text-white border-[#3d5f42]' :
            toast.type === 'warning' ? 'bg-amber-700 text-white border-amber-800' :
            'bg-gray-900 text-white border-gray-800'
          }`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠' : 'ℹ'}</span>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Proof preview"
              className="max-h-[82vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/20"
            />
            <p className="text-white/80 text-xs mt-3 font-medium bg-black/60 px-4 py-1.5 rounded-full">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}

      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif text-2xl font-black tracking-tight text-[#2f4a34] group-hover:opacity-90 transition-opacity">
                prsnn<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200">
              <span className="px-2.5 py-1 rounded-full bg-[#2f4a34]/10 text-[#2f4a34] text-[11px] font-bold uppercase tracking-wider">
                Admin Console
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500 font-medium">Logged in as @{userData?.username || 'admin'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
              title="Refresh dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#2f4a34]' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <Link
              href="/super-admin/deleted-accounts"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
            >
              <span>🗑️ Deleted Accounts</span>
            </Link>

            {userData?.role === 'superadmin' && (
              <Link
                href="/super-admin"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-sm"
              >
                <span>Super Admin</span>
                <span className="text-gray-400">→</span>
              </Link>
            )}

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2f4a34] text-white hover:bg-[#3d5f42] transition-colors shadow-sm"
            >
              Public Site ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Title & Context */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
                User Verification &amp; Operations
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-medium mt-1.5">
                Review ID verification requests, inspect document proofs, and manage platform members with ease.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Database Connected
              </span>
            </div>
          </div>
        </div>

        {/* 4 Professional KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
          {/* Card 1: Pending Verifications */}
          <div
            onClick={() => { setActiveTab('pending'); setStatusFilter('all'); }}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 ${
              activeTab === 'pending'
                ? 'bg-amber-50/90 border-amber-300/80 shadow-md ring-2 ring-amber-400/20'
                : 'bg-white border-gray-200/80 shadow-sm hover:shadow-md hover:border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Action Required
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight mb-1">
              {stats?.pendingVerifications ?? users.length}
            </div>
            <p className="text-xs font-semibold text-gray-500">Pending Identity Reviews</p>
          </div>

          {/* Card 2: Total Registered Users */}
          <div
            onClick={() => { setActiveTab('all-users'); setRoleFilter('all'); }}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 ${
              activeTab === 'all-users'
                ? 'bg-blue-50/90 border-blue-300/80 shadow-md ring-2 ring-blue-400/20'
                : 'bg-white border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                All Members
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight mb-1">
              {allUsers.length}
            </div>
            <p className="text-xs font-semibold text-gray-500">Total Registered Accounts</p>
          </div>

          {/* Card 3: Verified Companions */}
          <div
            onClick={() => { setActiveTab('companions'); setRoleFilter('all'); }}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 ${
              activeTab === 'companions'
                ? 'bg-emerald-50/90 border-emerald-300/80 shadow-md ring-2 ring-emerald-400/20'
                : 'bg-white border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2f4a34]">
                Active Platform
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-[#2f4a34] flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight mb-1">
              {stats?.verifiedFellows ?? companionsList.length}
            </div>
            <p className="text-xs font-semibold text-gray-500">Live Verified Companions</p>
          </div>

          {/* Card 4: New Signups Today */}
          <div className="rounded-2xl p-6 bg-white border border-gray-200/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                Growth Metric
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight mb-1">
              {stats?.signupsToday ?? 0}
            </div>
            <p className="text-xs font-semibold text-gray-500">New Signups Today</p>
          </div>
        </div>

        {/* Navigation Tabs and Controls */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-4 md:p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setActiveTab('pending'); setSearchTerm(''); }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'bg-[#2f4a34] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                <span>Pending Verifications</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {users.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('all-users'); setSearchTerm(''); }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'all-users'
                    ? 'bg-[#2f4a34] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                <span>All Registered Users</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'all-users' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  {allUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('companions'); setSearchTerm(''); }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'companions'
                    ? 'bg-[#2f4a34] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                <span>Verified Companions</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'companions' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {companionsList.length}
                </span>
              </button>

              <Link
                href="/super-admin/deleted-accounts"
                className="px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 border border-red-200"
              >
                <span>🗑️ Deleted Accounts</span>
              </Link>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <span className="text-xs text-gray-400 font-semibold mr-1">View:</span>
              <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200/60">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, @username, email, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2f4a34]/20 focus:border-[#2f4a34] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2f4a34]/20"
                >
                  <option value="all">All Roles</option>
                  <option value="companion">Companions</option>
                  <option value="user">Regular Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2f4a34]/20"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2f4a34]/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content List (Cards or Table) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col h-96">
                <div className="h-52 w-full bg-gray-100"></div>
                <div className="p-6 space-y-4 flex-1">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                  <div className="flex gap-3 mt-auto pt-4">
                    <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                    <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentDisplayList.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center border border-gray-200/80 shadow-sm max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 bg-emerald-50 text-[#2f4a34] rounded-full flex items-center justify-center mb-5 text-3xl shadow-inner">
              {activeTab === 'pending' ? '✨' : '🔍'}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              {activeTab === 'pending' ? 'No Pending Verifications!' : 'No matching members found'}
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              {activeTab === 'pending'
                ? 'All submitted user credentials have been reviewed. You are completely caught up.'
                : 'Try adjusting your search query or reset the role and status filters.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}
                  className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-black transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              ) : activeTab === 'pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all-users')}
                    className="px-5 py-2.5 bg-[#2f4a34] text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-[#3d5f42] transition-all shadow-md"
                  >
                    Browse All {allUsers.length} Users →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('companions')}
                    className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 font-bold rounded-full text-xs uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm"
                  >
                    View Companions ({companionsList.length})
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards Grid View (The Clean & High-Impact Visual Format) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {currentDisplayList.map((item) => {
              const itemId = item.id || item.userId || item._id;
              const photoUrl = item.profilePhotoUrl || item.profilePhoto || item.idProofFrontUrl;
              const effectiveStatus = item.verificationStatus || item.verification_status || (item.is_verified ? 'verified' : 'pending');
              const role = item.role || (item.pricePerHour ? 'companion' : 'user');
              const joinedDate = item.created_at || item.createdAt;

              return (
                <div
                  key={itemId}
                  className="bg-white rounded-[2rem] overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  {/* Top Image Preview with Hover Overlay */}
                  <div className="h-56 w-full bg-gray-100 relative overflow-hidden">
                    {photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photoUrl}
                        alt={item.fullName || item.username}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/mode-sit-with-me.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-bold bg-gray-50">
                        <span className="text-3xl mb-1">👤</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Dark gradient for pill contrast */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

                    {/* Corner Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm ${
                        role === 'companion'
                          ? 'bg-purple-900/80 text-purple-100 border border-purple-400/30'
                          : role === 'admin' || role === 'superadmin'
                          ? 'bg-gray-900/80 text-white border border-gray-400/30'
                          : 'bg-blue-900/80 text-blue-100 border border-blue-400/30'
                      }`}>
                        {role}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm ${
                        effectiveStatus === 'verified'
                          ? 'bg-emerald-900/80 text-emerald-100 border border-emerald-400/30'
                          : effectiveStatus === 'rejected'
                          ? 'bg-red-900/80 text-red-100 border border-red-400/30'
                          : 'bg-amber-900/80 text-amber-100 border border-amber-400/30'
                      }`}>
                        {effectiveStatus}
                      </span>
                    </div>

                    {/* Hover Inspect Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-xs p-4">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/user/${itemId}`)}
                        className="w-full max-w-[200px] py-2.5 px-4 bg-white text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg text-center"
                      >
                        Inspect ID Proofs →
                      </button>

                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setLightboxImage(photoUrl)}
                          className="py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-medium backdrop-blur-md transition-colors"
                        >
                          🔍 Preview Image Fullscreen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Username */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3
                            onClick={() => router.push(`/admin/user/${itemId}`)}
                            className="text-lg font-bold text-gray-950 hover:text-[#2f4a34] transition-colors truncate cursor-pointer leading-snug"
                          >
                            {item.fullName || item.username || 'Unnamed Member'}
                          </h3>
                          <p className="text-xs text-gray-400 font-medium truncate">@{item.username || 'user'}</p>
                        </div>

                        {item.pricePerHour && (
                          <span className="shrink-0 text-xs font-extrabold text-[#2f4a34] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            ₹{item.pricePerHour}/hr
                          </span>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 my-3 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-gray-400">✉</span>
                          <span className="truncate">{item.email}</span>
                        </div>
                        {item.phoneNumber && item.phoneNumber !== 'Not provided' && (
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-gray-400">📞</span>
                            <span>{item.phoneNumber}</span>
                          </div>
                        )}
                        {item.city && (
                          <div className="flex items-center gap-2 truncate text-gray-600">
                            <span className="text-gray-400">📍</span>
                            <span>{item.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 pt-2 border-t border-gray-100">
                        <span>📅</span>
                        <span>Joined {joinedDate ? new Date(joinedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      {effectiveStatus === 'pending' || effectiveStatus === 'not_submitted' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerify(itemId, 'verified')}
                            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all text-center"
                          >
                            ✓ Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerify(itemId, 'rejected')}
                            className="flex-1 py-2.5 px-3 bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 hover:border-red-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/user/${itemId}`)}
                            className="text-xs font-bold text-gray-800 hover:text-black flex items-center gap-1 py-1"
                          >
                            <span>Inspect Profile</span>
                            <span>→</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {effectiveStatus !== 'verified' && (
                              <button
                                type="button"
                                onClick={() => handleVerify(itemId, 'verified')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-200"
                              >
                                Approve
                              </button>
                            )}
                            {effectiveStatus !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleVerify(itemId, 'rejected')}
                                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-200"
                              >
                                Reject
                              </button>
                            )}
                            {role === 'companion' && (
                              <Link
                                href={`/companions/${itemId}`}
                                target="_blank"
                                className="px-2.5 py-1.5 text-xs font-bold text-[#2f4a34] hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Open public companion profile"
                              >
                                Live ↗
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View (Professional CRM / Grid Format for Speed) */
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider font-extrabold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="py-4 px-6">Member</th>
                    <th scope="col" className="py-4 px-6">Contact</th>
                    <th scope="col" className="py-4 px-6">Role</th>
                    <th scope="col" className="py-4 px-6">Verification</th>
                    <th scope="col" className="py-4 px-6">Joined</th>
                    <th scope="col" className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentDisplayList.map((item) => {
                    const itemId = item.id || item.userId || item._id;
                    const photoUrl = item.profilePhotoUrl || item.profilePhoto || item.idProofFrontUrl;
                    const effectiveStatus = item.verificationStatus || item.verification_status || (item.is_verified ? 'verified' : 'pending');
                    const role = item.role || (item.pricePerHour ? 'companion' : 'user');
                    const joinedDate = item.created_at || item.createdAt;

                    return (
                      <tr key={itemId} className="hover:bg-gray-50/70 transition-colors group">
                        {/* Member */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => router.push(`/admin/user/${itemId}`)}
                              className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 cursor-pointer"
                            >
                              {photoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={photoUrl}
                                  alt={item.fullName || item.username}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/mode-sit-with-me.png';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs bg-gray-50">
                                  👤
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => router.push(`/admin/user/${itemId}`)}
                                className="font-bold text-gray-900 hover:text-[#2f4a34] transition-colors cursor-pointer truncate"
                              >
                                {item.fullName || item.username || 'Unnamed'}
                              </p>
                              <p className="text-xs text-gray-400 font-medium truncate">@{item.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-6 text-xs text-gray-600">
                          <p className="font-medium text-gray-800 truncate">{item.email}</p>
                          <p className="text-gray-400 font-medium truncate">{item.phoneNumber || 'No phone'}</p>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                            role === 'companion'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : role === 'admin' || role === 'superadmin'
                              ? 'bg-gray-100 text-gray-800 border border-gray-300'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {role}
                          </span>
                        </td>

                        {/* Verification */}
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                            effectiveStatus === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : effectiveStatus === 'rejected'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {effectiveStatus}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                          {joinedDate ? new Date(joinedDate).toLocaleDateString() : 'Recently'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/user/${itemId}`)}
                              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                            >
                              Inspect →
                            </button>

                            {effectiveStatus !== 'verified' && (
                              <button
                                type="button"
                                onClick={() => handleVerify(itemId, 'verified')}
                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-200"
                              >
                                ✓
                              </button>
                            )}

                            {effectiveStatus !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleVerify(itemId, 'rejected')}
                                className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-200"
                              >
                                ✕
                              </button>
                            )}

                            {role === 'companion' && (
                              <Link
                                href={`/companions/${itemId}`}
                                target="_blank"
                                className="px-2 py-1 text-xs font-bold text-[#2f4a34] hover:underline"
                                title="View Live"
                              >
                                ↗
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
