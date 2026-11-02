
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../components/common/Loading";

/* ─── Helper ─────────────────────────────────────────────── */
const Avatar = ({ src, name, size = "w-10 h-10" }) => (
  <div className={`${size} rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0`}>
    {src ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt={name} className="w-full h-full object-cover"
        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=374151&bold=true`; }} />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold text-sm">
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    )}
  </div>
);

const PaymentDetailModal = ({ payment, onClose }) => {
  if (!payment) return null;
  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const durationLabel = (() => {
    const m = parseInt(payment.duration, 10) || 0;
    if (m >= 60 && m % 60 === 0) return `${m / 60} hr${m / 60 > 1 ? 's' : ''}`;
    return `${m} min`;
  })();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 overflow-y-auto max-h-[90vh] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              ✅ Payment Verified
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3">Transaction Detail</h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">{payment.razorpayPaymentId || '—'}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors text-sm">✕</button>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center mb-6">
          <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-1">Amount Paid</p>
          <p className="text-4xl font-bold">₹{payment.amountPaid?.toFixed(2)}</p>
          <p className="text-green-100 text-xs mt-2">{fmt(payment.paidAt)}</p>
        </div>

        {/* People */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Payer */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3">💸 Paid By</p>
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={payment.payer?.profilePhotoUrl} name={payment.payer?.fullName} size="w-12 h-12" />
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{payment.payer?.fullName || '—'}</p>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{payment.payer?.role}</span>
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <p className="text-xs text-gray-500 flex items-center gap-1.5"><span>✉️</span> {payment.payer?.email || '—'}</p>
              {payment.payer?.phoneNumber && <p className="text-xs text-gray-500 flex items-center gap-1.5"><span>📞</span> {payment.payer.phoneNumber}</p>}
            </div>
          </div>

          {/* Recipient */}
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3">🤝 Paid To</p>
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={payment.recipient?.profilePhotoUrl} name={payment.recipient?.fullName} size="w-12 h-12" />
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{payment.recipient?.fullName || '—'}</p>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{payment.recipient?.role}</span>
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <p className="text-xs text-gray-500 flex items-center gap-1.5"><span>✉️</span> {payment.recipient?.email || '—'}</p>
              {payment.recipient?.phoneNumber && <p className="text-xs text-gray-500 flex items-center gap-1.5"><span>📞</span> {payment.recipient.phoneNumber}</p>}
            </div>
          </div>
        </div>

        {/* Booking Detail */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">📋 Booking Details</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Duration</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">{durationLabel}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Start Time</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">{payment.startTime || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Scheduled Date</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">{payment.scheduledDate ? new Date(payment.scheduledDate).toLocaleDateString('en-IN') : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Booking Status</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5 capitalize">{payment.bookingStatus || '—'}</p>
            </div>
          </div>
        </div>

        {/* Razorpay IDs */}
        <div className="mt-4 space-y-2">
          {payment.razorpayOrderId && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</span>
              <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">{payment.razorpayOrderId}</span>
            </div>
          )}
          {payment.razorpayPaymentId && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Payment ID</span>
              <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">{payment.razorpayPaymentId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const SuperAdminPanel = () => {
  const { token, userData } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    if (!token) return;
    if (userData && userData.role !== 'superadmin') {
       router.push('/admin');
       return;
    }
    fetchAnalytics();
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userData]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/super-stats`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/payments`, { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.data);
    } catch (err) { console.error('Payments fetch error:', err); }
    finally { setPaymentsLoading(false); }
  };
  
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/create-admin`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Admin created successfully!');
      setShowCreateAdmin(false);
      setNewAdmin({ username: '', email: '', password: '' });
      fetchAnalytics();
    } catch (error) {
       console.error(error);
       alert(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  if (!token) return <Loading message="Authenticating..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className='inline-block px-3 py-1 rounded-full bg-indigo-900 text-white text-xs font-bold tracking-wide mb-4 shadow-sm'>
              Super Admin Panel
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-500 font-medium mt-2">Manage System Administrators &amp; Overview.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
               onClick={() => router.push('/super-admin/all-users')}
               className="px-6 py-3 bg-white text-gray-700 font-bold rounded-full border border-gray-200 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all shadow-sm"
            >
               👥 All Users
            </button>
             <button 
               onClick={() => setShowCreateAdmin(true)}
               className="px-6 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
               + Create Admin
            </button>
            <button 
               onClick={() => router.push('/')}
               className="px-6 py-3 bg-white text-gray-700 font-bold rounded-full border border-gray-200 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all shadow-sm"
            >
               Home
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        {!analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 animate-pulse shadow-sm h-64">
                        <div className="h-14 w-14 bg-gray-100 rounded-2xl mb-6"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-50 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Total Users Card */}
                <div onClick={() => router.push('/super-admin/users?role=user')} className="bg-white p-8 rounded-[2rem] border border-gray-100 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">View All</span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Total Users</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2 relative z-10 tracking-tight">{analytics.totalUsers}</h3>
                    <div className="flex gap-4 mt-6 text-xs font-bold relative z-10">
                        <span className="text-green-600 cursor-pointer hover:underline flex items-center gap-1" onClick={(e) => { e.stopPropagation(); router.push('/super-admin/users?role=user&status=verified'); }}>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {analytics.totalVerified} Verified
                        </span>
                        <span className="text-yellow-600 cursor-pointer hover:underline flex items-center gap-1" onClick={(e) => { e.stopPropagation(); router.push('/super-admin/users?role=user&status=pending'); }}>
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            {analytics.totalUnverified} Pending
                        </span>
                    </div>
                </div>

                {/* Companions Card */}
                <div onClick={() => router.push('/super-admin/users?role=companion')} className="bg-white p-8 rounded-[2rem] border border-gray-100 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-yellow-600 group-hover:text-white transition-colors">View All</span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Total Companions</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2 relative z-10 tracking-tight">{analytics.totalFellows}</h3>
                    <div className="flex gap-4 mt-6 text-xs font-bold relative z-10">
                        <span className="text-green-600 cursor-pointer hover:underline flex items-center gap-1" onClick={(e) => { e.stopPropagation(); router.push('/super-admin/users?role=companion&status=verified'); }}>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {analytics.verifiedFellows || 0} Verified
                        </span>
                        <span className="text-yellow-600 cursor-pointer hover:underline flex items-center gap-1" onClick={(e) => { e.stopPropagation(); router.push('/super-admin/users?role=companion&status=pending'); }}>
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            {analytics.pendingFellows || 0} Pending
                        </span>
                    </div>
                </div>

                 {/* Admins Card */}
                 <div onClick={() => router.push('/super-admin/admins')} className="bg-white p-8 rounded-[2rem] border border-gray-100 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                         <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-purple-600 group-hover:text-white transition-colors">Manage</span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">System Admins</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2 relative z-10 tracking-tight">{analytics.totalAdmins}</h3>
                     <p className="text-gray-500 text-xs font-medium mt-4 relative z-10">Manage admin accounts and permissions.</p>
                </div>

                {/* Pending Admins Card */}
                <div onClick={() => router.push('/super-admin/admins?status=unverified')} className="bg-white p-8 rounded-[2rem] border border-gray-100 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                         {(analytics.totalUnverifiedAdmins > 0) && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-md border-2 border-white">! ACTION</span>
                         )}
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Pending Admins</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2 relative z-10 tracking-tight">{analytics.totalUnverifiedAdmins || 0}</h3>
                    <p className="text-gray-500 text-xs font-medium mt-4 relative z-10">Admins waiting for review.</p>
                </div>
                
                {/* Active Today */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg group relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Active Today</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2 relative z-10 tracking-tight">{analytics.activeToday}</h3>
                    <p className="text-gray-500 text-xs font-medium mt-4 relative z-10">Users active in the last 24h.</p>
                </div>

                {/* Deleted Accounts Card */}
                <div onClick={() => router.push('/super-admin/deleted-accounts')} className="bg-white p-8 rounded-[2rem] border border-gray-100 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                               <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-red-600 group-hover:text-white transition-colors">Audit</span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Deleted Accounts</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2 relative z-10 tracking-tight">{analytics.totalDeleted || 0}</h3>
                    <p className="text-gray-500 text-xs font-medium mt-4 relative z-10">View archived accounts.</p>
                </div>
            </div>
        )}

        {/* ── Payments Section ─────────────────────────────── */}
        <div className="mt-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Transactions</h2>
              </div>
              <p className="text-gray-400 text-sm font-medium pl-1">All completed payments between users and companions.</p>
            </div>
            {/* Revenue Summary */}
            {!paymentsLoading && payments.length > 0 && (
              <div className="flex gap-4">
                <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-0.5">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payments Grid */}
          {paymentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-6 animate-pulse shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gray-100 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-50 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-50 rounded w-1/3 mb-3"></div>
                  <div className="h-8 bg-gray-100 rounded-xl w-1/2"></div>
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center shadow-sm">
              <div className="text-5xl mb-4 opacity-30">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-400 text-sm">Payments made between users and companions will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {payments.map(payment => (
                <div
                  key={payment._id}
                  onClick={() => setSelectedPayment(payment)}
                  className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  {/* Paid At */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 relative z-10">
                    {new Date(payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span className="ml-2 text-gray-300">·</span>
                    <span className="ml-2">{payment.duration} min session</span>
                  </p>

                  {/* Payer → Recipient */}
                  <div className="flex items-center gap-2 mb-5 relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={payment.payer?.profilePhotoUrl} name={payment.payer?.fullName} />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate leading-tight">{payment.payer?.fullName || 'User'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{payment.payer?.email}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-gray-300 mx-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={payment.recipient?.profilePhotoUrl} name={payment.recipient?.fullName} />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate leading-tight">{payment.recipient?.fullName || 'Companion'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{payment.recipient?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount + View */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Amount</p>
                      <p className="text-lg font-bold text-green-700">₹{payment.amountPaid?.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-700 transition-colors flex items-center gap-1">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
                  </div>

                  {/* Payment ID snippet */}
                  {payment.razorpayPaymentId && (
                    <p className="text-[10px] font-mono text-gray-300 mt-3 truncate relative z-10">
                      {payment.razorpayPaymentId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

       {/* Create Admin Modal */}
       {showCreateAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all">
           <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 md:p-10 transform scale-100 transition-transform">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Admin</h2>
                    <p className="text-gray-500 text-xs font-medium mt-1">Add a new administrator to the system.</p>
                </div>
                <button onClick={() => setShowCreateAdmin(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  ✕
                </button>
             </div>
             <form onSubmit={handleCreateAdmin} className="space-y-6">
               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                 <input 
                   type="text" 
                   required
                   value={newAdmin.username}
                   onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-gray-300 outline-none font-medium transition-all"
                   placeholder="e.g. admin_jane"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                 <input 
                   type="email" 
                   required
                   value={newAdmin.email}
                   onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-gray-300 outline-none font-medium transition-all"
                   placeholder="admin@prsnn.com"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                 <input 
                   type="password" 
                   required
                   value={newAdmin.password}
                   onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-gray-300 outline-none font-medium transition-all"
                   placeholder="••••••••"
                 />
               </div>
               <button 
                 type="submit" 
                 className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl hover:-translate-y-0.5 mt-2"
               >
                 Create Admin Account
               </button>
             </form>
           </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

export default SuperAdminPanel;
