'use client';
import React from 'react';
import Link from 'next/link';

/**
 * PRSNN Brand Logo Component
 * Peaceful, calm, friendly humanist serif brandmark with warm terracotta dot.
 * "Presence without pressure."
 */
export default function Logo({ 
  variant = 'dark', // 'dark' (for light bg) | 'light' (for dark bg) | 'white'
  size = 'default', // 'small' | 'default' | 'large' | 'hero'
  showTagline = false,
  href = '/',
  className = ''
}) {
  const sizeClasses = {
    small: 'text-lg md:text-xl tracking-tight',
    default: 'text-2xl md:text-[1.75rem] tracking-tight',
    large: 'text-3xl md:text-4xl tracking-tight',
    hero: 'text-4xl md:text-5xl lg:text-6xl tracking-tight',
  };

  const textColors = {
    dark: 'text-[#1E3A2F]', // Forest green
    light: 'text-white',
    white: 'text-white',
    ink: 'text-[#141A17]',
  };

  const dotColors = {
    dark: 'text-[#2F4A34]', // Warm terracotta
    light: 'text-[#E5896B]',
    white: 'text-[#2F4A34]',
    ink: 'text-[#2F4A34]',
  };

  const content = (
    <div className={`inline-flex flex-col ${className}`}>
      <span className={`font-display font-extrabold lowercase select-none transition-colors duration-200 ${sizeClasses[size] || sizeClasses.default} ${textColors[variant] || textColors.dark}`}>
        prsnn<span className={`inline-block ml-0.5 font-display font-black ${dotColors[variant] || dotColors.dark}`}>.</span>
      </span>
      {showTagline && (
        <span className="text-[10px] md:text-xs font-medium tracking-wide uppercase text-moss/70 mt-0.5">
          Presence without pressure
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block group focus:outline-none" aria-label="PRSNN Home">
        {content}
      </Link>
    );
  }

  return content;
}
