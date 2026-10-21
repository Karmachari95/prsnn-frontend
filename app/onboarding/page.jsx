"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Loading from "../components/common/Loading";
import { useNotification } from "../context/NotificationContext";

const OnboardingContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams?.get('role');
    const { token, userData, fetchProfile } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [pageStatus, setPageStatus] = useState('loading');
    const [userChoice, setUserChoice] = useState(null); // 'companion' or 'basic'
    const [step, setStep] = useState(1);
    const [phoneError, setPhoneError] = useState('');

    // Prominent Indian Cities List
    const indianCities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", 
        "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", 
        "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", 
        "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", 
        "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", 
        "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", 
        "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
        "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad",
        "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh", "Tiruppur", "Gurgaon",
        "Moradabad", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Dehradun"
    ].sort();
    
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        city: '', 
        area: '', // Added area field
        profilePhoto: null,
        // Companion-specific fields
        backupPhoto: null,
        idProofFront: null,
        idProofBack: null,
        description: '',
        monday_availability: false,
        tuesday_availability: false,
        wednesday_availability: false,
        thursday_availability: false,
        friday_availability: false,
        saturday_availability: false,
        sunday_availability: false,
        startTime: '',
        endTime: '',
        pricePerHour: '',
        tags: [],
        agreedToPolicy: false
    });

    const [previews, setPreviews] = useState({
        profilePhoto: null,
        backupPhoto: null,
        idProofFront: null,
        idProofBack: null
    });

    const [extraConsents, setExtraConsents] = useState({
        noEntertainment: false,
        silence: false,
        noFixing: false
    });

    const daysOfWeek = [
        { key: 'monday_availability', label: 'Monday' },
        { key: 'tuesday_availability', label: 'Tuesday' },
        { key: 'wednesday_availability', label: 'Wednesday' },
        { key: 'thursday_availability', label: 'Thursday' },
        { key: 'friday_availability', label: 'Friday' },
        { key: 'saturday_availability', label: 'Saturday' },
        { key: 'sunday_availability', label: 'Sunday' }
    ];

    const availableTags = [
        "Don't Go Alone", "Sit With Me", "Be Around", "Explore Together"
    ];
    
    const tagIcons = {
        "Don't Go Alone": '🛡️',
        "Sit With Me": '🪑',
        "Be Around": '🛋️',
        "Explore Together": '🧭'
    };

    const modeTags = {
        "Don't Go Alone": ['Plus One', 'Cafe Hopping', 'Event Companion', 'Shopping', 'Waiting Room'],
        "Sit With Me": ['Silence', 'Sitting', 'Body Doubling', 'Study Buddy', 'Work Companion', 'Reading'],
        "Be Around": ['Just Presence', 'Quiet', 'Homebody', 'Gaming', 'Movie Watcher'],
        "Explore Together": ['Walking', 'Sightseeing', 'Photography', 'Foodie', 'Urban Hiking']
    };

    useEffect(() => {
        if (!token) {
            router.push('/');
            return;
        }

        if (userData?.role === 'superadmin') {
            router.push('/super-admin');
            return;
        }
        if (userData?.role === 'admin') {
            router.push('/admin');
            return;
        }

        if (roleParam === 'companion' || userData?.role === 'companion') {
            setUserChoice('companion');
        }

        checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userData, router, roleParam]);

    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                fullName: prev.fullName || userData.fullName || '',
                phoneNumber: prev.phoneNumber || userData.phoneNumber || ''
            }));
        }
    }, [userData]);

    const checkOnboardingStatus = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/check`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.data.hasProfile) {
                setPageStatus('none');
            } else {
                setPageStatus(res.data.status);
            }
        } catch {
            // No profile yet, continue onboarding
            setPageStatus('none');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'phoneNumber') {
            if (!/^\d{0,10}$/.test(value)) {
                return; // Prevent entering non-digits or more than 10 digits if you want strict control, or just validate
            }
            if (value.length !== 10) {
                setPhoneError('Invalid mobile number');
            } else {
                setPhoneError('');
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const currentTags = prev.tags || [];
            if (currentTags.includes(tag)) {
                return { ...prev, tags: currentTags.filter(t => t !== tag) };
            } else {
                return { ...prev, tags: [...currentTags, tag] };
            }
        });
    };

    const handleSelectAllSubTags = (mainTag) => {
        const subTags = modeTags[mainTag];
        setFormData(prev => {
            const currentTags = prev.tags || [];
            const allSelected = subTags.every(t => currentTags.includes(t));
            
            if (allSelected) {
                // Deselect all
                return { ...prev, tags: currentTags.filter(t => !subTags.includes(t)) };
            } else {
                // Select all missing
                const newTags = new Set([...currentTags, ...subTags]);
                return { ...prev, tags: Array.from(newTags) };
            }
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [type]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBasicSubmit = async (e) => {
        e.preventDefault();
        
        if (phoneError || formData.phoneNumber.length !== 10) {
            showNotification('error', "Please enter a valid 10-digit mobile number");
            return;
        }
        
        if (!formData.agreedToPolicy) {
            alert("Please agree to the terms and conditions");
            return;
        }
        
        try {
            setLoading(true);
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('city', formData.city);
            data.append('area', formData.area);
            if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);

            // Submit as basic user (not companion)
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/onboard-basic`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });

            // Refresh user profile to update status
            await fetchProfile(token, userData);

            // Redirect to home since basic users are automatically verified
            router.push('/');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to create profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCompanionSubmit = async (e) => {
        e.preventDefault();

        if (phoneError || formData.phoneNumber.length !== 10) {
            showNotification('error', "Please enter a valid 10-digit mobile number");
            return;
        }

        if (!extraConsents.noEntertainment || !extraConsents.silence || !extraConsents.noFixing) {
            showNotification('error', "You must agree to all the strict conditions to apply.");
            return;
        }
        
        if (!formData.agreedToPolicy) {
            showNotification('error', "Please agree to the terms and policy");
            return;
        }

        if (formData.description.length > 1000) {
            showNotification('error', "Description must be less than 1000 characters");
            return;
        }

        const price = Number(formData.pricePerHour);
        if (isNaN(price) || price < 1 || price > 1000) {
            showNotification('error', "Hourly rate must be between ₹1 and ₹1000.");
            return;
        }

        // Validate Time (09:00 to 21:00)
        const validateTime = (t) => {
            if (!t) return false;
            const hour = parseInt(t.split(':')[0], 10);
            const minute = parseInt(t.split(':')[1], 10);
            
            // Convert to minutes for easier range check
            const timeInMins = hour * 60 + minute;
            const startLimit = 9 * 60; // 09:00 -> 540
            const endLimit = 21 * 60;  // 21:00 -> 1260
            
            return timeInMins >= startLimit && timeInMins <= endLimit;
        };

        if (!validateTime(formData.startTime) || !validateTime(formData.endTime)) {
            showNotification('error', "Availability must be between 9:00 AM and 9:00 PM.");
            return;
        }

        const hasAvailability = daysOfWeek.some(day => formData[day.key]);
        if (!hasAvailability) {
            showNotification('error', "Please select at least one availability day");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('city', formData.city);
            data.append('area', formData.area);
            data.append('description', formData.description);
            data.append('startTime', formData.startTime);
            data.append('endTime', formData.endTime);
            data.append('pricePerHour', formData.pricePerHour);
            data.append('agreedToPolicy', formData.agreedToPolicy);
            data.append('tags', JSON.stringify(formData.tags));
            
            // Day-wise availability
            daysOfWeek.forEach(day => {
                data.append(day.key, formData[day.key]);
            });
            
            if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);
            if (formData.backupPhoto) data.append('backupPhoto', formData.backupPhoto);
            if (formData.idProofFront) data.append('idProofFront', formData.idProofFront);
            if (formData.idProofBack) data.append('idProofBack', formData.idProofBack);

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/onboard-companion`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });

            // Refresh user profile to update status
            await fetchProfile(token, userData);

            // Instead of redirecting home, show pending screen
            setPageStatus('pending');
            window.scrollTo(0, 0);
        } catch (err) {
            console.error(err);
            showNotification('error', err.response?.data?.message || "Failed to submit profile");
        } finally {
            setLoading(false);
        }
    };

    if (!token || pageStatus === 'loading') return <Loading message="Checking status..." />;

    if (pageStatus === 'verified') {
        return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl max-w-lg w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>
                  
                  <div className="mx-auto h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-8 relative z-10 animate-bounce-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Verified</h1>
                  <p className="text-gray-500 font-medium mb-8 leading-relaxed text-lg">
                    Your profile is complete and verified! <br/>
                    You can now use all features of the platform.
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full w-full"></div>
                  </div>
                  <button onClick={() => router.push('/')} className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      Return Home
                  </button>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-8">Status: Under Review</p>
                </div>
              </div>
        );
    }

    if (pageStatus === 'pending') {
        return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl max-w-lg w-full relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl opacity-50 -ml-10 -mt-10"></div>

                  <div className="mx-auto h-24 w-24 bg-yellow-50 rounded-full flex items-center justify-center mb-8 relative z-10 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10 text-yellow-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Verification Pending</h1>
                  <p className="text-gray-500 font-medium mb-8 leading-relaxed text-lg">
                    Your application is currently being reviewed by our team.
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full w-1/2 animate-loading"></div>
                  </div>
                  <button onClick={() => router.push('/')} className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      Return Home
                  </button>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-8">Status: Under Review</p>
                </div>
              </div>
        );
    }

    if (pageStatus === 'rejected') {
        return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl max-w-lg w-full relative overflow-hidden">
                   <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-50 -mr-10 -mb-10"></div>

                  <div className="mx-auto h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mb-8 relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Application Returned</h1>
                  <p className="text-gray-500 font-medium mb-8 leading-relaxed text-lg">
                    Unfortunately, your application was not approved. <br/>
                    Please review our feedback and resubmit.
                  </p>
                  <button 
                    onClick={() => setPageStatus('none')}
                    className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Update Application
                  </button>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-8">Status: Action Required</p>
                </div>
              </div>
        );
    }

    // Choice Screen - First screen user sees
    if (!userChoice) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative flex items-center justify-center overflow-hidden">
                 {/* Background Decor */}
                 <div className='absolute top-0 left-0 w-96 h-96 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float'></div>
                 <div className='absolute bottom-0 right-0 w-96 h-96 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float' style={{animationDelay: '2s'}}></div>

                 <div className="max-w-6xl mx-auto relative z-10 w-full animate-fadeIn">
                    <div className="text-center mb-16">
                        <h1 className="text-3xl md:text-3xl font-bold text-gray-900 tracking-tight lowercase mb-6">
                            Moments we build this for...
                        </h1>

                        {/* Situational Clarity List */}
                        <div className="mb-8 flex flex-col gap-1.5 opacity-70 text-sm md:text-base font-medium text-gray-500 items-center">
                            <p>• Before walking into a café alone</p>
                            <p>• Waiting rooms</p>
                            <p>• First day in a new city</p>
                            <p>• Entering events solo</p>
                            <p>• Long public waits</p>
                        </div>

                        <p className="text-xl text-gray-400 font-medium tracking-wide">
                            Choose your journey
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Basic User Card */}
                        <div 
                            onClick={() => setUserChoice('basic')}
                            className="bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[450px] border border-gray-100 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10">
                                <span className="bg-green-50 text-green-800 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 inline-block border border-green-100">For Members</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">I want company.</h2>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-sm">
                                    Find a companion to sit with you. No pressure, just human presence.
                                </p>
                            </div>

                             <div className="mt-10 flex items-center text-gray-900 font-bold group-hover:translate-x-2 transition-transform relative z-10 text-lg">
                                Join as Member <span className="ml-2">→</span>
                            </div>
                        </div>
                        
                        {/* Companion Card */}
                        <div 
                            onClick={() => setUserChoice('companion')}
                            className="bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[450px] border border-gray-100 group relative overflow-hidden"
                        >
                             <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <span className="bg-yellow-50 text-yellow-800 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 inline-block border border-yellow-100">For Companions</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">I want to join as a companion</h2>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-sm">
                                    Become a verified companion. Share your time and get paid for your presence.
                                </p>
                            </div>
                            
                            <div className="mt-10 flex items-center text-gray-900 font-bold group-hover:translate-x-2 transition-transform relative z-10 text-lg">
                                Apply Now <span className="ml-2">→</span>
                            </div>
                        </div>

                        
                    </div>
                </div>
            </div>
        );
    }

    // Basic User Form (Simple)
    if (userChoice === 'basic') {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative">
                <div className="max-w-2xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <button 
                            onClick={() => setUserChoice(null)}
                            className="mb-8 text-gray-400 hover:text-gray-900 flex items-center gap-2 mx-auto font-medium transition-colors"
                        >
                            ← Back to choice
                        </button>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                            Complete Your Profile
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">Just a few details to get started!</p>
                    </div>

                    <form onSubmit={handleBasicSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                        <div className="space-y-8">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Basic Information</h2>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all font-medium"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                <input 
                                    type="tel" 
                                    name="phoneNumber"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 bg-gray-50 border ${phoneError ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all font-medium`}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength={10}
                                />
                                {phoneError && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{phoneError}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                                    <select 
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all font-medium appearance-none"
                                    >
                                        <option value="" disabled>Select your city</option>
                                        {indianCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Area <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="area"
                                        required
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all font-medium"
                                        placeholder="e.g., Bandra West"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4">Profile Photo <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:bg-gray-50 transition-colors">
                                    {previews.profilePhoto ? (
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={previews.profilePhoto} alt="Preview" className="h-48 w-48 object-cover mx-auto rounded-full shadow-lg" />
                                            <button 
                                                type="button"
                                                onClick={() => { setPreviews(prev => ({ ...prev, profilePhoto: null })); setFormData(prev => ({ ...prev, profilePhoto: null })); }}
                                                className="mt-6 px-6 py-2 bg-red-50 text-red-500 font-bold rounded-full hover:bg-red-100 transition-colors text-sm"
                                            >
                                                Remove Photo
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📸</div>
                                            <p className="font-bold text-gray-900 mb-1">Upload Profile Photo</p>
                                            <p className="text-gray-400 text-sm">Click to select an image</p>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                required
                                                onChange={(e) => handleFileChange(e, 'profilePhoto')}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>


                            <div className="bg-gray-50 rounded-2xl p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="agreedToPolicy"
                                        required
                                        checked={formData.agreedToPolicy}
                                        onChange={handleInputChange}
                                        className="mt-1 h-5 w-5 border-gray-300 rounded text-black focus:ring-black"
                                    />
                                    <span className="text-sm font-medium text-gray-600">
                                        I agree to the <a href="/terms-of-service" target="_blank" className="underline text-black font-bold">Terms and Conditions</a>, and I confirm that all information provided is accurate.
                                    </span>
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {loading ? 'Creating Profile...' : 'Complete Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Companion Form (3-Step Detailed Form)
    if (userChoice === 'companion') {
        return (
            <div className="min-h-screen bg-yellow-50 p-6 md:p-12 font-sans relative">
                {/* Background Decor */}
                <div className='absolute top-20 left-10 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30'></div>
                <div className='absolute top-20 right-10 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30'></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <button 
                            onClick={() => setUserChoice(null)}
                            className="mb-6 text-gray-500 hover:text-black flex items-center gap-2 mx-auto font-bold"
                        >
                            ← Back to choice
                        </button>
                        <div className='inline-block px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold tracking-wider transform -rotate-2 border-2 border-transparent shadow-[2px_2px_0px_0px_rgba(150,150,150,1)] mb-4'>
                            STEP {step} OF 3
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                            BECOME A <span className="text-black underline decoration-4 decoration-black underline-offset-4">COMPANION</span>
                        </h1>
                        <p className="text-lg text-gray-600 font-medium mt-2">Join our community and start earning by spending time with people!</p>
                    </div>

                    <form onSubmit={handleCompanionSubmit} className="bg-yellow-50 rounded-2xl p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-gray-900 mb-6">BASIC INFORMATION</h2>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name (as on ID) *</label>
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium"
                                        placeholder="Enter your full legal name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        name="phoneNumber"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-yellow-50 border-2 ${phoneError ? 'border-red-500' : 'border-black'} text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium`}
                                        placeholder="Enter 10-digit mobile number"
                                        maxLength={10}
                                    />
                                    {phoneError && <p className="text-red-500 text-xs font-bold mt-1">{phoneError}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">City *</label>
                                    <select 
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium appearance-none"
                                    >
                                        <option value="" disabled>Select your city</option>
                                        {indianCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Area *</label>
                                    <input 
                                        type="text" 
                                        name="area"
                                        required
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium"
                                        placeholder="Enter your area (e.g., Indiranagar)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Description (Max 1000 characters) *</label>
                                    <textarea 
                                        name="description"
                                        required
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        maxLength={1000}
                                        rows={5}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium resize-none"
                                        placeholder="Tell us about yourself, your interests, and what you can offer as a companion..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1 font-bold">{formData.description.length}/1000 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                        Tags (Select all that apply) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {availableTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTagToggle(tag)}
                                                className={`py-3 px-2 rounded-xl font-bold border-2 border-black transition-all flex flex-col items-center justify-center gap-1 uppercase tracking-tight text-xs md:text-sm h-full ${
                                                    formData.tags.includes(tag)
                                                    ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                                                    : 'bg-yellow-50 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50'
                                                }`}
                                            >
                                                <span className="text-xl md:text-2xl">{tagIcons[tag]}</span>
                                                <span className="text-center leading-tight">{tag}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-bold">{formData.tags.length} tags selected</p>
                                    
                                    {/* Sub-tags Selection */}
                                    {formData.tags.some(t => Object.keys(modeTags).includes(t)) && (
                                        <div className="mt-8 animate-fadeIn">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Refine Your Skills</h3>
                                            <div className="space-y-6">
                                                {availableTags.filter(mainTag => formData.tags.includes(mainTag)).map(mainTag => {
                                                    const subTags = modeTags[mainTag];
                                                    const allSelected = subTags.every(t => formData.tags.includes(t));
                                                    
                                                    return (
                                                        <div key={mainTag} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                                <span>{tagIcons[mainTag]}</span> {mainTag} options
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectAllSubTags(mainTag)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                        allSelected
                                                                        ? 'bg-black text-white border-black'
                                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    Select All
                                                                </button>
                                                                {subTags.map(subTag => (
                                                                    <button
                                                                        key={subTag}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle(subTag)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                            formData.tags.includes(subTag)
                                                                            ? 'bg-black text-white border-black'
                                                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                        }`}
                                                                    >
                                                                        {subTag}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (!formData.fullName.trim()) return alert("Please enter your full name.");
                                        if (!formData.phoneNumber || formData.phoneNumber.length !== 10) return alert("Please enter a valid 10-digit phone number.");
                                        if (!formData.city) return alert("Please select your city.");
                                        if (!formData.area.trim()) return alert("Please enter your area.");
                                        if (!formData.description.trim()) return alert("Please enter a description.");
                                        if (formData.tags.length === 0) return alert("Please select at least one tag.");
                                        setStep(2);
                                    }}
                                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl border-2 border-black hover:bg-green-700 transition-all shadow-[6px_6px_0px_0px_rgba(100,100,100,0.5)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    NEXT STEP →
                                </button>
                            </div>
                        )}

                        {/* Step 2: Documents Upload */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-gray-900 mb-6">UPLOAD DOCUMENTS</h2>
                                
                                {/* Profile Photos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Profile Photo *</label>
                                        <div className="border-4 border-dashed border-black rounded-xl p-6 text-center">
                                            {previews.profilePhoto ? (
                                                <div className="relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={previews.profilePhoto} alt="Preview" className="max-h-48 mx-auto rounded-lg border-2 border-black" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setPreviews(prev => ({ ...prev, profilePhoto: null })); setFormData(prev => ({ ...prev, profilePhoto: null })); }}
                                                        className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded-lg border-2 border-black"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer">
                                                    <div className="text-6xl mb-4">📸</div>
                                                    <p className="font-bold text-gray-900">Click to upload</p>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        required
                                                        onChange={(e) => handleFileChange(e, 'profilePhoto')}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Add Another Image</label>
                                        <div className="border-4 border-dashed border-black rounded-xl p-6 text-center">
                                            {previews.backupPhoto ? (
                                                <div className="relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={previews.backupPhoto} alt="Preview" className="max-h-48 mx-auto rounded-lg border-2 border-black" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setPreviews(prev => ({ ...prev, backupPhoto: null })); setFormData(prev => ({ ...prev, backupPhoto: null })); }}
                                                        className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded-lg border-2 border-black"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer">
                                                    <div className="text-6xl mb-4">🖼️</div>
                                                    <p className="font-bold text-gray-900">Click to upload</p>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, 'backupPhoto')}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Government ID Proofs */}
                                <div className="mt-6 pt-6 border-t-2 border-black/10">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2">Government ID Proof (Aadhaar / ID Card)</h3>
                                    <p className="text-xs text-gray-500 mb-4">Required for identity verification before your companion profile is activated.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Front ID Proof *</label>
                                            <div className="border-4 border-dashed border-black rounded-xl p-6 text-center">
                                                {previews.idProofFront ? (
                                                    <div className="relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={previews.idProofFront} alt="Front ID Preview" className="max-h-48 mx-auto rounded-lg border-2 border-black object-contain" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setPreviews(prev => ({ ...prev, idProofFront: null })); setFormData(prev => ({ ...prev, idProofFront: null })); }}
                                                            className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded-lg border-2 border-black"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer">
                                                        <div className="text-5xl mb-3">📄</div>
                                                        <p className="font-bold text-gray-900 text-sm">Upload Front ID</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">Aadhaar / Driver License (Front)</p>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'idProofFront')}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Back ID Proof</label>
                                            <div className="border-4 border-dashed border-black rounded-xl p-6 text-center">
                                                {previews.idProofBack ? (
                                                    <div className="relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={previews.idProofBack} alt="Back ID Preview" className="max-h-48 mx-auto rounded-lg border-2 border-black object-contain" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setPreviews(prev => ({ ...prev, idProofBack: null })); setFormData(prev => ({ ...prev, idProofBack: null })); }}
                                                            className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded-lg border-2 border-black"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer">
                                                        <div className="text-5xl mb-3">📄</div>
                                                        <p className="font-bold text-gray-900 text-sm">Upload Back ID</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">Aadhaar / Driver License (Back)</p>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'idProofBack')}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 bg-yellow-50 text-black font-bold rounded-xl border-2 border-black hover:bg-gray-100 transition-all shadow-[6px_6px_0px_0px_rgba(200,200,200,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        ← BACK
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl border-2 border-black hover:bg-green-700 transition-all shadow-[6px_6px_0px_0px_rgba(100,100,100,0.5)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        NEXT STEP →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Availability & Pricing */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-gray-900 mb-6">AVAILABILITY & PRICING</h2>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Available Days *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day.key}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, [day.key]: !prev[day.key] }))}
                                                className={`py-3 px-4 rounded-lg font-bold border-2 border-black transition-all ${
                                                    formData[day.key]
                                                    ? 'bg-black text-white'
                                                    : 'bg-yellow-50 text-black hover:bg-gray-100'
                                                }`}
                                            >
                                                {day.label.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Start Time *</label>
                                        <input 
                                            type="time" 
                                            name="startTime"
                                            required
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">End Time *</label>
                                        <input 
                                            type="time" 
                                            name="endTime"
                                            required
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Price Per Hour (₹) *</label>
                                    <select
                                        name="pricePerHour"
                                        required
                                        value={formData.pricePerHour}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-black text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium appearance-none"
                                    >
                                        <option value="" disabled>Select hourly rate</option>
                                        <option value="399">₹399</option>
                                        <option value="499">₹499</option>
                                        <option value="699">₹699</option>
                                    </select>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-black border-b border-black pb-2">Mandatory Reality Check</h3>
                                    
                                    <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-yellow-50 rounded-lg transition-colors">
                                        <input 
                                            type="checkbox" 
                                            required
                                            checked={extraConsents.noEntertainment}
                                            onChange={(e) => setExtraConsents({...extraConsents, noEntertainment: e.target.checked})}
                                            className="mt-1 h-5 w-5 border-2 border-black rounded flex-shrink-0"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            I understand I am <span className="font-bold text-black">not here to entertain</span>. I will not try to be &ldquo;fun&rdquo; or &ldquo;interesting&rdquo;.
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-yellow-50 rounded-lg transition-colors">
                                        <input 
                                            type="checkbox" 
                                            required
                                            checked={extraConsents.silence}
                                            onChange={(e) => setExtraConsents({...extraConsents, silence: e.target.checked})}
                                            className="mt-1 h-5 w-5 border-2 border-black rounded flex-shrink-0"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            I am comfortable with <span className="font-bold text-black">long periods of silence</span> and will not break it unless necessary.
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-yellow-50 rounded-lg transition-colors">
                                        <input 
                                            type="checkbox" 
                                            required
                                            checked={extraConsents.noFixing}
                                            onChange={(e) => setExtraConsents({...extraConsents, noFixing: e.target.checked})}
                                            className="mt-1 h-5 w-5 border-2 border-black rounded flex-shrink-0"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            I will not offer <span className="font-bold text-black">advice, therapy, or help</span>. I am here only for presence.
                                        </span>
                                    </label>

                                    <div className="bg-yellow-50 border-4 border-black/10 rounded-xl p-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                name="agreedToPolicy"
                                                required
                                                checked={formData.agreedToPolicy}
                                                onChange={handleInputChange}
                                                className="mt-1 h-5 w-5 border-2 border-black rounded flex-shrink-0"
                                            />
                                            <span className="text-sm font-bold text-gray-900">
                                                I agree to the <a href="/terms-of-service" target="_blank" className="underline text-black">Terms of Service</a> and confirm my details are accurate.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-4 bg-yellow-50 text-black font-bold rounded-xl border-2 border-black hover:bg-gray-100 transition-all shadow-[6px_6px_0px_0px_rgba(200,200,200,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        ← BACK
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl border-2 border-black hover:bg-green-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'SUBMITTING...' : '✓ SUBMIT APPLICATION'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        );
    }
    
    return null;
};

const OnboardingPage = () => (
    <Suspense fallback={<Loading message="Loading..." />}>
        <OnboardingContent />
    </Suspense>
);

export default OnboardingPage;
