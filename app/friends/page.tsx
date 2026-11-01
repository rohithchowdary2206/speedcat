"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  MapPin, 
  Trophy, 
  Calendar, 
  PlusCircle, 
  UserMinus, 
  UserPlus,
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Clock,
  Sparkles
} from "lucide-react";
import { 
  getFriendsForPlayer, 
  getPendingFriendRequests,
  getAllPlayers,
  respondFriendRequest,
  sendFriendRequest,
  removeFriend, 
  getAllGames, 
  sendNotification,
  refreshFriendships
} from "@/lib/community";
import { PlayerProfile, Friendship, SKILL_LEVEL_BADGE_COLORS } from "@/types/community";
import { SportType } from "@/types/venue";
import { useAuth } from "@/components/AuthProvider";

export default function FriendsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/friends");
    }
  }, [authLoading, user, router]);
  const [friendsList, setFriendsList] = useState<{ friend: PlayerProfile; relationship: Friendship }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"friends" | "discover">("friends");
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState<Record<string, string>>({});

  // Invite modal state
  const [inviteModalFriend, setInviteModalFriend] = useState<PlayerProfile | null>(null);
  const [selectedGameIdToInvite, setSelectedGameIdToInvite] = useState<string>("");
  const [inviteSent, setInviteSent] = useState(false);

  const currentUser: PlayerProfile | null = useMemo(() => {
    if (profile) return profile;
    if (user) {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || user.email?.split("@")[0] || "Speedcat Player";
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
        reliableRatingPercentage: 100,
        contactPrivacy: "hidden",
        isPublic: true,
        createdAt: ""
      };
    }
    return null;
  }, [user, profile]);

  const loadFriends = () => {
    if (!currentUser) return;
    setFriendsList(getFriendsForPlayer(currentUser.id));
    setPendingRequests(getPendingFriendRequests(currentUser.id));
  };

  useEffect(() => {
    loadFriends();

    const handleUpdate = () => loadFriends();
    window.addEventListener("speecat_auth_changed", handleUpdate);
    window.addEventListener("speecat_notifications_changed", handleUpdate);
    window.addEventListener("speecat_games_changed", handleUpdate);
    return () => {
      window.removeEventListener("speecat_auth_changed", handleUpdate);
      window.removeEventListener("speecat_notifications_changed", handleUpdate);
      window.removeEventListener("speecat_games_changed", handleUpdate);
    };
  }, [currentUser?.id]);

  const hostedGames = useMemo(() => {
    if (!currentUser) return [];
    return getAllGames().filter((g) => g.hostId === currentUser.id && g.status === "Open");
  }, [currentUser]);

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    try {
      await respondFriendRequest(friendshipId, accept);
      loadFriends();
    } catch (err: any) {
      alert(err.message || "Failed to respond to request");
    }
  };

  const handleSendRequest = async (addresseeId: string) => {
    try {
      setRequestStatus((prev) => ({ ...prev, [addresseeId]: "sending" }));
      await sendFriendRequest(addresseeId);
      setRequestStatus((prev) => ({ ...prev, [addresseeId]: "sent" }));
      loadFriends();
    } catch (err: any) {
      setRequestStatus((prev) => ({ ...prev, [addresseeId]: "error" }));
      alert(err.message || "Failed to send friend request");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) return;
    if (confirm("Remove this player from your friends list?")) {
      try {
        await removeFriend(currentUser.id, friendId);
        loadFriends();
      } catch (err: any) {
        alert(err.message || "Failed to remove friend");
      }
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !inviteModalFriend || !selectedGameIdToInvite) return;

    const game = getAllGames().find((g) => g.id === selectedGameIdToInvite);
    if (!game) return;

    try {
      await sendNotification({
        recipientId: inviteModalFriend.id,
        title: "Game Invitation from a Friend! 🏅",
        message: `${currentUser.name} invited you to play ${game.sport} at ${game.venueName} on ${game.date}!`,
        type: "friend_invite",
        link: `/games/${game.id}`,
      });

      setInviteSent(true);
      setTimeout(() => {
        setInviteSent(false);
        setInviteModalFriend(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to send invitation");
    }
  };

  const filteredFriends = useMemo(() => {
    return friendsList.filter(({ friend }) => {
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const matchName = friend.name.toLowerCase().includes(t);
        const matchLoc = friend.locality.toLowerCase().includes(t);
        if (!matchName && !matchLoc) return false;
      }
      if (selectedSport !== "All") {
        if (!friend.favoriteSports.includes(selectedSport as SportType)) return false;
      }
      return true;
    });
  }, [friendsList, searchTerm, selectedSport]);

  const discoverablePlayers = useMemo(() => {
    if (!currentUser) return [];
    const all = getAllPlayers();
    const friendIds = new Set(friendsList.map((f) => f.friend.id));
    return all.filter((p) => {
      if (p.id === currentUser.id) return false;
      if (friendIds.has(p.id)) return false;
      if (discoverSearch.trim()) {
        const t = discoverSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(t);
        const matchLoc = p.locality.toLowerCase().includes(t);
        if (!matchName && !matchLoc) return false;
      }
      return true;
    });
  }, [currentUser, friendsList, discoverSearch]);

  const allPlayers = useMemo(() => getAllPlayers(), []);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Banner */}
          <div className="bg-speecat-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Real-Time Community Connections</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  My Speedcat Sports Friends
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  Connect with players across Hyderabad, receive mutual friend requests, and organize games together in real time.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl text-center min-w-[110px]">
                  <div className="text-3xl font-black text-speecat-green">{friendsList.length}</div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">Friends</div>
                </div>
                {pendingRequests.length > 0 && (
                  <div className="bg-amber-500/20 border border-amber-400/40 p-4 rounded-2xl text-center min-w-[110px] animate-pulse">
                    <div className="text-3xl font-black text-amber-300">{pendingRequests.length}</div>
                    <div className="text-xs font-semibold text-amber-200 mt-0.5">Requests</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Friend Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-700" />
                  <h2 className="text-base font-black text-amber-950 uppercase tracking-wider">
                    Pending Friend Requests ({pendingRequests.length})
                  </h2>
                </div>
                <span className="text-xs text-amber-800 font-semibold">Action required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((req) => {
                  const requesterId = req.requesterId || req.playerId1;
                  const requester = allPlayers.find((p) => p.id === requesterId);
                  const name = requester?.name || "Hyderabad Player";
                  const avatar = requester?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=10b981`;
                  const locality = requester?.locality || "Hyderabad";

                  return (
                    <div
                      key={req.id}
                      className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatar}
                          alt={name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-sm text-speecat-navy truncate">{name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-speecat-green shrink-0" />
                            <span className="truncate">{locality}</span>
                          </div>
                          {requester?.sportsmanship && (
                            <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                              ★ {requester.sportsmanship.overallScore.toFixed(1)} Sportsmanship
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRespond(req.id, false)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Decline Request"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRespond(req.id, true)}
                          className="bg-speecat-green hover:bg-speecat-green-600 text-speecat-navy font-black text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("friends")}
              className={`font-black text-sm px-5 py-2.5 rounded-2xl transition-all ${
                activeTab === "friends"
                  ? "bg-speecat-navy text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              My Friends ({friendsList.length})
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`font-black text-sm px-5 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
                activeTab === "discover"
                  ? "bg-speecat-navy text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <UserPlus className="w-4 h-4 text-speecat-green" />
              <span>Discover Players ({discoverablePlayers.length})</span>
            </button>
          </div>

          {activeTab === "friends" ? (
            <>
              {/* Filters Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search friends by name or locality..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-speecat-navy focus:outline-none focus:ring-2 focus:ring-speecat-green"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase">Sport in common:</span>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-speecat-navy"
                  >
                    <option value="All">All Sports</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Pickleball">Pickleball</option>
                  </select>
                </div>
              </div>

              {/* Friends Grid */}
              {filteredFriends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFriends.map(({ friend, relationship }) => {
                    const commonSports = currentUser
                      ? friend.favoriteSports.filter((s) => currentUser.favoriteSports.includes(s))
                      : friend.favoriteSports;

                    return (
                      <div
                        key={friend.id}
                        className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Avatar & Bio */}
                          <div className="flex items-start gap-3.5">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/40 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <Link href={`/profile/${friend.id}`}>
                                <h3 className="font-extrabold text-base text-speecat-navy hover:text-speecat-green transition-colors truncate">
                                  {friend.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-speecat-green shrink-0" />
                                <span className="truncate">{friend.locality}, Hyderabad</span>
                              </div>
                              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                                ★ {friend.sportsmanship?.overallScore ? friend.sportsmanship.overallScore.toFixed(1) : "5.0"} Sportsmanship
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {friend.bio || "Active sports player in Hyderabad."}
                          </p>

                          {/* Common Sports & Skill Levels */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Sport Skill Levels
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {commonSports.map((sp) => {
                                const skill = friend.sportSkills[sp]?.selfAssessed || "Intermediate";
                                const badge = SKILL_LEVEL_BADGE_COLORS[skill] || {
                                  bg: "bg-slate-100",
                                  text: "text-slate-700",
                                  border: "border-slate-200",
                                };
                                return (
                                  <span
                                    key={sp}
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}
                                  >
                                    {sp}: {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Match History Stats */}
                          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Games Played Together:</span>
                              <span className="font-bold text-speecat-navy">{relationship.gamesPlayedTogether} matches</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Game Played:</span>
                              <span className="font-semibold text-speecat-navy">{relationship.lastGameDate || "Recent"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setInviteModalFriend(friend)}
                            className="flex-1 bg-speecat-navy hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-speecat-green" />
                            <span>Invite to Game</span>
                          </button>

                          <Link
                            href={`/profile/${friend.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                            title="View Profile"
                          >
                            Profile
                          </Link>

                          <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Remove Friend"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-speecat-navy">No friends connected yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Discover local players in the tab above, or participate in confirmed community games to automatically connect with players!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="inline-flex items-center gap-2 bg-speecat-green text-speecat-navy font-black text-xs px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    <span>Discover Hyderabad Players</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Discover Players Tab */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                  <div className="relative w-full max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search community players by name or locality..."
                      value={discoverSearch}
                      onChange={(e) => setDiscoverSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-speecat-navy focus:outline-none focus:ring-2 focus:ring-speecat-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discoverablePlayers.map((player) => {
                    const status = requestStatus[player.id];
                    return (
                      <div
                        key={player.id}
                        className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3.5">
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <Link href={`/profile/${player.id}`}>
                                <h3 className="font-extrabold text-base text-speecat-navy hover:text-speecat-green transition-colors truncate">
                                  {player.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-speecat-green shrink-0" />
                                <span className="truncate">{player.locality}, Hyderabad</span>
                              </div>
                              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                                ★ {player.sportsmanship?.overallScore ? player.sportsmanship.overallScore.toFixed(1) : "5.0"} Sportsmanship
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {player.bio || "Active sports player in Hyderabad."}
                          </p>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Favorite Sports
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {player.favoriteSports.map((sp) => (
                                <span
                                  key={sp}
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {sp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleSendRequest(player.id)}
                            disabled={status === "sending" || status === "sent"}
                            className="flex-1 bg-speecat-green hover:bg-speecat-green-600 disabled:opacity-75 text-speecat-navy font-black text-xs py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>
                              {status === "sending"
                                ? "Sending..."
                                : status === "sent"
                                ? "Request Sent ✓"
                                : "Add Friend"}
                            </span>
                          </button>

                          <Link
                            href={`/profile/${player.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                          >
                            Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* INVITE FRIEND TO GAME MODAL */}
        {inviteModalFriend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-base text-speecat-navy">
                  Invite {inviteModalFriend.name} to a Game
                </h3>
                <button onClick={() => setInviteModalFriend(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              {inviteSent ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-speecat-green mx-auto" />
                  <h4 className="font-bold text-sm text-speecat-navy">Invitation Sent!</h4>
                  <p className="text-xs text-slate-600">
                    {inviteModalFriend.name} has been notified and can confirm their spot!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                  {hostedGames.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block font-bold text-speecat-navy">
                        Choose an open game you are hosting:
                      </label>
                      <div className="space-y-2">
                        {hostedGames.map((g) => (
                          <label
                            key={g.id}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedGameIdToInvite === g.id
                                ? "border-speecat-green bg-emerald-50/50 shadow-xs"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="invite_game"
                              value={g.id}
                              checked={selectedGameIdToInvite === g.id}
                              onChange={(e) => setSelectedGameIdToInvite(e.target.value)}
                              className="mt-0.5 text-speecat-green accent-speecat-green"
                            />
                            <div>
                              <div className="font-bold text-speecat-navy">{g.title}</div>
                              <div className="text-[11px] text-slate-500">
                                {g.sport} • {g.date} • {g.startTime} • {g.venueName}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                      <p className="text-slate-600 font-medium">You don't have any open hosted games right now.</p>
                      <Link
                        href="/host-game"
                        className="inline-block bg-speecat-navy text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Host a New Game First
                      </Link>
                    </div>
                  )}

                  {hostedGames.length > 0 && (
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setInviteModalFriend(null)}
                        className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedGameIdToInvite}
                        className="bg-speecat-green hover:bg-speecat-green-600 disabled:opacity-50 text-speecat-navy text-xs font-black px-5 py-2 rounded-xl shadow-xs"
                      >
                        Send Friend Invitation
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        )}

      </div>
  );
}
