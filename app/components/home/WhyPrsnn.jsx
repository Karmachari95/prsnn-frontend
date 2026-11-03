'use client';

import Image from 'next/image';
import Link from 'next/link';
import Reveal from '../common/Reveal';

const cards = [
  {
    title: 'Verified Humans',
    desc: 'Every companion’s ID is manually reviewed by our team before they show up.',
  },
  {
    title: 'Public Spaces Only',
    desc: 'Meetups stay in cafés, parks, events, and other open places.',
  },
  {
    title: 'Clear Boundaries',
    desc: 'No dating. No therapy. Just genuine human presence.',
  },
];

export default function WhyPrsnn() {
  return (
    <section id="why" className="py-24 md:py-[7.5rem] bg-paper">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative rounded-[1.75rem] overflow-hidden aspect-[4/5] border border-line shadow-neoblack">
              <Image
                src="/companions-banner.webp"
                alt="Calm shared presence"
                fill
                sizes="(max-width:1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
                <p className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                  Sometimes you don&apos;t need advice.
                  <br />
                  <span className="text-signal">You just need someone beside you.</span>
                </p>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss mb-3">
                Why prsnn
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-ink tracking-tight leading-[1.12] max-w-xl">
                There are moments that simply feel easier when another person is around.
              </h2>
              <p className="mt-5 text-lg md:text-xl text-ink/60 font-medium leading-relaxed max-w-xl">
                Whether you&apos;re attending an event, studying, exploring a city, or
                spending a quiet afternoon at a café — find verified companionship
                without expectations.
              </p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cards.map((card, i) => (
                <Reveal key={card.title} delay={i + 1}>
                  <div className="h-full rounded-[1.35rem] bg-mist border border-line p-5 md:p-6 hover:-translate-y-1 hover:shadow-neoblack transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl bg-ink text-signal flex items-center justify-center text-sm font-bold mb-4">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm md:text-base text-ink/55 font-medium leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-line/60 flex items-center justify-between">
              <Link
                href="/our-story"
                className="text-sm font-bold text-[#1E3A2F] hover:text-[#2F4A34] flex items-center gap-1.5 transition-colors group"
              >
                <span>Read Mukarram Jah&apos;s story on why we built PRSNN</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
