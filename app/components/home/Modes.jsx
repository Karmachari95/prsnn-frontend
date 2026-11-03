'use client';

import Link from 'next/link';
import Image from 'next/image';
import Reveal from '../common/Reveal';
import SectionHeader from '../common/SectionHeader';
import {
  IconAlone,
  IconSit,
  IconAround,
  IconExplore,
} from '../illustrations/ModeIcons';

const modes = [
  {
    title: "Don't Go Alone",
    desc: 'Attend weddings, events, cafés, hospital visits, and social gatherings with a trusted companion.',
    href: '/companions?mode=dont-go-alone',
    tags: ['Events', 'Cafés', 'Visits'],
    image: '/mode-dont-go-alone.webp',
    Icon: IconAlone,
  },
  {
    title: 'Sit With Me',
    desc: 'Stay focused with quiet company while studying, working, or reading.',
    href: '/companions?mode=sit-with-me',
    tags: ['Study', 'Work', 'Silence'],
    image: '/mode-sit-with-me.webp',
    Icon: IconSit,
  },
  {
    title: 'Explore Together',
    desc: 'Discover cafés, parks, food streets, museums, and neighborhoods with someone who shares your pace.',
    href: '/companions?mode=explore-together',
    tags: ['Walks', 'Food', 'City'],
    image: '/mode-explore-together.webp',
    Icon: IconExplore,
  },
  {
    title: 'Quiet Company',
    desc: 'Sometimes sharing the same space is enough.',
    href: '/companions?mode=be-around',
    tags: ['Presence', 'Home', 'Calm'],
    image: '/mode-be-around.webp',
    Icon: IconAround,
  },
];

const categories = [
  { label: 'Coffee & Cafés', tag: 'Cafe Hopping', icon: '☕' },
  { label: 'Walks & City', tag: 'Walking', icon: '🚶' },
  { label: 'Events & Culture', tag: 'Event Companion', icon: '🎟️' },
  { label: 'Study & Silence', tag: 'Study Buddy', icon: '📖' },
  { label: 'Food & Dining', tag: 'Foodie', icon: '🍽️' },
];

export default function Modes() {
  return (
    <section id="modes" className="py-24 md:py-[7.5rem] bg-paper">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeader
          eyebrow="Experiences"
          title="Choose how you want company today."
          subtitle="Four clear ways to book presence — expectations set before you meet."
        />

        {/* Quick category strip matching Screen 6 */}
        <div className="mb-10 flex items-center justify-start sm:justify-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={`/companions?tag=${encodeURIComponent(c.tag)}`}
              className="group shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-line bg-mist hover:bg-moss hover:text-paper hover:border-moss transition-all duration-200 text-sm font-semibold text-ink shadow-sm"
            >
              <span className="text-base">{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {modes.map((mode, i) => (
            <Reveal key={mode.href} delay={(i % 2) + 1}>
              <Link
                href={mode.href}
                className="group flex flex-col sm:flex-row overflow-hidden rounded-[1.5rem] border border-line bg-mist hover:bg-paper hover:border-ink/15 hover:shadow-neoblack hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="relative sm:w-[42%] min-h-[180px] sm:min-h-full aspect-[16/10] sm:aspect-auto overflow-hidden">
                  <Image
                    src={mode.image}
                    alt=""
                    fill
                    sizes="(max-width:768px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/10 transition-colors" />
                  <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-paper text-moss flex items-center justify-center shadow-neoblack">
                    <mode.Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="font-display text-2xl md:text-[1.75rem] font-bold text-ink tracking-tight">
                    {mode.title}
                  </h3>
                  <p className="mt-3 text-base md:text-lg text-ink/60 font-medium leading-relaxed">
                    {mode.desc}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {mode.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-paper border border-line text-xs font-semibold text-ink/55"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
