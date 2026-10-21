"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const VerificationGuard = () => {
    const { token, userData } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Exempt pages (Auth, Onboarding, Public Policies if needed)
    const isExemptPage = 
        pathname.startsWith('/onboarding') || 
        pathname.startsWith('/admin/onboarding') || 
        pathname === '/login' || 
        pathname === '/signup' || 
        pathname === '/logout' ||
        // Allow static public pages for everyone? User said "As soon as user onboards... unless he submits... he shouldn't be able to access anything".
        // So assuming STRICT blocking.
        false;

    // If no token, we assume public access or handled by middleware/other guards for protected routes.
    // But if logged in (token exists), enforce verification.
    if (!token || !userData) return null;

    const isSuperAdmin = userData?.role === 'superadmin';
    const isRegularUser = userData?.role === 'user';
    const status = userData?.verificationStatus || userData?.verification_status || 'not_submitted';
    const isVerified = userData?.is_verified || status === 'verified';
    
    // LOGIC:
    // 1. SuperAdmin -> Allow Everything.
    // 2. Regular Users -> Allow Everything (standard members don't need manual verification).
    // 3. Verified -> Allow Everything.
    // 4. Pending -> Allow Everything.
    // 5. Not Submitted / Rejected for companions/admins -> Block (Redirect to Onboarding).

    if (isSuperAdmin) return null;
    if (isRegularUser) return null;
    if (isVerified) return null;
    if (status === 'pending') return null;

    // If we are here, status is 'not_submitted' or 'rejected'
    if (!isExemptPage) {
        return (
            <div 
                className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="max-w-md bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-2xl animate-slideUp">
                    <div className="text-6xl mb-6 animate-pulse">🔒</div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 tracking-tight">
                        {status === 'rejected' ? 'Action Required' : 'One Last Step'}
                    </h2>
                    <p className="text-lg font-medium text-gray-500 mb-8 leading-relaxed">
                        {status === 'rejected' 
                            ? "Your verification was not approved. Please review our feedback and resubmit your documents."
                            : "To ensure safety for everyone, you must complete your verification before accessing the community."}
                    </p>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            if (userData?.role === 'admin') {
                                router.push('/admin/onboarding');
                            } else {
                                router.push('/onboarding');
                            }
                        }}
                        className="w-full py-4 bg-black text-white font-bold text-lg rounded-full hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        {status === 'rejected' ? 'Fix Application' : 'Complete Verification'}
                    </button>
                    {status === 'rejected' && (
                        <p className="mt-6 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 py-2 px-4 rounded-full inline-block">
                            Please check your details carefully
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default VerificationGuard;
