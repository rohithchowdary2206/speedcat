"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  MapPin, 
  Trophy, 
  Calendar, 
  Users, 
  Star, 
  ShieldCheck, 
  Edit3, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Globe,
  Activity,
  Plus
} from "lucide-react";
import { 
  getCurrentUser, 
  updatePlayerProfile, 
  getAllGames, 
  getAllFriendships,
  getFriendsForPlayer
} from "@/lib/community";
import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import { 
  PlayerProfile, 
  SkillLevel, 
  ALL_SKILL_LEVELS, 
  SKILL_LEVEL_BADGE_COLORS 
} from "@/types/community";
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

function MyProfileContent() {
  const { profile: authProfile, refreshProfile } = useAuth();
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(authProfile || getCurrentUser());
  const [friends, setFriends] = useState<{ friend: PlayerProfile; relationship: any }[]>([]);
  const [selectedSportTab, setSelectedSportTab] = useState<SportType>("Badminton");

  // Edit/Onboarding Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocality, setEditLocality] = useState("Gachibowli");
  const [editSports, setEditSports] = useState<SportType[]>([]);
  const [editSportSkillLevels, setEditSportSkillLevels] = useState<Partial<Record<SportType, SkillLevel>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadUser = (user: PlayerProfile | null) => {
    setCurrentUser(user);
    if (user) {
      setFriends(getFriendsForPlayer(user.id));
      if (user.favoriteSports.length > 0 && !user.favoriteSports.includes(selectedSportTab)) {
        setSelectedSportTab(user.favoriteSports[0]);
      }
      setEditName(user.name);
      setEditBio(user.bio);
      setEditLocality(user.locality);
      setEditSports(user.favoriteSports);

      const levels: Partial<Record<SportType, SkillLevel>> = {};
      user.favoriteSports.forEach((s) => {
        levels[s] = user.sportSkills[s]?.selfAssessed || "Intermediate";
      });
      setEditSportSkillLevels(levels);
    }
  };

  useEffect(() => {
    loadUser(authProfile || getCurrentUser());

    const handleAuth = () => loadUser(authProfile || getCurrentUser());
    window.addEventListener("speecat_auth_changed", handleAuth);
    return () => window.removeEventListener("speecat_auth_changed", handleAuth);
  }, [authProfile]);

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-[#F5F5F2]">No Player Logged In</h2>
        <p className="text-xs text-slate-500">Sign in with a demo persona to view your sports profile.</p>
        <Link href="/login" className="bg-[#B7F34A] text-[#F5F5F2] font-bold text-xs px-4 py-2 rounded-xl">
          Log In
        </Link>
      </div>
    );
  }

  // Active sport rating info
  const activeRating = currentUser.sportSkills[selectedSportTab] || {
    selfAssessed: "Beginner",
    ratingsCount: 0,
    distribution: { Beginner: 0, Amateur: 0, Intermediate: 0, Advanced: 0, Professional: 0 },
  };

  const totalDistRatings = Object.values(activeRating.distribution).reduce((a, b) => a + b, 0);

  // Player's games
  const allGames = getAllGames();
  const playerGames = allGames.filter(
    (g) => g.hostId === currentUser.id || g.participants.some((p) => p.playerId === currentUser.id)
  );
  const upcomingGames = playerGames.filter((g) => g.status === "Open" || g.status === "Full");
  const pastGames = playerGames.filter((g) => g.status === "Completed");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedSkills = { ...currentUser.sportSkills };

      editSports.forEach((sp) => {
        const chosenLevel = editSportSkillLevels[sp] || "Intermediate";
        if (!updatedSkills[sp]) {
          updatedSkills[sp] = {
            selfAssessed: chosenLevel,
            ratingsCount: 0,
            distribution: { Beginner: 0, Amateur: 0, Intermediate: 0, Advanced: 0, Professional: 0 },
          };
        } else {
          updatedSkills[sp] = {
            ...updatedSkills[sp]!,
            selfAssessed: chosenLevel,
          };
        }
      });

      const updated = await updatePlayerProfile({
        id: currentUser.id,
        name: editName,
        bio: editBio,
        locality: editLocality as any,
        favoriteSports: editSports,
        sportSkills: updatedSkills,
      });

      setCurrentUser(updated);
      await refreshProfile();
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-emerald-400/30 shadow-md"
                />
                <span className="absolute -bottom-1.5 -right-1.5 bg-[#B7F34A] text-[#F5F5F2] p-1.5 rounded-xl shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F2]">
                    {currentUser.name}
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Verified Player
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
                    {currentUser.locality}, Hyderabad
                  </span>
                  <span>•</span>
                  <span>Member since {new Date(currentUser.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed pt-1">
                  {currentUser.bio}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-speecat-navy hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Edit Profile & Skills</span>
              </button>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-[#F5F5F2]">{currentUser.gamesPlayed}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Games Played</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-[#B7F34A]">{currentUser.gamesHosted}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Games Hosted</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-purple-600">{currentUser.friendsCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Sports Friends</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{currentUser.sportsmanship.overallScore.toFixed(1)}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Sportsmanship</div>
            </div>
          </div>
        </div>

        {/* 2 Column Layout: Separate Sport Skill Breakdown (Left) vs Sportsmanship & Availability (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): Sport-Specific Skill Levels & Distribution */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#F5F5F2] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#B7F34A]" />
                    <span>Sport-Specific Skill Ratings</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Skills are tracked separately for every sport. A badminton rating does not affect cricket.
                  </p>
                </div>

                {/* Sport Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {currentUser.favoriteSports.map((sp) => (
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

              {/* Active Sport Skill Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-black tracking-wider block">
                      Active Sport
                    </span>
                    <h3 className="text-xl font-black text-[#F5F5F2]">
                      {selectedSportTab}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Self-Assessed</span>
                      <span className="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md inline-block">
                        {activeRating.selfAssessed}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Community Verified</span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md inline-block">
                        {activeRating.communityLevel || "Pending Ratings"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skill Rating Distribution Graph */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#F5F5F2]">
                      Post-Game Peer Rating Distribution ({totalDistRatings} ratings)
                    </span>
                    {totalDistRatings < 3 && (
                      <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                        New player — collecting peer ratings
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    {ALL_SKILL_LEVELS.map((level) => {
                      const count = activeRating.distribution[level] || 0;
                      const percentage = totalDistRatings > 0 ? (count / totalDistRatings) * 100 : 0;
                      const isCurrentCommunity = activeRating.communityLevel === level;

                      return (
                        <div key={level} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <span>{level}</span>
                              {isCurrentCommunity && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded">
                                  Current
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {count} {count === 1 ? "rating" : "ratings"} ({percentage.toFixed(0)}%)
                            </span>
                          </div>

                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#B7F34A] rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Upcoming & Past Games for this player */}
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-[#F5F5F2] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B7F34A]" />
                <span>My Matches ({playerGames.length})</span>
              </h2>

              {upcomingGames.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Upcoming Confirmed Games ({upcomingGames.length})
                  </div>
                  {upcomingGames.map((g) => (
                    <Link
                      key={g.id}
                      href={`/games/${g.id}`}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs transition-colors block"
                    >
                      <div>
                        <div className="font-bold text-[#F5F5F2]">{g.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {g.sport} • {g.date} • {g.startTime} • {g.venueName}
                        </div>
                      </div>
                      <span className="text-[#B7F34A] font-bold">View →</span>
                    </Link>
                  ))}
                </div>
              )}

              {pastGames.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Completed Matches ({pastGames.length})
                  </div>
                  {pastGames.map((g) => (
                    <Link
                      key={g.id}
                      href={`/games/${g.id}`}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs transition-colors block"
                    >
                      <div>
                        <div className="font-bold text-[#F5F5F2]">{g.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {g.sport} • Completed on {g.date}
                        </div>
                      </div>
                      <span className="text-blue-600 font-bold">Rate Players →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 Col): Sportsmanship & Availability */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Sportsmanship Reputation Card */}
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-[#F5F5F2] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
                  <span>Sportsmanship & Reliability</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {currentUser.sportsmanship.totalReviews} reviews
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Punctuality</span>
                  <div className="flex items-center gap-1 font-bold text-[#F5F5F2]">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentUser.sportsmanship.punctuality.toFixed(1)} / 5</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Teamwork & Encouragement</span>
                  <div className="flex items-center gap-1 font-bold text-[#F5F5F2]">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentUser.sportsmanship.teamwork.toFixed(1)} / 5</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Fair Play</span>
                  <div className="flex items-center gap-1 font-bold text-[#F5F5F2]">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentUser.sportsmanship.fairPlay.toFixed(1)} / 5</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Reliability (No-Show Rate: 0%)</span>
                  <div className="flex items-center gap-1 font-bold text-[#F5F5F2]">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentUser.sportsmanship.reliability.toFixed(1)} / 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Preferences */}
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-[#F5F5F2] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B7F34A]" />
                <span>Playing Availability</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold text-[11px] block mb-1">Weekdays</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.availability.weekdays.map((slot, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl font-bold">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold text-[11px] block mb-1">Weekends</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.availability.weekends.map((slot, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-xl font-bold">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Sports Friends Card */}
            <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-[#F5F5F2] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>My Sports Friends ({friends.length})</span>
                </h3>
                <Link href="/friends" className="text-xs text-[#B7F34A] font-bold hover:underline">
                  View All
                </Link>
              </div>

              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.slice(0, 4).map(({ friend, relationship }) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200" />
                        <div className="min-w-0">
                          <Link href={`/profile/${friend.id}`} className="text-xs font-bold text-[#F5F5F2] hover:text-[#B7F34A] truncate block">
                            {friend.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 block truncate">{friend.locality} • ★ {friend.sportsmanship.overallScore.toFixed(1)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border shrink-0">
                        {relationship.gamesPlayedTogether} matches
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No sports friends yet. Play matches or send friend requests to connect!</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* EDIT PROFILE & ONBOARDING MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-[#F5F5F2]">
                Edit Player Profile & Sports Skills
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#F5F5F2] mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#F5F5F2] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#F5F5F2] mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[#F5F5F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#F5F5F2] mb-1.5">
                  Favourite Sports (Select All That Apply)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SPORTS.map((sp) => {
                    const isSelected = editSports.includes(sp);
                    return (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (editSports.length > 1) {
                              setEditSports(editSports.filter((s) => s !== sp));
                            }
                          } else {
                            setEditSports([...editSports, sp]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                          isSelected
                            ? "bg-speecat-navy text-white border-speecat-navy"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {sp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Set Self-Assessed Skill For Selected Sports */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="font-extrabold text-[#F5F5F2] block">
                  Self-Assessed Skill Level for each sport separately:
                </span>
                <div className="space-y-2">
                  {editSports.map((sp) => (
                    <div key={sp} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F2]">{sp}</span>
                      <select
                        value={editSportSkillLevels[sp] || "Intermediate"}
                        onChange={(e) =>
                          setEditSportSkillLevels({
                            ...editSportSkillLevels,
                            [sp]: e.target.value as SkillLevel,
                          })
                        }
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#F5F5F2]"
                      >
                        {ALL_SKILL_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-5 py-2 rounded-xl shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MyProfilePage() {
  return (
    <RequireAuth roles={["player", "host", "admin"]}>
      <MyProfileContent />
    </RequireAuth>
  );
}
