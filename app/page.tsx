"use client";

import React, { useState } from 'react';
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { StickyBookingBar } from "@/components/sticky-booking-bar";

// Header Component with Scroll Effect
function Header({ onOpenBooking }: { onOpenBooking: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm h-16 py-0' : 'bg-transparent h-24 py-4'
        }`}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-sm relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className={`font-serif text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
            Con Strass <span className="text-rose-400">o Senza</span>
          </div>
        </div>
        <nav className={`hidden md:flex gap-8 text-sm font-medium tracking-wide transition-colors ${scrolled ? 'text-stone-600' : 'text-white/90'}`}>
          <a href="#" className="hover:text-rose-400 transition-colors">SERVIZI</a>
          <a href="#" className="hover:text-rose-400 transition-colors">PORTFOLIO</a>
          <a href="#chi-siamo" className="hover:text-rose-400 transition-colors">CHI SIAMO</a>
        </nav>
        <button
          onClick={onOpenBooking}
          className={`hidden md:inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 shadow-lg ${scrolled ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white text-rose-900 hover:bg-rose-50'
            }`}
        >
          Prenota Ora
        </button>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 text-center text-sm">
      <div className="container mx-auto px-4">
        <div className="font-serif text-2xl font-bold text-white mb-6">
          Con Strass <span className="text-rose-400">o Senza</span>
        </div>
        <p className="mb-4">Via Roma 123, Milano - Tel: +39 333 1234567</p>
        <p>© 2025 Con Strass o Senza. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Booking Modal Component
import { BookingModal } from "@/components/booking-modal";
import { MarketingPopup } from "@/components/marketing-popup";
import { MarketingBanner } from "@/components/marketing-banner";

// Main Page Component
import { supabase } from "@/utils/supabase";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Data State
  const [services, setServices] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  // Fetch Data on Load
  React.useEffect(() => {
    async function fetchData() {
      // Fetch Services
      const { data: servicesData } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      if (servicesData) setServices(servicesData);

      // Fetch Features
      const { data: featuresData } = await supabase.from('features').select('*').order('sort_order', { ascending: true });
      if (featuresData) setFeatures(featuresData);

      // Fetch Portfolio
      const { data: portfolioData } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(6);
      if (portfolioData) setPortfolio(portfolioData);
    }

    fetchData();
  }, []);

  const handleOpenBooking = (serviceId?: string) => {
    if (serviceId) setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setTimeout(() => setSelectedServiceId(null), 300);
  };

  return (
    <div className="min-h-screen bg-rose-50 relative selection:bg-rose-200 selection:text-rose-900">

      <MarketingBanner />

      <Header onOpenBooking={() => handleOpenBooking()} />

      <main>
        <HeroSection onOpenBooking={handleOpenBooking} services={services} />
        <FeaturesSection features={features} />
        <PortfolioGrid portfolio={portfolio} />
      </main>

      <Footer />

      <div className="md:hidden">
        <div onClick={() => handleOpenBooking()}>
          <StickyBookingBar />
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        preselectedServiceId={selectedServiceId}
      />
      <MarketingPopup />
    </div>
  );
}
