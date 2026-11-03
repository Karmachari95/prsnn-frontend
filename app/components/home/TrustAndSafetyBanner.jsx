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
    <section className="py-20 md:py-24 bg-white border-y border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss mb-3">
            Safety by Design
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-ink tracking-tight">
            Built on trust, consent and boundaries.
          </h2>
          <p className="mt-3 text-base text-ink/60 font-medium">
            PRSNN is designed from the ground up for peace of mind. No surprises, no pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="p-8 rounded-3xl bg-mist border border-line hover:-translate-y-1 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-2xl shadow-sm mb-5">
                {p.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-ink/65 font-medium leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/safety"
            className="px-8 py-3.5 rounded-full bg-moss text-white font-bold text-sm hover:bg-moss-mid transition-colors"
          >
            Read Our 8 Core Safety Standards →
          </Link>
          <Link
            href="/agreement"
            className="px-8 py-3.5 rounded-full bg-white border border-line text-ink font-bold text-sm hover:bg-mist transition-colors"
          >
            Review Boundaries Agreement
          </Link>
        </div>
      </div>
    </section>
  );
}
