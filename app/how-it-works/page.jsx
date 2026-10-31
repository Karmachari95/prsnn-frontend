import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'How It Works — prsnn.',
  description: 'Learn how PRSNN works: book verified companions for platonic presence in daylight public spaces.',
};

const steps = [
  {
    n: '01',
    title: 'Choose your activity & vibe',
    body: 'Whether you want a companion for casual café hopping, attending an event, a quiet reading session, or walking through the city, pick the activity that suits your mood.',
    points: ['Clear expectations upfront', '100% Platonic only', 'No awkward small talk required'],
  },
  {
    n: '02',
    title: 'Find your verified companion',
    body: 'Browse companion profiles with verified IDs, comfort zones, real ratings, and transparent hourly rates. Every companion has completed government ID inspection and phone verification.',
    points: ['100% ID verified', 'Ratings & reviews', 'Direct upfront pricing (₹400–₹800/hr)'],
  },
  {
    n: '03',
    title: 'Meet in public — leave anytime',
    body: 'Sessions happen exclusively in daylight hours (7:00 AM – 10:00 PM) in open public spaces (cafés, parks, libraries, museums). No pressure, no obligations. End the session whenever you want.',
    points: ['Daylight hours (7 AM–10 PM)', 'Public venues only', 'Leave anytime with zero explanation'],
  },
];

const safetyRules = [
  { title: 'Public Spaces Only', desc: 'All sessions occur in open, public venues such as coffee shops, parks, and cultural centers. Private spaces and home visits are strictly prohibited.' },
  { title: 'Strictly Platonic', desc: 'PRSNN is solely for non-romantic companionship and shared presence. Romantic, physical, or sexual requests are strictly prohibited and result in permanent ban.' },
  { title: 'Daylight Hours', desc: 'Bookings only take place between 7:00 AM and 10:00 PM for the safety, comfort, and peace of mind of both companions and guests.' },
  { title: 'Voluntary & Safe', desc: 'Either party can end the session at any moment. Zero pressure, zero explanation required. Full refund policy applies.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181B18] pb-24">
      {/* Header */}
      <section className="pt-28 md:pt-36 pb-14 px-6 md:px-8 border-b border-[#EAE6DF] bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-4">
            Simple & Transparent
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#181B18] leading-tight">
            How PRSNN Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#181B18]/70 font-medium max-w-xl mx-auto leading-relaxed">
            The simplest, safest way to book platonic companionship for public activities. Presence without pressure.
          </p>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="py-14 md:py-20 px-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step) => (
            <div
              key={step.n}
              className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-[#EAE6DF]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8">
                <div className="w-14 h-14 rounded-xl bg-[#1E3A2F] text-white flex items-center justify-center font-display text-xl font-bold shrink-0">
                  {step.n}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#181B18] mb-2">
                    {step.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#181B18]/75 font-medium leading-relaxed mb-4">
                    {step.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.points.map((p) => (
                      <span
                        key={p}
                        className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#181B18]/80 flex items-center gap-1.5"
                      >
                        <span className="text-[#1E3A2F] font-bold">✓</span>
                        <span>{p}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Ground Rules */}
      <section className="px-6 md:px-8 max-w-4xl mx-auto mb-16">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#E8EFE9] border border-[#1E3A2F]/20">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1E3A2F] mb-6 text-center">
            Our Core Safety Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safetyRules.map((rule) => (
              <div key={rule.title} className="p-4 rounded-xl bg-white border border-[#1E3A2F]/15">
                <h3 className="font-bold text-sm text-[#1E3A2F] mb-1">{rule.title}</h3>
                <p className="text-xs text-[#181B18]/75 leading-relaxed font-medium">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 md:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#1E3A2F] text-white">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            Ready to book your companion?
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Find trusted companions in your city for quiet company, events, or café visits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/companions"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#D97757] text-white font-bold text-sm"
            >
              Browse Companions
            </Link>
            <Link
              href="/safety"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm"
            >
              Read Safety Charter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
