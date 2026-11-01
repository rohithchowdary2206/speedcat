"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Sparkles, 
  CheckCircle2
} from "lucide-react";
import { HYDERABAD_LOCALITIES } from "@/lib/venues";
import { SportType } from "@/types/venue";

const SPORTS_OPTIONS: SportType[] = [
  "Badminton",
  "Football",
  "Cricket",
  "Tennis",
  "Pickleball",
  "Basketball",
  "Table Tennis",
  "Swimming",
  "Multi-Sport",
];

export default function Hero() {
  const router = useRouter();
  const [selectedLocality, setSelectedLocality] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedLocality) params.set("locality", selectedLocality);
    if (selectedSport) params.set("sport", selectedSport);
    if (selectedDate) params.set("date", selectedDate);
    if (selectedTimeSlot) params.set("time", selectedTimeSlot);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#17191C] pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#292D32]">
      {/* Background subtle graphic accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B7F34A]/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#E7F2D0]/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header / Badges */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#292D32] border border-[#373C42] text-[#B7F34A] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#B7F34A]" />
            <span>ATHLETIQ • PLAY • BOOK • CONNECT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F5F2] tracking-tight leading-[1.15]">
            Your Game. <br />
            <span className="text-[#B7F34A] relative inline-block">
              Our Community.
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#B7F34A]/30"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="6" fill="transparent" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#AEB4B0] max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            Discover top-rated badminton courts, football turfs, cricket pitches, running clubs, and sports communities across Hyderabad. Preview directory with transparent pricing in Indian Rupees.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-[#AEB4B0] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
              Verified Hyderabad Localities
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
              100% Free Demo Booking Preview
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
              Prices in ₹ per hour
            </span>
          </div>
        </div>

        {/* Interactive Search Card in Card Background (#292D32) */}
        <div className="mt-10 max-w-4xl mx-auto bg-[#292D32] rounded-2xl shadow-2xl border border-[#373C42] p-4 sm:p-6 transition-all">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Locality Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#F5F5F2] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
                  Locality
                </label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-[#B7F34A] focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">All Hyderabad Areas</option>
                  {HYDERABAD_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sport Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#F5F5F2] flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#B7F34A]" />
                  Sport
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-[#B7F34A] focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">All Sports</option>
                  {SPORTS_OPTIONS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#F5F5F2] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B7F34A]" />
                  Sample Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-[#B7F34A] focus:border-transparent transition-all cursor-pointer"
                />
              </div>

              {/* Time Slot Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#F5F5F2] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B7F34A]" />
                  Time Window
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-[#B7F34A] focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning (6 AM - 11 AM)</option>
                  <option value="afternoon">Afternoon (11 AM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 8 PM)</option>
                  <option value="night">Night (8 PM - 12 AM)</option>
                </select>
              </div>

            </div>

            {/* Bottom Row: Quick filters & Search Button (Lime with dark text) */}
            <div className="mt-5 pt-4 border-t border-[#373C42] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#AEB4B0]">
                <span className="font-semibold text-[#F5F5F2]">Popular now:</span>
                <button
                  type="button"
                  onClick={() => { setSelectedLocality("Gachibowli"); setSelectedSport("Badminton"); }}
                  className="bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] text-[#F5F5F2] px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Gachibowli Badminton
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedLocality("Madhapur"); setSelectedSport("Football"); }}
                  className="bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] text-[#F5F5F2] px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Madhapur Turf
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedLocality("Kondapur"); setSelectedSport("Pickleball"); }}
                  className="bg-[#17191C] hover:bg-[#1C2024] border border-[#373C42] text-[#F5F5F2] px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Kondapur Pickleball
                </button>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B7F34A] hover:bg-[#A3E435] text-[#17191C] font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-4 h-4 text-[#17191C]" />
                <span>Search Venues</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Highlights / Proof points */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="bg-[#292D32]/90 backdrop-blur-sm border border-[#373C42] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#F5F5F2]">13+</div>
            <div className="text-xs font-semibold text-[#AEB4B0] mt-0.5">Hyderabad Areas</div>
          </div>
          <div className="bg-[#292D32]/90 backdrop-blur-sm border border-[#373C42] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#B7F34A]">9</div>
            <div className="text-xs font-semibold text-[#AEB4B0] mt-0.5">Sports Categories</div>
          </div>
          <div className="bg-[#292D32]/90 backdrop-blur-sm border border-[#373C42] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#F5F5F2]">₹250 - ₹1,300</div>
            <div className="text-xs font-semibold text-[#AEB4B0] mt-0.5">Hourly Court Rates</div>
          </div>
          <div className="bg-[#292D32]/90 backdrop-blur-sm border border-[#373C42] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#E7F2D0]">Preview</div>
            <div className="text-xs font-semibold text-[#AEB4B0] mt-0.5">Interactive Demo</div>
          </div>
        </div>

      </div>
    </section>
  );
}
