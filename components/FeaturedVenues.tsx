"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import VenueCard from "./VenueCard";
import { getVenues } from "@/lib/venues";
import { SportType } from "@/types/venue";

export default function FeaturedVenues() {
  const allVenues = getVenues();
  const [activeTab, setActiveTab] = useState<string>("All");

  const categories = ["All", "Badminton", "Football", "Cricket", "Pickleball", "Tennis"];

  const filteredVenues = allVenues.filter((v) => {
    if (activeTab === "All") return v.isFeatured || v.isPopular;
    return v.sport === activeTab || v.sportsAvailable?.includes(activeTab as SportType);
  }).slice(0, 6);

  return (
    <section className="py-16 bg-[#17191C] border-b border-[#292D32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Verified Directory Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2]">
              Featured Hyderabad Venues
            </h2>
            <p className="text-sm text-[#AEB4B0] mt-1">
              Top-rated sports arenas in Gachibowli, HITEC City, Madhapur, and Jubilee Hills
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#292D32] p-1 rounded-xl border border-[#373C42]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === cat
                    ? "bg-[#B7F34A] text-[#17191C] shadow-sm"
                    : "text-[#AEB4B0] hover:text-[#F5F5F2] hover:bg-[#32373D]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#32373D] border border-[#373C42] hover:border-[#B7F34A]/50 text-[#F5F5F2] hover:text-[#B7F34A] font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            <span>View All 18 Hyderabad Sports Venues</span>
            <ArrowRight className="w-4 h-4 text-[#B7F34A]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
