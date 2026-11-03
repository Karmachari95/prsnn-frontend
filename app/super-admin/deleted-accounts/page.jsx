"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../../components/common/Loading";

const DeletedAccountsPage = () => {
    const { token, userData } = useAuth();
    const router = useRouter();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';

    useEffect(() => {
        if (!token) return;
        if (userData && !['admin', 'superadmin'].includes(userData.role)) {
           router.push('/admin');
           return;
        }
        fetchDeletedAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userData]);
    
    const fetchDeletedAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_URL}/api/admin/deleted-accounts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const list = Array.isArray(res.data?.accounts) ? res.data.accounts : (Array.isArray(res.data) ? res.data : []);
            setAccounts(list);
        } catch (err) {
            console.error("Error fetching deleted accounts", err);
            setError(err.response?.data?.message || "Failed to load deleted accounts");
        } finally {
            setLoading(false);
        }
    };

    if(!token) return <Loading message="Authenticating..." />;

    const returnPath = userData?.role === 'superadmin' ? '/super-admin' : '/admin';

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <button onClick={() => router.push(returnPath)} className="mb-8 text-gray-500 hover:text-black flex items-center gap-2 font-medium transition-colors">
                     &larr; Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className='inline-block px-3 py-1 rounded-full bg-red-900 text-white text-xs font-bold tracking-wide mb-4 shadow-sm'>
                            Audit Trail
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                            Deleted Accounts
                        </h1>
                        <p className="text-lg text-gray-500 font-medium mt-2">Archive of all deleted user accounts for audit purposes.</p>
                    </div>
                </div>

                {loading ? (
                    <Loading fullScreen={false} message="Fetching deleted accounts..." size="medium" />
                ) : accounts.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            🗑️
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">No Deleted Accounts</h3>
                        <p className="text-gray-500 font-medium mt-2">No accounts have been deleted yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm mb-8 flex items-center gap-4">
                            <span className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
                                {accounts.length}
                            </span>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Total Deleted Accounts</h3>
                                <p className="text-gray-500 text-sm">These records are permanently archived.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {accounts.map((account) => (
                                <div key={account._id} className="bg-white rounded-[2rem] p-6 border border-gray-100 hover:shadow-lg transition-all shadow-sm group">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                {account.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-xl text-gray-900">{account.username}</h3>
                                                <p className="text-sm text-gray-500 font-medium">{account.email}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                        {account.role}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-red-100">
                                                        Deleted
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm font-medium text-gray-500 space-y-1 md:text-right">
                                            <p>Created: <span className="text-gray-900">{account.created_at ? new Date(account.created_at).toLocaleDateString() : '—'}</span></p>
                                            <p>Deleted: <span className="text-red-600 font-bold">{account.deleted_at ? new Date(account.deleted_at).toLocaleDateString() : '—'}</span></p>
                                        </div>

                                        <button 
                                            onClick={() => setSelectedAccount(account)}
                                            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm whitespace-nowrap"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Details Modal */}
            {selectedAccount && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all" onClick={() => setSelectedAccount(null)}>
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full p-8 md:p-10 max-h-[90vh] overflow-y-auto transform scale-100 transition-transform" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Account Details</h2>
                            <button onClick={() => setSelectedAccount(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Basic Info */}
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-6">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="text-gray-400 font-bold text-xs uppercase mb-1">User ID</p>
                                        <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 inline-block">{selectedAccount.userId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-bold text-xs uppercase mb-1">Username</p>
                                        <p className="text-gray-900 font-medium">{selectedAccount.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-bold text-xs uppercase mb-1">Email</p>
                                        <p className="text-gray-900 font-medium">{selectedAccount.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-bold text-xs uppercase mb-1">Role</p>
                                        <p className="text-gray-900 font-medium uppercase">{selectedAccount.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-bold text-xs uppercase mb-1">Verification Status</p>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedAccount.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {selectedAccount.verification_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Data */}
                            {selectedAccount.profile && (
                                <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-6">Profile Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div>
                                            <p className="text-gray-400 font-bold text-xs uppercase mb-1">Full Name</p>
                                            <p className="text-gray-900 font-medium">{selectedAccount.profile.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold text-xs uppercase mb-1">Phone</p>
                                            <p className="text-gray-900 font-medium">{selectedAccount.profile.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold text-xs uppercase mb-1">Category</p>
                                            <p className="text-gray-900 font-medium">{selectedAccount.profile.categoryType}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold text-xs uppercase mb-1">Price/Hour</p>
                                            <p className="text-gray-900 font-medium">₹{selectedAccount.profile.pricePerHour}</p>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <p className="text-gray-400 font-bold text-xs uppercase mb-1">Description</p>
                                            <p className="text-gray-700 bg-white p-4 rounded-xl border border-green-100">{selectedAccount.profile.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Deletion Info */}
                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                                <h3 className="font-bold text-red-900 text-sm uppercase tracking-wider mb-6">Deletion Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="text-red-400 font-bold text-xs uppercase mb-1">Deleted By (Admin ID)</p>
                                        <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded-lg border border-red-100 inline-block">{selectedAccount.deleted_by}</p>
                                    </div>
                                    <div>
                                        <p className="text-red-400 font-bold text-xs uppercase mb-1">Deleted At</p>
                                        <p className="text-gray-900 font-medium">{selectedAccount.deleted_at ? new Date(selectedAccount.deleted_at).toLocaleString() : '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-red-400 font-bold text-xs uppercase mb-1">Account Created</p>
                                        <p className="text-gray-900 font-medium">{selectedAccount.created_at ? new Date(selectedAccount.created_at).toLocaleString() : '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-red-400 font-bold text-xs uppercase mb-1">Account Lifespan</p>
                                        <p className="text-gray-900 font-medium">
                                            {(() => {
                                                const d1 = selectedAccount.created_at ? new Date(selectedAccount.created_at).getTime() : null;
                                                const d2 = selectedAccount.deleted_at ? new Date(selectedAccount.deleted_at).getTime() : Date.now();
                                                if (!d1 || isNaN(d1) || isNaN(d2)) return '—';
                                                const diffDays = Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
                                                return `${diffDays} days`;
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeletedAccountsPage;
