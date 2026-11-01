"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Compass, 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  PlusCircle, 
  RotateCcw, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Tag,
  ArrowRight
} from "lucide-react";
import ClubCard from "@/components/ClubCard";
import ClubEventCard from "@/components/ClubEventCard";
import { getAllClubs, getAllClubEvents } from "@/lib/clubs";
import { HYDERABAD_LOCALITIES } from "@/lib/venues";
import { Club, ClubEvent, ClubCategory, ALL_CLUB_CATEGORIES } from "@/types/club";

function ClubsContent() {
  const searchParams = useSearchParams();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLocality, setSelectedLocality] = useState<string>("All");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>("All"); // All, Free, Paid
  const [activeTab, setActiveTab] = useState<"clubs" | "events">("clubs");

  const loadData = () => {
    setClubs(getAllClubs());
    setEvents(getAllClubEvents());
  };

  useEffect(() => {
    loadData();

    const handleClubsChange = () => loadData();
    window.addEventListener("speedcat_clubs_changed", handleClubsChange);
    window.addEventListener("speedcat_events_changed", handleClubsChange);
    return () => {
      window.removeEventListener("speedcat_clubs_changed", handleClubsChange);
      window.removeEventListener("speedcat_events_changed", handleClubsChange);
    };
  }, []);

  // Sync category or query from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    const loc = searchParams.get("locality");
    if (cat) setSelectedCategory(cat);
    if (loc) setSelectedLocality(loc);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLocality("All");
    setSelectedPriceFilter("All");
  };

  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const matchName = c.name.toLowerCase().includes(t);
        const matchDesc = c.description.toLowerCase().includes(t);
        const matchLoc = c.locality.toLowerCase().includes(t);
        const matchCat = c.category.toLowerCase().includes(t);
        if (!matchName && !matchDesc && !matchLoc && !matchCat) return false;
      }
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
      if (selectedLocality !== "All" && c.locality !== selectedLocality) return false;
      return true;
    });
  }, [clubs, searchTerm, selectedCategory, selectedLocality]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(t);
        const matchClub = e.clubName.toLowerCase().includes(t);
        const matchLoc = e.locality.toLowerCase().includes(t);
        if (!matchTitle && !matchClub && !matchLoc) return false;
      }
      if (selectedCategory !== "All" && e.category !== selectedCategory) return false;
      if (selectedLocality !== "All" && e.locality !== selectedLocality) return false;
      if (selectedPriceFilter === "Free" && e.price !== 0) return false;
      if (selectedPriceFilter === "Paid" && e.price === 0) return false;
      return true;
    });
  }, [events, searchTerm, selectedCategory, selectedLocality, selectedPriceFilter]);

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-speecat-navy rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7F34A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-[#B7F34A]/20 text-[#B7F34A] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>ATHLETIQ Clubs & Events</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Discover Sports & Fitness Clubs in Hyderabad
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Join active running groups, cycling pelotons, badminton communities, and outdoor bootcamp clubs. Attend free weekly sessions or reserve specialized training workshops.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/clubs/organizer"
                className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Organiser Portal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Discovery & Search Bar */}
        <div className="bg-[#292D32] rounded-3xl border border-[#373C42]/90 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clubs by name, activity (e.g. Running, Cycling, Badminton), or Hyderabad area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Location Select */}
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#F5F5F2] cursor-pointer"
              >
                <option value="All">All Hyderabad Areas</option>
                {HYDERABAD_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Free vs Paid activities filter */}
              <select
                value={selectedPriceFilter}
                onChange={(e) => setSelectedPriceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#F5F5F2] cursor-pointer"
              >
                <option value="All">All Activities (Free & Paid)</option>
                <option value="Free">Free Community Only</option>
                <option value="Paid">Paid Workshops / Passes</option>
              </select>

              {(searchTerm || selectedCategory !== "All" || selectedLocality !== "All" || selectedPriceFilter !== "All") && (
                <button
                  onClick={handleResetFilters}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-speecat-navy text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Categories
            </button>
            {ALL_CLUB_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-speecat-navy text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle: Clubs vs Upcoming Events */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("clubs")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === "clubs"
                  ? "bg-speecat-navy text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Active Clubs ({filteredClubs.length})
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "events"
                  ? "bg-speecat-navy text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#B7F34A]" />
              <span>Upcoming Club Events ({filteredEvents.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-semibold hidden sm:block">
            Verified Hyderabad Communities
          </div>
        </div>

        {/* CLUBS TAB CONTENT */}
        {activeTab === "clubs" && (
          <div>
            {filteredClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                  <ClubCard key={club.id} club={club} onMembershipChange={loadData} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-12 text-center space-y-3">
                <Compass className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-[#F5F5F2]">No clubs match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search keyword or selecting "All Categories".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB CONTENT */}
        {activeTab === "events" && (
          <div>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <ClubEventCard key={evt.id} event={evt} onRegistered={loadData} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-[#F5F5F2]">No events found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no scheduled events matching this criteria right now.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function ClubsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Loading ATHLETIQ clubs directory...</div>}>
      <ClubsContent />
    </Suspense>
  );
}
