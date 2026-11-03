'use client';

import Link from 'next/link';
import Reveal from './Reveal';

const legalNav = [
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/terms-of-service', label: 'Terms' },
  { href: '/code-of-conduct', label: 'Code of Conduct' },
  { href: '/contact', label: 'Contact' },
];

export function LegalHero({
  eyebrow,
  title,
  subtitle,
  updated,
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-20 w-[28rem] h-[28rem] rounded-full bg-moss/40 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[22rem] h-[22rem] rounded-full bg-signal/10 blur-[90px]" />
        <div className="noise absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-14 md:pb-16">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-signal mb-4">
            {eyebrow}
          </p>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold tracking-tight leading-[1.08] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
          {updated && (
            <p className="mt-5 text-sm font-medium text-white/40">
              Last updated: {updated}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function LegalNav({ current }) {
  return (
    <div className="sticky top-20 z-20 -mt-6 mb-10 md:mb-12">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <nav
          aria-label="Legal pages"
          className="flex flex-wrap gap-2 p-2 rounded-full bg-paper/90 backdrop-blur-xl border border-line shadow-neoblack"
        >
          {legalNav.map((item) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-ink text-white'
                    : 'text-ink/60 hover:text-ink hover:bg-mist'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function LegalSection({ number, title, children, dark = false, className = '' }) {
  return (
    <Reveal>
      <section
        className={`rounded-3xl border p-6 md:p-8 ${
          dark
            ? 'bg-ink text-paper border-white/10'
            : 'bg-paper border-line'
        } ${className}`}
      >
        {(number || title) && (
          <div className="flex items-start gap-3 mb-5">
            {number != null && (
              <span
                className={`shrink-0 w-10 h-10 rounded-2xl font-display font-bold text-sm flex items-center justify-center ${
                  dark ? 'bg-signal text-ink' : 'bg-ink text-signal'
                }`}
              >
                {number}
              </span>
            )}
            {title && (
              <h2
                className={`font-display text-xl md:text-2xl font-bold tracking-tight leading-snug pt-1.5 ${
                  dark ? 'text-white' : 'text-ink'
                }`}
              >
                {title}
              </h2>
            )}
          </div>
        )}
        <div
          className={`space-y-4 text-base font-medium leading-relaxed ${
            dark ? 'text-white/70' : 'text-ink/65'
          }`}
        >
          {children}
        </div>
      </section>
    </Reveal>
  );
}

export function LegalList({ items, variant = 'disc' }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 shrink-0 font-bold ${
              variant === 'x'
                ? 'text-clay'
                : variant === 'check'
                  ? 'text-moss'
                  : 'text-ink/35'
            }`}
            aria-hidden
          >
            {variant === 'x' ? '✕' : variant === 'check' ? '✓' : '•'}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalShell({ children }) {
  return (
    <div className="min-h-screen bg-mist pb-20 md:pb-28">
      {children}
    </div>
  );
}

export function LegalBody({ children }) {
  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 space-y-5 md:space-y-6">
      {children}
    </div>
  );
}

export function LegalIntro({ children }) {
  return (
    <Reveal>
      <div className="rounded-3xl bg-moss-soft/70 border border-moss/15 p-6 md:p-8 text-base md:text-lg text-ink/70 font-medium leading-relaxed space-y-3">
        {children}
      </div>
    </Reveal>
  );
}
