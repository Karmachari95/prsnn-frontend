'use client';

import Reveal from './Reveal';

/**
 * Unified section header — stacked, never split left/right.
 * Modern editorial block: eyebrow → title → support.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left', // left | center
  light = false,
  className = '',
  delay = 0,
}) {
  const isCenter = align === 'center';

  return (
    <Reveal
      delay={delay}
      className={`mb-8 md:mb-10 ${isCenter ? 'text-center mx-auto' : ''} ${className}`}
    >
      {eyebrow && (
        <div
          className={`flex items-center gap-3 mb-4 ${
            isCenter ? 'justify-center' : ''
          }`}
        >
          <span
            className={`w-8 h-px ${light ? 'bg-signal/70' : 'bg-moss/60'}`}
            aria-hidden
          />
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
              light ? 'text-signal' : 'text-moss'
            }`}
          >
            {eyebrow}
          </p>
        </div>
      )}

      <h2
        className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06] max-w-3xl ${
          isCenter ? 'mx-auto' : ''
        } ${light ? 'text-paper' : 'text-ink'}`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-5 text-lg md:text-xl font-medium leading-relaxed max-w-xl ${
            isCenter ? 'mx-auto' : ''
          } ${light ? 'text-paper/55' : 'text-ink/55'}`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
