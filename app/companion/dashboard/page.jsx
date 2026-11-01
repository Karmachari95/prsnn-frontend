"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";

export default function CompanionDashboardPage() {
  const router = useRouter();
  const { userData, token } = useAuth();

  const [availableForBookings, setAvailableForBookings] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 12,
    earnings: 8400,
    rating: 4.8,
    reviewCount: 120,
  });

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) {
      router.push("/login?role=companion");
      return;
    }
    setLoading(false);
  }, [token, router]);

  const toggleAvailability = async () => {
    const nextState = !availableForBookings;
    setAvailableForBookings(nextState);
    try {
      const activeToken = token || localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ isAvailable: nextState }),
      });
    } catch (e) {
      console.warn("Failed to update availability status", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-moss/20 border-t-moss rounded-full animate-spin" />
      </div>
    );
  }

  const companionName = userData?.displayName || userData?.fullName || "Companion";
  const profilePhoto = userData?.profilePhoto || userData?.profilePhotoUrl || "/mode-sit-with-me.png";

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-moss selection:text-paper">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Figma Screen 20: Companion Header */}
        <div className="bg-paper rounded-3xl border border-line p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-moss/30 shadow-sm shrink-0">
                <Image
                  src={profilePhoto}
                  alt={companionName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-moss-soft/60 border border-moss/15 text-[11px] font-bold text-moss uppercase tracking-wider mb-1">
                  <span>⭐ Verified Companion</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
                  Welcome, {companionName}
                </h1>
                <p className="text-xs text-ink/55 font-medium flex items-center gap-1 mt-0.5">
                  <span className="text-amber-500 font-bold">★ {stats.rating}</span>
                  <span>({stats.reviewCount} verified reviews)</span>
                </p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 bg-mist/60 px-4 py-2.5 rounded-2xl border border-line">
              <span className="text-xs font-bold text-ink">
                Available for bookings
              </span>
              <button
                type="button"
                onClick={toggleAvailability}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  availableForBookings ? "bg-moss" : "bg-ink/20"
                }`}
                aria-label="Toggle availability"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    availableForBookings ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards matching Figma Screen 20 */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-paper p-5 rounded-2xl border border-line text-center shadow-sm">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Bookings</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink mt-1">
              {stats.totalBookings}
            </p>
          </div>
          <Link
            href="/companion/earnings"
            className="bg-paper p-5 rounded-2xl border border-line text-center shadow-sm hover:border-moss/40 hover:bg-moss-soft/10 transition-all cursor-pointer"
          >
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Earnings</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-moss mt-1">
              ₹{stats.earnings.toLocaleString("en-IN")}
            </p>
          </Link>
          <div className="bg-paper p-5 rounded-2xl border border-line text-center shadow-sm">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Rating</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink mt-1 flex items-center justify-center gap-1">
              <span className="text-amber-500 text-xl">★</span>
              <span>{stats.rating}</span>
            </p>
          </div>
        </div>

        {/* Women's Safety Status Banner */}
        <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#1E3A2F]/15 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E3A2F]">
              <span className="w-2 h-2 rounded-full bg-[#2F4A34]" />
              <span>Women&apos;s Safety First Protected</span>
            </div>
            <p className="text-xs text-[#181B18]/75 font-medium leading-relaxed">
              Default filter: receiving bookings from women companions only. You have a free hand to update this anytime.
            </p>
          </div>
          <Link
            href="/settings/preferences"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-[#1E3A2F]/20 text-xs font-bold text-[#1E3A2F] hover:bg-[#1E3A2F] hover:text-white transition-colors shrink-0"
          >
            Preferences →
          </Link>
        </div>

        {/* Navigation Rows matching Figma Screen 20 */}
        <div className="bg-paper rounded-3xl border border-line divide-y divide-line overflow-hidden shadow-sm">
          <Link
            href="/my-bookings"
            className="p-5 flex items-center justify-between hover:bg-mist/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-lg">
                📅
              </span>
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-moss transition-colors">
                  Upcoming Bookings
                </p>
                <p className="text-xs text-ink/50 font-medium">
                  View scheduled sessions and request queue
                </p>
              </div>
            </div>
            <span className="text-ink/40 group-hover:text-ink text-sm font-bold">→</span>
          </Link>

          <Link
            href="/companion/earnings"
            className="p-5 flex items-center justify-between hover:bg-mist/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-lg">
                💳
              </span>
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-moss transition-colors">
                  Payouts &amp; Earnings
                </p>
                <p className="text-xs text-ink/50 font-medium">
                  Review completed sessions and bank transfer status
                </p>
              </div>
            </div>
            <span className="text-ink/40 group-hover:text-ink text-sm font-bold">→</span>
          </Link>

          <Link
            href="/profile"
            className="p-5 flex items-center justify-between hover:bg-mist/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-lg">
                ✏️
              </span>
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-moss transition-colors">
                  Edit Profile &amp; Hourly Rate
                </p>
                <p className="text-xs text-ink/50 font-medium">
                  Update bio, tags, city, and pricing per hour
                </p>
              </div>
            </div>
            <span className="text-ink/40 group-hover:text-ink text-sm font-bold">→</span>
          </Link>

          <Link
            href="/profile"
            className="p-5 flex items-center justify-between hover:bg-mist/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-lg">
                🕒
              </span>
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-moss transition-colors">
                  Availability Calendar
                </p>
                <p className="text-xs text-ink/50 font-medium">
                  Set available days of the week and operating hours
                </p>
              </div>
            </div>
            <span className="text-ink/40 group-hover:text-ink text-sm font-bold">→</span>
          </Link>

          <Link
            href="/settings/preferences"
            className="p-5 flex items-center justify-between hover:bg-mist/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-lg">
                🛡️
              </span>
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-moss transition-colors">
                  Matching Preferences
                </p>
                <p className="text-xs text-ink/50 font-medium">
                  Choose who you accept bookings from (women only / any gender)
                </p>
              </div>
            </div>
            <span className="text-ink/40 group-hover:text-ink text-sm font-bold">→</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
