"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/common/Alert";
import { generateStrongPassword } from "../utils/password";

const trustItems = [
  "Manually Verified Companions",
  "Public Meetups Only",
  "Leave Anytime",
  "Strict Community Guidelines",
];

const IconMail = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M5 7l7 5 7-5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconUser = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M5.5 19.5c1.5-3.2 4-4.8 6.5-4.8s5 1.6 6.5 4.8"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconLock = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="5"
      y="10"
      width="14"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M8 10V8a4 4 0 118 0v2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconEye = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

const IconEyeOff = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 3l18 18M10.5 10.6a2.75 2.75 0 003.9 3.9M7 7.4C4.6 8.8 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1M14.2 6.4A9.4 9.4 0 0112 5.5C6 5.5 2.5 12 2.5 12"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconPhone = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 5.5C3 14.06 9.94 21 18.5 21c.83 0 1.5-.67 1.5-1.5v-3.28a1.5 1.5 0 00-1.12-1.45l-3.56-.89a1.5 1.5 0 00-1.57.54l-1.12 1.37a13.9 13.9 0 01-5.59-5.59l1.37-1.12a1.5 1.5 0 00.54-1.57l-.89-3.56A1.5 1.5 0 006.78 3H3.5C2.67 3 2 3.67 2 4.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "bg-line" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-clay", width: "33%" };
  if (score <= 3) return { score: 2, label: "Good", color: "bg-amber-500", width: "66%" };
  return { score: 3, label: "Strong", color: "bg-moss", width: "100%" };
}

const AuthInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
  autoComplete,
  rightSlot,
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-ink/70">
      {label}
    </label>
    <div className="relative group/input">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35 group-focus-within/input:text-moss transition-colors duration-300">
        <Icon />
      </span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-14 md:h-[3.6rem] pl-12 pr-12 rounded-2xl bg-paper border border-line shadow-[0_1px_2px_rgba(14,17,13,0.04)] text-base font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:border-moss focus:ring-4 focus:ring-moss/10 focus:bg-white transition-all duration-300"
      />
      {rightSlot}
    </div>
  </div>
);

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get('role');

  const [state, setState] = useState(roleParam === 'companion' ? "Sign Up" : "Sign In");
  const [accountType, setAccountType] = useState(roleParam === 'companion' ? "companion" : "user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationImage, setVerificationImage] = useState(null);

  const { login } = useAuth();
  const isSignIn = state === "Sign In";
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (roleParam === 'companion') {
      setState("Sign Up");
      setAccountType("companion");
    }
    // Proactively warm up backend service on Render
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
    fetch(`${apiUrl}/api/health`, { method: 'GET' }).catch(() => {});
  }, [roleParam]);

  useEffect(() => {
    setAlert(null);
    setEmail("");
    setPassword("");
    setUsername("");
    setFullName("");
    setPhoneNumber("");
    setConfirmPassword("");
    setVerificationImage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [state]);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length < minLength) {
      return { valid: false, message: "Password must be at least 8 characters long" };
    }
    if (!hasUpperCase) {
      return { valid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!hasLowerCase) {
      return { valid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!hasNumber) {
      return { valid: false, message: "Password must contain at least one number" };
    }
    if (!hasSpecialChar) {
      return {
        valid: false,
        message: "Password must contain at least one special character (!@#$%^&*...)",
      };
    }
    return { valid: true };
  };

  const suggestPassword = async () => {
    const suggested = generateStrongPassword();
    // Fill both fields and reveal them so the user can see what they got.
    setPassword(suggested);
    setConfirmPassword(suggested);
    setShowPassword(true);
    setShowConfirmPassword(true);

    let copied = false;
    try {
      await navigator.clipboard.writeText(suggested);
      copied = true;
    } catch {
      // Clipboard can be unavailable (insecure context, permissions). The
      // password is visible on screen either way.
    }
    setAlert({
      type: "success",
      title: "Strong password ready",
      message: copied
        ? "Copied to your clipboard. Save it in a password manager before you continue."
        : "Save it in a password manager before you continue.",
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setAlert(null);
    setLoading(true);

    if (state === "Sign Up") {
      if (!fullName.trim()) {
        setAlert({
          type: "error",
          title: "Full Name Required",
          message: "Please enter your full name",
        });
        setLoading(false);
        return;
      }

      if (phoneNumber.trim().length !== 10) {
        setAlert({
          type: "error",
          title: "Invalid Phone Number",
          message: "Please enter a valid 10-digit mobile number",
        });
        setLoading(false);
        return;
      }

      if (username.length < 5) {
        setAlert({
          type: "error",
          title: "Invalid Username",
          message: "Username must be at least 5 characters long",
        });
        setLoading(false);
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setAlert({
          type: "error",
          title: "Invalid Password",
          message: passwordValidation.message,
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setAlert({ type: "error", title: "Error", message: "Passwords do not match" });
        setLoading(false);
        return;
      }
    }

    try {
      if (state === "Sign Up") {
        const formData = new FormData();
        formData.append("fullName", fullName.trim());
        formData.append("phoneNumber", phoneNumber.trim());
        formData.append("role", accountType);
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        if (verificationImage) {
          formData.append("verificationImage", verificationImage);
        }

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, formData);
        router.push(`/verify-email?email=${encodeURIComponent(email)}&role=${encodeURIComponent(accountType)}`);
      } else {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
        let response;
        try {
          response = await axios.post(
            `${apiUrl}/api/auth/login`,
            { email: email.trim(), password },
            { timeout: 60000 }
          );
        } catch (firstErr) {
          if (!firstErr.response) {
            setAlert({
              type: "warning",
              title: "Waking up server",
              message: "Connecting to PRSNN backend, please wait a moment..."
            });
            await new Promise(r => setTimeout(r, 2000));
            response = await axios.post(
              `${apiUrl}/api/auth/login`,
              { email: email.trim(), password },
              { timeout: 60000 }
            );
          } else {
            throw firstErr;
          }
        }
        const data = response.data;
        if (data.token) {
          login(data.token, data.user);
        }
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        (!error.response
          ? "The server was in sleep mode and is warming up. Please click Log In again in a few seconds."
          : "Something went wrong. Please try again.");

      if (error.response?.status === 403 && error.response?.data?.emailVerificationRequired) {
        const userEmail = error.response.data.email || email;
        setAlert({
          type: "warning",
          title: "Email Verification Required",
          message: "Redirecting you to verify your email...",
        });
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
        }, 2000);
      } else {
        setAlert({ type: "error", title: "Notice", message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-mist">
      {/* Soft ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-20 w-[32rem] h-[32rem] rounded-full bg-moss-soft/60 blur-[100px] animate-blob" />
        <div className="absolute bottom-0 -left-16 w-[28rem] h-[28rem] rounded-full bg-signal/15 blur-[90px] animate-blob-delayed" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-moss/10 blur-[80px] animate-blob-slow" />
        <div className="noise absolute inset-0 opacity-40" />
      </div>

      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-paper/80 backdrop-blur-md text-ink/50 hover:text-ink border border-line shadow-sm transition-all hover:scale-105"
        aria-label="Close and go home"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT — emotional branding */}
        <aside className="relative min-h-[42vh] lg:min-h-screen overflow-hidden">
          <Image
            src="/auth-side.webp"
            alt="Quiet company in a calm café"
            fill
            priority
            quality={80}
            sizes="(max-width:1024px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIRITMUFRYf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AzvG9p3G3w4m2uJY45ZBlVYgFs+tV7i7ku7mWeZizyMSxJ9TVVJJI5vZ2d3d3d3d3f//Z"
            className="object-cover object-[center_30%] animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent" />
          <div className="noise absolute inset-0" aria-hidden />

          <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12 lg:p-14 xl:p-16 text-paper">
            <div className="animate-hero-rise">
              <p className="font-display text-3xl md:text-4xl font-extrabold lowercase tracking-tight">
                prsnn<span className="text-signal">.</span>
              </p>
            </div>

            <div className="max-w-lg mt-10 lg:mt-0 animate-hero-rise-d1">
              <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-semibold tracking-tight leading-[1.12] text-white">
                Presence without pressure.
              </h1>
              <p className="mt-5 text-base md:text-lg text-white/65 font-medium leading-relaxed max-w-md">
                You&apos;re never expected to impress anyone here.
                <br className="hidden sm:block" />
                Whether you&apos;re looking for quiet company or offering yours,
                every connection begins with trust.
              </p>

              <div className="mt-8 p-5 md:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] animate-hero-rise-d2">
                <ul className="space-y-3">
                  {trustItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm md:text-[15px] font-medium text-white/90"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-signal/20 text-signal flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-10 lg:mt-0 text-sm md:text-base text-white/45 font-medium italic max-w-sm animate-hero-rise-d3">
              &ldquo;Sometimes the best conversations begin with silence.&rdquo;
            </p>
          </div>
        </aside>

        {/* RIGHT — form fills half screen */}
        <section className="relative flex min-h-screen lg:min-h-0 lg:h-screen bg-paper/80 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-line">
          <div className="w-full h-full flex flex-col justify-start lg:justify-center px-6 pt-16 pb-12 sm:px-10 md:px-14 lg:px-12 xl:px-16 animate-hero-rise-d2 overflow-y-auto">
              <p className="font-display text-xl font-extrabold lowercase tracking-tight text-ink mb-8 lg:hidden">
                prsnn<span className="text-moss">.</span>
              </p>

              <h2 className="font-display text-[clamp(1.75rem,3vw,2.625rem)] font-semibold tracking-tight text-ink leading-[1.15]">
                {isSignIn ? "Welcome Back" : "Join prsnn."}
              </h2>
              <p className="mt-3 text-base md:text-lg text-ink/55 font-medium leading-relaxed max-w-xl">
                {isSignIn
                  ? "Sign in to book companions, manage your sessions, and reconnect with people around you."
                  : "Create your account and start finding meaningful company—or become someone’s trusted companion."}
              </p>

              <form onSubmit={onSubmitHandler} className="mt-9 space-y-5 w-full max-w-none">
                {!isSignIn && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-ink/70">
                        I want to join as
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAccountType("user")}
                          className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            accountType === "user"
                              ? "bg-ink text-white border-ink shadow-sm"
                              : "bg-paper text-ink/70 border-line hover:border-ink/20"
                          }`}
                        >
                          <span className="text-base">👤</span> Member
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountType("companion")}
                          className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            accountType === "companion"
                              ? "bg-moss text-white border-moss shadow-sm"
                              : "bg-paper text-ink/70 border-line hover:border-ink/20"
                          }`}
                        >
                          <span className="text-base">⭐</span> Companion
                        </button>
                      </div>
                      <p className="text-xs text-ink/45 font-medium">
                        {accountType === "companion"
                          ? "Earn by offering presence and companionship for public activities."
                          : "Find and book companions for events, walks, cafes, and shared presence."}
                      </p>
                    </div>

                    <AuthInput
                      id="fullName"
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Sharma"
                      icon={IconUser}
                      required
                      autoComplete="name"
                    />

                    <AuthInput
                      id="phoneNumber"
                      label="Phone Number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(val);
                      }}
                      placeholder="10-digit mobile number"
                      icon={IconPhone}
                      required
                      autoComplete="tel"
                    />

                    <AuthInput
                      id="username"
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="At least 5 characters"
                      icon={IconUser}
                      required
                      autoComplete="username"
                    />
                  </>
                )}

                <AuthInput
                  id="email"
                  label={isSignIn ? "Email or Username" : "Email Address"}
                  type={isSignIn ? "text" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSignIn ? "you@email.com or username" : "you@email.com"}
                  icon={IconMail}
                  required
                  autoComplete={isSignIn ? "username" : "email"}
                />

                <AuthInput
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={IconLock}
                  required
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink/35 hover:text-ink transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  }
                />

                {!isSignIn && (
                  <div className="space-y-2 -mt-1" aria-live="polite">
                    {password.length > 0 && (
                      <div className="h-1.5 rounded-full bg-mist-deep overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-ink/50">
                        {password.length > 0 ? (
                          <>
                            Password strength:{" "}
                            <span className="text-ink">{strength.label}</span>
                          </>
                        ) : (
                          <>At least 8 characters with a capital, a number and a symbol</>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={suggestPassword}
                        className="shrink-0 text-xs font-semibold text-moss hover:text-ink underline underline-offset-4 decoration-moss/40 hover:decoration-ink transition-colors"
                      >
                        Suggest a strong password
                      </button>
                    </div>
                  </div>
                )}

                {!isSignIn && (
                  <AuthInput
                    id="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={IconLock}
                    required
                    autoComplete="new-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink/35 hover:text-ink transition-colors"
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    }
                  />
                )}

                {isSignIn && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="w-5 h-5 rounded-md border border-line bg-mist peer-checked:bg-ink peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-moss/40 flex items-center justify-center transition-colors">
                        {rememberMe && (
                          <svg className="w-3 h-3 text-signal" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6.5l2.5 2.5 4.5-5"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm font-medium text-ink/60">
                        Keep me signed in
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="text-sm font-semibold text-moss hover:text-ink transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden w-full h-14 rounded-full bg-ink text-paper font-bold text-base tracking-wide hover:bg-ink-soft hover:scale-[1.02] hover:shadow-[0_16px_40px_-12px_rgba(14,17,13,0.45)] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 disabled:shadow-none mt-1"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-paper/30 border-t-paper animate-spin" />
                        {isSignIn ? "Signing in…" : "Creating account…"}
                      </>
                    ) : isSignIn ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </span>
                </button>

                {!isSignIn && (
                  <p className="text-xs text-ink/45 font-medium leading-relaxed text-center pt-1">
                    By creating an account you agree to our{" "}
                    <Link href="/terms-of-service" className="text-ink underline underline-offset-2 hover:text-moss">
                      Terms
                    </Link>
                    ,{" "}
                    <Link href="/privacy-policy" className="text-ink underline underline-offset-2 hover:text-moss">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link href="/code-of-conduct" className="text-ink underline underline-offset-2 hover:text-moss">
                      Community Guidelines
                    </Link>
                    .
                  </p>
                )}
              </form>

              <p className="mt-8 text-center text-sm md:text-base text-ink/55 font-medium">
                {isSignIn ? (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setState("Sign Up")}
                      className="font-bold text-ink hover:text-moss transition-colors"
                    >
                      Create an account →
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setState("Sign In")}
                      className="font-bold text-ink hover:text-moss transition-colors"
                    >
                      Sign In →
                    </button>
                  </>
                )}
              </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const Login = () => (
  <Suspense fallback={<div className="min-h-screen bg-mist" />}>
    <LoginContent />
  </Suspense>
);

export default Login;
