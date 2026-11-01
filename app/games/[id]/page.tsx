"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  AlertCircle, 
  PlusCircle, 
  Check, 
  X, 
  ArrowLeft,
  Sparkles,
  Lock,
  Star,
  UserCheck
} from "lucide-react";
import { 
  getGameById, 
  getAllGames, 
  getCurrentUser, 
  requestToJoinGame, 
  respondToJoinRequest, 
  getChatMessages, 
  addChatMessage, 
  markGameCompleted, 
  cancelGame,
  leaveGame,
  submitPlayerRating,
  getAllRatings
} from "@/lib/community";
import { subscribeGamePresence } from "@/lib/realtime";
import { useAuth } from "@/components/AuthProvider";
import { CommunityGame, ChatMessage, SkillLevel, ALL_SKILL_LEVELS, SKILL_LEVEL_BADGE_COLORS, PlayerProfile } from "@/types/community";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;
  const { user, profile } = useAuth();

  const [game, setGame] = useState<CommunityGame | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [joinNote, setJoinNote] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [playerToRateId, setPlayerToRateId] = useState<string>("");
  const [ratedSkillLevel, setRatedSkillLevel] = useState<SkillLevel>("Intermediate");
  const [punctualityScore, setPunctualityScore] = useState(5);
  const [teamworkScore, setTeamworkScore] = useState(5);
  const [fairPlayScore, setFairPlayScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittedRatingSuccess, setSubmittedRatingSuccess] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const currentUser: PlayerProfile | null = useMemo(() => {
    if (profile) return profile;
    if (user) {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || user.email?.split("@")[0] || "ATHLETIQ Player";
      return {
        id: user.id,
        name: fullName,
        email: user.email || "",
        avatar: meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0f172a&color=10b981`,
        role: meta.role || "player",
        locality: meta.locality || "Hyderabad",
        city: "Hyderabad",
        bio: "",
        favoriteSports: ["Badminton"],
        sportSkills: {},
        sportsmanship: { overallScore: 5.0, punctuality: 5.0, teamwork: 5.0, fairPlay: 5.0, communication: 5.0, reliability: 5.0, totalReviews: 0 },
        gamesHosted: 0,
        gamesPlayed: 0,
        friendsCount: 0,
        availability: { weekdays: [], weekends: [] },
        contactPrivacy: "friends_only",
        isPublic: true,
        createdAt: ""
      };
    }
    return getCurrentUser();
  }, [user, profile]);

  const loadData = () => {
    const g = getGameById(gameId);
    setGame(g ? { ...g } : null);
    if (g) {
      setChatMessages(getChatMessages(g.id));
      setSelectedAttendees(g.participants.map((p) => p.playerId));
    }
  };

  useEffect(() => {
    loadData();

    const handleChatUpdate = (e: any) => {
      if (e.detail?.gameId === gameId) {
        setChatMessages(getChatMessages(gameId));
      }
    };

    window.addEventListener("speecat_chat_message", handleChatUpdate);
    window.addEventListener("speecat_games_changed", loadData);

    return () => {
      window.removeEventListener("speecat_chat_message", handleChatUpdate);
      window.removeEventListener("speecat_games_changed", loadData);
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !currentUser) return;
    const unsub = subscribeGamePresence(
      gameId,
      {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      (online) => {
        setOnlineUsers(online);
      }
    );
    return () => unsub();
  }, [gameId, currentUser]);

  if (!game) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#F5F5F2]">Game Not Found</h2>
        <p className="text-slate-500 text-xs">
          The requested community game match could not be found or has been removed.
        </p>
        <Link href="/games" className="bg-[#B7F34A] text-[#F5F5F2] font-bold px-4 py-2 rounded-xl text-xs">
          Back to Find Games
        </Link>
      </div>
    );
  }

  const isHost = currentUser?.id === game.hostId;
  const isParticipant = game.participants.some((p) => p.playerId === currentUser?.id);
  const isPending = game.joinRequests.some((r) => r.playerId === currentUser?.id && r.status === "pending");
  const spotsLeft = Math.max(0, game.maxGroupSize - game.participants.length);

  // Check ratings already submitted by current user for this game
  const allRatings = getAllRatings();
  const ratedPlayerIdsByMe = allRatings
    .filter((r) => r.gameId === game.id && r.raterPlayerId === currentUser?.id)
    .map((r) => r.ratedPlayerId);

  const handleRequestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to join this game.");
      router.push("/login");
      return;
    }

    try {
      await requestToJoinGame(game.id, currentUser.id, joinNote);
      setShowJoinModal(false);
      setJoinNote("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to submit join request");
    }
  };

  const handleRespondRequest = async (playerId: string, accept: boolean) => {
    try {
      await respondToJoinRequest(game.id, playerId, accept);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to respond to request");
    }
  };

  const handleLeaveGame = async () => {
    if (!confirm("Are you sure you want to leave this game? Your slot will open for other players.")) return;
    try {
      setIsLeaving(true);
      await leaveGame(game.id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Could not leave game");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !currentUser) return;

    try {
      await addChatMessage(game.id, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: newMsg.trim(),
      });
      setNewMsg("");
      setChatMessages(getChatMessages(game.id));
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    }
  };

  const handleConfirmCompletion = async () => {
    if (!currentUser) return;
    try {
      await markGameCompleted(game.id, currentUser.id, selectedAttendees);
      setShowCompletionModal(false);
      loadData();
      alert("Game finalized! Confirmed participants are now automatically added to your ATHLETIQ Friends list!");
    } catch (err: any) {
      alert(err.message || "Failed to complete game");
    }
  };

  const handleCancelGame = async () => {
    if (!cancelReason.trim()) return;
    try {
      await cancelGame(game.id, cancelReason);
      setShowCancelModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel game");
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !playerToRateId) return;

    try {
      await submitPlayerRating({
        gameId: game.id,
        sport: game.sport,
        raterPlayerId: currentUser.id,
        ratedPlayerId: playerToRateId,
        skillLevel: ratedSkillLevel,
        punctuality: punctualityScore,
        teamwork: teamworkScore,
        fairPlay: fairPlayScore,
        reliability: 5,
        comment: ratingComment,
      });

      setSubmittedRatingSuccess(true);
      setTimeout(() => {
        setSubmittedRatingSuccess(false);
        setShowRatingModal(false);
        setPlayerToRateId("");
        setRatingComment("");
        loadData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to submit rating");
    }
  };

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B7F34A] bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hyderabad Games</span>
          </Link>

          <span
            className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
              game.status === "Open"
                ? "bg-emerald-100 text-emerald-800"
                : game.status === "Full"
                ? "bg-amber-100 text-amber-800"
                : game.status === "Completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {game.status}
          </span>
        </div>

        {/* Main Game Header Card */}
        <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-speecat-navy text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {game.sport}
                </span>

                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                  Skill: {game.skillRequirement.displayText}
                </span>

                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {game.matchFormat}
                </span>

                {game.isVenueConfirmed && (
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Venue Confirmed
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F2]">
                {game.title}
              </h1>

              {/* Venue & Time Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#B7F34A] shrink-0" />
                  <span>{game.venueName} • {game.locality}, Hyderabad</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 font-semibold text-[#F5F5F2]">
                  <Calendar className="w-4 h-4 text-[#B7F34A] shrink-0" />
                  <span>{game.date}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#B7F34A] shrink-0" />
                  <span>{game.startTime} to {game.endTime} ({game.durationHours} hrs)</span>
                </div>
              </div>
            </div>

            {/* Price & Primary CTA */}
            <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0 space-y-2">
              <div className="text-left lg:text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Approx Cost / Player</div>
                <div className="text-2xl font-black text-[#B7F34A]">
                  {game.costPerPlayer ? `₹${game.costPerPlayer}` : "Free to play"}
                </div>
              </div>

              {isHost ? (
                <div className="flex flex-wrap items-center gap-2">
                  {game.status !== "Completed" && game.status !== "Cancelled" && (
                    <>
                      <button
                        onClick={() => setShowCompletionModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm Attendance & Complete</span>
                      </button>

                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3 py-2.5 rounded-xl transition-colors"
                      >
                        Cancel Match
                      </button>
                    </>
                  )}
                </div>
              ) : isParticipant ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
                    <span>Confirmed Player</span>
                  </div>
                  {game.status !== "Completed" && game.status !== "Cancelled" && (
                    <button
                      onClick={handleLeaveGame}
                      disabled={isLeaving}
                      className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition-colors"
                    >
                      {isLeaving ? "Leaving..." : "Leave Match"}
                    </button>
                  )}
                </div>
              ) : isPending ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-4 py-2 rounded-xl">
                  Join Request Pending Host Review
                </div>
              ) : spotsLeft === 0 || game.status !== "Open" ? (
                <div className="bg-slate-100 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl">
                  Game Full / Closed
                </div>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 fill-current" />
                  <span>Request to Join Match</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 2 Column Layout: Details & Confirmed Players (Left) vs Group Chat & Requests (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description & Equipment */}
            <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-[#F5F5F2]">Match Description & Rules</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {game.description}
              </p>

              {game.equipmentNotes && (
                <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-[#F5F5F2]">Equipment Notes: </span>
                  <span className="text-slate-600">{game.equipmentNotes}</span>
                </div>
              )}

              {game.rules && game.rules.length > 0 && (
                <div className="pt-2">
                  <span className="font-bold text-xs text-[#F5F5F2] block mb-1.5">Game Rules:</span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {game.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B7F34A]" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirmed Players Card */}
            <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#F5F5F2] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B7F34A]" />
                    <span>Confirmed Players ({game.participants.length}/{game.maxGroupSize})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} remaining
                  </p>
                </div>

                {game.status === "Completed" && (
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full">
                    Match Completed
                  </span>
                )}
              </div>

              {/* Participants Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {game.participants.map((participant) => {
                  const isHostP = participant.playerId === game.hostId;
                  const alreadyRated = ratedPlayerIdsByMe.includes(participant.playerId);
                  const canRateThisPlayer =
                    game.status === "Completed" &&
                    isParticipant &&
                    participant.playerId !== currentUser?.id &&
                    !alreadyRated;

                  const isOnline = onlineUsers.some((u) => u.id === participant.playerId);

                  return (
                    <div
                      key={participant.playerId}
                      className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          {isOnline && (
                            <span
                              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse"
                              title="Online in lobby"
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#F5F5F2]">
                              {participant.name}
                            </span>
                            {isHostP && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                                Host
                              </span>
                            )}
                            {isOnline && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1 py-0.2 rounded border border-emerald-200">
                                Live
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {game.sport} Skill: <span className="text-[#F5F5F2] font-bold">{participant.sportSkill}</span>
                          </div>
                        </div>
                      </div>

                      {/* Post-Game Rating Trigger */}
                      {canRateThisPlayer && (
                        <button
                          onClick={() => {
                            setPlayerToRateId(participant.playerId);
                            setShowRatingModal(true);
                          }}
                          className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-[11px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs shrink-0"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          <span>Rate</span>
                        </button>
                      )}

                      {alreadyRated && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Rated ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty spots visual */}
              {spotsLeft > 0 && (
                <div className="border border-dashed border-slate-200 rounded-2xl p-3 text-center text-xs text-slate-400">
                  + {spotsLeft} open spot{spotsLeft === 1 ? "" : "s"} waiting for players
                </div>
              )}
            </div>

            {/* Host Join Request Management (Visible to Host) */}
            {isHost && game.joinRequests.filter((r) => r.status === "pending").length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-amber-900 uppercase tracking-wider">
                    Pending Join Requests ({game.joinRequests.filter((r) => r.status === "pending").length})
                  </h3>
                  <span className="text-[11px] text-amber-800">Review player skill before accepting</span>
                </div>

                <div className="space-y-3">
                  {game.joinRequests
                    .filter((r) => r.status === "pending")
                    .map((req) => (
                      <div
                        key={req.playerId}
                        className="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={req.avatar}
                            alt={req.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <div className="font-bold text-xs text-[#F5F5F2]">{req.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {game.sport} Skill: <span className="font-bold text-[#F5F5F2]">{req.sportSkill}</span>
                            </div>
                            {req.note && (
                              <p className="text-[11px] text-slate-600 mt-1 italic">
                                "{req.note}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleRespondRequest(req.playerId, false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespondRequest(req.playerId, true)}
                            className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-4 py-1.5 rounded-xl transition-colors shadow-xs"
                          >
                            Accept Player
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (1 Col): Group Chat */}
          <div className="lg:col-span-1 space-y-4">
            
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] overflow-hidden shadow-sm flex flex-col h-[520px]">
              
              {/* Chat Header */}
              <div className="p-4 bg-speecat-navy text-white flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#B7F34A]" />
                    <span>Game Group Chat</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Host & confirmed participants only
                  </p>
                </div>

                <span className="text-[10px] bg-slate-800 text-[#B7F34A] font-bold px-2 py-0.5 rounded-full">
                  {game.participants.length} Members
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
                {isParticipant ? (
                  chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`space-y-1 ${
                          msg.isSystem
                            ? "text-center my-2"
                            : msg.senderId === currentUser?.id
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {msg.isSystem ? (
                          <div className="inline-block bg-slate-200/80 text-slate-700 text-[10px] px-2.5 py-1 rounded-full font-medium">
                            {msg.content}
                          </div>
                        ) : msg.isAnnouncement ? (
                          <div className="bg-amber-100 border border-amber-300 rounded-xl p-2.5 text-amber-950 text-left space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-800 block">
                              📢 Host Announcement
                            </span>
                            <p>{msg.content}</p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] text-slate-400 mb-0.5">
                              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div
                              className={`inline-block p-2.5 rounded-2xl max-w-[85%] text-left leading-relaxed ${
                                msg.senderId === currentUser?.id
                                  ? "bg-speecat-navy text-white font-medium"
                                  : "bg-white border border-slate-200 text-slate-800"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No messages yet. Say hello to your teammates!
                    </div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-400">
                    <Lock className="w-8 h-8 text-slate-300" />
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-[#F5F5F2]">Private Game Chat</p>
                      <p className="text-[11px] leading-relaxed">
                        Only confirmed participants can view or send messages in this group. Request to join to participate!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              {isParticipant && (
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message to the group..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
                  />
                  <button
                    type="submit"
                    className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] p-2 rounded-xl transition-colors shrink-0"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* JOIN REQUEST MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-[#F5F5F2]">
                Request to Join Match
              </h3>
              <button onClick={() => setShowJoinModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-[#F5F5F2]">{game.title}</div>
                <div className="text-slate-500">
                  {game.sport} • {game.date} • {game.startTime}
                </div>
                <div className="text-[#B7F34A] font-bold">
                  Required Skill: {game.skillRequirement.displayText}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#F5F5F2] mb-1">
                  Note to Host (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hi Rahul! I play regular badminton in Gachibowli, ready to play doubles!"
                  value={joinNote}
                  onChange={(e) => setJoinNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestJoin}
                className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-5 py-2.5 rounded-xl shadow-xs"
              >
                Send Join Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE CONFIRMATION & COMPLETION MODAL */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-[#F5F5F2]">
                  Confirm Attendance & Complete Game
                </h3>
              </div>
              <button onClick={() => setShowCompletionModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Before finalising completion, select the players who <strong>actually showed up and played</strong>.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 leading-snug font-medium">
                🤝 <strong>Automatic Friends Feature:</strong> Confirmed attendees will automatically be added to each other's ATHLETIQ Friends list and prompted to rate each other!
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {game.participants.map((p) => {
                  const isChecked = selectedAttendees.includes(p.playerId);
                  return (
                    <label
                      key={p.playerId}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedAttendees(selectedAttendees.filter((id) => id !== p.playerId));
                            } else {
                              setSelectedAttendees([...selectedAttendees, p.playerId]);
                            }
                          }}
                          className="w-4 h-4 text-[#B7F34A] rounded accent-speecat-green"
                        />
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-[#F5F5F2]">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isChecked ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isChecked ? "Attended" : "No-Show"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs"
              >
                Finalize & Complete Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-GAME RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-base text-[#F5F5F2]">
                  Rate Player Skill & Sportsmanship
                </h3>
              </div>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {submittedRatingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#B7F34A] mx-auto" />
                <h4 className="font-bold text-sm text-[#F5F5F2]">Rating Submitted!</h4>
                <p className="text-xs text-slate-600">
                  Your feedback has been anonymously added to this player's {game.sport} rating distribution.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Individual ratings are kept <strong>anonymous</strong>. Only aggregate distributions are shown.
                </p>

                {/* Sport Skill Rating */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#F5F5F2]">
                    Observed {game.sport} Skill Level
                  </label>
                  <select
                    value={ratedSkillLevel}
                    onChange={(e) => setRatedSkillLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#F5F5F2] font-bold"
                  >
                    {ALL_SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sportsmanship Reputation */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-[#F5F5F2]">
                    Sportsmanship & Reliability
                  </label>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 block">Punctuality</span>
                      <select
                        value={punctualityScore}
                        onChange={(e) => setPunctualityScore(Number(e.target.value))}
                        className="bg-white border rounded px-1.5 py-0.5 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map((s) => (
                          <option key={s} value={s}>
                            {s} ★
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 block">Teamwork</span>
                      <select
                        value={teamworkScore}
                        onChange={(e) => setTeamworkScore(Number(e.target.value))}
                        className="bg-white border rounded px-1.5 py-0.5 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map((s) => (
                          <option key={s} value={s}>
                            {s} ★
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 block">Fair Play</span>
                      <select
                        value={fairPlayScore}
                        onChange={(e) => setFairPlayScore(Number(e.target.value))}
                        className="bg-white border rounded px-1.5 py-0.5 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map((s) => (
                          <option key={s} value={s}>
                            {s} ★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#F5F5F2] mb-1">
                    Structured Feedback (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Great rallies, very punctual, and positive attitude!"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#F5F5F2]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    Submit Anonymous Rating
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CANCEL GAME MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-base text-rose-600">Cancel Game Match</h3>
            <p className="text-xs text-slate-600">
              Please state a reason so confirmed players are notified. Cancelled games will not generate friendship connections or ratings.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Sudden rain or court unavailable..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#F5F5F2]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancelGame}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
