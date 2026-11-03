"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Loading from "../../../components/common/Loading";

const AdminDetailsPage = ({ params }) => {
  const routeParams = useParams();
  const rawId = routeParams?.id || params?.id;

  // Extract effective ID even if served via default/index.html SPA fallback
  const getEffectiveId = () => {
    let adminId = rawId;
    if (typeof window !== 'undefined' && (!adminId || adminId === 'default')) {
      const cleanPath = window.location.pathname.replace(/\/$/, '');
      const parts = cleanPath.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last !== 'admin') {
        adminId = last.replace('.html', '');
      }
    }
    return adminId || 'default';
  };

  const id = getEffectiveId();
  const { token, userData } = useAuth();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!activeToken) return;
    if (userData && userData.role !== 'superadmin') {
       router.push('/admin');
       return;
    }
    if (id && id !== 'default') {
      fetchAdminDetails(activeToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id, userData]);

  const fetchAdminDetails = async (activeToken) => {
    const authToken = activeToken || token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!authToken || !id || id === 'default') return;

    try {
      // Re-using the getUserDetails endpoint which now supports admins too
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setAdmin(res.data);
    } catch (err) {
      console.error("Error fetching admin details:", err);
      // Suppress alert, UI will show "Admin not found"
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-admin/${id}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Admin ${status} successfully`);
      router.push('/super-admin/admins?status=unverified');
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  if (loading) return <Loading message="Loading details..." />;
  if (!admin) return <div className="h-screen flex items-center justify-center">Admin not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.push('/super-admin/admins')} className="mb-6 text-gray-500 hover:text-black flex items-center gap-2">
            &larr; Back to List
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-black p-8 text-white flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{admin.username}</h1>
                    <p className="text-gray-400">{admin.email}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold uppercase text-sm ${admin.is_verified ? 'bg-green-500 text-black' : 'bg-yellow-400 text-black'}`}>
                    {admin.verification_status}
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left: Verification Documents */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Admin Verification Document</h3>
                    <div className="bg-gray-100 rounded-xl p-2 border border-gray-200">
                        {admin.profile?.frontAadharPhoto ? (
                             /* eslint-disable-next-line @next/next/no-img-element */
                             <img 
                                src={admin.profile.frontAadharPhoto} 
                                alt="Verification Doc" 
                                className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setEnlargedImage(admin.profile.frontAadharPhoto)}
                             />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400 font-bold">
                                {admin.profile ? "No Document Uploaded" : "Onboarding Not Submitted"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Personal Details (from MongoDB) */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Admin Profile</h3>
                    {admin.profile ? (
                        <div className="space-y-6">
                             {/* Profile Photo & Basic Info */}
                             <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                {admin.profilePhotoUrl || admin.profile_photo_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img 
                                        src={admin.profilePhotoUrl || admin.profile_photo_url} 
                                        alt="Profile" 
                                        className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                        onClick={() => setEnlargedImage(admin.profilePhotoUrl || admin.profile_photo_url)}
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
                                )}
                                <div className="flex-1">
                                    <p className="font-bold text-2xl text-gray-900">{admin.profile?.fullName || admin.fullName || admin.username}</p>
                                    <p className="text-gray-500 text-sm">@{admin.username}</p>
                                    <p className="text-gray-600 mt-1">{admin.email}</p>
                                </div>
                             </div>

                             {/* Detailed Information Grid */}
                             <div className="grid grid-cols-1 gap-4">
                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                     <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Full Name</label>
                                     <p className="font-semibold text-gray-900">{admin.profile?.fullName || admin.fullName || 'Not provided'}</p>
                                 </div>
                                 
                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                     <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Phone Number</label>
                                     <p className="font-semibold text-gray-900">{admin.profile?.phoneNumber || admin.phoneNumber || 'Not provided'}</p>
                                 </div>

                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                     <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Email Address</label>
                                     <p className="font-semibold text-gray-900">{admin.email}</p>
                                 </div>

                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                     <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Username</label>
                                     <p className="font-semibold text-gray-900">@{admin.username}</p>
                                 </div>

                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                     <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Role</label>
                                     <p className="font-semibold text-gray-900 capitalize">{admin.role}</p>
                                 </div>
                             </div>

                             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                                 <strong>Submission Date:</strong> {new Date(admin.profile.createdAt || admin.created_at).toLocaleDateString('en-US', { 
                                     year: 'numeric', 
                                     month: 'long', 
                                     day: 'numeric',
                                     hour: '2-digit',
                                     minute: '2-digit'
                                 })}
                             </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100">
                            Admin has not completed their onboarding profile yet.
                        </div>
                    )}

                    {/* Action Buttons */}
                    {/* Action Buttons - Only if pending */}
                    {admin.verification_status === 'pending' ? (
                        <div className="mt-10 flex gap-4">
                            <button 
                                onClick={() => handleVerify('verified')}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all"
                            >
                                ✓ APPROVE ADMIN
                            </button>
                            <button 
                                onClick={() => handleVerify('rejected')}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all"
                            >
                                ✕ REJECT
                            </button>
                        </div>
                    ) : (
                        <div className={`mt-10 p-6 rounded-xl text-center font-black text-xl border-2 ${admin.verification_status === 'verified' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
                            {admin.verification_status === 'verified' ? '✅ ADMIN VERIFIED' : '❌ ADMIN REJECTED'}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Image Enlargement Modal */}
        {enlargedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <div className="relative max-w-6xl max-h-[90vh]">
              <button 
                className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300"
                onClick={() => setEnlargedImage(null)}
              >
                ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={enlargedImage} 
                alt="Enlarged view" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDetailsPage;
