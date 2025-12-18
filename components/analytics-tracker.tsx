"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export function AnalyticsTracker() {
    const pathname = usePathname();
    // Use a ref to prevent double-firing in strict mode for the same page view
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        // Basic debounce/check to ensure we don't track the same hit multiple times instantly
        if (lastTrackedPath.current === pathname) return;

        const trackVisit = async () => {
            try {
                lastTrackedPath.current = pathname; // Mark as tracked

                await supabase.from('site_visits').insert({
                    page_path: pathname,
                    user_agent: window.navigator.userAgent,
                    referrer: document.referrer || null,
                });
            } catch (error) {
                console.error('Analytics error:', error);
            }
        };

        // Small timeout to ensure page component mounted properly
        const timer = setTimeout(() => {
            trackVisit();
        }, 1000);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null; // This component renders nothing
}
