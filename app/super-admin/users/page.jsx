"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../../components/common/Loading";
import Notification from "../../components/common/Alert";

const UsersList = () => {
    const { token, userData } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status'); // 'verified', 'pending', or null
    const roleFilter = searchParams.get('role'); // 'companion' or null

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const usersPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!token) return;
        if (userData && userData.role !== 'superadmin') {
           router.push('/admin');
           return;
        }
        fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userData]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/all-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (userId) => {
        setNotification({
            type: 'confirm',
            title: 'Delete User?',
            message: "Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.",
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            onConfirm: () => executeDeleteUser(userId),
            onClose: () => setNotification(null)
        });
    };

    const executeDeleteUser = async (userId) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotification({
                type: 'success',
                title: 'Deleted',
                message: "User deleted successfully",
                onClose: () => setNotification(null)
            });
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            setNotification({
                type: 'error',
                title: 'Error',
                message: "Failed to delete user",
                onClose: () => setNotification(null)
            });
        }
    };

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, roleFilter]);

    // Prepare User Data (Filter + Pagination)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = true;
        if (statusFilter === 'verified') {
            matchesStatus = user.verification_status === 'verified';
        } else if (statusFilter === 'pending') {
            matchesStatus = user.verification_status !== 'verified';
        }

        let matchesRole = true;
        if (roleFilter) {
            matchesRole = user.role === roleFilter;
        }

        return matchesSearch && matchesStatus && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const currentUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

     const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };


    if(!token) return <Loading message="Authenticating..." />;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative">
            {/* Notification Toast */}
            {notification && (
                <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={notification.onClose}
                    onConfirm={notification.onConfirm}
                    confirmText={notification.confirmText}
                    cancelText={notification.cancelText}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <button onClick={() => router.push('/super-admin')} className="mb-8 text-gray-500 hover:text-black flex items-center gap-2 font-medium transition-colors">
                     &larr; Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <div className='inline-block px-3 py-1 rounded-full bg-indigo-900 text-white text-xs font-bold tracking-wide mb-4 shadow-sm'>
                            User Database
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                            {roleFilter === 'companion' ? 'All Companions' : roleFilter === 'user' ? 'Normal Users' : 'All Users'}
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">
                            {roleFilter === 'companion' ? 'View, manage, and delete companion accounts.' : roleFilter === 'user' ? 'View, manage, and delete normal user accounts.' : 'View, manage, and delete all user accounts.'}
                        </p>
                    </div>
                     <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <Loading fullScreen={false} message="Fetching users..." size="medium" />
                ) : (
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6">User</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6">Joined</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-base">{user.username}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                                            <span className="text-[9px] font-bold uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    user.verification_status === 'verified'
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : user.verification_status === 'pending'
                                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                    : user.verification_status === 'rejected'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}>
                                                    {(user.verification_status || 'not_submitted').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-medium text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                 <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => router.push(`/admin/user/${user.id}`)}
                                                        className="px-4 py-2 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 hover:text-black transition-all shadow-sm"
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="px-4 py-2 bg-white text-red-600 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-50 transition-all shadow-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                 </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4 text-gray-400">🔍</div>
                                                    <p className="text-gray-900 font-bold text-lg">No users found</p>
                                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                         </div>
                         
                         {/* Pagination */}
                         {filteredUsers.length > usersPerPage && (
                             <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t border-gray-100">
                                 <p className="text-sm font-medium text-gray-500">
                                     Showing <span className="text-gray-900 font-bold">{(page - 1) * usersPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(page * usersPerPage, filteredUsers.length)}</span> of <span className="text-gray-900 font-bold">{filteredUsers.length}</span> results
                                 </p>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={handlePrevPage}
                                        disabled={page === 1}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                            page === 1 
                                            ? 'text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                                        }`}
                                    >
                                        Previous
                                     </button>
                                     <button 
                                        onClick={handleNextPage}
                                        disabled={page === totalPages}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                            page === totalPages 
                                            ? 'text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                                        }`}
                                    >
                                        Next
                                     </button>
                                 </div>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

const UsersPage = () => {
    return (
        <Suspense fallback={<Loading message="Loading users..." />}>
            <UsersList />
        </Suspense>
    );
};

export default UsersPage;
