"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Flame
} from "lucide-react";
import { Club } from "@/types/club";
import { isPlayerInClub, joinClub, leaveClub } from "@/lib/clubs";
import { getCurrentUser } from "@/lib/community";

interface ClubCardProps {
  club: Club;
  onMembershipChange?: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Running: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  Cycling: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  Badminton: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  Fitness: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  Swimming: { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
  Tennis: { bg: "bg-lime-50", text: "text-lime-800", border: "border-lime-200" },
  "Social Activities": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  Cricket: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
};

export default function ClubCard({ club, onMembershipChange }: ClubCardProps) {
  const currentUser = getCurrentUser();
  const [isJoined, setIsJoined] = useState(() =>
    currentUser ? isPlayerInClub(club.id, currentUser.id) : false
  );
  const [memberCount, setMemberCount] = useState(club.memberCount);

  const handleToggleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("Please log in with a demo persona to join this club.");
      return;
    }

    try {
      if (isJoined) {
        leaveClub(club.id, currentUser.id);
        setIsJoined(false);
        setMemberCount((prev) => Math.max(1, prev - 1));
      } else {
        joinClub(club.id, {
          playerId: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        });
        setIsJoined(true);
        setMemberCount((prev) => prev + 1);
      }
      if (onMembershipChange) onMembershipChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const badgeStyle = CATEGORY_COLORS[club.category] || {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-200",
  };

  return (
    <div className="bg-[#292D32] rounded-3xl border border-[#373C42]/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={club.coverImage}
          alt={club.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`text-xs font-black px-3 py-1 rounded-full border backdrop-blur-md ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} shadow-xs`}
          >
            {club.category}
          </span>

          {club.featured && (
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured Club
            </span>
          )}
        </div>

        {/* Bottom Locality Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-semibold drop-shadow">
            <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
            <span>{club.locality}, Hyderabad</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
            <Calendar className="w-3 h-3 text-[#B7F34A]" />
            <span>{club.upcomingEventsCount} Upcoming</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link href={`/clubs/${club.slug}`}>
            <h3 className="text-lg font-black text-[#F5F5F2] group-hover:text-[#B7F34A] transition-colors line-clamp-1">
              {club.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
            {club.tagline || club.description}
          </p>

          {/* Members Bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                {club.members.slice(0, 3).map((m, idx) => (
                  <img
                    key={idx}
                    src={m.avatar}
                    alt={m.name}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <span className="font-bold text-[#F5F5F2] text-xs">
                {memberCount} members
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              By <span className="font-bold text-slate-700">{club.organizerName.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
          <Link
            href={`/clubs/${club.slug}`}
            className="text-xs font-bold text-slate-600 hover:text-[#F5F5F2] flex items-center gap-1 transition-colors"
          >
            <span>View Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleToggleJoin}
            className={`text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
              isJoined
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                : "bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2]"
            }`}
          >
            {isJoined ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </>
            ) : (
              <span>Join Club</span>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
