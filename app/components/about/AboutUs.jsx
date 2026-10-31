'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '../common/Reveal';
import { IconShield } from '../illustrations/ModeIcons';
import FounderSection from './FounderSection';

const values = [
  {
    title: 'No judgment',
    desc: 'Come as you are. Awkward is welcome. Performing for company is optional — and usually unnecessary.',
  },
  {
    title: 'Always safe',
    desc: 'Verified companions, public meetups, written boundaries, and a clear exit. Presence should feel light.',
  },
  {
    title: 'Real humans',
    desc: 'No bots. No scripts. Just people willing to share a stretch of time so the room feels less empty.',
  },
];

const AboutUs = () => {
  return (
    <div className="w-full bg-mist">
      <section className="relative overflow-hidden pt-28 md:pt-32 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <Reveal className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] md:aspect-[5/4] rounded-[1.75rem] overflow-hidden border border-line">
                <Image
                  src="/about_us_hero.png"
                  alt="Community presence"
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-7 md:p-9">
                  <p className="font-display text-4xl md:text-5xl font-extrabold text-white lowercase leading-none">
                    prsnn<span className="text-signal">.</span>
                  </p>
                  <p className="mt-3 text-white/85 font-medium max-w-xs text-sm md:text-base leading-relaxed">
                    Presence without pressure — built for India&apos;s cities.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-6">
              <Reveal>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss mb-4">
                  Who we are
                </p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.05]">
                  More than a marketplace.
                  <span className="block text-moss mt-2">A quieter way to show up.</span>
                </h1>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-6 text-lg text-ink/70 font-medium leading-relaxed max-w-xl">
                  prsnn. bridges the gap between doing it alone and sharing the
                  moment. We help you book verified companions for platonic
                  presence — sit, walk, wait, wander — with boundaries that stay
                  clear from the first tap.
                </p>
              </Reveal>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Safety first',
                    desc: 'IDs checked. Vibes vetted. Public spaces preferred.',
                  },
                  {
                    title: 'Instant connection',
                    desc: 'Find company for a walk, café, study session, or wait.',
                  },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i + 1}>
                    <div className="p-6 rounded-2xl bg-paper border border-line h-full">
                      <h3 className="font-display font-bold text-ink text-lg mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-ink/50 font-medium text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={3} className="mt-8 flex flex-wrap gap-3">
                <Link href="/companions" className="btn-primary">
                  Find a companion
                </Link>
                <Link href="/safety" className="btn-ghost">
                  Safety & Boundaries
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Founder Section */}
      <FounderSection />

      <section className="py-16 md:py-20 bg-[#1E3A2F] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <Reveal className="md:col-span-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#D97757] mb-4 border border-white/15">
              <IconShield className="w-5 h-5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Our promise
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white">
              You can leave anytime.
              <span className="block text-white/50 mt-2 font-normal">No explanation needed.</span>
            </h2>
          </Reveal>
          <Reveal delay={2} className="md:col-span-7">
            <p className="text-white/80 font-medium text-base md:text-lg leading-relaxed">
              Loneliness isn&apos;t always dramatic. Sometimes it&apos;s an empty
              chair at a café, a waiting room that stretches too long, or a study
              night that feels heavier alone. PRSNN exists for those moments —
              soft company with hard boundaries.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-paper border-t border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight text-center mb-14">
              The code we live by
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map((item, idx) => (
              <Reveal key={item.title} delay={idx + 1}>
                <article className="h-full p-8 md:p-10 rounded-2xl bg-mist border border-line hover:border-ink/20 hover:-translate-y-1 transition-[transform,border-color] duration-300">
                  <span className="font-display text-sm font-bold text-moss/50">
                    0{idx + 1}
                  </span>
                  <h3 className="font-display text-xl font-bold text-ink mt-4 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-ink/55 font-medium leading-relaxed text-[15px]">
                    {item.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
