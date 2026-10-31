"use client";
import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import Hero from './components/home/Hero';
import RealMoments from './components/home/RealMoments';
import TrustAndSafetyBanner from './components/home/TrustAndSafetyBanner';
import FeaturedCompanions from './components/home/FeaturedCompanions';
import FinalCTA from './components/home/FinalCTA';

export default function Home() {
  const { userData, token, logout } = useAuth();

  const checkProfileStatus = useCallback(async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  useEffect(() => {
    if (token && userData) {
      checkProfileStatus();
    }
  }, [token, userData, checkProfileStatus]);

  return (
    <main className="bg-[#FAF8F5] min-h-screen">
      {/* 1. Hero with clear messaging & primary actions */}
      <Hero />

      {/* 2. Visual Everyday Experiences */}
      <RealMoments />

      {/* 3. Live Verified Companions Preview */}
      <FeaturedCompanions />

      {/* 4. Safety & Trust Pillars with direct link to /safety */}
      <TrustAndSafetyBanner />

      {/* 5. Founder Quote & Our Story Teaser */}
      <section className="py-20 md:py-24 px-5 md:px-8 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-white border border-[#EAE6DF] p-8 md:p-14 shadow-sm text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider">
            About the Founder
          </span>
          <blockquote className="mt-6 font-display text-2xl md:text-3xl font-bold text-[#181B18] leading-snug">
            &ldquo;Because sometimes, you don&rsquo;t need someone to solve your problems. You just need someone beside you.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-semibold text-[#181B18]/60">
            &mdash; Mukarram Jah, Founder of PRSNN
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/about/founder"
              className="px-6 py-3 rounded-full bg-[#1E3A2F] hover:bg-[#152A22] text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Meet Mukarram Jah &rarr;
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#EAE6DF] text-[#181B18] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Our Story & Mission
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Clean Final CTA */}
      <FinalCTA />
    </main>
  );
}
