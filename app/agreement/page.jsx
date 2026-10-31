'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function AgreementPage() {
  const [copied, setCopied] = useState(false);

  const sections = [
    {
      num: 1,
      title: "Purpose of the platform",
      text: "PRSNN facilitates platonic companionship for approved activities and experiences. It is not a dating service, therapy service or substitute for professional care."
    },
    {
      num: 2,
      title: "Scope of the booking",
      text: "Members and companions agree to participate only in the activity, duration, location and other conditions confirmed through the platform. Neither party is required to provide services, tasks or activities outside the agreed booking."
    },
    {
      num: 3,
      title: "Respect and consent",
      text: "Both parties must respect personal boundaries. Consent to a booking does not imply consent to physical contact, romantic or sexual interaction, sharing personal information or any activity outside the agreed service. Either party may decline an additional request or end an interaction."
    },
    {
      num: 4,
      title: "Personal-information sharing",
      text: "Users should exercise care before sharing personal phone numbers, social media accounts, addresses, financial details, identity documents or other private information. Users should understand that information voluntarily shared directly with another person may be retained or misused outside PRSNN's control. PRSNN describes what information it collects, what is shared through the platform and what safeguards apply in its privacy policy."
    },
    {
      num: 5,
      title: "Prohibited behavior",
      text: "Users must not engage in harassment, coercion, threats, stalking, inappropriate requests, fraud, illegal activity or misuse of another person's personal information. Users must not pressure another participant to move a booking to a private location or perform tasks outside the agreed service."
    },
    {
      num: 6,
      title: "Responsibilities of participants",
      text: "Members and companions are responsible for respecting agreed boundaries, following platform rules and exercising reasonable care during an interaction. This does not remove any legal obligations that apply to PRSNN or any participant."
    },
    {
      num: 7,
      title: "Reporting and support",
      text: "Users should report misconduct, safety concerns, unauthorized use of personal information or payment disputes through the available reporting and support channels. PRSNN will handle reports according to its published policies and applicable law."
    },
    {
      num: 8,
      title: "Payments, cancellations and disputes",
      text: "Users must review the booking price, cancellation policy and applicable refund conditions before payment. Disputes will be handled under the published policy and applicable law."
    },
    {
      num: 9,
      title: "Privacy and consent",
      text: "Users can review the privacy policy to understand data collection, processing, retention, sharing and their applicable rights. Optional consent may be withdrawn where applicable, subject to legitimate legal and operational requirements."
    },
    {
      num: 10,
      title: "Acknowledgment",
      text: "By accepting this agreement, I confirm that I have read and understood the platform's participation rules, privacy information and service boundaries. I understand that a booking is voluntary, that personal boundaries must be respected, and that no verification process can guarantee the absence of all risk."
    }
  ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A201C] pt-28 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#5A635B]">
          <Link href="/safety" className="hover:text-[#1E3A2F] font-semibold flex items-center gap-1">
            ← Safety & Standards
          </Link>
          <span className="font-mono">Version 1.0 (Auditable)</span>
        </div>

        {/* Title Card */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-[#E8E2D8] shadow-sm mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E3A2F]/10 text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-4">
            Official Platform Agreement
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black text-[#1E3A2F] leading-tight mb-4">
            PRSNN Participation, Privacy and Boundaries Agreement
          </h1>
          <p className="text-sm md:text-base text-[#4A534B] leading-relaxed">
            This agreement defines the core conduct rules, service boundaries, and privacy safeguards for all members and companions on PRSNN. Every user consents to these principles before their participation begins.
          </p>

          <div className="mt-6 pt-6 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B726A]">
            <span>Effective date: October 2026</span>
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full border border-[#D5CDC0] text-[#1E3A2F] font-semibold hover:bg-[#FAF7F2] transition-colors"
            >
              {copied ? '✓ Copied link' : 'Share agreement link'}
            </button>
          </div>
        </div>

        {/* Numbered Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((s) => (
            <div 
              key={s.num}
              className="p-6 md:p-8 rounded-2xl bg-white border border-[#E8E2D8] shadow-[0_2px_12px_rgba(30,58,47,0.03)]"
            >
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#1E3A2F] text-white font-bold text-sm flex items-center justify-center mt-0.5">
                  {s.num}
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-[#1E3A2F] mb-2">
                    {s.title}
                  </h2>
                  <p className="text-[#3A423C] text-[15px] leading-relaxed">
                    {s.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="text-center p-8 rounded-2xl bg-[#E8EFE9] border border-[#CCDCD0]">
          <p className="font-display text-lg font-bold text-[#1E3A2F]">
            Presence without pressure. Every interaction voluntary, clear, and safe.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-full bg-[#1E3A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#152a22] transition-colors"
            >
              Join PRSNN
            </Link>
            <Link 
              href="/safety" 
              className="px-6 py-2.5 rounded-full bg-white text-[#1E3A2F] border border-[#CCDCD0] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF7F2] transition-colors"
            >
              Safety Guidelines
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
