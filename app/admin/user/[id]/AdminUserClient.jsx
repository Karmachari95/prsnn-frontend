"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Loading from "../../../components/common/Loading";

const UserDetailsPage = ({ params }) => {
  const routeParams = useParams();
  const id = routeParams?.id || params?.id;
  const { token, userData } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    if (!token) return;
    if (userData && !['admin', 'superadmin'].includes(userData.role)) {
       router.push('/');
       return;
    }
    fetchUserDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      alert(`Failed to fetch user details: ${err.response?.data?.message || err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify/${id}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(prev => ({ ...prev, verification_status: status }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <Loading message="Loading user details..." />;
  if (!user) return <div className="h-screen flex items-center justify-center">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 text-gray-500 hover:text-black flex items-center gap-2 font-medium transition-colors">
            &larr; Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gray-900 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">{user.username}</h1>
                    <p className="text-gray-400 font-medium">{user.email}</p>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                    <div className={`px-5 py-2 rounded-full font-bold uppercase text-xs tracking-widest ${user.is_verified ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-900/20'}`}>
                        {user.verification_status}
                    </div>
                    {user.verifiedBy && (
                        <div className="text-right flex items-center gap-2 bg-gray-800/50 px-4 py-1.5 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Verified By</span>
                             <span className="font-bold text-blue-300 text-xs">{user.verifiedBy}</span>
                        </div>
                    )}
                </div>
            </div>

            {user.verification_status === 'not_submitted' && (
                <div className="mx-8 md:mx-12 mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div>
                        <p className="font-bold">Onboarding Not Completed</p>
                        <p className="text-xs text-amber-700 mt-0.5">This user created an account via sign-up but has not filled out or submitted the onboarding profile form yet.</p>
                    </div>
                </div>
            )}

            <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Verification Documents */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Verification Documents
                    </h3>
                    <div className="space-y-8">
                        {/* Front ID Proof */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Front ID Proof</label>
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 shadow-inner group">
                                {(user.idProofFrontUrl || user.profile?.idProofFrontUrl || user.profile?.frontAadharPhoto || user.profile?.front_aadhar_photo) ? (
                                    <div className="relative overflow-hidden rounded-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={user.idProofFrontUrl || user.profile?.idProofFrontUrl || user.profile?.frontAadharPhoto || user.profile?.front_aadhar_photo} 
                                            alt="Front ID" 
                                            className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                                            onClick={() => setEnlargedImage(user.idProofFrontUrl || user.profile?.idProofFrontUrl || user.profile?.frontAadharPhoto || user.profile?.front_aadhar_photo)}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 pointer-events-none transition-colors"></div>
                                    </div>
                                ) : (
                                    <div className="h-56 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        <span className="text-2xl mb-2 opacity-50">📄</span>
                                        <span className="text-xs font-medium">No Document Uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Back ID Proof */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Back ID Proof</label>
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 shadow-inner group">
                                {(user.idProofBackUrl || user.profile?.idProofBackUrl || user.profile?.backAadharPhoto || user.profile?.back_aadhar_photo) ? (
                                    <div className="relative overflow-hidden rounded-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={user.idProofBackUrl || user.profile?.idProofBackUrl || user.profile?.backAadharPhoto || user.profile?.back_aadhar_photo} 
                                            alt="Back ID" 
                                            className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                                            onClick={() => setEnlargedImage(user.idProofBackUrl || user.profile?.idProofBackUrl || user.profile?.backAadharPhoto || user.profile?.back_aadhar_photo)}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 pointer-events-none transition-colors"></div>
                                    </div>
                                ) : (
                                    <div className="h-56 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        <span className="text-2xl mb-2 opacity-50">📄</span>
                                        <span className="text-xs font-medium">No Document Uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Personal Details (from MongoDB) */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Profile Details
                    </h3>
                    
                    {user.profile ? (
                        <div className="space-y-8">
                            {/* Profile Photo & Basic Info */}
                            <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                                {user.profilePhotoUrl || user.profile_photo_url ? (
                                    <div className="relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={user.profilePhotoUrl || user.profile_photo_url} 
                                            alt="Profile" 
                                            className="w-24 h-24 rounded-[2rem] object-cover cursor-pointer shadow-md group-hover:shadow-lg transition-all" 
                                            onClick={() => setEnlargedImage(user.profilePhotoUrl || user.profile_photo_url)}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-[2rem] bg-gray-100 flex items-center justify-center text-3xl shadow-inner">👤</div>
                                )}
                                <div>
                                    <p className="font-bold text-2xl text-gray-900 tracking-tight">{user.profile?.fullName || user.fullName || user.username}</p>
                                    <p className="text-gray-400 text-sm font-medium">@{user.username}</p>
                                    <p className="text-gray-500 text-sm mt-1 bg-gray-50 px-3 py-1 rounded-full inline-block border border-gray-100">{user.email}</p>
                                </div>
                            </div>

                            {/* Detailed Information Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Full Name</label>
                                    <p className="font-bold text-gray-900">{user.profile?.fullName || user.fullName || 'Not provided'}</p>
                                </div>
                                
                                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Phone Number</label>
                                    <p className="font-bold text-gray-900">{user.profile?.phoneNumber || user.profile?.phone_number || user.phoneNumber || 'Not provided'}</p>
                                </div>

                                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Email Address</label>
                                    <p className="font-bold text-gray-900">{user.email}</p>
                                </div>

                                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Username</label>
                                    <p className="font-bold text-gray-900">@{user.username}</p>
                                </div>

                                {user.profile?.description && (
                                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Description</label>
                                        <p className="font-medium text-gray-700 leading-relaxed italic">&ldquo;{user.profile.description}&rdquo;</p>
                                    </div>
                                )}

                                {(user.profile?.pricePerHour || user.profile?.price_per_hour) && (
                                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Price Per Hour</label>
                                        <p className="font-bold text-gray-900">₹{user.profile.pricePerHour || user.profile.price_per_hour}</p>
                                    </div>
                                )}

                                {(user.profile?.startTime || user.profile?.start_time) && (
                                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Availability Time</label>
                                        <p className="font-bold text-gray-900">
                                            {user.profile.startTime || user.profile.start_time || 'N/A'} - {user.profile.endTime || user.profile.end_time || 'N/A'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100 text-green-800 text-sm flex items-center gap-3">
                                <span className="text-xl">📅</span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                        {user.verification_status === 'not_submitted' ? 'Registered On' : 'Submission Date'}
                                    </p>
                                    <p className="font-bold">{new Date(user.profile.createdAt || user.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 bg-gray-50 text-gray-500 rounded-3xl border border-gray-100 text-center">
                            <span className="text-4xl opacity-30 block mb-2">🤷‍♂️</span>
                            <p className="font-medium">User has not completed their profile onboarding yet.</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {user.verification_status === 'pending' ? (
                        <div className="mt-12 flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => handleVerify('verified')}
                                className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
                            >
                                Accept & Verify
                            </button>
                            <button 
                                onClick={() => handleVerify('rejected')}
                                className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-bold rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
                            >
                                Reject User
                            </button>
                        </div>
                    ) : (
                        <div className={`mt-10 p-6 rounded-2xl text-center font-bold text-sm uppercase tracking-widest border ${user.verification_status === 'verified' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            {user.verification_status === 'verified' ? '✅ This user is verified' : '❌ This user was rejected'}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Image Enlargement Modal */}
        {enlargedImage && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <div className="relative max-w-6xl w-full flex flex-col items-center">
              <button 
                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors text-xl font-bold uppercase tracking-widest flex items-center gap-2"
                onClick={() => setEnlargedImage(null)}
              >
                Close ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={enlargedImage} 
                alt="Enlarged view" 
                className="w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsPage;
