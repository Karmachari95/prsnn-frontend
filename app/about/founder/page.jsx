'use client';
import React from 'react';
import FounderSection from '../../components/about/FounderSection';
import Link from 'next/link';

export default function FounderPage() {
  return (
    <div className="pt-28 md:pt-36 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <Link 
          href="/about" 
          className="text-xs font-semibold text-moss/70 hover:text-moss inline-flex items-center gap-1.5 transition-colors"
        >
          ← Back to About Us
        </Link>
      </div>
      <FounderSection />
    </div>
  );
}
