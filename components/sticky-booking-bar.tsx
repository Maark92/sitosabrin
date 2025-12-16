"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export function StickyBookingBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-rose-100 md:hidden z-50">
      <Button 
        className="w-full bg-stone-800 hover:bg-stone-900 text-white font-medium py-6 text-lg shadow-lg"
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
      >
        <CalendarDays className="mr-2 h-5 w-5" />
        Prenota Ora
      </Button>
    </div>
  );
}
