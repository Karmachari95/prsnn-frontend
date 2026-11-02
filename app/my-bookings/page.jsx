"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../components/common/Loading';
import axios from 'axios';
import Link from 'next/link';
import PaymentModal from '../components/PaymentModal';
import { useNotification } from '../context/NotificationContext';

const MyBookings = () => {
    const { userData, token } = useAuth();
    const router = useRouter();
    const { showNotification } = useNotification();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Incident Report Modal
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportingBooking, setReportingBooking] = useState(null);
    const [reportReason, setReportReason] = useState('Boundaries Violation');
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        if (!activeToken) {
            router.push('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                let url = '';
                if (userData?.role === 'companion') {
                    url = `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/incoming-requests`;
                } else {
                    url = `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-requests`;
                }

                if (url) {
                    const res = await axios.get(url, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setBookings(res.data);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userData) {
            fetchBookings();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, token]);

    const handleAction = async (bookingId, newStatus) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`, 
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } });
            
            // Update local state
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
            showNotification('success', `Booking status updated to ${newStatus}`);
        } catch (error) {
            console.error("Action failed", error);
            showNotification('error', "Failed to update status");
        }
    };
    
    const handlePaymentSuccess = () => {
        const bookingId = selectedBooking?._id;
        if (bookingId) {
             setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, paymentStatus: 'paid', status: 'paid_awaiting_companion' } : b));
             setPaymentModalOpen(false);
             showNotification('success', 'Payment received. Finding an eligible companion...');
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportDetails.trim()) {
            showNotification('error', 'Please provide details of the incident.');
            return;
        }

        setSubmittingReport(true);
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${reportingBooking._id}/report`,
                { reason: reportReason, details: reportDetails },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('success', 'Incident reported to PRSNN safety team. We take all reports seriously.');
            setReportModalOpen(false);
            setReportDetails('');
            setReportingBooking(null);
        } catch (err) {
            console.error('Report submission failed:', err);
            showNotification('error', err.response?.data?.message || 'Failed to submit report.');
        } finally {
            setSubmittingReport(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': 
                return { text: 'Awaiting Acceptance', color: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' };
            case 'paid_awaiting_companion':
                return { text: 'Prepaid · Matching Companion', color: 'bg-[#E8EFE9] text-[#2F4A34] border-[#2F4A34]/30 font-bold' };
            case 'accepted': 
                return { text: 'Confirmed Session', color: 'bg-[#E8EFE9] text-[#1E3A2F] border-[#1E3A2F]/20 font-bold' };
            case 'rejected': 
                return { text: 'Declined', color: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' };
            case 'refund_pending':
                return { text: 'Refund Pending', color: 'bg-[#E8EFE9] text-[#2F4A34] border-[#2F4A34]/30' };
            case 'cancelled':
                return { text: 'Cancelled', color: 'bg-[#FAF8F5] text-[#181B18]/60 border-[#EAE6DF]' };
            default: 
                return { text: status, color: 'bg-[#FAF8F5] text-[#181B18]/60 border-[#EAE6DF]' };
        }
    };

    const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

    if (loading || !userData) {
        return <Loading />;
    }

    return (
       <div className="min-h-screen pt-28 md:pt-36 pb-24 px-4 md:px-8 max-w-5xl mx-auto font-sans bg-[#FAF8F5] text-[#181B18]">
           {/* Header Section */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                     <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-3 border border-[#1E3A2F]/15">
                        <span className="w-2 h-2 rounded-full bg-[#2F4A34]" />
                        <span>{userData.role === 'companion' ? 'Companion Sessions' : 'Presence without pressure'}</span>
                     </div>
                     <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[#181B18]">
                        {userData.role === 'companion' ? 'Companion Sessions' : 'My Bookings'}
                     </h1>
                </div>
                {userData.role !== 'companion' && (
                    <Link href="/companions">
                        <button className="px-6 py-3 bg-[#2F4A34] text-white font-bold hover:bg-[#1E3A2F] transition-all rounded-full shadow-sm text-xs uppercase tracking-wider">
                            + Find Companion
                        </button>
                    </Link>
                )}
           </div>

           {/* Filter Tabs */}
           <div className="flex flex-wrap gap-2.5 mb-8">
               {[
                   { key: 'all', label: 'All' },
                   { key: 'paid_awaiting_companion', label: 'Matching' },
                   { key: 'accepted', label: 'Confirmed' },
                   { key: 'pending', label: 'Pending' },
                   { key: 'rejected', label: 'Declined' }
               ].map((f) => (
                   <button
                       key={f.key}
                       onClick={() => setFilter(f.key)}
                       className={`px-4 py-2 rounded-full font-bold text-xs transition-all border ${
                           filter === f.key 
                           ? 'bg-[#1E3A2F] text-white border-[#1E3A2F] shadow-sm' 
                           : 'bg-white text-[#181B18]/65 border-[#EAE6DF] hover:bg-[#FAF8F5]'
                       }`}
                   >
                       {f.label}
                       <span className={`ml-2 text-[10px] py-0.5 px-1.5 rounded-full ${filter === f.key ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#181B18]/50'}`}>
                           {f.key === 'all' ? bookings.length : bookings.filter(b => b.status === f.key).length}
                       </span>
                   </button>
               ))}
           </div>

           {/* Bookings List */}
           {filteredBookings.length === 0 ? (
               <div className="bg-white rounded-[2rem] p-12 md:p-20 text-center shadow-sm border border-[#EAE6DF]">
                    <div className="text-5xl mb-5 opacity-40">🌿</div>
                    <h3 className="font-display text-2xl font-black text-[#181B18] mb-2">No bookings found</h3>
                    <p className="text-[#181B18]/60 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                        {filter === 'all' 
                            ? "Presence without pressure. Ready to find someone to sit, walk, or explore with?" 
                            : `You don't have any requests matching this filter.`}
                    </p>
                    {userData.role !== 'companion' && filter === 'all' && (
                        <button 
                            onClick={() => router.push('/companions')}
                            className="px-8 py-3 bg-[#1E3A2F] text-white font-bold rounded-full hover:bg-[#152a22] shadow-sm transition-all text-xs uppercase tracking-wider"
                        >
                            Explore Companions
                        </button>
                    )}
               </div>
           ) : (
               <div className="grid gap-6">
                   {filteredBookings.map((booking) => {
                       const badge = getStatusBadge(booking.status);
                       const partner = userData.role === 'companion' ? booking.requesterId : booking.companionId;
                       const partnerName = partner?.displayName || partner?.fullName || partner?.username || 'Companion';

                       return (
                           <div key={booking._id} className="group relative bg-white border border-[#EAE6DF] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-all duration-300">
                               
                               {/* Status Badge */}
                               <div className={`self-start md:absolute md:top-6 md:right-6 px-3.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${badge.color}`}>
                                   {badge.text}
                               </div>

                               {/* Avatar Section */}
                               <div className="flex-shrink-0">
                                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#EAE6DF]">
                                       {/* eslint-disable-next-line @next/next/no-img-element */}
                                       <img 
                                            src={partner?.profilePhotoUrl || "/profile_pic.png"} 
                                            alt={partnerName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = "/profile_pic.png"; }}
                                       />
                                   </div>
                               </div>

                               {/* Content Section */}
                               <div className="flex-grow space-y-3">
                                   <div>
                                       <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                           {userData.role === 'companion' ? 'Booked by' : 'Companion'}
                                       </span>
                                       <h3 className="font-display text-xl md:text-2xl font-bold text-[#181B18]">
                                           {partnerName}
                                       </h3>
                                   </div>

                                   {/* Details grid */}
                                   <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                                       {booking.activity && (
                                           <span className="bg-[#FAF8F5] px-3.5 py-1 rounded-full border border-[#EAE6DF] font-semibold text-gray-800">
                                               🎯 {booking.activity}
                                           </span>
                                       )}
                                       {booking.scheduledDate && (
                                           <span className="bg-[#FAF8F5] px-3.5 py-1 rounded-full border border-[#EAE6DF]">
                                               📅 {booking.scheduledDate} {booking.startTime ? `@ ${booking.startTime}` : ''}
                                           </span>
                                       )}
                                       <span className="bg-[#FAF8F5] px-3.5 py-1 rounded-full border border-[#EAE6DF]">
                                           ⏳ {(() => {
                                               const m = parseInt(booking.duration, 10) || 60;
                                               return m >= 60 ? `${m / 60} hr${m / 60 > 1 ? 's' : ''}` : `${m} mins`;
                                           })()}
                                       </span>
                                       <span className="bg-[#FAF8F5] px-3.5 py-1 rounded-full border border-[#EAE6DF] font-bold text-gray-900">
                                           💳 ₹{booking.totalAmount || (booking.pricePerHour * ((parseInt(booking.duration, 10) || 60) / 60) + (booking.platformFee ?? 50))}
                                       </span>
                                   </div>

                                   {booking.location && (
                                       <div className="text-xs text-gray-600 flex items-center gap-1.5">
                                           <span>📍 Public Location:</span>
                                           <strong className="text-gray-900">{booking.location}</strong>
                                       </div>
                                   )}

                                   {/* Sequential offer info for matching state */}
                                   {booking.status === 'paid_awaiting_companion' && (
                                       <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                                           ⏳ We have notified the companion. If unavailable within the acceptance window, PRSNN will automatically offer your booking to up to 2 other eligible verified companions or issue an immediate 100% refund.
                                       </div>
                                   )}

                                   {/* Action Buttons */}
                                   <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                       <button
                                           type="button"
                                           onClick={() => {
                                               setReportingBooking(booking);
                                               setReportModalOpen(true);
                                           }}
                                           className="text-xs font-semibold text-red-500 hover:text-red-700 underline"
                                       >
                                           Report safety concern
                                       </button>

                                       <div className="flex items-center gap-3 ml-auto">
                                           {userData.role === 'companion' && (booking.status === 'pending' || booking.status === 'paid_awaiting_companion') ? (
                                               <div className="flex gap-2">
                                                   <button 
                                                        onClick={() => handleAction(booking._id, 'accepted')}
                                                        className="px-5 py-2 bg-green-600 text-white font-bold rounded-full shadow-sm hover:bg-green-700 transition-all text-xs"
                                                   >
                                                       Accept Session
                                                   </button>
                                                   <button 
                                                        onClick={() => handleAction(booking._id, 'rejected')}
                                                        className="px-5 py-2 bg-white text-gray-700 font-bold border border-gray-200 rounded-full hover:bg-red-50 hover:text-red-600 transition-all text-xs"
                                                   >
                                                       Decline
                                                   </button>
                                               </div>
                                           ) : (
                                               <>
                                                   {booking.status === 'accepted' && (
                                                       <Link href={`/session/${booking._id}`}>
                                                           <button className="px-5 py-2.5 bg-[#1E3A2F] text-white font-bold rounded-full shadow hover:bg-black transition-all text-xs flex items-center gap-1.5">
                                                               <span>🟢</span> Enter Session Room
                                                           </button>
                                                       </Link>
                                                   )}
                                                   {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                                                       <button 
                                                           onClick={() => { setSelectedBooking(booking); setPaymentModalOpen(true); }}
                                                           className="px-5 py-2 bg-green-600 text-white font-bold rounded-full shadow hover:bg-green-700 transition-all text-xs"
                                                       >
                                                           Prepay & Request
                                                       </button>
                                                   )}
                                               </>
                                           )}
                                       </div>
                                   </div>
                               </div>
                           </div>
                       );
                   })}
               </div>
           )}
           
           {/* Payment Modal */}
           {paymentModalOpen && selectedBooking && (
                <PaymentModal 
                    booking={selectedBooking} 
                    onClose={() => setPaymentModalOpen(false)} 
                    onSuccess={handlePaymentSuccess} 
                />
            )}

            {/* Report Incident Modal */}
            {reportModalOpen && reportingBooking && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl relative">
                        <button
                            onClick={() => setReportModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-black font-bold"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Report Safety Incident
                        </h3>
                        <p className="text-xs text-gray-500 mb-5">
                            PRSNN maintains zero tolerance for boundary violations, harassment, or unsafe behavior. All reports are immediately reviewed by administrators.
                        </p>

                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                                    Reason
                                </label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:border-black outline-none"
                                >
                                    <option value="Boundaries Violation">Boundaries Violation (Physical contact / Private space)</option>
                                    <option value="Inappropriate Conversation">Inappropriate or Coercive Conversation</option>
                                    <option value="Non-Public Location Request">Request to meet in non-public space</option>
                                    <option value="No Show / Unprofessional">No Show / Unprofessional</option>
                                    <option value="Other">Other Safety Concern</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                                    Details <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    placeholder="Please describe what happened, including time, location, and details..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:border-black outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReportModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReport}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                    {submittingReport ? 'Submitting...' : 'Submit Incident Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
       </div>
    );
};

export default MyBookings;
