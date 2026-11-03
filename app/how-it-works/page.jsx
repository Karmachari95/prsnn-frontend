'use client';
import React from 'react';
import Link from 'next/link';
import Reveal from '../components/common/Reveal';

const steps = [
  {
    n: '01',
    title: 'Join the club',
    body: 'Create a profile in minutes. Share what you like — walks, silence, cafés, study. Every user is verified so you can focus on being yourself.',
    points: ['Fast sign-up', 'Manual ID review', 'Privacy protected'],
  },
  {
    n: '02',
    title: 'Find your companion',
    body: 'Browse verified companions. Filter by city, day, and comfort zones. Read the vibe before you book.',
    points: ['Smart filters', 'Real reviews', 'Clear pricing'],
  },
  {
    n: '03',
    title: 'Meet — then leave anytime',
    body: 'Book securely. Meet in public. Shared presence, no forced conversation. End the session whenever you want.',
    points: ['Secure payments', 'Public meetups', 'No explanation needed'],
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <section className="pt-28 md:pt-36 pb-16 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-10 right-0 w-72 h-72 bg-signal/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative text-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss mb-5">
              The process
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-ink">
              No awkwardness.
              <span className="block text-moss">Just presence.</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-ink/70 font-medium max-w-xl mx-auto leading-relaxed">
              prsnn. is the lightest way to book platonic companionship — designed
              to feel safe from the first tap.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-6 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={Math.min(i + 1, 4)}>
              <article className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 p-8 md:p-10 rounded-[1.75rem] bg-paper border border-line">
                <div className="md:col-span-2">
                  <span className="font-display text-4xl font-bold text-moss/25">
                    {step.n}
                  </span>
                </div>
                <div className="md:col-span-10">
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    {step.title}
                  </h2>
                  <p className="text-ink/55 font-medium leading-relaxed text-[15px] md:text-base max-w-2xl mb-6">
                    {step.body}
                  </p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {step.points.map((p) => (
                      <li
                        key={p}
                        className="text-sm font-semibold text-ink/80 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-24 px-6 bg-ink text-paper relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-moss/40 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <Reveal variant="scale">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Ready when you are.
            </h2>
            <p className="text-paper/55 font-medium mb-10 max-w-md mx-auto leading-relaxed">
              Browse companions or join as one. Either way — presence without pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/companions" className="btn-signal">
                Browse companions
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold border border-white/20 text-paper hover:bg-white/10 transition-colors"
              >
                Join prsnn.
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
