import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ booking, onClose, onSuccess }) => {
    const { token, userData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

    // Load razorpay script dynamically
    useEffect(() => {
        const loadRazorpayScript = () => {
            if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                setIsRazorpayLoaded(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => setIsRazorpayLoaded(true);
            document.body.appendChild(script);
        };
        loadRazorpayScript();
    }, []);

    const handlePayment = async () => {
        if (!isRazorpayLoaded) {
            setError("Payment gateway is still loading. Please try again in a moment.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Create order on the backend
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-intent`,
                { bookingId: booking._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Open Razorpay Checkout modal
            const options = {
                key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount, // Amount is in paise
                currency: data.currency || 'INR',
                name: "PRSNN",
                description: `PRSNN Companionship Booking`,
                order_id: data.orderId,
                handler: async function (response) {
                    setIsLoading(true);
                    try {
                        // 3. Verify payment on the backend
                        await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify-payment`,
                            {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                bookingId: booking._id
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        onSuccess({ id: response.razorpay_payment_id, status: 'succeeded' });
                    } catch (verifyErr) {
                         console.error("Verification failed", verifyErr);
                         setError("Payment succeeded but verification failed on our server. Please contact support.");
                         setIsLoading(false);
                    }
                },
                prefill: {
                    name: userData?.fullName || "",
                    email: userData?.email || "",
                    contact: userData?.phoneNumber || "", // Must be a valid 10-digit Indian mobile number for UPI to appear
                },
                method: {
                    upi: true,        // Explicitly enable UPI
                    card: true,
                    netbanking: true,
                    wallet: true,
                    emi: false,
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [
                                    { method: "upi" },
                                ],
                            },
                            other: {
                                name: "Other Payment Methods",
                                instruments: [
                                    { method: "card" },
                                    { method: "netbanking" },
                                    { method: "wallet" },
                                ],
                            },
                        },
                        sequence: ["block.upi", "block.other"],
                        preferences: {
                            show_default_blocks: false,
                        },
                    },
                },
                theme: {
                    color: "#16a34a" // Tailwind green-600
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            
            paymentObject.on('payment.failed', function (response){
                 setError(response.error.description);
                 setIsLoading(false);
            });

            paymentObject.open();
            // Hand off to Razorpay UI; loading will reset via handler/dismiss
            // (loading reset also handled by modal.ondismiss)

        } catch (err) {
            console.error("Failed to initialize payment", err);
            const serverError = err.response?.data?.error;
            const message = err.response?.data?.message || err.message || "Failed to initialize payment.";
            setError(serverError ? `${message}: ${serverError}` : message);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-xl max-w-md w-full p-8 overflow-hidden">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
                
                <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">Complete Payment</h3>
                    <p className="text-gray-500 mt-2">
                        Complete your payment to enter the session with <span className="font-bold text-black">{booking.companionId?.fullName || "your Companion"}</span>
                    </p>
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-left space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span>Companion Fee ({booking.duration || 60} mins)</span>
                            <span>₹{(booking.basePrice || (booking.pricePerHour * ((parseInt(booking.duration, 10) || 60) / 60))).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span>PRSNN Safety & Platform Fee</span>
                            <span>₹{(booking.platformFee ?? 50).toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                            <span className="text-xs text-gray-700 uppercase tracking-widest font-bold">Total Prepaid</span>
                            <span className="text-2xl font-black text-gray-950">
                               ₹{(booking.totalAmount || ((booking.basePrice || (booking.pricePerHour * ((parseInt(booking.duration, 10) || 60) / 60))) + (booking.platformFee ?? 50))).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                <div className="mt-6 flex flex-col gap-3 w-full">
                    <button 
                        onClick={handlePayment}
                        disabled={isLoading || !isRazorpayLoaded}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : (!isRazorpayLoaded ? 'Loading setup...' : '🔒 Pay Now (UPI / Card / Net Banking)')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
