"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";

export default function SetPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleKeyPress = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        localStorage.setItem("userPin", nextPin);
        setIsSaved(true);
        setTimeout(() => {
          router.push("/");
        }, 1200);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setIsSaved(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-moss selection:text-paper">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-sm bg-paper rounded-3xl border border-line p-8 shadow-sm text-center">
          {/* Green Shield Icon */}
          <div className="w-16 h-16 rounded-full bg-moss/10 text-moss mx-auto flex items-center justify-center text-2xl mb-4 border border-moss/20">
            🔒
          </div>

          <h1 className="font-display text-2xl font-extrabold text-ink">
            Set a 4-digit PIN
          </h1>
          <p className="mt-2 text-xs text-ink/60 font-medium leading-relaxed">
            Use this PIN for quicker and more secure access to your PRSNN account.
          </p>

          {/* 4 Digit Boxes */}
          <div className="flex justify-center gap-3 my-8">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-2xl border flex items-center justify-center text-xl font-bold transition-all ${
                    hasDigit
                      ? "border-moss bg-moss-soft/30 text-ink scale-105"
                      : "border-line bg-mist/50 text-ink/30"
                  }`}
                >
                  {hasDigit ? "•" : ""}
                </div>
              );
            })}
          </div>

          {isSaved && (
            <div className="mb-4 text-xs font-bold text-moss animate-fadeIn">
              ✓ PIN saved successfully! Redirecting...
            </div>
          )}

          {/* Keypad matching Figma Screen 5 */}
          <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-2xl bg-mist/60 hover:bg-mist active:scale-95 text-base font-bold text-ink transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-12 rounded-2xl bg-mist/60 hover:bg-mist active:scale-95 text-base font-bold text-ink transition-all flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-mist/60 hover:bg-mist active:scale-95 text-base font-bold text-ink transition-all flex items-center justify-center"
              aria-label="Backspace"
            >
              ⌫
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 text-xs font-semibold text-ink/40 hover:text-ink transition-colors"
          >
            Skip for now
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
