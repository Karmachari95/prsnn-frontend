'use client';

import Image from 'next/image';
import Link from 'next/link';
import Reveal from '../common/Reveal';
import SectionHeader from '../common/SectionHeader';

const moments = [
  {
    title: 'Events',
    desc: 'Never walk into gatherings alone — show up with calm company beside you.',
    image: '/moment-events.png',
    href: '/companions?mode=dont-go-alone',
  },
  {
    title: 'Hospital Visit',
    desc: 'Waiting rooms feel lighter when someone sits with you.',
    image: '/moment-hospital.png',
    href: '/companions?mode=dont-go-alone',
  },
  {
    title: 'Study Session',
    desc: 'Quiet focus with body-doubling that keeps you on track.',
    image: '/mode-sit-with-me.png',
    href: '/companions?mode=sit-with-me',
  },
  {
    title: 'Weekend Café',
    desc: 'Coffee tastes better when the table isn’t empty.',
    image: '/hero-right.png',
    href: '/companions?mode=dont-go-alone',
  },
  {
    title: 'City Walk',
    desc: 'Explore parks and streets at a pace that feels right.',
    image: '/mode-explore-together.png',
    href: '/companions?mode=explore-together',
  },
  {
    title: 'New in Town',
    desc: 'Settle into a new city with soft, pressure-free presence.',
    image: '/mode-be-around.png',
    href: '/companions?mode=be-around',
  },
];

export default function RealMoments() {
  return (
    <section className="py-24 md:py-[7.5rem] bg-mist">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeader
          eyebrow="Real moments"
          title="You're not alone in feeling this way."
          subtitle="Sometimes, you don't need advice or a big conversation. You just need someone beside you. Everyday situations that simply feel lighter with trusted company."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {moments.map((m, i) => (
            <Reveal key={m.title} delay={Math.min((i % 3) + 1, 3)}>
              <Link
                href={m.href}
                className="group block rounded-[1.5rem] overflow-hidden bg-paper border border-line hover:-translate-y-1.5 hover:shadow-neoblack transition-[transform,box-shadow,border-color] duration-300 hover:border-ink/15"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image
                    src={m.image}
                    alt=""
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-xl md:text-2xl font-bold text-ink tracking-tight">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-base text-ink/60 font-medium leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
