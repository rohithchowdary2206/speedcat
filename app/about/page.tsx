import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, MapPin, Sparkles, Trophy, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-speedcat-green" />
            <span>About ATHLETIQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-speedcat-navy">
            Find Your Game. Book Your Court.
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            ATHLETIQ is Hyderabad’s modern sports venue booking and club community platform prototype, bringing players, clubs, and verified sports facilities together.
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-speedcat-navy">Our Vision for Hyderabad Sports</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Finding high quality sports venues in Hyderabad—whether it is a badminton court near Gachibowli, a 5-a-side football turf in Madhapur, or an evening box cricket match in Kukatpally—has historically required calling multiple arenas, dealing with opaque pricing, and risking full bookings upon arrival.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            ATHLETIQ was envisioned to bring total transparency and community connection to Hyderabad’s sports enthusiasts with instant hourly court rates in Indian Rupees (₹), verified facility amenities (non-marking wooden floors, FIFA AstroTurf, LED floodlights), active sports clubs, and seamless match scheduling.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <Trophy className="w-8 h-8 text-speedcat-green" />
            <h3 className="font-bold text-base text-speedcat-navy">Quality Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent court surface specifications, amenities lists, and verified operating hours for every Hyderabad locality.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h3 className="font-bold text-base text-speedcat-navy">Clubs & Community</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find running groups, badminton sessions, cycling tours, and fellow sports lovers matching your exact skill level.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <ShieldCheck className="w-8 h-8 text-purple-600" />
            <h3 className="font-bold text-base text-speedcat-navy">Transparent Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clear price breakdowns in INR (₹) with dynamic platform fee transparency for club organisers and athletes.
            </p>
          </div>
        </div>

        {/* Prototype Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
          <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-700" />
            Demonstration Prototype Notice
          </h3>
          <p className="leading-relaxed text-amber-900/90">
            This website is an interactive prototype preview. Venues listed are real Hyderabad sports centers used as representative examples of directory appearance and search behavior. ATHLETIQ does not currently claim official commercial partnership with the listed venues, and all booking flows are purely demonstrational without real-world court reservations or monetary payments.
          </p>
        </div>

        {/* Action Link */}
        <div className="text-center pt-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-speedcat-navy text-white font-black text-sm px-6 py-3 rounded-xl hover:bg-slate-800 shadow-md transition-all"
          >
            <span>Explore Hyderabad Sports Directory</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
