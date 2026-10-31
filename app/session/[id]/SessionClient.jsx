
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Chat from '../../components/Chat';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function SessionPage() {
    const { id } = useParams();
    const router = useRouter();
    const { userData, token } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            // Wait for auth to initialize or redirect
            return; 
        }

        const fetchBooking = async () => {
            try {
                 const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`, {
                     headers: { Authorization: `Bearer ${token}` }
                 });
                 setBooking(res.data);
            } catch (err) {
                console.error("Failed to fetch booking", err);
                router.push('/my-bookings');
            } finally {
                setLoading(false);
            }
        };
        
        if (userData) {
            fetchBooking();
        }
    }, [id, token, userData, router]);

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (userData.role !== 'companion' && booking?.paymentStatus !== 'paid') {
         return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans text-center">
                 <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
                     <span className="text-4xl mb-4 block">🔒</span>
                     <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Required</h1>
                     <p className="text-gray-500 mb-8">
                         You must complete the payment to join this session with <span className="font-bold text-gray-900">{booking?.companionId?.fullName || 'the companion'}</span>.
                     </p>
                     <button 
                         onClick={() => router.push('/my-bookings')} 
                         className="w-full px-6 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                     >
                         Go to My Requests
                     </button>
                 </div>
             </div>
         );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-50 font-sans">
            {/* Header */}
            <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-end pb-6 gap-4">
                 <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Active Session</h1>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">ID: {id}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                     {/* Show Payment Status Badge */}
                     {booking?.paymentStatus === 'paid' && (
                         <div className="px-4 py-2 bg-green-100 text-green-800 font-bold rounded-full text-xs uppercase tracking-widest border border-green-200 flex items-center gap-2">
                             ✓ Paid
                         </div>
                     )}
                     <button 
                        onClick={() => router.push('/my-bookings')}
                        className="px-6 py-2.5 bg-white text-gray-700 font-bold border border-gray-200 rounded-full hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all text-sm tracking-wide shadow-sm hover:shadow-md"
                    >
                        ← Back to Dashboard
                    </button>
                 </div>
            </div>

            {/* Session Guidelines Card */}
            <div className="w-full max-w-3xl mb-6">
                 <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <span className="text-2xl mt-1">📜</span>
                    <div>
                        <h3 className="font-bold uppercase text-gray-900 text-xs tracking-widest mb-2">Session Guidelines</h3>
                        <p className="font-medium text-gray-600 text-sm leading-relaxed">
                            Respect your fellow. Keep the conversation friendly and professional. 
                            Any inappropriate behavior will result in an immediate ban.
                        </p>
                    </div>
                 </div>
            </div>

            <div className="w-full flex-1 flex flex-col items-center justify-center">
                <Chat bookingId={id} />
            </div>
            
        </div>
    );
}
