"use client";

import React from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Lock
} from "lucide-react";
import { CommunityGame, SKILL_LEVEL_BADGE_COLORS } from "@/types/community";
import { getCurrentUser } from "@/lib/community";

interface GameCardProps {
  game: CommunityGame;
  onRequestJoin?: (gameId: string) => void;
}

export default function GameCard({ game }: GameCardProps) {
  const currentUser = getCurrentUser();
  const confirmedCount = game.participants.length;
  const spotsLeft = Math.max(0, game.maxGroupSize - confirmedCount);
  const isHost = currentUser?.id === game.hostId;
  const isJoined = game.participants.some((p) => p.playerId === currentUser?.id);
  const isPending = game.joinRequests?.some(
    (r) => r.playerId === currentUser?.id && r.status === "pending"
  );

  const skillBadge = game.skillRequirement.level
    ? SKILL_LEVEL_BADGE_COLORS[game.skillRequirement.level]
    : { bg: "bg-[#17191C]", text: "text-[#B7F34A]", border: "border-[#B7F34A]/30" };

  const sportEmoji: Record<string, string> = {
    Badminton: "🏸",
    Football: "⚽",
    Cricket: "🏏",
    Tennis: "🎾",
    Pickleball: "🏓",
    Basketball: "🏀",
    "Table Tennis": "🏓",
    Swimming: "🏊",
    "Multi-Sport": "🏟️",
  };

  return (
    <div className="bg-[#292D32] rounded-2xl border border-[#373C42] hover:border-[#B7F34A]/50 p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group">
      
      {/* Top Bar: Sport, Format, Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{sportEmoji[game.sport] || "🏅"}</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#F5F5F2]">
              {game.sport}
            </span>
            <span className="text-[11px] text-[#AEB4B0] font-semibold">• {game.matchFormat}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {game.visibility === "invite-only" && (
              <span className="text-[10px] bg-[#17191C] text-[#AEB4B0] border border-[#373C42] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#B7F34A]" />
                Invite
              </span>
            )}
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                game.status === "Open"
                  ? "bg-[#B7F34A]/15 text-[#B7F34A] border border-[#B7F34A]/30"
                  : game.status === "Full"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : game.status === "Completed"
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  : "bg-[#17191C] text-[#AEB4B0] border border-[#373C42]"
              }`}
            >
              {game.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/games/${game.id}`}>
          <h3 className="font-extrabold text-base sm:text-lg text-[#F5F5F2] group-hover:text-[#B7F34A] transition-colors line-clamp-1">
            {game.title}
          </h3>
        </Link>

        {/* Venue & Locality */}
        <div className="flex items-center gap-1 text-xs text-[#AEB4B0] font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#B7F34A] shrink-0" />
          <span className="truncate">{game.venueName} • {game.locality}, Hyd</span>
        </div>
      </div>

      {/* Date, Time, Skill & Player Requirements */}
      <div className="space-y-2.5 pt-2 border-t border-[#373C42] text-xs">
        
        {/* Schedule */}
        <div className="flex flex-wrap items-center gap-3 text-[#F5F5F2] font-medium">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#B7F34A]" />
            <span>{game.date}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#B7F34A]" />
            <span>{game.startTime} ({game.durationHours}h)</span>
          </div>
        </div>

        {/* Skill Requirement Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#AEB4B0] uppercase tracking-wider">
            Skill:
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border bg-[#17191C] text-[#B7F34A] border-[#B7F34A]/30`}
          >
            {game.skillRequirement.displayText}
          </span>
        </div>

        {/* Spots & Confirmed Players */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#AEB4B0]" />
            <span className="font-bold text-[#F5F5F2]">
              {confirmedCount}/{game.maxGroupSize} Players
            </span>
            <span className="text-[#AEB4B0] text-[11px]">
              ({spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"})
            </span>
          </div>

          {game.costPerPlayer ? (
            <div className="text-right font-black text-[#B7F34A] text-xs">
              ₹{game.costPerPlayer} <span className="font-normal text-[#AEB4B0] text-[10px]">/ player</span>
            </div>
          ) : (
            <div className="text-right text-[11px] font-bold text-[#B7F34A]">
              Free to Join
            </div>
          )}
        </div>

        {/* Host Info Bar */}
        <div className="pt-2 border-t border-[#373C42] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={game.hostAvatar}
              alt={game.hostName}
              className="w-7 h-7 rounded-full object-cover border border-[#373C42]"
            />
            <div className="text-xs">
              <span className="text-[#AEB4B0] text-[10px] block">Hosted by</span>
              <span className="font-bold text-[#F5F5F2] truncate max-w-[120px] block">
                {game.hostName}
              </span>
            </div>
          </div>

          <div className="text-[10px] font-bold text-[#AEB4B0] bg-[#17191C] border border-[#373C42] px-2 py-0.5 rounded">
            Host: {game.participants[0]?.sportSkill || "Intermediate"}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-[#373C42] flex items-center justify-between gap-2">
        <Link
          href={`/games/${game.id}`}
          className="text-xs font-bold text-[#AEB4B0] hover:text-[#B7F34A] flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {isHost ? (
          <Link
            href={`/games/${game.id}`}
            className="bg-[#17191C] hover:bg-[#32373D] border border-[#373C42] text-[#F5F5F2] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
          >
            Manage Game
          </Link>
        ) : isJoined ? (
          <Link
            href={`/games/${game.id}`}
            className="bg-[#B7F34A]/15 border border-[#B7F34A]/40 text-[#B7F34A] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Joined (Chat)</span>
          </Link>
        ) : isPending ? (
          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl">
            Request Pending
          </span>
        ) : spotsLeft === 0 || game.status !== "Open" ? (
          <span className="bg-[#17191C] border border-[#373C42] text-[#AEB4B0] text-xs font-bold px-3 py-1.5 rounded-xl">
            Game Full
          </span>
        ) : (
          <Link
            href={`/games/${game.id}`}
            className="bg-[#B7F34A] hover:bg-[#A3E435] text-[#17191C] text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Request to Join
          </Link>
        )}
      </div>

    </div>
  );
}
