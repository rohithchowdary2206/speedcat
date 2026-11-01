"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Compass,
  UserCheck,
  UserPlus,
  HelpCircle,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import { getClubBySlug, getEventsForClub, isPlayerInClub, joinClub, leaveClub } from "@/lib/clubs";
import { useAuth } from "@/components/AuthProvider";
import { Club, ClubEvent } from "@/types/club";
import ClubEventCard from "@/components/ClubEventCard";

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, profile } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<"events" | "about" | "members">("events");
  const [shareCopied, setShareCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const currentUserId = profile?.id || user?.id || "";
  const currentUserName = profile?.name || user?.email?.split("@")[0] || "ATHLETIQ Member";
  const currentUserAvatar = profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const loadClubData = () => {
    if (!slug) return;
    const found = getClubBySlug(slug);
    if (found) {
      setClub({ ...found });
      setEvents(getEventsForClub(found.id));
      setIsJoined(isPlayerInClub(found.id, currentUserId));
    } else {
      setClub(null);
    }
  };

  useEffect(() => {
    loadClubData();

    const handleClubsChange = () => loadClubData();
    const handleEventsChange = () => loadClubData();

    window.addEventListener("speedcat_clubs_changed", handleClubsChange);
    window.addEventListener("speedcat_events_changed", handleEventsChange);
    return () => {
      window.removeEventListener("speedcat_clubs_changed", handleClubsChange);
      window.removeEventListener("speedcat_events_changed", handleEventsChange);
    };
  }, [slug, currentUserId]);

  const handleToggleJoin = () => {
    if (!club) return;
    if (!user) {
      router.push(`/login?next=/clubs/${slug}`);
      return;
    }

    if (isJoined) {
      if (club.organizerId === currentUserId) {
        alert("As the club organiser, you cannot leave the club.");
        return;
      }
      if (confirm(`Are you sure you want to leave ${club.name}?`)) {
        leaveClub(club.id, currentUserId);
        setIsJoined(false);
        setActionNotice("You have left the club.");
        setTimeout(() => setActionNotice(null), 4000);
      }
    } else {
      joinClub(club.id, {
        playerId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
      });
      setIsJoined(true);
      setActionNotice(`Welcome to ${club.name}! You can now participate in all member activities.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  if (!club) {
    return (
      <div className="min-api-screen min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Club Not Found</h1>
        <p className="text-slate-600 max-w-md mb-6">
          The club you are looking for does not exist or may have been unlisted.
        </p>
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-speedcat-navy text-white rounded-xl font-semibold hover:bg-slate-800 transition shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500 overflow-hidden">
              <Link href="/" className="hover:text-[#F5F5F2] transition font-medium">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link href="/clubs" className="hover:text-[#F5F5F2] transition font-medium">
                Clubs
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-semibold truncate">{club.name}</span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              {shareCopied ? "Link Copied!" : "Share Club"}
            </button>
          </div>
        </div>
      </div>

      {/* Club Hero Banner */}
      <div className="relative bg-gradient-to-b from-speedcat-navy to-slate-900 text-white pt-8 pb-14 overflow-hidden">
        {/* Cover Background photo with overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-speedcat-navy via-speedcat-navy/80 to-transparent z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Clubs
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800 shrink-0">
                <img
                  src={club.logoImage}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-[#B7F34A] text-[#F5F5F2]">
                    {club.category}
                  </span>
                  {club.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Club
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                    <MapPin className="w-3 h-3 text-[#B7F34A]" />
                    {club.locality}, Hyderabad
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                  {club.name}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal">
                  {club.tagline}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleToggleJoin}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2 ${
                  isJoined
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30"
                    : "bg-[#B7F34A] hover:bg-[#B7F34A]-light text-[#F5F5F2] shadow-speedcat-green/20"
                }`}
              >
                {isJoined ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Joined (Member)
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Join Club
                  </>
                )}
              </button>

              {currentUserId === club.organizerId && (
                <Link
                  href="/clubs/organizer"
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-2 border border-white/20"
                >
                  <PlusCircle className="w-4 h-4 text-[#B7F34A]" />
                  Organiser Hub
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Members</div>
              <div className="text-2xl font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-[#B7F34A]" />
                {club.memberCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Upcoming Sessions</div>
              <div className="text-2xl font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-[#B7F34A]" />
                {events.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Base Hub</div>
              <div className="text-sm font-semibold text-white mt-1 truncate">
                {club.meetingPoint}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Organiser</div>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={club.organizerAvatar}
                  alt={club.organizerName}
                  className="w-6 h-6 rounded-full border border-[#B7F34A]"
                />
                <span className="text-sm font-semibold text-white truncate">{club.organizerName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionNotice}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Tabs & Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-6">
              <button
                onClick={() => setActiveTab("events")}
                className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                  activeTab === "events"
                    ? "border-speedcat-navy text-[#F5F5F2]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Calendar className="w-4 h-4 text-[#B7F34A]" />
                Upcoming Events ({events.length})
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                  activeTab === "about"
                    ? "border-speedcat-navy text-[#F5F5F2]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4 text-[#B7F34A]" />
                About & Guidelines
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                  activeTab === "members"
                    ? "border-speedcat-navy text-[#F5F5F2]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Users className="w-4 h-4 text-[#B7F34A]" />
                Members ({club.members.length})
              </button>
            </div>

            {/* TAB: UPCOMING EVENTS */}
            {activeTab === "events" && (
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">No scheduled events yet</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      The organiser hasn't scheduled any upcoming activities for this club yet. Check back soon!
                    </p>
                    {currentUserId === club.organizerId && (
                      <Link
                        href="/clubs/organizer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-speedcat-navy text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                      >
                        <PlusCircle className="w-4 h-4 text-[#B7F34A]" />
                        Schedule Club Event
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((evt) => (
                      <ClubEventCard key={evt.id} event={evt} onRegistered={loadClubData} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ABOUT & GUIDELINES */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#B7F34A]" />
                    About {club.name}
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                    {club.description}
                  </p>
                </div>

                {/* Club Rules */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#F5F5F2]" />
                    Club Rules & Expectations
                  </h3>
                  <ul className="space-y-2.5">
                    {club.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Community Guidelines */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ATHLETIQ Community Standards
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {club.communityGuidelines.map((item, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MEMBERS */}
            {activeTab === "members" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#B7F34A]" />
                    Club Roster ({club.members.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing all registered members
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {club.members.map((member) => (
                    <div
                      key={member.playerId}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {member.name}
                            {member.playerId === currentUserId && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            {member.role} • Joined {new Date(member.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </div>

                      {member.role === "organizer" && (
                        <span className="px-2 py-0.5 bg-speedcat-navy text-white text-[10px] rounded-full font-bold uppercase tracking-wider">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Organiser & Club Info Sidebar */}
          <div className="space-y-6">
            {/* Organiser Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Club Organiser
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={club.organizerAvatar}
                  alt={club.organizerName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#B7F34A]"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {club.organizerName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {club.organizerRole}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Organiser
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-4 leading-relaxed">
                Organises regular weekly sessions, maintains quality standards, and assists newcomer integrations.
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleToggleJoin}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    isJoined
                      ? "bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700"
                      : "bg-speedcat-navy hover:bg-slate-800 text-white"
                  }`}
                >
                  {isJoined ? "Leave Club" : "Join This Club"}
                </button>
              </div>
            </div>

            {/* Club Details Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Club Overview
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#B7F34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Location</span>
                    <span className="text-slate-600">{club.meetingPoint}, {club.locality}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-[#B7F34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Activity</span>
                    <span className="text-slate-600">{club.category} (Beginners to Advanced)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#B7F34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Founded</span>
                    <span className="text-slate-600">
                      {new Date(club.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Demo Club Preview</p>
                    <p className="mt-0.5 text-amber-800">
                      Hyderabad sports community preview. Event check-ins and registrations operate in interactive demo mode.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
