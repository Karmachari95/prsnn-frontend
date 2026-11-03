'use client';

import Image from 'next/image';
import Reveal from '../common/Reveal';
import SectionHeader from '../common/SectionHeader';

const steps = [
  {
    n: '01',
    title: 'Choose Your Experience',
    desc: 'Pick Don’t Go Alone, Sit With Me, Explore Together, or Quiet Company — so everyone knows the vibe before you meet.',
    image: '/step1.webp',
  },
  {
    n: '02',
    title: 'Select Verified Companion',
    desc: 'Browse manually verified profiles, availability, and reviews. Book a public meetup that fits your day.',
    image: '/step2.webp',
  },
  {
    n: '03',
    title: 'Meet Safely',
    desc: 'Meet in a public place. Leave whenever you like. Clear boundaries. No pressure. No expectations beyond presence.',
    image: '/step3.webp',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-[7.5rem] bg-mist">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. Clear expectations."
          subtitle="Choose your experience. Pick a verified companion. Meet safely in a public place. Leave whenever you like."
        />

        <div className="relative">
          <div
            className="hidden md:block absolute top-[5.5rem] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent"
            aria-hidden
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i + 1}>
                <div className="relative group rounded-[1.5rem] bg-paper border border-line overflow-hidden hover:-translate-y-1.5 hover:shadow-neoblack transition-all duration-300 h-full flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                    <Image
                      src={step.image}
                      alt=""
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-ink text-signal font-display font-bold text-lg flex items-center justify-center shadow-neoblack">
                      {step.n}
                    </div>
                  </div>
                  <div className="p-6 md:p-7 flex-1">
                    <h3 className="font-display text-2xl font-bold text-ink tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base md:text-lg text-ink/60 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
