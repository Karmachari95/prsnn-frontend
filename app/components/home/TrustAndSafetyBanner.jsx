'use client';

import React from 'react';
import Link from 'next/link';

export default function TrustAndSafetyBanner() {
  const pillars = [
    {
      icon: '🛡️',
      title: '100% ID Verified',
      desc: 'Every companion completes government ID check and phone verification before their first meetup.'
    },
    {
      icon: '☀️',
      title: 'Daylight & Public Places',
      desc: 'All sessions are strictly held in public spaces between 7:00 AM and 10:00 PM.'
    },
    {
      icon: '🤝',
      title: 'Platonic & Zero Pressure',
      desc: 'Clear boundaries, strictly voluntary companionship. Anyone can end a session anytime.'
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-white border-y border-[#EAE6DF]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A2F] mb-3">
            Safety by Design
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-[#181B18] tracking-tight">
            Built on trust, consent and boundaries.
          </h2>
          <p className="mt-3 text-base text-[#181B18]/60 font-medium">
            PRSNN is designed from the ground up for peace of mind. No surprises, no pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#EAE6DF] hover:-translate-y-1 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE6DF] flex items-center justify-center text-2xl shadow-sm mb-5">
                {p.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-[#181B18] mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-[#181B18]/65 font-medium leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/safety"
            className="px-8 py-3.5 rounded-full bg-[#1E3A2F] text-white font-bold text-sm hover:bg-[#152A22] transition-colors"
          >
            Read Our 8 Core Safety Standards →
          </Link>
          <Link
            href="/agreement"
            className="px-8 py-3.5 rounded-full bg-white border border-[#EAE6DF] text-[#181B18] font-bold text-sm hover:bg-[#FAF8F5] transition-colors"
          >
            Review Boundaries Agreement
          </Link>
        </div>
      </div>
    </section>
  );
}
