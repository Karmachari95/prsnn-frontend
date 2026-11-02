"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../../components/common/Loading";

const AllUsersPage = () => {
    const { token, userData } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const usersPerPage = 9;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'verified', 'pending'

    useEffect(() => {
        if (!token) return;
        if (userData && !['admin', 'superadmin'].includes(userData.role)) {
           router.push('/');
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

    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterStatus]);

    // Prepare User Data (Filter + Pagination)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = true;
        if (filterStatus === 'verified') {
            matchesStatus = user.verification_status === 'verified';
        } else if (filterStatus === 'pending') {
            matchesStatus = user.verification_status === 'pending';
        }

        return matchesSearch && matchesStatus;
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
            <div className="max-w-7xl mx-auto relative z-10">
                <button onClick={() => router.push('/admin')} className="mb-8 text-gray-500 hover:text-black flex items-center gap-2 font-medium transition-colors">
                     &larr; Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className='inline-block px-3 py-1 rounded-full bg-indigo-900 text-white text-xs font-bold tracking-wide mb-4 shadow-sm'>
                            Admin Panel
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                            All Users
                        </h1>
                        <p className="text-lg text-gray-500 font-medium mt-2">View and manage all registered users.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <svg className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-transparent border-none text-gray-900 font-medium focus:ring-0 outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex p-1 bg-gray-100 rounded-[1.5rem] gap-1">
                        <button 
                            onClick={() => setFilterStatus('all')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                                filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilterStatus('verified')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                                filterStatus === 'verified' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-green-600'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${filterStatus === 'verified' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Verified
                        </button>
                        <button 
                            onClick={() => setFilterStatus('pending')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                                filterStatus === 'pending' ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-500 hover:text-yellow-600'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${filterStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                            Pending
                        </button>
                    </div>
                </div>

                {loading ? (
                    <Loading fullScreen={false} message="Fetching users..." size="medium" />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {currentUsers.map((user) => (
                                <div 
                                    key={user.id} 
                                    className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden" 
                                    onClick={() => router.push(`/admin/user/${user.id}`)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-900 truncate">{user.username}</h3>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                                                user.is_verified 
                                                ? 'bg-green-50 text-green-700 border border-green-100' 
                                                : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                {user.verification_status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center gap-3 text-sm group/item">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                  <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-600 font-medium truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm group/item">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                  <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-600 font-medium">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* View Details Button */}
                                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                                        <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            View Profile 
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {currentUsers.length === 0 && (
                                <div className="col-span-full bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                        🔍
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">No users found</p>
                                    <p className="text-gray-500 font-medium mt-2">Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination */}
                        {filteredUsers.length > usersPerPage && (
                            <div className="bg-white px-8 py-4 flex items-center justify-between border border-gray-100 rounded-2xl shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Showing <span className="text-gray-900">{(page - 1) * usersPerPage + 1}</span> to <span className="text-gray-900">{Math.min(page * usersPerPage, filteredUsers.length)}</span> of <span className="text-gray-900">{filteredUsers.length}</span> results
                                </p>
                                <div className="flex gap-2">
                                    <button 
                                       onClick={handlePrevPage}
                                       disabled={page === 1}
                                       className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                           page === 1 
                                           ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                                           : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                       }`}
                                   >
                                       &larr; Prev
                                    </button>
                                    <button 
                                       onClick={handleNextPage}
                                       disabled={page === totalPages}
                                       className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                           page === totalPages 
                                           ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                                           : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                       }`}
                                   >
                                       Next &rarr;
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllUsersPage;
