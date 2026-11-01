"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import PopularSports from "@/components/PopularSports";
import FeaturedVenues from "@/components/FeaturedVenues";
import LocalityBrowser from "@/components/LocalityBrowser";
import WhyATHLETIQ from "@/components/WhyATHLETIQ";
import HyderabadMap from "@/components/HyderabadMap";
import VenueCard from "@/components/VenueCard";
import GameCard from "@/components/GameCard";
import { getVenues } from "@/lib/venues";
import { getAllGames } from "@/lib/community";
import { CommunityGame } from "@/types/community";
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Users, 
  PlusCircle, 
  Trophy, 
  CheckCircle2, 
  UserPlus 
} from "lucide-react";

export default function HomePage() {
  const allVenues = getVenues();
  const [games, setGames] = useState<CommunityGame[]>([]);

  useEffect(() => {
    setGames(getAllGames());
  }, []);

  const recentVenues = allVenues.slice(-4).reverse();
  const openCommunityGames = games.filter((g) => g.status === "Open").slice(0, 4);

  return (
    <div className="flex flex-col">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. COMMUNITY CALLOUT: Active Games in Hyderabad */}
      <section className="py-14 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Hyderabad Player Community</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2]">
                Join Active Games in Hyderabad
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Don't have enough players? Join open matches hosted by local players or organize your own game!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/host-game"
                className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Host a Game</span>
              </Link>

              <Link
                href="/games"
                className="bg-white hover:bg-slate-100 text-[#F5F5F2] border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
              >
                <span>View All Games</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {openCommunityGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS: Skill Matching & Automatic Friends */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Player Matching</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2]">
              More than Court Booking — A Sports Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Find partners matching your skill level, chat before match day, and grow your local sports network.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#B7F34A]-700 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-extrabold text-base text-[#F5F5F2]">Find or Host a Game</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Choose the sport, venue, schedule, and required skill level (Beginner to Professional). Public or invite-only.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-extrabold text-base text-[#F5F5F2]">Sport-Specific Skills</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Your badminton rating never dictates your football or cricket skill level. Every sport is calibrated independently!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-extrabold text-base text-[#F5F5F2]">Private Game Chat</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Once accepted, access the private group chat to coordinate court slots, warm-ups, and equipment with fellow teammates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
                4
              </div>
              <h3 className="font-extrabold text-base text-[#F5F5F2]">Automatic Friends</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                After the game, verified attendees are automatically added to your ATHLETIQ Friends list and can anonymously rate peer skills.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Popular Sports Category Cards */}
      <PopularSports />

      {/* 5. Featured Hyderabad Venues */}
      <FeaturedVenues />

      {/* 6. Browse by Locality */}
      <LocalityBrowser />

      {/* 7. Interactive Hyderabad Map Preview Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geographic Discovery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Map View of Hyderabad Sports Venues
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Visual coordinate distribution across West, Central, and East Hyderabad zones
              </p>
            </div>

            <Link
              href="/explore?view=map"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] hover:text-emerald-400 transition-colors"
            >
              <span>Open Fullscreen Map Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <HyderabadMap venues={allVenues} />
        </div>
      </section>

      {/* 8. Recently Added Listings */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fresh Additions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2]">
                Recently Added to ATHLETIQ
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                New turf stadiums, community sports arenas, and fitness centers in Telangana
              </p>
            </div>

            <Link
              href="/explore"
              className="text-xs font-bold text-[#F5F5F2] hover:text-[#B7F34A] flex items-center gap-1"
            >
              <span>Explore All {allVenues.length} Venues</span>
              <ArrowRight className="w-4 h-4 text-[#B7F34A]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} viewMode="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Why ATHLETIQ Section */}
      <WhyATHLETIQ />

      {/* 10. Call To Action Banner */}
      <section className="py-14 bg-gradient-to-r from-speecat-navy via-slate-900 to-speecat-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B7F34A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-[#B7F34A]/20 text-[#B7F34A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-current" />
            Ready for your match?
          </span>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Step onto the Court in Hyderabad Today
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Find games, connect with fellow players, or explore top sports venues across Telangana.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/games"
              className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-sm px-7 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Find Games to Play
            </Link>
            <Link
              href="/host-game"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-700 transition-colors"
            >
              Host a Game
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
