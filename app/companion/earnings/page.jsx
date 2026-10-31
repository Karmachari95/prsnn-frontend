"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";

export default function CompanionEarningsPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("November 2026");

  const weeklyData = [
    { label: "1-7", amount: 1800, height: "45%" },
    { label: "8-14", amount: 2600, height: "70%" },
    { label: "15-21", amount: 1900, height: "50%" },
    { label: "22-30", amount: 2100, height: "60%" },
  ];

  const recentPayouts = [
    {
      id: "p1",
      date: "28 Nov 2026",
      activity: "Quiet Coffee & Book Reading",
      duration: "2 hours",
      amount: 1000,
      status: "Transferred",
    },
    {
      id: "p2",
      date: "22 Nov 2026",
      activity: "City Walk & Art Gallery",
      duration: "3 hours",
      amount: 1500,
      status: "Transferred",
    },
    {
      id: "p3",
      date: "15 Nov 2026",
      activity: "Café Study Session",
      duration: "2 hours",
      amount: 1000,
      status: "Transferred",
    },
    {
      id: "p4",
      date: "9 Nov 2026",
      activity: "Evening Stroll & Conversation",
      duration: "1.5 hours",
      amount: 750,
      status: "Transferred",
    },
  ];

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-moss selection:text-paper">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Figma Screen 21: Header & Month Switcher */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/companion/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-ink/70 hover:text-ink transition-colors"
          >
            <span>←</span>
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-3 bg-paper px-4 py-2 rounded-2xl border border-line shadow-sm">
            <span className="text-xs font-bold text-ink">{selectedMonth}</span>
            <span className="text-xs text-ink/40 font-bold">▾</span>
          </div>
        </div>

        {/* Total Earnings Hero Card matching Figma Screen 21 */}
        <div className="bg-paper rounded-3xl border border-line p-6 sm:p-8 shadow-sm mb-6 text-center">
          <p className="text-xs font-bold text-ink/45 uppercase tracking-widest">
            Total Net Earnings
          </p>
          <p className="font-display text-4xl sm:text-5xl font-extrabold text-moss mt-2">
            ₹8,400
          </p>
          <div className="mt-6 pt-6 border-t border-line grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Total Sessions
              </p>
              <p className="font-display text-2xl font-bold text-ink mt-1">12</p>
            </div>
            <div className="text-center border-l border-line">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Avg. per Session
              </p>
              <p className="font-display text-2xl font-bold text-ink mt-1">₹700</p>
            </div>
          </div>
        </div>

        {/* Weekly Bar Chart matching Figma Screen 21 */}
        <div className="bg-paper rounded-3xl border border-line p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Weekly Performance
            </h3>
            <span className="text-xs font-medium text-moss bg-moss-soft/60 px-2.5 py-1 rounded-lg">
              100% On-time Payouts
            </span>
          </div>

          <div className="h-44 flex items-end justify-around gap-4 pt-4 border-b border-line pb-2">
            {weeklyData.map((w) => (
              <div key={w.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-ink/60">₹{w.amount}</span>
                <div
                  style={{ height: w.height }}
                  className="w-10 sm:w-14 bg-moss rounded-t-xl transition-all duration-500 hover:brightness-110"
                />
                <span className="text-xs font-bold text-ink/50 mt-1">{w.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink/45 font-medium text-center mt-3">
            Payouts are credited directly to your bank account within 24 hours of session completion.
          </p>
        </div>

        {/* Recent Payouts Table */}
        <div className="bg-paper rounded-3xl border border-line overflow-hidden shadow-sm">
          <div className="p-5 border-b border-line flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Recent Completed Sessions</h3>
            <span className="text-xs text-ink/45 font-medium">4 sessions</span>
          </div>
          <div className="divide-y divide-line">
            {recentPayouts.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-ink">{p.activity}</p>
                  <p className="text-xs text-ink/50 font-medium mt-0.5">
                    {p.date} · {p.duration}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-base text-moss">
                    +₹{p.amount.toLocaleString("en-IN")}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-[#1E3A2F] bg-[#E8EFE9] px-2 py-0.5 rounded-full mt-0.5">
                    ✓ {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
