'use client';
import React from 'react';
import Link from 'next/link';
import Reveal from '../components/common/Reveal';

const steps = [
  {
    n: '01',
    title: 'Choose your activity & vibe',
    body: 'Whether you want a companion for casual café hopping, attending a cultural event, a quiet reading session, or walking through the city, pick the mode that suits your mood.',
    points: ['Clear expectations upfront', '100% Platonic only', 'No awkward small talk required'],
    color: '#D97757',
    badgeBg: 'bg-[#FDF1EC]',
    badgeText: 'text-[#D97757]',
  },
  {
    n: '02',
    title: 'Find your verified companion',
    body: 'Browse companion profiles with verified IDs, comfort zones, real ratings, and transparent hourly rates. Every companion has completed government ID inspection and phone verification.',
    points: ['100% ID verified', 'Ratings & reviews', 'Direct upfront pricing (₹400–₹800/hr)'],
    color: '#1E3A2F',
    badgeBg: 'bg-[#E8EFE9]',
    badgeText: 'text-[#1E3A2F]',
  },
  {
    n: '03',
    title: 'Meet in public — leave anytime',
    body: 'Sessions happen exclusively in daylight hours (7:00 AM – 10:00 PM) in open public spaces (cafés, parks, libraries, museums). No pressure, no obligations. End the session whenever you want.',
    points: ['Daylight hours (7 AM–10 PM)', 'Public venues only', 'Leave anytime with zero explanation'],
    color: '#2A4F40',
    badgeBg: 'bg-[#E8EFE9]',
    badgeText: 'text-[#1E3A2F]',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181B18] pb-24">
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 px-6 md:px-8 relative overflow-hidden border-b border-[#EAE6DF]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FDF1EC] rounded-full blur-3xl pointer-events-none opacity-70" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#E8EFE9] rounded-full blur-3xl pointer-events-none opacity-60" />

        <div className="max-w-4xl mx-auto relative text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-5">
              <span>●</span> Simple & Transparent
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] text-[#181B18]">
              No awkwardness. <br className="hidden sm:inline" />
              <span className="text-[#1E3A2F]">Just presence.</span>
            </h1>
            <p className="mt-5 text-base md:text-xl text-[#181B18]/70 font-medium max-w-xl mx-auto leading-relaxed">
              PRSNN is the lightest, safest way to book platonic companionship — designed to feel voluntary, respectful, and safe from the first tap.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Steps List */}
      <section className="py-16 md:py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i + 1}>
              <article className="p-8 md:p-12 rounded-[2rem] bg-white border border-[#EAE6DF] shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
                  {/* Step Number Circle */}
                  <div
                    className={`shrink-0 w-16 h-16 rounded-2xl ${step.badgeBg} ${step.badgeText} flex items-center justify-center font-display text-2xl font-black border border-[#EAE6DF]`}
                  >
                    {step.n}
                  </div>

                  {/* Step Body */}
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-black text-[#181B18] tracking-tight mb-3">
                      {step.title}
                    </h2>
                    <p className="text-[#181B18]/70 font-medium leading-relaxed text-base md:text-lg mb-6">
                      {step.body}
                    </p>

                    <div className="flex flex-wrap gap-2.5">
                      {step.points.map((p) => (
                        <span
                          key={p}
                          className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#181B18]/75 flex items-center gap-1.5"
                        >
                          <span className="text-[#1E3A2F] font-bold">✓</span>
                          <span>{p}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bottom CTA Card matching Figma */}
      <section className="px-6 md:px-8 max-w-4xl mx-auto">
        <div className="p-10 md:p-14 rounded-[2.5rem] bg-[#1E3A2F] text-white text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#D97757]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4">
              Ready when you are.
            </h2>
            <p className="text-white/80 font-medium text-base md:text-lg mb-8 leading-relaxed">
              Find a companion for today, or apply to join our verified community. Either way — presence without pressure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/companions"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#D97757] hover:bg-[#C26243] text-white font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Find a Companion →
              </Link>
              <Link
                href="/safety"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
              >
                Read Safety Charter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
