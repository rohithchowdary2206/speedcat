"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  MapPin, 
  PlusCircle, 
  Star, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { 
  getCurrentUser, 
  getAllGames, 
  getAllFriendships, 
  getAllRatings 
} from "@/lib/community";
import { CommunityGame, PlayerProfile } from "@/types/community";
import GameCard from "@/components/GameCard";

export default function MyGamesPage() {
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(null);
  const [games, setGames] = useState<CommunityGame[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "hosted" | "past" | "suggested">("upcoming");

  const loadData = () => {
    setCurrentUser(getCurrentUser());
    setGames(getAllGames());
  };

  useEffect(() => {
    loadData();

    const handleAuth = () => loadData();
    const handleGames = () => loadData();
    window.addEventListener("speecat_auth_changed", handleAuth);
    window.addEventListener("speecat_games_changed", handleGames);

    return () => {
      window.removeEventListener("speecat_auth_changed", handleAuth);
      window.removeEventListener("speecat_games_changed", handleGames);
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-[#F5F5F2]">Log In to View Your Games</h2>
        <p className="text-xs text-slate-500">Access your scheduled matches, group chats, and hosted games.</p>
        <Link href="/login" className="bg-[#B7F34A] text-[#F5F5F2] font-bold text-xs px-4 py-2 rounded-xl">
          Log In Demo
        </Link>
      </div>
    );
  }

  // Segment Games
  const upcomingGames = games.filter(
    (g) =>
      (g.status === "Open" || g.status === "Full") &&
      (g.hostId === currentUser.id || g.participants.some((p) => p.playerId === currentUser.id))
  );

  const hostedGames = games.filter((g) => g.hostId === currentUser.id);

  const pastGames = games.filter(
    (g) =>
      g.status === "Completed" &&
      (g.hostId === currentUser.id || g.participants.some((p) => p.playerId === currentUser.id))
  );

  // Suggested games matching player's sports
  const suggestedGames = games.filter((g) => {
    if (g.status !== "Open") return false;
    if (g.hostId === currentUser.id) return false;
    if (g.participants.some((p) => p.playerId === currentUser.id)) return false;
    return currentUser.favoriteSports.includes(g.sport);
  });

  const pendingRequestsTotal = hostedGames.reduce(
    (acc, g) => acc + g.joinRequests.filter((r) => r.status === "pending").length,
    0
  );

  // Ratings pending for past games
  const allRatings = getAllRatings();
  const unratedPastGame = pastGames.find((g) => {
    const otherParticipants = g.participants.filter((p) => p.playerId !== currentUser.id);
    const ratedCount = allRatings.filter(
      (r) => r.gameId === g.id && r.raterPlayerId === currentUser.id
    ).length;
    return ratedCount < otherParticipants.length;
  });

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-speecat-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Player Match Schedule</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                My Games & Match Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Track your upcoming community matches, group chats, hosted requests, and post-game ratings.
              </p>
            </div>

            <Link
              href="/host-game"
              className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host a New Game</span>
            </Link>
          </div>
        </div>

        {/* Rating Prompt Banner if pending */}
        {unratedPastGame && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-600 fill-amber-500 shrink-0" />
              <div>
                <span className="font-extrabold text-amber-950">
                  Rate your fellow players from "{unratedPastGame.title}"!
                </span>
                <p className="text-[11px] text-amber-800">
                  Give peer feedback on skill and sportsmanship to help the Hyderabad community.
                </p>
              </div>
            </div>

            <Link
              href={`/games/${unratedPastGame.id}`}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2 rounded-xl text-center shrink-0 transition-colors"
            >
              Submit Ratings Now
            </Link>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 pb-2 text-xs font-bold gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "upcoming"
                ? "bg-speecat-navy text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Upcoming Matches ({upcomingGames.length})
          </button>

          <button
            onClick={() => setActiveTab("hosted")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "hosted"
                ? "bg-speecat-navy text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Hosted Games ({hostedGames.length})</span>
            {pendingRequestsTotal > 0 && (
              <span className="bg-amber-400 text-[#F5F5F2] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingRequestsTotal} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "past"
                ? "bg-speecat-navy text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Past Completed Games ({pastGames.length})
          </button>

          <button
            onClick={() => setActiveTab("suggested")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "suggested"
                ? "bg-speecat-navy text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Suggested for You ({suggestedGames.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-12 text-center space-y-4">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-[#F5F5F2]">No upcoming games scheduled</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Find an open game matching your sport and skill level or host one in your neighborhood!
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href="/games"
                    className="bg-speecat-navy text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Find Open Games
                  </Link>
                  <Link
                    href="/host-game"
                    className="bg-[#B7F34A] text-[#F5F5F2] font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Host a Game
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "hosted" && (
          <div className="space-y-4">
            {hostedGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hostedGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-12 text-center space-y-4">
                <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-[#F5F5F2]">You haven't hosted any games yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Take the lead and host a match at any Hyderabad court or turf.
                </p>
                <Link
                  href="/host-game"
                  className="inline-block bg-[#B7F34A] text-[#F5F5F2] font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                >
                  Host Your First Game
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-4">
            {pastGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pastGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-12 text-center text-xs text-slate-400">
                No past completed games yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "suggested" && (
          <div className="space-y-4">
            {suggestedGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {suggestedGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-12 text-center text-xs text-slate-400">
                No new open games match your sports right now. Check back soon or host one!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
