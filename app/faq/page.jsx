'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const categories = [
  'All',
  'Safety & Boundaries',
  'Booking & Sessions',
  'Companions',
  'Payments & Refunds'
];

const faqData = [
  {
    category: 'Safety & Boundaries',
    q: 'How does PRSNN help keep women safe?',
    a: 'PRSNN is designed around clear boundaries, gender-based matching preferences and safety-conscious interactions. Women members are matched with women companions only by default, and women companions receive bookings from women members only by default. Users can choose to open matching to people of any gender only through an explicit preference and consent process in their settings. Verification and safety procedures reduce certain risks but cannot guarantee that every interaction will be risk-free. For concerns, use the in-app reporting and 24/7 safety support channels.',
    link: '/safety',
    linkText: 'Read our full Safety Charter →'
  },
  {
    category: 'Safety & Boundaries',
    q: 'Is PRSNN a dating app or matrimonial service?',
    a: 'No. PRSNN is 100% platonic companionship for everyday public moments — attending events, visiting cafés, study sessions, exploring a city, or quiet work sessions. Any romantic solicitation, dating pressure, or inappropriate contact is strictly forbidden and results in immediate account suspension.',
  },
  {
    category: 'Booking & Sessions',
    q: 'Where do meetups happen?',
    a: 'All meetups must take place in open, daylight, approved public settings (e.g., cafés, public libraries, parks, museums, event venues). Private homes, hotel rooms, or secluded areas are strictly prohibited by our platform rules.',
  },
  {
    category: 'Booking & Sessions',
    q: 'What are the operating hours for bookings?',
    a: 'Bookings are strictly scheduled between 7:00 AM and 10:00 PM local time. Bookings outside these daylight hours are automatically disabled to protect personal safety.',
  },
  {
    category: 'Safety & Boundaries',
    q: 'Can I leave a session early if I feel uncomfortable?',
    a: 'Yes, absolutely. You may end a session at any moment if you feel unsafe or uncomfortable. You never need to continue an interaction simply because you booked or paid for it. Your safety and peace of mind always come first.',
  },
  {
    category: 'Companions',
    q: 'How are companions verified?',
    a: 'Every companion completes a mandatory identity verification process before becoming eligible for bookings. Government-issued photo IDs (Aadhaar, Passport, or Driving License) and phone numbers are manually reviewed and verified by platform administrators.',
  },
  {
    category: 'Booking & Sessions',
    q: 'How do I book a companion?',
    a: 'Visit the Find Companions page, filter by city and vibe, select an available date and time slot within operating hours, review the transparent price calculation, and confirm your booking.',
    link: '/companions',
    linkText: 'Browse Available Companions →'
  },
  {
    category: 'Companions',
    q: 'How do I apply to become a companion?',
    a: 'Create an account, select "Companion" as your role, complete the photo and government ID verification process, and once approved, set your available days, operating hours, and hourly rate.',
    link: '/login?role=companion',
    linkText: 'Apply to Become a Companion →'
  },
  {
    category: 'Payments & Refunds',
    q: 'How does payment and pricing work?',
    a: 'Pricing is transparent and shown upfront before booking. Companions set their hourly rate (typically ₹399–₹600/hr) plus a ₹50 platform fee. Payments are processed securely via Razorpay.',
  },
  {
    category: 'Payments & Refunds',
    q: 'What happens if a companion cancels or is unavailable?',
    a: 'If a companion declines or is unavailable, the system automatically routes your request to other eligible companions matching your preferences. If no match is confirmed, 100% of your payment is refunded immediately.',
    link: '/refund-policy',
    linkText: 'View Refund Policy →'
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = activeCategory === 'All'
    ? faqData
    : faqData.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181B18] pt-28 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-4 border border-[#1E3A2F]/15">
            <span className="w-2 h-2 rounded-full bg-[#2F4A34]" />
            <span>Help & FAQ</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#181B18]">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#181B18]/70 font-medium">
            Everything you need to know about bookings, women’s safety, verification, and boundaries.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#1E3A2F] text-white shadow-sm'
                  : 'bg-white text-[#181B18]/70 border border-[#EAE6DF] hover:border-[#1E3A2F]/30 hover:text-[#181B18]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-[#EAE6DF] bg-white transition-all overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-lg md:text-xl text-[#181B18]"
                >
                  <span>{faq.q}</span>
                  <span className={`w-8 h-8 rounded-full border border-[#EAE6DF] flex items-center justify-center shrink-0 text-sm transition-transform duration-250 ${isOpen ? 'rotate-180 bg-[#1E3A2F] text-white border-transparent' : 'bg-[#FAF8F5] text-[#181B18]/60'}`}>
                    ↓
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[#181B18]/75 leading-relaxed font-medium text-sm md:text-base border-t border-[#EAE6DF]/60">
                    <p className="mt-3">{faq.a}</p>
                    {faq.link && (
                      <Link
                        href={faq.link}
                        className="inline-block mt-4 text-xs font-bold text-[#2F4A34] hover:underline"
                      >
                        {faq.linkText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="p-8 md:p-10 rounded-3xl bg-[#E8EFE9] border border-[#1E3A2F]/15 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-xl text-[#1E3A2F]">
              Have a specific question not listed here?
            </h3>
            <p className="text-sm text-[#1E3A2F]/75 mt-1 font-medium">
              Our safety and support team is always ready to assist.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 px-6 py-3 rounded-full bg-[#1E3A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#152A22] transition-colors shadow-sm"
          >
            Contact Support →
          </Link>
        </div>

      </div>
    </div>
  );
}
