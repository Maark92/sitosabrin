"use client";

import React, { useState } from 'react';
import Image from "next/image";
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
      <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
        <div className="flex items-center gap-3 relative z-10">
          {/* Logo Image */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-sm relative">
            <Image
              src="/logo.png"
              alt="Con Strass o Senza Logo"
              width={48}
              height={48}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`font-serif text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
            Con Strass <span className="text-rose-400">o Senza</span>
          </div>
        </div>

        {/* Centered Navigation */}
        <nav className={`hidden md:flex items-center gap-8 text-sm font-medium tracking-wide transition-colors absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${scrolled ? 'text-stone-600' : 'text-white/90'}`}>
          <a href="#" className="hover:text-rose-400 transition-colors">SERVIZI</a>
          <a href="#portfolio" className="hover:text-rose-400 transition-colors">PORTFOLIO</a>
          <a href="#chi-siamo" className="hover:text-rose-400 transition-colors">CHI SIAMO</a>
        </nav>

        <button
          onClick={onOpenBooking}
          className={`hidden md:inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 shadow-lg relative z-10 ${scrolled ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white text-rose-900 hover:bg-rose-50'
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
        <p className="mb-2">Valguarnera (EN) - 94019</p>
        <p className="mb-2">Tel: <a href="https://wa.me/393299362917" className="hover:text-rose-400 transition-colors">+39 329 936 2917</a></p>
        <p className="mb-4 text-xs text-stone-500">Sabrina Palermo - P.IVA: [INSERIRE SE NECESSARIO]</p>
        <p className="mb-4">© 2025 Con Strass o Senza. All rights reserved.</p>

        <div className="flex justify-center gap-4 text-xs text-stone-600">
          <a href="/privacy-policy" className="hover:text-rose-400 transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="/cookie-policy" className="hover:text-rose-400 transition-colors">Cookie Policy</a>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            "name": "Con Strass o Senza",
            "image": "https://constrassosenza.vercel.app/logo.png",
            "telephone": "+393299362917",
            "email": "sabrypalermo00@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Valguarnera Caropepe",
              "addressRegion": "EN",
              "postalCode": "94019",
              "addressCountry": "IT"
            },
            "url": "https://constrassosenza.vercel.app",
            "priceRange": "$$",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "09:00",
              "closes": "20:00",
              "description": "Solo su prenotazione"
            }
          })
        }}
      />
    </footer>
  );
}

// Booking Modal Component
import { BookingModal } from "@/components/booking-modal";
import { MarketingPopup } from "@/components/marketing-popup";
import { MarketingBanner } from "@/components/marketing-banner";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { InstagramFeed } from "@/components/instagram-feed";

// Main Page Component
import { supabase } from "@/utils/supabase";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Data State
  const [services, setServices] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data on Load
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, featuresRes, portfolioRes] = await Promise.all([
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('features').select('*').order('sort_order', { ascending: true }),
          supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(6)
        ]);

        if (servicesRes.data) setServices(servicesRes.data);
        if (featuresRes.data) setFeatures(featuresRes.data);
        if (portfolioRes.data) setPortfolio(portfolioRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
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
        {/* @ts-ignore - Prop will be added later */}
        <HeroSection onOpenBooking={handleOpenBooking} services={services} isLoading={isLoading} />

        <div id="chi-siamo">
          {/* @ts-ignore - Prop will be added later */}
          <FeaturesSection features={features} isLoading={isLoading} />
        </div>

        <div id="portfolio">
          {/* @ts-ignore - Prop will be added later */}
          <PortfolioGrid portfolio={portfolio} isLoading={isLoading} />
        </div>

        <InstagramFeed />
      </main>

      <Footer />

      <FloatingWhatsApp />

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
