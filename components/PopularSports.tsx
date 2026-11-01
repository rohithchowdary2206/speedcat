"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles
} from "lucide-react";
import { getSportsList } from "@/lib/venues";
import { SportType } from "@/types/venue";

const SPORT_ICONS: Record<SportType, string> = {
  Badminton: "🏸",
  Football: "⚽",
  Cricket: "🏏",
  Tennis: "🎾",
  Pickleball: "🏓",
  Basketball: "🏀",
  "Table Tennis": "🏓",
  Swimming: "🏊",
  "Multi-Sport": "🏟️",
};

export default function PopularSports() {
  const sports = getSportsList();

  return (
    <section className="py-14 bg-[#17191C] border-b border-[#292D32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sports Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2]">
              Explore by Sport
            </h2>
            <p className="text-sm text-[#AEB4B0] mt-1">
              Select your favorite game to find Hyderabad’s best courts and turfs
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] hover:text-[#A3E435] group"
          >
            <span>View All Hyderabad Sports</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {sports.map((item) => (
            <Link
              key={item.name}
              href={`/explore?sport=${encodeURIComponent(item.name)}`}
              className="bg-[#292D32] hover:bg-[#32373D] border border-[#373C42] hover:border-[#B7F34A]/50 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all group hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">
                {SPORT_ICONS[item.name] || "🏅"}
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[#F5F5F2] group-hover:text-[#B7F34A] transition-colors">
                {item.name}
              </h3>
              <span className="text-[11px] text-[#AEB4B0] mt-0.5">
                {item.count} venues
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
