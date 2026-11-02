"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../components/common/Loading";
import liveCompanions from "../data/liveCompanions.json";

const AdminPanel = () => {
  const { token, userData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'companions'
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!token) return;
    
    // Basic role check
    if (userData && !['admin', 'superadmin'].includes(userData.role)) {
       router.push('/');
       return;
    }

    fetchUnverifiedUsers();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userData]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';

  const fetchUnverifiedUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/unverified`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
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
      // Update local state instead of removing
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, verificationStatus: status } : u
      ));
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error("Error verifying user", err);
      alert("Failed to update status");
    }
  };


  if(!token) return <Loading message="Authenticating..." />;



  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className='inline-block px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-bold tracking-wide mb-4 shadow-sm'>
              Admin Panel
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              User Verification
            </h1>
            <p className="text-lg text-gray-500 font-medium mt-2">Manage user verifications and onboarding.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative cursor-pointer mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-700 hover:text-black transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {stats?.pendingVerifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {stats.pendingVerifications}
                </span>
              )}
            </div>
            <button 
               onClick={() => router.push('/')}
               className="px-6 py-3 bg-white text-gray-700 font-bold rounded-full border border-gray-200 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all shadow-sm"
            >
              Home
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">New Signups Today</p>
                        <h3 className="text-5xl font-bold text-gray-900 tracking-tight">{stats.signupsToday}</h3>
                    </div>
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                    </div>
                </div>
                 <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Pending Verifications</p>
                        <h3 className="text-5xl font-bold text-gray-900 tracking-tight">{stats.pendingVerifications}</h3>
                    </div>
                    <div className="h-16 w-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                </div>
            </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>Pending Verifications</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('companions')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'companions'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>All Verified Companions</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'companions' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'
              }`}>
                {liveCompanions.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/all-users"
              className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-bold rounded-xl hover:bg-[#2A4F40] transition-colors shadow-sm"
            >
              Super Admin: All Users →
            </Link>
          </div>
        </div>

        {activeTab === 'companions' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                All Verified Companions in Database ({liveCompanions.length})
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                Includes all real database profiles and verified women companions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveCompanions.map((comp) => (
                <div key={comp.id || comp._id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={comp.profilePhoto || comp.profilePhotoUrl || '/mode-sit-with-me.png'} 
                        alt={comp.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-base text-gray-900 truncate">{comp.fullName}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-widest shrink-0">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate">@{comp.username} · {comp.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#1E3A2F]">₹{comp.pricePerHour}/hr</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-[11px] font-semibold text-amber-600">★ {comp.rating}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full ${comp.gender === 'woman' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                          {comp.gender === 'woman' ? 'Woman' : 'Man'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed font-normal">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(comp.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                    {(comp.tags || []).length > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-400">
                        +{(comp.tags || []).length - 3}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium truncate">
                      {comp.area ? `📍 ${comp.area}` : `📍 ${comp.city}`}
                    </span>
                    <Link
                      href={`/companions/${comp.id || comp._id}`}
                      target="_blank"
                      className="text-xs font-bold text-[#1E3A2F] hover:underline"
                    >
                      View Live →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col h-96">
                   <div className="h-48 w-full bg-gray-100"></div>
                   <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                      <div className="flex gap-3 mt-auto pt-4">
                         <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                         <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                      </div>
                   </div>
                </div>
             ))}
           </div>
        ) : users.length === 0 ? (
           <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
             <div className="mx-auto h-24 w-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 text-4xl">
               ✨
             </div>
             <h3 className="text-2xl font-bold text-gray-900 tracking-tight">All caught up!</h3>
             <p className="text-gray-500 font-medium mt-2">There are no pending user verifications at the moment.</p>
             <button
               onClick={() => setActiveTab('companions')}
               className="mt-6 px-6 py-3 bg-[#1E3A2F] text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-[#2A4F40] transition-all shadow-md"
             >
               View All {liveCompanions.length} Verified Companions →
             </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col group">
                {/* Image Section */}
                <div className="h-56 w-full bg-gray-100 relative overflow-hidden cursor-pointer" onClick={() => router.push(`/admin/user/${user.id}`)}>
                   {user.profilePhotoUrl || user.idProofFrontUrl ? (
                     /* eslint-disable-next-line @next/next/no-img-element */
                     <img 
                       src={user.profilePhotoUrl || user.idProofFrontUrl} 
                       alt="Verification" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50">
                       <span className="text-xs uppercase tracking-widest">No Image</span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <span className="bg-white/90 text-black px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">View Details</span>
                   </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{user.username}</h3>
                      <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border ${
                        user.verificationStatus === 'verified' ? 'bg-green-50 text-green-700 border-green-100' : 
                        user.verificationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                      {user.verificationStatus === 'verified' ? 'Verified' : user.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 font-bold mb-6 uppercase tracking-widest flex items-center gap-1">
                    <span>📅</span> Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>

                  <div className="mt-auto flex gap-3">
                    {user.verificationStatus === 'verified' || user.verificationStatus === 'rejected' ? (
                        <div className={`flex-1 py-3 ${user.verificationStatus === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border rounded-xl font-bold text-center text-xs uppercase tracking-widest`}>
                           {user.verificationStatus === 'verified' ? 'Verified' : 'Rejected'}
                        </div>
                    ) : (
                       <>
                         <button
                           onClick={() => handleVerify(user.id, 'verified')}
                           className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 transition-all text-xs uppercase tracking-widest"
                         >
                           Verify
                         </button>
                         <button
                           onClick={() => handleVerify(user.id, 'rejected')}
                           className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl font-bold hover:shadow-lg hover:shadow-red-50 hover:-translate-y-0.5 transition-all text-xs uppercase tracking-widest"
                         >
                           Reject
                         </button>
                       </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
