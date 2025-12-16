import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Con Strass o Senza | Onicotecnica Valguarnera",
  description: "Specialista in Nail Art, Ricostruzione Unghie e Manicure a Valguarnera (EN). Prenota il tuo appuntamento esclusivo con Sabrina Palermo.",
  keywords: ["onicotecnica Valguarnera", "ricostruzione unghie Enna", "nail art", "manicure semipermanente", "Con Strass o Senza"],
  authors: [{ name: "Sabrina Palermo" }],
  openGraph: {
    title: "Con Strass o Senza | Onicotecnica Valguarnera",
    description: "Nail Art unica e trattamenti esclusivi a Valguarnera (EN).",
    url: "https://constrassosenza.vercel.app",
    siteName: "Con Strass o Senza",
    locale: "it_IT",
    type: "website",
  },
};

import { CookieBanner } from "@/components/cookie-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
