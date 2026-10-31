"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../components/common/Loading';
import { useNotification } from '../context/NotificationContext';
import cachedFetch, { clearCache } from '../utils/cache';

/**
 * Profile Page with Edit Functionality
 */
const Profile = () => {
    const { userData, logout, fetchProfile: fetchAuthProfile } = useAuth();
    const router = useRouter();
    const { showNotification } = useNotification();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        gender: 'prefer_not_to_say',
        genderPreference: 'women_only',
        genderConsentAcknowledged: false,
        city: '',
        area: '',
        description: '',
        pricePerHour: '',
    });

    useEffect(() => {
        if (userData) {
            fetchProfile();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await cachedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setProfileData(data);
            
            // Initialize form data
            setFormData({
                username: data.username || userData.username || '',
                displayName: data.displayName || data.username || userData.displayName || '',
                email: data.email || userData.email || '',
                fullName: data.fullName || '',
                phoneNumber: data.phoneNumber || '',
                gender: data.gender || 'prefer_not_to_say',
                genderPreference: data.genderPreference || (data.gender === 'woman' ? 'women_only' : 'any'),
                genderConsentAcknowledged: Boolean(data.genderConsentAcknowledged),
                city: data.city || '',
                area: data.area || '',
                description: data.description || '',
                pricePerHour: data.pricePerHour || '',
                startTime: data.startTime || '',
                endTime: data.endTime || '',
                tags: data.tags ? (Array.isArray(data.tags) ? data.tags.join(', ') : data.tags) : '',
                // Availability - fix mapping from object
                monday_availability: data.availability?.monday || false,
                tuesday_availability: data.availability?.tuesday || false,
                wednesday_availability: data.availability?.wednesday || false,
                thursday_availability: data.availability?.thursday || false,
                friday_availability: data.availability?.friday || false,
                saturday_availability: data.availability?.saturday || false,
                sunday_availability: data.availability?.sunday || false,
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'phoneNumber') {
            const cleanDigits = value.replace(/\D/g, '');
            if (value && (cleanDigits.length < 7 || cleanDigits.length > 15)) {
                setPhoneError('Please enter a valid phone number (7-15 digits)');
            } else {
                setPhoneError('');
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showNotification('error', 'Image size must be less than 2MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('error', 'Only JPG, PNG and WEBP formats are allowed');
            return;
        }

        setUploadingPhoto(true);
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('profilePhoto', file);
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSubmit
            });

            if (response.ok) {
                clearCache();
                
                const updatedDataRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                     headers: { 'Authorization': `Bearer ${token}` }
                });
                const updatedData = await updatedDataRes.json();
                
                setProfileData(prev => ({
                    ...prev,
                    profilePhotoUrl: updatedData.profilePhotoUrl
                }));
                
                if (fetchAuthProfile) {
                     fetchAuthProfile(token, userData);
                }

                showNotification('success', 'Profile photo updated successfully!');
            } else {
                const error = await response.json();
                showNotification('error', `Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating profile photo:', error);
            showNotification('error', 'Failed to update profile photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async () => {
        const cleanPhone = (formData.phoneNumber || '').replace(/\D/g, '');
        if (formData.phoneNumber && (cleanPhone.length < 7 || cleanPhone.length > 15)) {
            showNotification('error', "Please enter a valid phone number (7 to 15 digits)");
            return;
        }

        if (formData.gender === 'woman' && formData.genderPreference === 'any' && !formData.genderConsentAcknowledged) {
            showNotification('error', "Please confirm the safety consent notice to match with companions of any gender.");
            return;
        }

        // Validate Price
        if (formData.pricePerHour) {
            const price = Number(formData.pricePerHour);
            if (isNaN(price) || price < 1 || price > 1000) {
                showNotification('error', "Hourly rate must be between ₹1 and ₹1000.");
                return;
            }
        }

        // Validate Time (09:00 to 21:00)
        const validateTime = (t) => {
            if (!t) return false;
            const hour = parseInt(t.split(':')[0], 10);
            const minute = parseInt(t.split(':')[1], 10);
            const timeInMins = hour * 60 + minute;
            const startLimit = 9 * 60; // 09:00
            const endLimit = 21 * 60;  // 21:00
            
            return timeInMins >= startLimit && timeInMins <= endLimit;
        };

        if (formData.startTime && !validateTime(formData.startTime)) {
            showNotification('error', "Start time must be between 9:00 AM and 9:00 PM.");
            return;
        }
        if (formData.endTime && !validateTime(formData.endTime)) {
            showNotification('error', "End time must be between 9:00 AM and 9:00 PM.");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Clear cache for profile and companions (if user is a companion)
                clearCache();
                
                await fetchProfile();
                setIsEditing(false);
                showNotification('success', 'Profile updated successfully!', 'Profile Saved');
            } else {
                const error = await response.json();
                showNotification('error', `Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (!userData || loading) {
        return <Loading message="Loading profile..." />;
    }

    const isCompanion = userData?.role === 'companion' || profileData?.role === 'companion' || profileData?.companionProfile;

    return (
        <div className="w-full min-h-screen pt-28 md:pt-36 pb-20 px-4 md:px-8 bg-[#FAF8F5] text-[#181B18]">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-3 border border-[#1E3A2F]/15">
                        <span className="w-2 h-2 rounded-full bg-[#D97757]" />
                        <span>Member Portal</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-5xl font-black text-[#181B18] tracking-tight">
                        My Dashboard
                    </h1>
                    <p className="text-[#181B18]/60 font-medium text-sm md:text-base mt-1">
                        Welcome back, <span className="font-bold text-[#1E3A2F]">{userData.username}</span>
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Left Column: Profile Card */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white border border-[#EAE6DF] rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                             {/* Decorative Background */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-[#FDF1EC] rounded-full blur-3xl opacity-70 transform translate-x-10 -translate-y-10"></div>

                             <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md mb-6 overflow-hidden relative group/photo">
                                    <Image 
                                        src={profileData?.profilePhotoUrl || "/profile_pic.png"} 
                                        alt="Profile" 
                                        fill
                                        className="object-cover"
                                    />
                                    <label className="absolute inset-0 bg-[#1E3A2F]/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer">
                                        <span className="text-white text-xs font-bold text-center px-2">
                                            {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                                        </span>
                                        <input 
                                            type="file" 
                                            accept="image/jpeg, image/png, image/webp" 
                                            className="hidden" 
                                            onChange={handlePhotoChange}
                                            disabled={uploadingPhoto}
                                        />
                                    </label>
                                </div>
                                
                                {!isEditing ? (
                                    <>
                                        <h2 className="font-display text-2xl font-bold text-[#181B18] tracking-tight mb-1">
                                            {formData.displayName || formData.username}
                                        </h2>
                                        <p className="text-xs font-semibold text-[#181B18]/60 bg-[#FAF8F5] border border-[#EAE6DF] px-3.5 py-1 rounded-full mb-4">
                                            {userData.email}
                                        </p>
                                        {isCompanion && (
                                            <span className="text-[10px] bg-[#E8EFE9] text-[#1E3A2F] px-3.5 py-1 rounded-full font-bold uppercase tracking-widest mb-6 border border-[#1E3A2F]/15">
                                                VERIFIED COMPANION
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full mb-6">
                                        <h2 className="font-display text-2xl font-bold text-[#181B18] tracking-tight mb-1">
                                            {formData.username}
                                        </h2>
                                        <p className="text-xs font-semibold text-[#181B18]/60 bg-[#FAF8F5] border border-[#EAE6DF] px-3.5 py-1 rounded-full">
                                            {userData.email}
                                        </p>
                                    </div>
                                )}

                                <div className="w-full space-y-3 mt-2">
                                    {!isEditing ? (
                                        <>
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="w-full py-3 bg-[#1E3A2F] text-white font-bold rounded-full hover:bg-[#152a22] transition-all text-xs uppercase tracking-wider shadow-sm"
                                            >
                                                Edit Profile
                                            </button>
                                            <button 
                                                onClick={logout}
                                                className="w-full py-2.5 bg-white text-[#D97757] font-bold rounded-full border border-[#D97757]/30 hover:bg-[#FDF1EC] transition-all text-xs uppercase tracking-wider"
                                            >
                                                Log Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="w-full py-3 bg-[#1E3A2F] text-white font-bold rounded-full hover:bg-[#152a22] transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-sm"
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    fetchProfile();
                                                }}
                                                className="w-full py-2.5 bg-white text-[#181B18]/60 font-bold rounded-full border border-[#EAE6DF] hover:bg-[#FAF8F5] transition-all text-xs uppercase tracking-wider"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* Quick Stats */}
                        {isCompanion && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 text-center shadow-sm">
                                    <span className="block font-display text-2xl font-black text-[#1E3A2F] mb-0.5">0</span>
                                    <span className="text-[10px] font-bold uppercase text-[#181B18]/45 tracking-wider">Bookings</span>
                                </div>
                                <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 text-center shadow-sm">
                                    <span className="block font-display text-2xl font-black text-[#D97757] mb-0.5">5.0</span>
                                    <span className="text-[10px] font-bold uppercase text-[#181B18]/45 tracking-wider">Rating</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Content/Activity */}
                    <div className="w-full md:w-2/3 space-y-6">

                        {/* Profile Details - Visible for ALL users */}
                        <div className="bg-white border border-[#EAE6DF] rounded-[2rem] p-7 md:p-8 shadow-sm">
                            <h3 className="font-bold text-xs uppercase tracking-widest text-[#1E3A2F] mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#D97757]"></span>
                                {isCompanion ? 'Companion Details' : 'Profile Details'}
                            </h3>
                            
                            {!isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-1 block">Display Name</label>
                                            <p className="font-display font-bold text-base text-[#181B18] border-b border-[#EAE6DF] pb-2">{formData.displayName || formData.username || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-1 block">Full Name (Private)</label>
                                            <p className="font-display font-bold text-base text-[#181B18] border-b border-[#EAE6DF] pb-2">{formData.fullName || 'Not set'}</p>
                                        </div>
                                         <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-1 block">Email</label>
                                            <p className="font-medium text-base text-[#181B18] border-b border-[#EAE6DF] pb-2">{formData.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-1 block">Phone</label>
                                            <p className="font-medium text-base text-[#181B18] border-b border-[#EAE6DF] pb-2">{formData.phoneNumber || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-1 block">City</label>
                                            <p className="font-medium text-base text-[#181B18] border-b border-[#EAE6DF] pb-2">{formData.city || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-1 block">Area</label>
                                            <p className="font-medium text-base text-[#181B18] border-b border-[#EAE6DF] pb-2">{formData.area || 'Not set'}</p>
                                        </div>
                                    </div>
                                    
                                    {isCompanion && (
                                        <>
                                             <div className="pt-2">
                                                 <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest mb-2 block">Description</label>
                                                 <p className="text-sm text-[#181B18]/75 leading-relaxed bg-[#FAF8F5] border border-[#EAE6DF] p-4 rounded-2xl italic">{formData.description || 'No description'}</p>
                                             </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                name="displayName"
                                                value={formData.displayName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                placeholder="Name shown on PRSNN"
                                            />
                                            <p className="text-[11px] text-gray-400 mt-1">This is the only name other users will see.</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Full Name (Legal ID)</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                placeholder="Your full legal name"
                                            />
                                            <p className="text-[11px] text-gray-400 mt-1">Kept confidential for verification.</p>
                                        </div>
                                         <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Email <span className="text-[10px] text-gray-300 ml-1">(Read only)</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-100 bg-white text-gray-400 rounded-xl text-sm cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                placeholder="Phone with country code"
                                                maxLength={16}
                                            />
                                            {phoneError && <p className="text-xs text-red-500 font-bold mt-1">{phoneError}</p>}
                                        </div>
                                         <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Area</label>
                                            <input
                                                type="text"
                                                name="area"
                                                value={formData.area}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                placeholder="Area/Locality"
                                            />
                                        </div>
                                    </div>
                                    
                                    {isCompanion && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Description</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                    placeholder="About yourself..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Matching Preferences & Safety */}
                        <div className="bg-white border border-[#EAE6DF] rounded-[2rem] p-7 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-[#1E3A2F] flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#D97757] rounded-full"></span>
                                    Safety & Matching Preferences
                                </h3>
                                <a href="/safety" className="text-xs font-bold text-[#D97757] hover:underline">
                                    View Safety Standards →
                                </a>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE6DF]">
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest block mb-1">Your Gender</label>
                                            <p className="font-display font-bold text-base text-[#181B18] capitalize">
                                                {formData.gender === 'woman' ? 'Woman' : formData.gender === 'man' ? 'Man' : formData.gender === 'non_binary' ? 'Non-binary' : 'Prefer not to say'}
                                            </p>
                                        </div>
                                        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE6DF]">
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest block mb-1">Matching Preference</label>
                                            <p className="font-display font-bold text-base text-[#181B18]">
                                                {formData.genderPreference === 'women_only' ? 'Women companions only' : 'Companions of any gender'}
                                            </p>
                                        </div>
                                    </div>
                                    {formData.genderPreference === 'women_only' && (
                                        <div className="bg-[#E8EFE9] border border-[#1E3A2F]/15 rounded-2xl p-4 text-xs text-[#1E3A2F] font-medium">
                                            🔒 Women-only matching is active. You will only be matched with verified women companions.
                                        </div>
                                    )}

                                    {/* Women's Safety First Note */}
                                    <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#1E3A2F]/15 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E3A2F]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]" />
                                                <span>Women&apos;s Safety First</span>
                                            </div>
                                            <a
                                                href="/settings/preferences"
                                                className="text-xs font-bold text-[#1E3A2F] hover:underline flex items-center gap-1"
                                            >
                                                Change Preference →
                                            </a>
                                        </div>
                                        <p className="text-xs leading-relaxed text-[#181B18]/80 font-medium">
                                            We put women&apos;s safety on top priority. By default, you will receive bookings from women companions only. You can optionally choose to accept bookings from people of any gender with your clear consent.
                                        </p>
                                        <p className="text-xs leading-relaxed text-[#1E3A2F] font-semibold bg-white/70 p-2 rounded-xl border border-[#1E3A2F]/10">
                                            ✨ You have a completely free hand to change or update this preference anytime whenever you want from <a href="/settings/preferences" className="underline font-bold">Settings → Preferences → Change Gender</a>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                            >
                                                <option value="woman">Woman</option>
                                                <option value="man">Man</option>
                                                <option value="non_binary">Non-binary</option>
                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Who would you feel comfortable booking?</label>
                                            <select
                                                name="genderPreference"
                                                value={formData.genderPreference}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        genderPreference: val,
                                                        genderConsentAcknowledged: val === 'women_only' ? false : prev.genderConsentAcknowledged
                                                    }));
                                                }}
                                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                            >
                                                <option value="women_only">Women companions only (selected by default)</option>
                                                <option value="any">Companions of any gender (optional)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Women's Safety First Note */}
                                    <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#1E3A2F]/15 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E3A2F]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]" />
                                            <span>Women&apos;s Safety First</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-[#181B18]/80 font-medium">
                                            We put women&apos;s safety on top priority. By default, you will receive bookings from women companions only. You can optionally choose to accept bookings from people of any gender with your clear consent. And you can change preferences anytime from settings → preferences → change gender.
                                        </p>
                                    </div>

                                    {formData.genderPreference === 'any' && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">⚠️</span>
                                                <div className="text-xs text-amber-900 leading-relaxed font-medium">
                                                    <strong>Affirmative Consent Notice:</strong> I understand that opting into matching with companions of any gender means I may be matched with male or non-binary companions. I confirm that I am comfortable with this preference and that all bookings remain subject to PRSNN&apos;s safety guidelines and Boundaries Agreement.
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-3 pt-2 border-t border-amber-200/60 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="genderConsentAcknowledged"
                                                    checked={formData.genderConsentAcknowledged}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-gray-900 rounded border-amber-400 focus:ring-black"
                                                />
                                                <span className="text-xs font-bold text-amber-950">
                                                    I understand and confirm this preference.
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notification Banner - Restrict to regular users who aren't companions yet */}
                        {(!isCompanion && userData.role === 'user' && !userData.is_verified) && (
                            <div className="bg-gradient-to-r from-[#1E3A2F] to-[#2A4F40] text-white p-8 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-[#1E3A2F]">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                                        Join PRSNN
                                    </div>
                                    <h3 className="font-display font-black text-xl md:text-2xl text-white mb-1">
                                        Want to become a companion?
                                    </h3>
                                    <p className="text-xs md:text-sm text-white/80 max-w-md leading-relaxed">
                                        Provide calm presence, explore local spots, and earn flexibly under strict daylight & safety guidelines.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => router.push('/onboarding')}
                                    className="px-6 py-3 bg-[#D97757] text-white font-bold rounded-full hover:bg-[#C26243] shadow-md transition-all text-xs uppercase tracking-wider shrink-0"
                                >
                                    Become a Companion →
                                </button>
                            </div>
                        )}
                        
                        {/* If they ARE a companion, show helpful status card */}
                        {isCompanion && (
                             <div className="bg-[#E8EFE9] border border-[#1E3A2F]/15 p-6 rounded-[2rem] flex items-start gap-4">
                                <span className="text-2xl">🌿</span>
                                <div>
                                    <h3 className="font-display font-bold text-base text-[#1E3A2F] mb-1">Presence without pressure</h3>
                                    <p className="text-xs text-[#1E3A2F]/80 leading-relaxed font-medium">
                                        Keep your city, hourly rate, and active daytime hours accurate. All bookings follow PRSNN&apos;s 7 AM – 10 PM daylight window and Boundaries Charter.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Availability & Settings (Companion Only) */}
                        {isCompanion && (
                            <div className="bg-white border border-[#EAE6DF] rounded-[2rem] p-7 md:p-8 shadow-sm">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-[#1E3A2F] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#1E3A2F] rounded-full"></span>
                                    Rate & Availability
                                </h3>

                                {!isEditing ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE6DF]">
                                                <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest block mb-1">Hourly Rate</label>
                                                <p className="font-display font-black text-3xl text-[#1E3A2F]">₹{formData.pricePerHour || '0'}<span className="text-xs font-normal text-[#181B18]/50">/hr</span></p>
                                            </div>
                                            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE6DF]">
                                                <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest block mb-1">Active Hours</label>
                                                <p className="font-display font-bold text-lg text-[#181B18] mt-1">{formData.startTime || '07:00'} - {formData.endTime || '22:00'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-[#181B18]/45 uppercase tracking-widest block mb-3">Weekly Schedule</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                    <span 
                                                        key={day}
                                                        className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                                                            formData[`${day.toLowerCase()}_availability`] 
                                                            ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]' 
                                                            : 'bg-[#FAF8F5] text-[#181B18]/30 border-[#EAE6DF]'
                                                        }`}
                                                    >
                                                        {day.slice(0,3)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Tags</label>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.tags ? formData.tags.split(',').map((tag, i) => (
                                                    <span key={i} className="text-xs font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-full border border-gray-200">
                                                        {tag.trim()}
                                                    </span>
                                                )) : <span className="text-gray-400 text-sm">No tags set</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Price per Hour (₹)</label>
                                                <input
                                                    type="number"
                                                    name="pricePerHour"
                                                    value={formData.pricePerHour}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-4 border border-gray-200 bg-gray-50 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                />
                                            </div>
                                            <div>
                                                 <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tags (comma separated)</label>
                                                 <input
                                                    type="text"
                                                    name="tags"
                                                    value={formData.tags}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-4 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                                    placeholder="e.g. Movies, Silent Sitting"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Start Time</label>
                                                <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">End Time</label>
                                                <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Available Days</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                    <label key={day} className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-all ${
                                                        formData[`${day.toLowerCase()}_availability`]
                                                        ? 'bg-black border-black text-white shadow-lg shadow-gray-200'
                                                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                                                    }`}>
                                                        <input
                                                            type="checkbox"
                                                            name={`${day.toLowerCase()}_availability`}
                                                            checked={formData[`${day.toLowerCase()}_availability`]}
                                                            onChange={handleInputChange}
                                                            className="hidden"
                                                        />
                                                        <span className="text-xs font-bold">{day.slice(0,3)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
