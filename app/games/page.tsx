"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  Search, 
  Filter, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowUpDown,
  CheckCircle2,
  Lock
} from "lucide-react";
import GameCard from "@/components/GameCard";
import { getAllGames, getCurrentUser } from "@/lib/community";
import { HYDERABAD_LOCALITIES } from "@/lib/venues";
import { CommunityGame, SkillLevel, ALL_SKILL_LEVELS } from "@/types/community";
import { SportType } from "@/types/venue";

const ALL_SPORTS: SportType[] = [
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

function FindGamesContent() {
  const searchParams = useSearchParams();
  const [games, setGames] = useState<CommunityGame[]>([]);
  const currentUser = getCurrentUser();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [selectedLocality, setSelectedLocality] = useState<string>("All");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [onlyOpenSpots, setOnlyOpenSpots] = useState<boolean>(true);
  const [onlyPublic, setOnlyPublic] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("soonest"); // soonest, spots, price-asc
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setGames(getAllGames());

    const handleGamesChanged = () => setGames(getAllGames());
    window.addEventListener("speecat_games_changed", handleGamesChanged);
    return () => window.removeEventListener("speecat_games_changed", handleGamesChanged);
  }, []);

  // Sync url params if any
  useEffect(() => {
    const s = searchParams.get("sport");
    const l = searchParams.get("locality");
    if (s) setSelectedSport(s);
    if (l) setSelectedLocality(l);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSport("All");
    setSelectedLocality("All");
    setSelectedSkillLevel("All");
    setSelectedDate("");
    setOnlyOpenSpots(true);
    setOnlyPublic(true);
    setSortBy("soonest");
  };

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        // Keyword Search
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          const matchTitle = g.title.toLowerCase().includes(t);
          const matchVenue = g.venueName.toLowerCase().includes(t);
          const matchLoc = g.locality.toLowerCase().includes(t);
          const matchSport = g.sport.toLowerCase().includes(t);
          if (!matchTitle && !matchVenue && !matchLoc && !matchSport) return false;
        }

        // Sport
        if (selectedSport !== "All" && g.sport !== selectedSport) return false;

        // Locality
        if (selectedLocality !== "All" && g.locality !== selectedLocality) return false;

        // Date
        if (selectedDate && g.date !== selectedDate) return false;

        // Skill Level
        if (selectedSkillLevel !== "All") {
          const req = g.skillRequirement;
          if (req.type === "open") {
            // Open to all matches any selected skill
          } else if (req.type === "single" && req.level !== selectedSkillLevel) {
            return false;
          } else if (req.type === "range") {
            const levels = ["Beginner", "Amateur", "Intermediate", "Advanced", "Professional"];
            const minIdx = levels.indexOf(req.minLevel || "Beginner");
            const maxIdx = levels.indexOf(req.maxLevel || "Professional");
            const selIdx = levels.indexOf(selectedSkillLevel);
            if (selIdx < minIdx || selIdx > maxIdx) return false;
          }
        }

        // Available Spots
        if (onlyOpenSpots) {
          const spotsLeft = g.maxGroupSize - g.participants.length;
          if (spotsLeft <= 0 || g.status !== "Open") return false;
        }

        // Public vs Invite
        if (onlyPublic && g.visibility !== "public") return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "soonest") {
          return new Date(`${a.date} ${a.startTime}`).getTime() - new Date(`${b.date} ${b.startTime}`).getTime();
        }
        if (sortBy === "spots") {
          const spotsA = a.maxGroupSize - a.participants.length;
          const spotsB = b.maxGroupSize - b.participants.length;
          return spotsB - spotsA;
        }
        if (sortBy === "price-asc") {
          return (a.costPerPlayer || 0) - (b.costPerPlayer || 0);
        }
        return 0;
      });
  }, [
    games,
    searchTerm,
    selectedSport,
    selectedLocality,
    selectedSkillLevel,
    selectedDate,
    onlyOpenSpots,
    onlyPublic,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedSport !== "All" ? 1 : 0) +
    (selectedLocality !== "All" ? 1 : 0) +
    (selectedSkillLevel !== "All" ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (searchTerm ? 1 : 0);

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Banner */}
        <div className="bg-speecat-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B7F34A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-[#B7F34A]/20 text-[#B7F34A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Hyderabad Player Community</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Find People to Play With in Hyderabad
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Join games hosted by local players or host your own match. Filter by sport, locality, and match your exact skill level from Beginner to Professional.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/host-game"
                className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Host a Game</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Search & Filter Header */}
        <div className="bg-[#292D32] rounded-2xl border border-[#373C42]/90 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by game title, sport, venue, or locality (e.g. Gachibowli, Badminton)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              />
            </div>

            {/* Sort & Quick options */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#F5F5F2]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#F5F5F2] focus:outline-none cursor-pointer"
                >
                  <option value="soonest">Soonest Match</option>
                  <option value="spots">Most Spots Left</option>
                  <option value="price-asc">Lowest Price (₹)</option>
                </select>
              </div>

              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden bg-slate-100 hover:bg-slate-200 text-[#F5F5F2] font-bold text-xs p-2.5 rounded-xl flex items-center gap-1"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B7F34A]" />
                <span>Filters ({activeFiltersCount})</span>
              </button>
            </div>
          </div>

          {/* Quick Sport Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
            <button
              onClick={() => setSelectedSport("All")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedSport === "All"
                  ? "bg-speecat-navy text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Sports
            </button>
            {ALL_SPORTS.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedSport === sport
                    ? "bg-speecat-navy text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Game Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Filters Sidebar */}
          <aside
            className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5 ${
              mobileFilterOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#B7F34A]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F2]">
                  Filter Community Games
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Hyderabad Locality */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F5F5F2] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Hyderabad Area</span>
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              >
                <option value="All">All Localities</option>
                {HYDERABAD_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Level Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F5F5F2] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Required Skill Level</span>
              </label>
              <select
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              >
                <option value="All">Any Skill Level</option>
                {ALL_SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F5F5F2] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-[#F5F5F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOpenSpots}
                  onChange={(e) => setOnlyOpenSpots(e.target.checked)}
                  className="rounded text-[#B7F34A] focus:ring-speecat-green w-4 h-4 accent-speecat-green"
                />
                <span className="font-semibold">Only games with open spots</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#F5F5F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPublic}
                  onChange={(e) => setOnlyPublic(e.target.checked)}
                  className="rounded text-[#B7F34A] focus:ring-speecat-green w-4 h-4 accent-speecat-green"
                />
                <span className="font-semibold">Public community matches</span>
              </label>
            </div>

            {/* Host Game Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
              <div className="font-black text-xs text-emerald-900">Can't find your match?</div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Host your own game in 2 minutes and let local players join you!
              </p>
              <Link
                href="/host-game"
                className="inline-block bg-speecat-navy text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Host a Game Now
              </Link>
            </div>

          </aside>

          {/* Games List Grid */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Results Counter */}
            <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div>
                Showing <span className="font-bold text-[#F5F5F2]">{filteredGames.length}</span> active games in Hyderabad
              </div>

              {currentUser && (
                <div className="text-[11px] text-slate-600 hidden sm:block">
                  Browsing as: <span className="font-bold text-[#F5F5F2]">{currentUser.name}</span>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#F5F5F2]">
                    No games found in your area
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Be the first to host a game at your local Hyderabad court or turf!
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Reset Filters
                  </button>
                  <Link
                    href="/host-game"
                    className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-5 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    Host a Game
                  </Link>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

export default function FindGamesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Loading community games...</div>}>
      <FindGamesContent />
    </Suspense>
  );
}
