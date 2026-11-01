import React from "react";
import { Zap, ShieldCheck, MapPin, IndianRupee, Sparkles } from "lucide-react";

export default function WhyATHLETIQ() {
  const features = [
    {
      icon: <IndianRupee className="w-6 h-6 text-[#FF7139]" />,
      title: "Transparent Pricing in INR (₹)",
      description:
        "Clear hourly rates with zero hidden booking charges. See off-peak and peak rates upfront before reserving.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#2563EB]" />,
      title: "Hyderabad-Wide Coverage",
      description:
        "From Gachibowli to Secunderabad, Madhapur to LB Nagar — discover top badminton courts, turfs, clubs, and pickleball arenas in your neighborhood.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#2563EB]" />,
      title: "Verified Facility & Club Details",
      description:
        "Every listing highlights verified surfaces (BWF Teak Wood, Yonex synthetic, FIFA AstroTurf, ITF Clay), club rules, and player amenities.",
    },
    {
      icon: <Zap className="w-6 h-6 text-[#FF7139]" />,
      title: "Active Clubs & Community Games",
      description:
        "Join Hyderabad sports clubs, sign up for weekly running and badminton sessions, or host games with players matching your skill level.",
    },
  ];

  return (
    <section className="py-16 bg-[#0B1020] border-t border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7139] uppercase tracking-wider bg-[#FF7139]/10 border border-[#FF7139]/30 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Hyderabad Players</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Why Sports Enthusiasts Choose ATHLETIQ
          </h2>
          <p className="text-sm text-[#A7B0C0]">
            PLAY • BOOK • CONNECT — A seamless experience from venue discovery and clubs to court checkout
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-[#1F2937] hover:bg-[#253245] border border-[#374151] hover:border-[#2563EB] rounded-2xl p-6 transition-all hover:shadow-xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0B1020] group-hover:scale-105 flex items-center justify-center mb-4 transition-transform border border-[#374151]">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#2563EB] transition-colors mb-2">
                {feat.title}
              </h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
