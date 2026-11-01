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
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
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
    <section className="relative overflow-hidden bg-[#0B1020] pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#1F2937]">
      {/* Background subtle graphic accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-speedcat-green/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header / Badges */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#2563EB]/15 border border-[#2563EB]/40 text-[#93C5FD] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#FF7139]" />
            <span>ATHLETIQ • PLAY • BOOK • CONNECT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight leading-[1.15]">
            Your Game. <br />
            <span className="text-[#FF7139] relative inline-block">
              Our Community.
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#FF7139]/30"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="6" fill="transparent" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A7B0C0] max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            Discover top-rated badminton courts, football turfs, cricket pitches, running clubs, and sports communities across Hyderabad. Preview directory with transparent pricing in Indian Rupees.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-[#A7B0C0] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF7139]" />
              Verified Hyderabad Localities
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF7139]" />
              100% Free Demo Booking Preview
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF7139]" />
              Prices in ₹ per hour
            </span>
          </div>
        </div>

        {/* Interactive Search Card */}
        <div className="mt-10 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-4 sm:p-6 transition-all">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Locality Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7139]" />
                  Locality
                </label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-speedcat-green focus:border-transparent transition-all cursor-pointer"
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
                <label className="block text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#FF7139]" />
                  Sport
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-speedcat-green focus:border-transparent transition-all cursor-pointer"
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
                <label className="block text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF7139]" />
                  Sample Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-speedcat-green focus:border-transparent transition-all cursor-pointer"
                />
              </div>

              {/* Time Slot Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF7139]" />
                  Time Window
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-speedcat-green focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning (6 AM - 11 AM)</option>
                  <option value="afternoon">Afternoon (11 AM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 8 PM)</option>
                  <option value="night">Night (8 PM - 12 AM)</option>
                </select>
              </div>

            </div>

            {/* Bottom Row: Quick filters & Search Button */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#A7B0C0]">
                <span className="font-semibold text-[#F8FAFC]">Popular now:</span>
                <button
                  type="button"
                  onClick={() => { setSelectedLocality("Gachibowli"); setSelectedSport("Badminton"); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Gachibowli Badminton
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedLocality("Madhapur"); setSelectedSport("Football"); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Madhapur Turf
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedLocality("Kondapur"); setSelectedSport("Pickleball"); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Kondapur Pickleball
                </button>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-4 h-4 text-[#FF7139]" />
                <span>Search Venues</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Highlights / Proof points */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">13+</div>
            <div className="text-xs font-semibold text-[#A7B0C0] mt-0.5">Hyderabad Areas</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#FF7139]">9</div>
            <div className="text-xs font-semibold text-[#A7B0C0] mt-0.5">Sports Categories</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">₹250 - ₹1,300</div>
            <div className="text-xs font-semibold text-[#A7B0C0] mt-0.5">Hourly Court Rates</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">Preview</div>
            <div className="text-xs font-semibold text-[#A7B0C0] mt-0.5">Interactive Demo</div>
          </div>
        </div>

      </div>
    </section>
  );
}
