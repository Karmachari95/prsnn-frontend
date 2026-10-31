'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '../common/Reveal';

export default function FounderSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2] text-[#1A201C] border-t border-b border-[#E8E2D8]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Photo Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <Reveal>
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-[#E0D8CB] bg-[#F0EBE1] shadow-[0_20px_50px_-20px_rgba(30,58,47,0.15)] group">
                {/* Founder Photo */}
                <div className="w-full h-full relative">
                  <Image
                    src="/about_us_hero.png"
                    alt="Mukarram Jah, Founder of PRSNN"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A2F]/85 via-transparent to-transparent" />
                </div>
                
                {/* Floating badge */}
                <div className="absolute bottom-6 inset-x-6 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg">
                  <p className="font-display text-xl font-bold text-[#1E3A2F]">Mukarram Jah</p>
                  <p className="text-xs font-semibold text-[#D97757] uppercase tracking-wider mt-0.5">
                    Founder of PRSNN · Technology Leader
                  </p>
                  <p className="text-xs text-[#5A635B] mt-2 leading-relaxed">
                    "Building technology that brings people closer."
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Story Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A2F]/10 border border-[#1E3A2F]/15 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#D97757]" />
                <span className="text-xs font-bold tracking-wider uppercase text-[#1E3A2F]">
                  About the Founder
                </span>
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[#1E3A2F] leading-tight">
                Meet Mukarram Jah
              </h2>
              <p className="text-lg md:text-xl font-medium text-[#D97757] mt-1">
                Building technology that brings people closer.
              </p>
            </Reveal>

            <Reveal delay={1}>
              <div className="space-y-4 text-base md:text-[17px] leading-relaxed text-[#2C332E] font-normal">
                <p>
                  I'm Mukarram, an engineer, technology leader and the founder of PRSNN.
                </p>
                <p>
                  My work in technology has taught me how to build systems that solve problems. But some problems are not purely technical. They are human.
                </p>
                <p className="p-4 rounded-2xl bg-white border border-[#E5DECF] italic text-[#1E3A2F] border-l-4 border-l-[#D97757]">
                  One of the experiences that shaped my thinking was seeing my grandfather live with dementia and the concern that came with him wandering off. It made me think more deeply about the importance of trusted people being available when someone needs support.
                </p>
                <p>
                  That experience became part of a bigger question for me: what if finding reliable human company were easier?
                </p>
                <p>
                  We all have moments when we want to attend an event, explore a new city, sit in a café, study, or simply spend time somewhere without doing it alone. Yet finding the right person at the right time is not always easy.
                </p>
                <p>
                  PRSNN is my attempt to make those moments easier. We're building a platform where people can find platonic companionship for everyday experiences, with clear expectations, defined boundaries and safety-conscious design.
                </p>
                <p className="font-medium text-[#1E3A2F]">
                  The ambition is simple: make human connection more accessible without making it complicated or uncomfortable. Because sometimes, you don't need someone to solve your problems. You just need someone beside you.
                </p>
                <p className="text-sm font-bold text-[#1E3A2F] pt-2">
                  — Mukarram Jah, Founder of PRSNN
                </p>
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/companions"
                  className="px-6 py-3.5 rounded-full bg-[#1E3A2F] text-white text-sm font-semibold hover:bg-[#152a22] transition-colors shadow-md"
                >
                  Explore Companions
                </Link>
                <Link
                  href="/safety"
                  className="px-6 py-3.5 rounded-full bg-white text-[#1E3A2F] border border-[#D5CDC0] text-sm font-semibold hover:bg-[#F3EFE8] transition-colors"
                >
                  Our Safety Standards
                </Link>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
