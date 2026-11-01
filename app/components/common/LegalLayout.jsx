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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A2F] via-[#193228] to-[#12251D] text-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#2F4A34]/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[22rem] h-[22rem] rounded-full bg-[#E8EFE9]/10 blur-[90px]" />
        <div className="noise absolute inset-0 opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-14 md:pb-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-bold uppercase tracking-[0.18em] mb-4 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F4A34]" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-black tracking-tight leading-[1.08] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg md:text-xl text-white/75 font-medium leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
          {updated && (
            <p className="mt-5 text-xs font-semibold text-white/50">
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
          className="flex flex-wrap gap-2 p-2 rounded-full bg-white/95 backdrop-blur-xl border border-[#EAE6DF] shadow-md"
        >
          {legalNav.map((item) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#1E3A2F] text-white shadow-sm'
                    : 'text-[#181B18]/65 hover:text-[#181B18] hover:bg-[#FAF8F5]'
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
            ? 'bg-[#1E3A2F] text-white border-white/10 shadow-lg'
            : 'bg-white border-[#EAE6DF] shadow-sm'
        } ${className}`}
      >
        {(number || title) && (
          <div className="flex items-start gap-3.5 mb-5">
            {number != null && (
              <span
                className={`shrink-0 w-10 h-10 rounded-2xl font-display font-black text-sm flex items-center justify-center border ${
                  dark ? 'bg-[#2F4A34] text-white border-white/20' : 'bg-[#E8EFE9] text-[#1E3A2F] border-[#1E3A2F]/15'
                }`}
              >
                {number}
              </span>
            )}
            {title && (
              <h2
                className={`font-display text-xl md:text-2xl font-bold tracking-tight leading-snug pt-1.5 ${
                  dark ? 'text-white' : 'text-[#181B18]'
                }`}
              >
                {title}
              </h2>
            )}
          </div>
        )}
        <div
          className={`space-y-4 text-base font-medium leading-relaxed ${
            dark ? 'text-white/80' : 'text-[#181B18]/70'
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
                ? 'text-[#2F4A34]'
                : variant === 'check'
                  ? 'text-[#1E3A2F]'
                  : 'text-[#181B18]/40'
            }`}
            aria-hidden
          >
            {variant === 'x' ? '✕' : variant === 'check' ? '✓' : '•'}
          </span>
          <span className="text-[#181B18]/75">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalShell({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20 md:pb-28">
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
      <div className="rounded-3xl bg-[#E8EFE9] border border-[#1E3A2F]/15 p-6 md:p-8 text-base md:text-lg text-[#181B18]/80 font-medium leading-relaxed space-y-3">
        {children}
      </div>
    </Reveal>
  );
}
