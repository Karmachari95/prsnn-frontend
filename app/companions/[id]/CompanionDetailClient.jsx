'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../../components/common/Loading';

const CompanionDetailClient = () => {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const { token, userData } = useAuth();
    const { showNotification } = useNotification();
    
    const [fellow, setFellow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('review'); // review -> hesitation -> success
    const [imgFailed, setImgFailed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Hesitation Checkboxes from original code
    const [checks, setChecks] = useState({
        publicOnly: false,
        noTouch: false,
        silenceOk: false,
        canLeave: false
    });

    // Booking Details
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('11:00');
    const [duration, setDuration] = useState('60');
    const [minDate, setMinDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        setMinDate(dateStr);
        setBookingDate(dateStr);
    }, []);

    useEffect(() => {
        const fetchFellow = async () => {
            if (!id) return;
            try {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
                    const resSpecific = await axios.get(`${apiUrl}/api/companions/${id}`);
                    if (resSpecific.data && (resSpecific.data._id || resSpecific.data.id)) {
                        setFellow(resSpecific.data);
                        setLoading(false);
                        return;
                    }
                } catch {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
                    const res = await axios.get(`${apiUrl}/api/companions`);
                    const list = Array.isArray(res.data) ? res.data : (res.data?.companions || []);
                    const found = list.find(f => String(f.id || f._id) === String(id));
                    if (found) {
                        setFellow(found);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Fetch companion error:", err);
            }

            setLoading(false);
        };

        fetchFellow();
    }, [id]);

    const handleConfirm = async () => {
        if (!token || !userData) {
            const proceed = confirm("You need to login to book a companion. Would you like to login now?");
            if (proceed) {
                router.push('/login');
            }
            return;
        }

        if (!bookingDate || !bookingTime) {
            showNotification('error', "Please select a date and time for your booking.");
            return;
        }

        const isWomenOnly = userData?.genderPreference === 'women_only';
        const isMaleCompanion = (fellow?.gender || '').toLowerCase() === 'man' || (fellow?.gender || '').toLowerCase() === 'male';

        if (isWomenOnly && isMaleCompanion) {
            showNotification('warning', "Your safety matching preference is set to 'Women companions only'. Please update your preferences in Settings to book companions of any gender.");
            return;
        }

        setSubmitting(true);
        try {
            const fellowId = fellow.id || fellow._id || fellow.userId;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';

            await axios.post(`${apiUrl}/api/bookings/request`, {
                companionId: fellowId,
                scheduledDate: bookingDate,
                startTime: bookingTime,
                duration: duration,
                message: "I would like to request your presence for companionship."
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStep('success');
            showNotification('success', 'Booking request sent successfully!');
        } catch (error) {
            console.error("Booking error:", error);
            showNotification('error', error.response?.data?.message || "Failed to submit booking request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading message="Loading profile..." />;
    if (!fellow) return (
        <div className="min-h-screen flex items-center justify-center text-ink/40 font-semibold uppercase tracking-widest text-xs">
            Companion not found
        </div>
    );

    const isActive = fellow.availability && Object.values(fellow.availability).some(Boolean);
    const comfortZones = fellow.tags || ['Sitting', 'Walking', 'Coffee', 'Listening'];

    return (
        <div className="min-h-screen bg-mist text-ink pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-28 md:pt-32 pb-4">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-moss">
                        Companion profile
                    </p>
                    <Link href="/companions" className="text-xs font-bold text-ink/50 hover:text-ink">
                        ← Back to Companions
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
                <div className="md:col-span-5 h-fit sticky top-24">
                     <div className="bg-paper rounded-2xl p-2.5 border border-line mb-5 shadow-sm">
                        <div className="aspect-[4/5] rounded-xl overflow-hidden relative bg-mist-deep">
                             {fellow.profilePhoto && !imgFailed ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={fellow.profilePhoto}
                                    alt={fellow.fullName || 'Companion'}
                                    onError={() => setImgFailed(true)}
                                    className="w-full h-full object-cover"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-ink text-signal">
                                    <span className="font-display text-6xl font-bold tracking-wider">
                                        {(fellow.fullName || fellow.username || '?')
                                            .split(/\s+/)
                                            .map(s => s[0])
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase() || '?'}
                                    </span>
                                </div>
                             )}
                             <div className="absolute top-3 right-3 bg-paper/95 px-3 py-1.5 rounded-lg shadow-sm border border-line">
                                <span className="text-xs font-bold text-ink">₹{fellow.pricePerHour || 400}/hr</span>
                             </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                         <div className="bg-paper p-4 rounded-xl border border-line flex flex-col items-center justify-center text-center">
                             <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 mb-1">City</span>
                             <span className="text-xs font-bold text-ink truncate w-full">{fellow.city || 'Available'}</span>
                         </div>
                         <div className="bg-paper p-4 rounded-xl border border-line flex flex-col items-center justify-center text-center">
                             <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 mb-1">Status</span>
                             <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                               <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-moss' : 'bg-ink/25'}`} />
                               {isActive ? 'Active' : 'Available'}
                             </span>
                         </div>
                     </div>
                </div>

                <div className="md:col-span-7 pt-2">
                    {step === 'review' && (
                        <div className="animate-slideUp">
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2 tracking-tight">
                                {fellow.fullName}
                            </h1>
                            <p className="text-ink/40 font-medium mb-4 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-moss"></span>
                                Verified companion
                            </p>

                            {userData?.genderPreference === 'women_only' && ((fellow?.gender || '').toLowerCase() === 'man' || (fellow?.gender || '').toLowerCase() === 'male') && (
                              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5 animate-fadeIn">
                                <p className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
                                  <span>🛡️</span>
                                  <span>Safety &amp; Matching Preference Notice</span>
                                </p>
                                <p className="leading-relaxed">
                                  Your current matching preference is set to <strong>Women companions only</strong>. To book companions of any gender, you can update your preference with consent anytime in{' '}
                                  <Link href="/settings/preferences" className="underline font-bold text-[#1E3A2F]">
                                    Matching Preferences →
                                  </Link>
                                </p>
                              </div>
                            )}

                            <p className="text-ink/60 mb-10 leading-relaxed text-lg font-medium">
                                &ldquo;{fellow.description || "I am here simply to be present. No expectations."}&rdquo;
                            </p>

                            <div className="mb-10">
                                <h3 className="text-[11px] font-semibold text-ink/40 uppercase tracking-[0.14em] mb-4">Comfort zones</h3>
                                <div className="flex flex-wrap gap-2">
                                    {comfortZones.map((tag, i) => (
                                        <span key={i} className="px-3.5 py-2 bg-paper border border-line rounded-xl text-sm font-semibold text-ink/70">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-paper rounded-2xl p-7 border border-line mb-8">
                                <h3 className="text-[11px] font-semibold text-ink/40 uppercase tracking-[0.14em] mb-6 flex justify-between items-center gap-3">
                                    <span>Typical availability</span>
                                    <span className="text-ink font-mono text-xs">{fellow.startTime || fellow.start_time || '09:00'} - {fellow.endTime || fellow.end_time || '22:00'} IST</span>
                                </h3>
                                
                                <div className="flex justify-between items-center gap-2">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                                        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                        const isAvail = fellow[days[i] + '_availability'] || (fellow.availability && fellow.availability[days[i]]) || true;
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${isAvail ? 'bg-ink text-paper' : 'bg-mist text-ink/35'}`}>
                                                    {d}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-mist-deep/50 rounded-2xl p-7 border border-line mb-8">
                                <h3 className="text-[11px] font-semibold text-ink/40 uppercase tracking-[0.14em] mb-6">Select date & time</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-ink/45 mb-2 uppercase tracking-wider">Date</label>
                                        <input 
                                            type="date" 
                                            value={bookingDate}
                                            min={minDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:border-moss transition-colors font-medium bg-paper"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-ink/45 mb-2 uppercase tracking-wider">Time</label>
                                        <input 
                                            type="time" 
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:border-moss transition-colors font-medium bg-paper"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-ink/45 mb-2 uppercase tracking-wider">Duration</label>
                                    <div className="flex gap-2">
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
                                                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${duration === d.value ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink/60 border-line hover:border-ink/30'}`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-ink/40 font-medium">
                                    Typically available: {fellow.startTime || fellow.start_time || '09:00'} - {fellow.endTime || fellow.end_time || '22:00'}
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => {
                                    if (!bookingDate) {
                                        showNotification('warning', 'Please select a date for your meetup.');
                                        return;
                                    }
                                    if (!bookingTime) {
                                        showNotification('warning', 'Please select a time for your meetup.');
                                        return;
                                    }
                                    setStep('hesitation');
                                }}
                                className="w-full py-4 rounded-full bg-moss text-white font-bold text-base hover:bg-moss-mid transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                Continue to Review →
                            </button>
                        </div>
                    )}

                    {step === 'hesitation' && (
                        <div className="animate-fadeIn bg-paper rounded-2xl p-8 border border-line">
                            <h2 className="font-display text-3xl font-bold mb-6 text-ink">Wait. Read this.</h2>
                            
                            <div className="space-y-3 mb-8">
                                {[
                                    { key: 'publicOnly', label: 'Public spaces only. No private homes.' },
                                    { key: 'noTouch', label: 'Absolutely no physical contact.' },
                                    { key: 'silenceOk', label: 'I accept silence as valid presence.' },
                                    { key: 'canLeave', label: 'I understand they can leave anytime.' }
                                ].map((item) => (
                                    <label key={item.key} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${checks[item.key] ? 'border-moss bg-moss-soft/40' : 'border-line'}`}>
                                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${checks[item.key] ? 'bg-moss border-moss' : 'border-ink/25'}`}>
                                            {checks[item.key] && <span className="text-white text-[10px]">✓</span>}
                                        </div>
                                        <input type="checkbox" checked={checks[item.key]} onChange={(e) => setChecks({...checks, [item.key]: e.target.checked})} className="hidden" />
                                        <span className={`text-sm font-medium ${checks[item.key] ? 'text-ink font-semibold' : 'text-ink/60'}`}>{item.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStep('review')} className="flex-1 py-3.5 bg-mist text-ink font-semibold rounded-xl border border-line hover:border-ink/30 transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={!Object.values(checks).every(Boolean) || submitting}
                                    className="flex-[2] py-3.5 bg-moss text-white font-bold rounded-xl hover:bg-moss-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {submitting ? 'Submitting...' : 'I agree & Send Request'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="animate-fadeIn bg-moss-soft/40 rounded-2xl p-10 text-center border border-moss/20">
                            <div className="w-16 h-16 bg-moss text-signal rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">✓</div>
                            <h2 className="font-display text-3xl font-bold text-ink mb-3">Request sent</h2>
                            <p className="text-ink/55 mb-8 font-medium">Sit tight. {fellow.fullName} will review your request.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button type="button" onClick={() => router.push('/my-bookings')} className="px-6 py-3 bg-ink text-paper rounded-full font-bold text-sm hover:bg-black transition-colors">
                                    View in My Bookings
                                </button>
                                <button type="button" onClick={() => router.push('/')} className="px-6 py-3 bg-paper rounded-full border border-line text-ink font-semibold text-sm hover:bg-mist transition-colors">
                                    Back to home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanionDetailClient;
