"use client";
import { useAuth } from './context/AuthContext';
import { useEffect, useCallback } from 'react';
import axios from 'axios';
import Hero from './components/home/Hero';
import Modes from './components/home/Modes';
import HowItWorks from './components/home/HowItWorks';
import WhyPrsnn from './components/home/WhyPrsnn';
import Safety from './components/home/Safety';
import Testimonials from './components/home/Testimonials';
import BecomeCompanion from './components/home/BecomeCompanion';
import FAQ from './components/home/FAQ';
import FinalCTA from './components/home/FinalCTA';

export default function Home() {
  const { userData, token, logout } = useAuth();

  const checkProfileStatus = useCallback(async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  useEffect(() => {
    if (token && userData) {
      checkProfileStatus();
    }
  }, [token, userData, checkProfileStatus]);

  return (
    <main className="bg-mist min-h-screen">
      <Hero />
      <Modes />
      <HowItWorks />
      <WhyPrsnn />
      <Safety />
      <Testimonials />
      <BecomeCompanion />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
