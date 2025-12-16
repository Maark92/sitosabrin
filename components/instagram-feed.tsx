"use client";

import React from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";

const instagramImages = [
    "/instagram/insta-1.png",
    "/instagram/insta-2.png",
    "/instagram/insta-3.jpg",
    "/instagram/insta-4.png",
    "/instagram/insta-5.jpg",
    "/instagram/insta-1.png", // Duplicate first to maintain volume
];

export function InstagramFeed() {
    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <a
                    href="https://www.instagram.com/con_strass.o.senza/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xl font-serif font-medium text-stone-800 hover:text-rose-500 transition-colors"
                >
                    <Instagram className="w-6 h-6" />
                    Seguici su Instagram @con_strass.o.senza
                </a>
            </div>

            <div className="relative w-full">
                <div className="flex gap-4 animate-scroll whitespace-nowrap">
                    {/* Double the images to create seamless loop */}
                    {[...instagramImages, ...instagramImages].map((src, index) => (
                        <div
                            key={index}
                            className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md group cursor-pointer"
                        >
                            <a href="https://www.instagram.com/con_strass.o.senza/" target="_blank" rel="noopener noreferrer">
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10" />
                                <Image
                                    src={src}
                                    alt={`Instagram post ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Creating the keyframe animation in global css or here via style tag if tailwind config missing */}
            <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
}
