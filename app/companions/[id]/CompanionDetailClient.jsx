'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../../components/common/Loading';
import PaymentModal from '../../components/PaymentModal';

import liveCompanions from '../../data/liveCompanions.json';

const fallbackCompanions = liveCompanions;

const FellowProfile = () => {
    const { id } = useParams();
    const router = useRouter();
    const { token, userData } = useAuth();
    const { showNotification } = useNotification();
    
    const [fellow, setFellow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('review'); // 'review' -> 'hesitation' -> 'payment' -> 'success'
    const [imgFailed, setImgFailed] = useState(false);
    const [activeBooking, setActiveBooking] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Hesitation Checkboxes
    const [checks, setChecks] = useState({
        publicOnly: false,
        noTouch: false,
        silenceOk: false,
        canLeave: false
    });

    // Booking Details
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('10:00');
    const [duration, setDuration] = useState('60'); // in minutes
    const [activity, setActivity] = useState('Quiet coffee / Café companionship');
    const [location, setLocation] = useState('');
    const [minDate, setMinDate] = useState('');

    // Gender Matching Preference
    const [genderPreference, setGenderPreference] = useState('women_only');
    const [genderConsentAcknowledged, setGenderConsentAcknowledged] = useState(false);

    useEffect(() => {
        setMinDate(new Date().toISOString().split('T')[0]);
        if (userData?.genderPreference) {
            setGenderPreference(userData.genderPreference);
            setGenderConsentAcknowledged(Boolean(userData.genderConsentAcknowledged));
        }
    }, [userData]);

    useEffect(() => {
        const fetchFellow = async () => {
             try {
                let resolved = null;
                try {
                     const resSpecific = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companions/${id}`);
                     if (resSpecific.data) resolved = resSpecific.data;
                } catch {
                     try {
                         const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companions`);
                         if (Array.isArray(res.data)) {
                             resolved = res.data.find(f => f.id === id || f._id === id);
                         }
                     } catch {
                         // Backend offline
                     }
                }

                if (!resolved) {
                    resolved = fallbackCompanions.find(f => f.id === id || f._id === id || f.fullName.toLowerCase() === (id || '').toLowerCase());
                }

                setFellow(resolved || fallbackCompanions[0]);
            } catch (err) {
                console.error('Error fetching companion:', err);
                const fallback = fallbackCompanions.find(f => f.id === id || f._id === id) || fallbackCompanions[0];
                setFellow(fallback);
            } finally {
                setLoading(false);
            }
        };
        if(id) fetchFellow();
    }, [id]);

    // Operating hours check (7:00 AM to 10:00 PM)
    const timeValidation = useMemo(() => {
        if (!bookingTime) return { valid: false, error: 'Please choose a start time.' };
        const [h, m] = bookingTime.split(':').map(Number);
        const startMins = h * 60 + m;
        const durMins = parseInt(duration, 10) || 60;
        const endMins = startMins + durMins;

        const openMins = 7 * 60;   // 07:00 AM
        const closeMins = 22 * 60; // 10:00 PM

        if (startMins < openMins) {
            return {
                valid: false,
                error: 'PRSNN operating hours begin at 7:00 AM. Please choose a later start time.'
            };
        }
        if (endMins > closeMins) {
            const endH = Math.floor(endMins / 60);
            const endM = (endMins % 60).toString().padStart(2, '0');
            const period = endH >= 12 ? 'PM' : 'AM';
            const displayH = endH > 12 ? endH - 12 : endH;
            return {
                valid: false,
                error: `With a ${durMins / 60}-hour duration, this booking ends at ${displayH}:${endM} ${period}. PRSNN closes strictly at 10:00 PM.`
            };
        }
        return { valid: true, error: null };
    }, [bookingTime, duration]);

    // Pricing Calculation
    const pricing = useMemo(() => {
        const rate = Number(fellow?.pricePerHour) || 0;
        const durHours = (parseInt(duration, 10) || 60) / 60;
        const companionFee = Math.round(rate * durHours);
        const platformFee = 50;
        const total = companionFee + platformFee;
        return { rate, durHours, companionFee, platformFee, total };
    }, [fellow, duration]);

    const handleProceedToHesitation = () => {
        if (!token || !userData) {
            const proceed = confirm("You need to login to book a companion. Would you like to login now?");
            if (proceed) {
                router.push('/login');
            }
            return;
        }

        if (!bookingDate) {
            showNotification('error', "Please select a booking date.");
            return;
        }

        if (!timeValidation.valid) {
            showNotification('error', timeValidation.error || "Please choose a valid time within operating hours (7:00 AM – 10:00 PM).");
            return;
        }

        if (!location.trim()) {
            showNotification('error', "Please enter a specific public meeting location.");
            return;
        }

        if (genderPreference === 'any' && !genderConsentAcknowledged) {
            showNotification('error', "Please confirm the affirmative consent for matching with any gender.");
            return;
        }

        setStep('hesitation');
    };

    const handleCreatePrepaidBooking = async () => {
        setSubmitting(true);
        try {
            const fellowId = fellow.id || fellow._id || fellow.userId;
            
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/request`, {
                companionId: fellowId,
                scheduledDate: bookingDate,
                startTime: bookingTime,
                duration: duration,
                activity: activity,
                city: fellow.city || 'Bangalore',
                location: location.trim(),
                genderPreference: genderPreference,
                genderConsentAcknowledged: genderConsentAcknowledged
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newBooking = res.data.booking;
            // Attach companion info if missing from populated result
            if (!newBooking.companionId || typeof newBooking.companionId === 'string') {
                newBooking.companionId = fellow;
            }
            setActiveBooking(newBooking);
            setShowPaymentModal(true);
        } catch (error) {
            console.error("Booking failed:", error);
            showNotification('error', error.response?.data?.message || "Failed to create booking request. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setStep('success');
    };

    if (loading) return <Loading message="Loading profile..." />;
    if (!fellow) return <div className="min-h-screen flex items-center justify-center text-ink/40 font-semibold uppercase tracking-widest text-xs">Companion not found</div>;

    const isActive = fellow.availability && Object.values(fellow.availability).some(Boolean);
    const comfortZones = fellow.tags || ['Sitting', 'Walking', 'Coffee', 'Listening'];

    return (
        <div className="min-h-screen bg-mist text-ink pb-24">
            <div className="max-w-4xl mx-auto px-6 pt-28 md:pt-32 pb-4">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-moss">
                        Companion profile · Presence without pressure
                    </p>
                    <Link href="/companions" className="text-xs font-bold text-gray-500 hover:text-black">
                        ← Back to Companions
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
                {/* Left Card: Companion Summary */}
                <div className="md:col-span-5 h-fit md:sticky md:top-28">
                     <div className="bg-paper rounded-3xl p-3 border border-line mb-5 shadow-sm">
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden relative bg-mist-deep">
                             {fellow.profilePhoto && !imgFailed ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={fellow.profilePhoto}
                                    alt={fellow.displayName || fellow.fullName || 'Companion'}
                                    onError={() => setImgFailed(true)}
                                    className="w-full h-full object-cover"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-100">
                                    <span className="font-display text-6xl font-bold tracking-wider">
                                        {(fellow.displayName || fellow.fullName || fellow.username || '?')
                                            .split(/\s+/)
                                            .map(s => s[0])
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase() || '?'}
                                    </span>
                                </div>
                             )}
                             <div className="absolute top-3 right-3 bg-paper/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-sm border border-line">
                                <span className="text-xs font-bold text-ink">₹{fellow.pricePerHour}/hr</span>
                             </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 mb-5">
                         <div className="bg-paper p-4 rounded-2xl border border-line flex flex-col items-center justify-center text-center">
                             <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 mb-1">City</span>
                             <span className="text-xs font-bold text-ink truncate w-full">{fellow.city || 'Bangalore'}</span>
                         </div>
                         <div className="bg-paper p-4 rounded-2xl border border-line flex flex-col items-center justify-center text-center">
                             <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 mb-1">Status</span>
                             <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                               <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-moss' : 'bg-ink/25'}`} />
                               {isActive ? 'Available' : 'Schedule only'}
                             </span>
                         </div>
                     </div>

                     {/* Operating Hours Reminder Badge */}
                     <div className="bg-[#E8EFE9] rounded-2xl p-4 border border-[#1E3A2F]/15 text-xs text-[#1E3A2F]">
                         <div className="flex items-center gap-2 font-bold text-[#1E3A2F] mb-1">
                             <span className="w-2 h-2 rounded-full bg-[#D97757]"></span>
                             <span className="font-display">Daylight Hours: 7:00 AM – 10:00 PM</span>
                         </div>
                         <p className="text-[11px] leading-relaxed text-[#1E3A2F]/80">
                             All PRSNN sessions strictly take place during daytime hours for everyone&apos;s peace of mind.
                         </p>
                     </div>
                </div>

                {/* Right Column: Step Flow */}
                <div className="md:col-span-7 pt-2">
                    {/* STEP 1: REVIEW & SCHEDULE */}
                    {step === 'review' && (
                        <div className="animate-slideUp space-y-6">
                            <div>
                                <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2 tracking-tight">
                                    {fellow.displayName || fellow.fullName}
                                </h1>
                                <p className="text-ink/60 font-medium flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-moss"></span>
                                    Verified PRSNN companion · ID & Boundaries Checked
                                </p>
                            </div>

                            <p className="text-ink/75 leading-relaxed text-base font-normal bg-paper p-5 rounded-2xl border border-line italic">
                                &ldquo;{fellow.description || "I am here simply to be present. No pressure, no expectations."}&rdquo;
                            </p>

                            <div>
                                <h3 className="text-[11px] font-semibold text-ink/40 uppercase tracking-[0.14em] mb-3">Comfort zones</h3>
                                <div className="flex flex-wrap gap-2">
                                    {comfortZones.map((tag, i) => (
                                        <span key={i} className="px-3.5 py-1.5 bg-paper border border-line rounded-xl text-xs font-bold text-ink/75">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Inputs */}
                            <div className="bg-paper rounded-3xl p-7 border border-line shadow-sm space-y-5">
                                <h3 className="text-[11px] font-semibold text-ink/40 uppercase tracking-[0.14em] border-b border-line pb-3">
                                    Plan your session
                                </h3>

                                {/* Activity Selection */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">
                                        Activity <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={activity}
                                        onChange={(e) => setActivity(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:border-ink font-medium bg-mist text-sm"
                                    >
                                        <option value="Quiet coffee / Café companionship">Quiet coffee / Café companionship</option>
                                        <option value="Exploring a new city / Walking">Exploring a new city / Walking</option>
                                        <option value="Attending an event / Museum / Gallery">Attending an event / Museum / Gallery</option>
                                        <option value="Studying / Co-working side-by-side">Studying / Co-working side-by-side</option>
                                        <option value="Dining out at a restaurant">Dining out at a restaurant</option>
                                        <option value="General public companionship">General public companionship</option>
                                    </select>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            value={bookingDate}
                                            min={minDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:border-ink font-medium bg-mist text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">
                                            Start Time (7 AM – 9 PM) <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="time" 
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:border-ink font-medium bg-mist text-sm"
                                        />
                                    </div>
                                </div>

                                {!timeValidation.valid && bookingTime && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-medium">
                                        ⚠️ {timeValidation.error}
                                    </div>
                                )}

                                {/* Duration */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">
                                        Duration
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { value: '60', label: '1 hour' },
                                            { value: '120', label: '2 hours' },
                                            { value: '180', label: '3 hours' },
                                            { value: '240', label: '4 hours' }
                                        ].map((d) => (
                                            <button
                                                key={d.value}
                                                type="button"
                                                onClick={() => setDuration(d.value)}
                                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                    duration === d.value 
                                                    ? 'bg-ink text-paper border-ink shadow-sm' 
                                                    : 'bg-mist text-ink/60 border-line hover:border-ink/40'
                                                }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Public Location */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">
                                        Meeting Location (Public Only) <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Third Wave Coffee, Indiranagar, Bengaluru"
                                        className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:border-ink font-medium bg-mist text-sm"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1.5">
                                        🔒 All sessions must take place in open, public venues. Private residences and hotel rooms are strictly prohibited.
                                    </p>
                                </div>

                                {/* Gender Matching Preference Selector */}
                                <div className="pt-2 border-t border-line space-y-3">
                                    <label className="block text-[11px] font-semibold text-ink/60 uppercase tracking-wider">
                                        Who would you feel comfortable booking?
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 bg-mist rounded-xl border border-line cursor-pointer">
                                            <input
                                                type="radio"
                                                name="genderPref"
                                                checked={genderPreference === 'women_only'}
                                                onChange={() => {
                                                    setGenderPreference('women_only');
                                                    setGenderConsentAcknowledged(false);
                                                }}
                                                className="w-4 h-4 text-black focus:ring-black"
                                            />
                                            <span className="text-xs font-bold text-ink">
                                                Women companions only (recommended by default)
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 bg-mist rounded-xl border border-line cursor-pointer">
                                            <input
                                                type="radio"
                                                name="genderPref"
                                                checked={genderPreference === 'any'}
                                                onChange={() => setGenderPreference('any')}
                                                className="w-4 h-4 text-black focus:ring-black"
                                            />
                                            <span className="text-xs font-bold text-ink">
                                                Companions of any gender (optional)
                                            </span>
                                        </label>
                                    </div>

                                    {/* Women's Safety First Note */}
                                    <div className="p-3.5 rounded-2xl bg-[#E8EFE9] border border-[#1E3A2F]/15 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E3A2F]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]" />
                                            <span>Women&apos;s Safety First</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-[#181B18]/80 font-medium">
                                            We put women&apos;s safety on top priority. By default, you will be matched with women companions only. You can optionally choose to book companions of any gender with your clear consent. And you can change preferences anytime from settings → preferences → change gender.
                                        </p>
                                    </div>

                                    {genderPreference === 'any' && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5">
                                            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                                                <strong>Consent Notice:</strong> I understand that opting into matching with companions of any gender means I may be matched with male or non-binary companions. I confirm that I am comfortable with this preference and that all bookings remain subject to PRSNN&apos;s safety guidelines and Boundaries Agreement.
                                            </p>
                                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={genderConsentAcknowledged}
                                                    onChange={(e) => setGenderConsentAcknowledged(e.target.checked)}
                                                    className="w-4 h-4 text-black rounded border-amber-400"
                                                />
                                                <span className="text-xs font-bold text-amber-950">
                                                    I understand and confirm this preference.
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown Preview */}
                                <div className="bg-mist p-4 rounded-2xl border border-line space-y-2">
                                    <div className="flex justify-between text-xs text-ink/60">
                                        <span>Companion rate ({pricing.durHours}h @ ₹{pricing.rate}/h)</span>
                                        <span className="font-semibold text-ink">₹{pricing.companionFee}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-ink/60">
                                        <span>Safety & Platform Fee</span>
                                        <span className="font-semibold text-ink">₹{pricing.platformFee}</span>
                                    </div>
                                    <div className="pt-2 border-t border-line flex justify-between items-baseline">
                                        <span className="text-xs uppercase font-bold tracking-wider text-ink">Total Prepaid</span>
                                        <span className="text-2xl font-bold text-ink font-display">₹{pricing.total}</span>
                                    </div>
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleProceedToHesitation}
                                    disabled={!bookingDate || !timeValidation.valid || !location.trim()}
                                    className="btn-primary w-full !py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Continue to Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: BOUNDARIES AGREEMENT (HESITATION STEP) */}
                    {step === 'hesitation' && (
                        <div className="animate-fadeIn bg-paper rounded-3xl p-8 border border-line shadow-sm space-y-6">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-moss">Step 2 of 3</span>
                                <h2 className="font-display text-3xl font-bold text-ink mt-1">
                                    Wait. Confirm Boundaries.
                                </h2>
                                <p className="text-xs text-ink/60 mt-1">
                                    Presence without pressure. Every interaction must be voluntary, respectful, and safe by design.
                                </p>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-mist p-5 rounded-2xl border border-line space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Companion:</span>
                                    <span className="font-bold text-ink">{fellow.displayName || fellow.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Activity:</span>
                                    <span className="font-bold text-ink">{activity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink/60">When:</span>
                                    <span className="font-bold text-ink">{bookingDate} at {bookingTime} ({pricing.durHours} hr)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Public Location:</span>
                                    <span className="font-bold text-ink truncate max-w-[200px]">{location}</span>
                                </div>
                                <div className="pt-2 border-t border-line flex justify-between font-bold text-sm">
                                    <span>Total Prepaid Amount:</span>
                                    <span className="text-moss">₹{pricing.total}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { key: 'publicOnly', label: 'Public spaces only. No private homes, vehicles, or secluded areas.' },
                                    { key: 'noTouch', label: 'Strictly platonic. Absolutely no physical contact is permitted.' },
                                    { key: 'silenceOk', label: 'Presence without pressure. Silence is accepted and respected.' },
                                    { key: 'canLeave', label: 'Either party may conclude or leave the session at any time.' }
                                ].map((item) => (
                                    <label key={item.key} className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${checks[item.key] ? 'border-[#1E3A2F] bg-[#E8EFE9]/40 shadow-sm' : 'border-line hover:bg-mist/40'}`}>
                                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checks[item.key] ? 'bg-[#1E3A2F] border-[#1E3A2F] text-white' : 'border-[#1E3A2F]/30'}`}>
                                            {checks[item.key] && <span className="text-xs font-black">✓</span>}
                                        </div>
                                        <input type="checkbox" checked={checks[item.key]} onChange={(e) => setChecks({...checks, [item.key]: e.target.checked})} className="hidden" />
                                        <span className={`text-xs font-semibold leading-relaxed ${checks[item.key] ? 'text-[#181B18]' : 'text-[#181B18]/60'}`}>{item.label}</span>
                                    </label>
                                ))}
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                By continuing, you confirm agreement to the <Link href="/agreement" className="text-black font-bold underline" target="_blank">PRSNN Boundaries Agreement</Link> and <Link href="/safety" className="text-black font-bold underline" target="_blank">Safety Standards</Link>.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setStep('review')} 
                                    className="flex-1 py-3.5 bg-mist text-ink font-bold rounded-2xl border border-line hover:border-ink/30 transition-colors text-sm"
                                >
                                    ← Back
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCreatePrepaidBooking}
                                    disabled={!Object.values(checks).every(Boolean) || submitting}
                                    className="flex-[2] btn-primary disabled:opacity-30 disabled:cursor-not-allowed !py-3.5 text-sm font-bold"
                                >
                                    {submitting ? 'Creating Booking...' : `Proceed to Pay ₹${pricing.total} →`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS & SEQUENTIAL OFFER STATE */}
                    {step === 'success' && (
                        <div className="animate-fadeIn bg-paper rounded-3xl p-8 md:p-10 text-center border border-moss/30 shadow-lg space-y-6">
                            <div className="w-16 h-16 bg-moss text-signal rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-md">
                                ✓
                            </div>
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-moss">
                                    Payment Confirmed · Sequential Offer Active
                                </span>
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mt-1">
                                    We&apos;re Finding Your Companion
                                </h2>
                                <p className="text-ink/60 mt-2 text-sm leading-relaxed max-w-lg mx-auto">
                                    Your prepaid booking has been safely recorded. We&apos;ve sent the request to <strong>{fellow.displayName || fellow.fullName}</strong> with a time-limited acceptance window.
                                </p>
                            </div>

                            <div className="bg-mist p-6 rounded-2xl border border-line text-left space-y-3 text-xs">
                                <h4 className="font-bold text-sm text-ink uppercase tracking-wider">How PRSNN Handles Your Booking:</h4>
                                <ul className="space-y-2 text-ink/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-moss font-bold">1.</span>
                                        <span>The companion receives your request and has a limited window to accept.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-moss font-bold">2.</span>
                                        <span>If they are unavailable or time expires, your request is seamlessly offered to up to 2 other eligible, verified companions matching your preferences.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-moss font-bold">3.</span>
                                        <span>If no companion is able to accept, your full payment of <strong>₹{pricing.total}</strong> is refunded immediately to your original payment method.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => router.push('/my-bookings')} 
                                    className="btn-primary flex-1 !py-3.5 text-sm"
                                >
                                    View My Bookings →
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => router.push('/')} 
                                    className="flex-1 py-3.5 bg-mist text-ink font-bold rounded-2xl border border-line hover:border-ink/30 transition-colors text-sm"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && activeBooking && (
                <PaymentModal
                    booking={activeBooking}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default FellowProfile;
