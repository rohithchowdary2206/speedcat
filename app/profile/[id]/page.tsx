"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  MapPin, 
  Trophy, 
  Calendar, 
  Users, 
  Star, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  PlusCircle,
  MessageSquare
} from "lucide-react";
import { getPlayerById, getAllGames, getCurrentUser } from "@/lib/community";
import { PlayerProfile, ALL_SKILL_LEVELS, SKILL_LEVEL_BADGE_COLORS } from "@/types/community";
import { SportType } from "@/types/venue";

export default function PublicPlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params?.id as string;

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [selectedSportTab, setSelectedSportTab] = useState<SportType>("Badminton");
  const currentUser = getCurrentUser();

  useEffect(() => {
    const p = getPlayerById(playerId);
    setPlayer(p);
    if (p && p.favoriteSports.length > 0) {
      setSelectedSportTab(p.favoriteSports[0]);
    }
  }, [playerId]);

  if (!player) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#F5F5F2]">Player Profile Not Found</h2>
        <Link href="/friends" className="bg-[#B7F34A] text-[#F5F5F2] font-bold text-xs px-4 py-2 rounded-xl">
          Back to Friends
        </Link>
      </div>
    );
  }

  const isMe = currentUser?.id === player.id;
  const activeRating = player.sportSkills[selectedSportTab] || {
    selfAssessed: "Beginner",
    ratingsCount: 0,
    distribution: { Beginner: 0, Amateur: 0, Intermediate: 0, Advanced: 0, Professional: 0 },
  };
  const totalDistRatings = Object.values(activeRating.distribution).reduce((a, b) => a + b, 0);

  // Common matches
  const allGames = getAllGames();
  const sharedGames = allGames.filter(
    (g) =>
      g.status === "Completed" &&
      g.actualAttendees?.includes(player.id) &&
      currentUser &&
      g.actualAttendees?.includes(currentUser.id)
  );

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            href="/friends"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B7F34A] bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Community</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <img
                src={player.avatar}
                alt={player.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-emerald-400/30 shadow-md"
              />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F2]">
                    {player.name}
                  </h1>
                  {isMe && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
                  <span>{player.locality}, Hyderabad</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed pt-1">
                  {player.bio}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/friends"
                className="bg-speecat-navy hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#B7F34A]" />
                <span>Invite to Game</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-[#F5F5F2]">{player.gamesPlayed}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Games Played</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-[#B7F34A]">{player.gamesHosted}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Games Hosted</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-purple-600">{player.friendsCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Sports Friends</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{player.sportsmanship.overallScore.toFixed(1)}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Sportsmanship</div>
            </div>
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Skill Ratings Per Sport */}
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-black text-[#F5F5F2] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#B7F34A]" />
                  <span>Sport-Specific Skill Breakdown</span>
                </h2>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {player.favoriteSports.map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setSelectedSportTab(sp)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                        selectedSportTab === sp
                          ? "bg-speecat-navy text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Sport Skill */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-[#F5F5F2]">{selectedSportTab}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Self: {activeRating.selfAssessed}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Peer Rated: {activeRating.communityLevel || "Pending Ratings"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-500 block">Rating Distribution</span>
                  {ALL_SKILL_LEVELS.map((lvl) => {
                    const count = activeRating.distribution[lvl] || 0;
                    const pct = totalDistRatings > 0 ? (count / totalDistRatings) * 100 : 0;
                    return (
                      <div key={lvl} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600 font-medium">
                          <span>{lvl}</span>
                          <span className="font-bold">{count} votes</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#B7F34A] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Shared Matches */}
            {sharedGames.length > 0 && (
              <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-3">
                <h3 className="font-black text-sm text-[#F5F5F2] uppercase tracking-wider">
                  Matches You Played Together ({sharedGames.length})
                </h3>
                <div className="space-y-2">
                  {sharedGames.map((g) => (
                    <Link
                      key={g.id}
                      href={`/games/${g.id}`}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs block"
                    >
                      <div>
                        <div className="font-bold text-[#F5F5F2]">{g.title}</div>
                        <div className="text-slate-500 text-[11px]">{g.sport} • {g.date}</div>
                      </div>
                      <span className="text-[#B7F34A] font-bold">View Match →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-3">
              <h3 className="font-black text-sm text-[#F5F5F2] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
                <span>Sportsmanship</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Punctuality</span>
                  <span className="font-bold">{player.sportsmanship.punctuality.toFixed(1)} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Teamwork</span>
                  <span className="font-bold">{player.sportsmanship.teamwork.toFixed(1)} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fair Play</span>
                  <span className="font-bold">{player.sportsmanship.fairPlay.toFixed(1)} / 5</span>
                </div>
              </div>
            </div>

            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-3">
              <h3 className="font-black text-sm text-[#F5F5F2] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B7F34A]" />
                <span>Availability</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Weekdays</span>
                  <span className="font-bold text-[#F5F5F2]">{player.availability.weekdays.join(", ")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Weekends</span>
                  <span className="font-bold text-[#F5F5F2]">{player.availability.weekends.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
