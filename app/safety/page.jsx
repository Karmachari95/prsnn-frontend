'use client';
import React from 'react';
import Link from 'next/link';

export default function SafetyPage() {
  const safetySections = [
    {
      title: "Gender-based matching",
      icon: "🛡️",
      iconBg: "bg-[#E8EFE9]",
      tag: "Women's Safety",
      content: "Women members and women companions are matched with women companions only by default. Matching with people of any gender is available only when the relevant user explicitly selects that preference and completes the affirmative consent step."
    },
    {
      title: "Identity verification",
      icon: "🪪",
      iconBg: "bg-[#FDF1EC]",
      tag: "Verification",
      content: "Companions must complete the verification process required by PRSNN before becoming eligible for bookings. Government-issued photo IDs (Aadhaar, Passport, or Driving License) are manually inspected and approved by authorized platform administrators."
    },
    {
      title: "Public meetups only",
      icon: "☕",
      iconBg: "bg-[#FEF3C7]",
      tag: "Safe Venues",
      content: "Meetups must take place in approved public settings under the platform's applicable rules. Cafés, public libraries, parks, events, and community venues are approved. Private homes, hotel rooms, or secluded locations are strictly prohibited."
    },
    {
      title: "Clear boundaries",
      icon: "🤝",
      iconBg: "bg-[#E8EFE9]",
      tag: "Platonic Only",
      content: "PRSNN is a platonic companionship platform. Dating, romantic engagement, sexual services, harassment, coercion, unwanted physical contact and pressure to share private personal information are strictly prohibited."
    },
    {
      title: "Leave when you feel uncomfortable",
      icon: "🚪",
      iconBg: "bg-[#FDF1EC]",
      tag: "Voluntary",
      content: "You may end a session immediately if you feel unsafe or uncomfortable. You do not need to continue an interaction simply because you booked or paid for it. Your personal safety and peace of mind always supersede any booking."
    },
    {
      title: "Report inappropriate behavior",
      icon: "⚠️",
      iconBg: "bg-[#FEE2E2]",
      tag: "Zero Tolerance",
      content: "Use the in-app reporting option on the booking card or contact our safety support channel. Reports are reviewed by human safety personnel, and verified violations result in immediate account suspension and appropriate escalation."
    },
    {
      title: "Protect your personal information",
      icon: "🔒",
      iconBg: "bg-[#E8EFE9]",
      tag: "Privacy First",
      content: "Share only information necessary for the booking. Avoid disclosing home addresses, personal bank details, government ID numbers, or private contact details unless a legitimate, clearly explained process requires it."
    },
    {
      title: "Understand the limits of verification",
      icon: "ℹ️",
      iconBg: "bg-[#FEF3C7]",
      tag: "Transparency",
      content: "Verification and safety procedures reduce certain risks but cannot guarantee that every interaction will be completely risk-free. PRSNN explains its actual safeguards, reporting processes and responsibilities transparently."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181B18] pt-28 md:pt-36 pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-4 border border-[#1E3A2F]/15">
            <span className="w-2 h-2 rounded-full bg-[#D97757]" />
            <span>Safety & Standards Charter</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#181B18]">
            Your comfort comes first.
          </h1>

          <p className="mt-5 text-lg md:text-xl text-[#181B18]/70 font-medium leading-relaxed">
            PRSNN is designed around clear boundaries, respectful interactions, and voluntary companionship.
          </p>
          <p className="mt-2 text-sm md:text-base text-[#181B18]/50 font-medium">
            We want every member and companion to understand what they are agreeing to before a session begins.
          </p>
        </div>

        {/* Operating Hours Banner */}
        <div className="mb-12 p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-[#1E3A2F] to-[#2A4F40] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Mandatory Rule
            </span>
            <h3 className="font-display font-black text-xl md:text-2xl mt-2 text-white">
              Daylight Hours: 7:00 AM – 10:00 PM Local Time
            </h3>
            <p className="text-xs md:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
              All bookings must strictly start and conclude between 7:00 AM and 10:00 PM. Bookings outside this daytime window are automatically disabled to protect community safety.
            </p>
          </div>
          <span className="shrink-0 px-5 py-2.5 rounded-full bg-[#D97757] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
            ☀️ 7 AM – 10 PM
          </span>
        </div>

        {/* Safety Standards Grid with Rich Color Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {safetySections.map((sec, idx) => (
            <div 
              key={sec.title}
              className="p-7 rounded-[1.75rem] bg-white border border-[#EAE6DF] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl p-3 rounded-2xl ${sec.iconBg} border border-[#EAE6DF] shadow-2xs`}>
                      {sec.icon}
                    </span>
                    <h2 className="font-display font-bold text-xl text-[#181B18]">
                      {sec.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm md:text-[15px] text-[#181B18]/70 leading-relaxed font-medium">
                  {sec.content}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#EAE6DF] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#181B18]/45 uppercase tracking-wider">
                  Standard #{idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-[10px] font-bold text-[#1E3A2F]">
                  {sec.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Participation & Boundaries Box */}
        <div className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-[#EAE6DF] shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="px-3.5 py-1.5 rounded-full bg-[#FDF1EC] text-[#D97757] text-xs font-bold uppercase tracking-wider">
              Legal & Behavioral Standard
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-black text-[#181B18] mt-3">
              Participation, Privacy and Boundaries Agreement
            </h3>
            <p className="mt-2 text-[#181B18]/65 text-sm md:text-base leading-relaxed">
              Every member and companion accepts our complete 10-point Participation, Privacy and Boundaries Agreement prior to their first booking.
            </p>
          </div>
          <Link
            href="/agreement"
            className="shrink-0 px-8 py-4 rounded-full bg-[#1E3A2F] hover:bg-[#152A22] text-white font-bold text-sm transition-all hover:scale-105 shadow-md"
          >
            Read Full Agreement →
          </Link>
        </div>

      </div>
    </div>
  );
}
