'use client';

import { useState } from 'react';
import Reveal from '../common/Reveal';
import SectionHeader from '../common/SectionHeader';

const faqs = [
  {
    q: 'How does PRSNN help keep women safe?',
    a: 'PRSNN is designed around clear boundaries, gender-based matching preferences and safety-conscious interactions. Women members are matched with women companions only by default, and women companions receive bookings from women members only by default. Users can choose to open matching to people of any gender only through an explicit preference and consent process. Companions must complete PRSNN\'s applicable identity-verification process before becoming eligible for bookings. The platform also establishes rules for respectful behavior, service boundaries and reporting inappropriate conduct. We encourage users to review profiles, meet in approved public locations, protect their personal information and report behavior that makes them uncomfortable. Users may end an interaction if they feel unsafe. Verification and safety procedures reduce certain risks but cannot guarantee that every interaction will be risk-free. For concerns, use the available reporting and support channels.',
    link: '/safety',
    linkText: 'Read our full Safety Standards →'
  },
  {
    q: 'Is prsnn a dating app?',
    a: 'No. prsnn is 100% platonic companionship for public meetups — events, cafés, study sessions, walks, and quiet company. No dating, no romance expectations.',
  },
  {
    q: 'Where do sessions happen?',
    a: 'Public places only — cafés, parks, venues, libraries, and similar open spaces. Clear boundaries are set before you meet.',
  },
  {
    q: 'Are companions verified?',
    a: 'Yes. Every companion submits their ID documents, and our team reviews each one manually before they can accept bookings.',
  },
  {
    q: 'Can I leave a session early?',
    a: 'Absolutely. You can leave anytime — no explanation required. Your comfort comes first.',
  },
  {
    q: 'How do I book a companion?',
    a: 'Choose an experience, browse verified companions in your city, pick a time, and meet safely in public.',
  },
  {
    q: 'How do I become a companion?',
    a: 'Sign up, complete verification and onboarding, then set your availability and the experiences you’re open to.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-12 md:py-16 bg-paper">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered."
          subtitle="Short answers so you know exactly what you’re booking."
          align="center"
        />

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={Math.min(i + 1, 3)}>
                <div
                  className={`rounded-[1.25rem] border transition-colors duration-300 ${
                    isOpen
                      ? 'bg-mist border-ink/15 shadow-neoblack'
                      : 'bg-paper border-line hover:border-ink/15'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-5"
                  >
                    <span className="font-display text-lg md:text-xl font-bold text-ink tracking-tight">
                      {item.q}
                    </span>
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full bg-ink text-signal flex items-center justify-center text-lg transition-transform duration-300 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 md:px-6 pb-5">
                        <p className="text-base md:text-lg text-ink/75 font-normal leading-relaxed">
                          {item.a}
                        </p>
                        {item.link && (
                          <div className="mt-3">
                            <a 
                              href={item.link} 
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-moss hover:text-moss-mid underline transition-colors"
                            >
                              {item.linkText}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
