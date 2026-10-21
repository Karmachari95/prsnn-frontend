"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Alert from "../components/common/Alert";
import { useAuth } from "../context/AuthContext";
import AuthShell, { AuthField, AuthSubmit, IconMail } from "../components/auth/AuthShell";

const RESEND_COOLDOWN_S = 30;

const VerifyEmailContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type, title, message }
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    // Resend cooldown — stops the button being hammered while an email is in flight.
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setMessage({ type: "error", title: "Check the code", message: "The code is 6 digits." });
            return;
        }
        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
                email,
                otp,
            });
            const data = response.data;
            if (data.token) {
                setMessage({ type: "success", title: "Email verified", message: "Taking you in…" });
                await login(data.token, data.user);
                const roleParam = searchParams.get("role");
                if (data.user?.role === 'companion' || roleParam === 'companion') {
                    router.push("/onboarding?role=companion");
                }
            } else {
                setMessage({ type: "success", title: "Email verified", message: "Redirecting to sign in…" });
                router.push("/login");
            }
        } catch (error) {
            setMessage({
                type: "error",
                title: "That code didn't work",
                message: error.response?.data?.message || "Check the 6 digits and try again, or request a new code.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            setMessage({ type: "error", title: "Email needed", message: "Enter the email you signed up with first." });
            return;
        }
        if (cooldown > 0) return;
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, { email });
            setMessage({ type: "success", title: "New code sent", message: `Check ${email} — and the spam folder, just in case.` });
            setCooldown(RESEND_COOLDOWN_S);
        } catch (error) {
            setMessage({
                type: "error",
                title: "Couldn't send a new code",
                message: error.response?.data?.message || "Please try again in a moment.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="One last step"
            title="Check your inbox"
            subtitle={
                email
                    ? <>We sent a 6-digit code to <span className="text-ink font-semibold break-all">{email}</span>. It expires in 10 minutes.</>
                    : "Enter the email you signed up with and the 6-digit code we emailed you."
            }
            footer={
                <>
                    Wrong account?{" "}
                    <Link href="/login" className="font-semibold text-moss hover:text-ink transition-colors">
                        Back to sign in
                    </Link>
                </>
            }
        >
            {message && (
                <Alert
                    type={message.type}
                    title={message.title}
                    message={message.message}
                    onClose={() => setMessage(null)}
                />
            )}

            <form onSubmit={handleVerify} className="space-y-5">
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon={IconMail}
                    required
                    autoComplete="email"
                />

                <AuthField
                    id="otp"
                    label="6-digit code"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus={!!email}
                    className="!pl-5 text-center font-display text-2xl font-semibold tracking-[0.45em] placeholder:tracking-[0.45em] placeholder:text-ink/20"
                />

                <AuthSubmit loading={loading} loadingText="Verifying…">
                    Verify email
                </AuthSubmit>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-ink/50">Didn&apos;t get it?</span>
                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || cooldown > 0}
                    className="font-semibold text-moss hover:text-ink transition-colors disabled:text-ink/35 disabled:cursor-not-allowed tabular-nums"
                >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
            </div>
        </AuthShell>
    );
};

const VerifyEmail = () => (
    <Suspense fallback={<div className="min-h-screen bg-mist" />}>
        <VerifyEmailContent />
    </Suspense>
);

export default VerifyEmail;
