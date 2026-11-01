'use client';

import Link from 'next/link';
import Reveal from '../common/Reveal';
import SectionHeader from '../common/SectionHeader';

const items = [
  {
    title: 'Manual ID Review',
    desc: 'Our team reviews every companion’s ID documents by hand before they go live.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="9" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
        <path d="M13.5 10.5h5M13.5 13.5h3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Public Meetups',
    desc: 'Sessions happen in open, public places — never private homes by default.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    title: 'Emergency Support',
    desc: 'Help is available when something feels off during a session.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    title: 'Report Users',
    desc: 'Flag behaviour that breaks guidelines — we take it seriously.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M5 4v16M5 5h11l-2 3.5L16 12H5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Leave Anytime',
    desc: 'You can end a meetup the moment it no longer feels right.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M14 8l4 4-4 4M18 12H9M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Community Standards',
    desc: 'Clear rules for platonic, respectful presence — always.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
        <path d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Safety() {
  return (
    <section id="safety" className="py-24 md:py-[7.5rem] bg-ink text-paper relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-moss/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-signal/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeader
          eyebrow="Safety"
          title="Designed Around Safety."
          subtitle="Manually verified companions. Public meetups only. Community guidelines. Emergency support. Leave anytime."
          light
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={Math.min((i % 3) + 1, 3)}>
              <div className="group h-full rounded-[1.35rem] bg-white/5 border border-white/10 p-6 md:p-7 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-signal/15 text-signal flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-base text-white/55 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center flex flex-wrap justify-center gap-4">
          <Link
            href="/safety"
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all hover:scale-105"
          >
            Read Full Safety Standards & Hours (7 AM – 10 PM) →
          </Link>
          <Link
            href="/agreement"
            className="px-6 py-3 rounded-full bg-[#2F4A34] hover:bg-[#2A4F40] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm"
          >
            Boundaries & Participation Agreement →
          </Link>
        </div>
      </div>
    </section>
  );
}
