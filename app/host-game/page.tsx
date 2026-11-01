"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Trophy, 
  Users, 
  IndianRupee, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  Building2,
  Lock,
  Globe,
  Info
} from "lucide-react";
import { getVenues, HYDERABAD_LOCALITIES } from "@/lib/venues";
import { getCurrentUser, createGame } from "@/lib/community";
import { SportType, HyderabadLocality, Venue } from "@/types/venue";
import { SkillLevel, ALL_SKILL_LEVELS, SkillRequirement } from "@/types/community";

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

import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";

function HostGameContent() {
  const router = useRouter();
  const { profile: currentUser } = useAuth();
  const allVenues = useMemo(() => getVenues(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-step State (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Sport
  const [sport, setSport] = useState<SportType>("Badminton");

  // Step 2: Venue
  const [venueChoiceType, setVenueChoiceType] = useState<"directory" | "custom">("directory");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("pgba-gachibowli");
  const [customVenueName, setCustomVenueName] = useState("");
  const [customLocality, setCustomLocality] = useState<HyderabadLocality>("Gachibowli");
  const [customAddress, setCustomAddress] = useState("");
  const [isVenueConfirmed, setIsVenueConfirmed] = useState(true);

  // Step 3: Schedule
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("07:00 PM");
  const [durationHours, setDurationHours] = useState(2);
  const [maxGroupSize, setMaxGroupSize] = useState(4);

  // Step 4: Skill Level
  const [skillType, setSkillType] = useState<"open" | "single" | "range">("range");
  const [singleSkill, setSingleSkill] = useState<SkillLevel>("Intermediate");
  const [minSkill, setMinSkill] = useState<SkillLevel>("Intermediate");
  const [maxSkill, setMaxSkill] = useState<SkillLevel>("Advanced");

  // Step 5: Game Details
  const [title, setTitle] = useState("Weekend Badminton Doubles Match");
  const [description, setDescription] = useState(
    "Looking for enthusiastic players for a competitive yet friendly match. Shuttles provided."
  );
  const [matchFormat, setMatchFormat] = useState<"Singles" | "Doubles" | "Team Match" | "Casual Practice">("Doubles");
  const [costPerPlayer, setCostPerPlayer] = useState<number | "">(250);
  const [isSplitCost, setIsSplitCost] = useState(true);
  const [equipmentNotes, setEquipmentNotes] = useState("Mavis 350 shuttles provided. Bring your own racquets.");
  const [visibility, setVisibility] = useState<"public" | "invite-only">("public");
  const [ruleInput, setRuleInput] = useState("Non-marking badminton shoes mandatory\nPlease arrive 10 minutes prior\nFair play and sportsmanship");

  const selectedVenue = allVenues.find((v) => v.id === selectedVenueId);

  // Calculate skill requirement object
  const skillRequirement: SkillRequirement = useMemo(() => {
    if (skillType === "open") {
      return { type: "open", displayText: "Open to All Skill Levels" };
    }
    if (skillType === "single") {
      return { type: "single", level: singleSkill, displayText: `${singleSkill} Level` };
    }
    return {
      type: "range",
      minLevel: minSkill,
      maxLevel: maxSkill,
      displayText: `${minSkill} to ${maxSkill}`,
    };
  }, [skillType, singleSkill, minSkill, maxSkill]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePublish = async () => {
    if (!currentUser) {
      router.push("/login?next=/host-game");
      return;
    }

    const venueName = venueChoiceType === "directory" && selectedVenue
      ? selectedVenue.name
      : customVenueName || "Hyderabad Sports Arena";

    const venueLocality = venueChoiceType === "directory" && selectedVenue
      ? selectedVenue.locality
      : customLocality;

    const venueAddress = venueChoiceType === "directory" && selectedVenue
      ? selectedVenue.address
      : customAddress || `${customLocality}, Hyderabad`;

    const rules = ruleInput
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    setIsSubmitting(true);
    try {
      const newGame = await createGame({
        sport,
        title: title || `${sport} Match in ${venueLocality}`,
        description,
        matchFormat,
        venueId: venueChoiceType === "directory" ? selectedVenueId : undefined,
        venueName,
        locality: venueLocality,
        venueAddress,
        isVenueConfirmed,
        date,
        startTime,
        endTime: "09:00 PM",
        durationHours,
        joiningDeadline: `${date}T18:00:00`,
        playersNeeded: maxGroupSize,
        maxGroupSize,
        skillRequirement,
        hostId: currentUser.id,
        hostName: currentUser.name,
        hostAvatar: currentUser.avatar,
        costPerPlayer: costPerPlayer ? Number(costPerPlayer) : null,
        isSplitCost,
        equipmentNotes,
        visibility,
        rules,
      });

      router.push(`/games/${newGame.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create game. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <PlusCircle className="w-4 h-4 text-speecat-green" />
            <span>Host a Game</span>
          </div>
          <h1 className="text-3xl font-black text-speecat-navy">
            Organize a Match in Hyderabad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Set your game details, match with players of your skill level, and play together.
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            {["Sport", "Venue", "Schedule", "Skill Level", "Details", "Publish"].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;

              return (
                <button
                  key={label}
                  onClick={() => setCurrentStep(stepNum)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "text-speecat-navy font-black"
                      : isPast
                      ? "text-speecat-green font-bold"
                      : "text-slate-400"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                      isActive
                        ? "bg-speecat-navy text-white"
                        : isPast
                        ? "bg-speecat-green text-speecat-navy"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* STEP 1: Select Sport */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-speecat-navy">Step 1: Choose the Sport</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the game you wish to play in Hyderabad
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_SPORTS.map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      setSport(sp);
                      setTitle(`Weekend ${sp} Match`);
                    }}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                      sport === sp
                        ? "border-speecat-green bg-emerald-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <span className="text-3xl">
                      {sp === "Badminton" ? "🏸" : sp === "Football" ? "⚽" : sp === "Cricket" ? "🏏" : sp === "Tennis" ? "🎾" : sp === "Pickleball" ? "🏓" : sp === "Basketball" ? "🏀" : sp === "Table Tennis" ? "🏓" : sp === "Swimming" ? "🏊" : "🏟️"}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-speecat-navy">{sp}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Venue */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-speecat-navy">Step 2: Choose Playing Venue</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick from verified Hyderabad sports facilities or enter your community location
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVenueChoiceType("directory")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    venueChoiceType === "directory" ? "bg-white text-speecat-navy shadow-xs" : "text-slate-500"
                  }`}
                >
                  Select from ATHLETIQ Directory
                </button>
                <button
                  type="button"
                  onClick={() => setVenueChoiceType("custom")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    venueChoiceType === "custom" ? "bg-white text-speecat-navy shadow-xs" : "text-slate-500"
                  }`}
                >
                  Custom Ground / Gated Community
                </button>
              </div>

              {venueChoiceType === "directory" ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-speecat-navy">
                    Select Hyderabad Arena ({sport})
                  </label>
                  <select
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-speecat-navy focus:outline-none focus:ring-2 focus:ring-speecat-green"
                  >
                    {allVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.locality}) — {v.pricePerHour ? `₹${v.pricePerHour}/hr` : "Price TBC"}
                      </option>
                    ))}
                  </select>

                  {selectedVenue && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-speecat-navy">{selectedVenue.name}</div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-speecat-green" />
                        <span>{selectedVenue.address}</span>
                      </div>
                      <div className="text-speecat-green font-bold">
                        Hourly Rate: {selectedVenue.pricePerHour ? `₹${selectedVenue.pricePerHour}/hr` : "To be confirmed"}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-speecat-navy mb-1">Venue / Ground Name</label>
                    <input
                      type="text"
                      placeholder="e.g. My Home Bhooja Badminton Court or Kondapur Community Turf"
                      value={customVenueName}
                      onChange={(e) => setCustomVenueName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-speecat-navy mb-1">Locality</label>
                      <select
                        value={customLocality}
                        onChange={(e) => setCustomLocality(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy"
                      >
                        {HYDERABAD_LOCALITIES.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-speecat-navy mb-1">Address / Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Botanical Garden"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <span className="font-bold">Important Notice:</span> Selecting a venue here coordinates the meeting spot with fellow players. It does not automatically book a court at the physical venue.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-speecat-navy">Step 3: Schedule & Group Size</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set the match timing and maximum number of players
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-speecat-navy mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-speecat-green" />
                    <span>Match Date</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-speecat-navy mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-speecat-green" />
                    <span>Start Time</span>
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy"
                  >
                    <option value="06:00 AM">06:00 AM</option>
                    <option value="06:30 AM">06:30 AM</option>
                    <option value="07:00 AM">07:00 AM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                    <option value="08:30 PM">08:30 PM</option>
                    <option value="09:00 PM">09:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-speecat-navy mb-1">
                    Duration (Hours)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 1.5, 2].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDurationHours(h)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          durationHours === h
                            ? "bg-speecat-navy text-white border-speecat-navy"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {h} {h === 1 ? "Hour" : "Hours"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-speecat-navy mb-1">
                    Total Players (Including You)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="22"
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(Math.max(2, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    e.g. 4 for Badminton Doubles, 10 for 5v5 Football, 12 for Box Cricket
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Skill Level (Key Feature!) */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-speecat-navy">
                  Step 4: Set Skill Level for {sport}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Skill levels ensure competitive, enjoyable games. Stored separately per sport.
                </p>
              </div>

              {/* Skill Type Options */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSkillType("range")}
                  className={`p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all ${
                    skillType === "range"
                      ? "border-speecat-green bg-emerald-50 text-speecat-navy"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Skill Range (Recommended)
                </button>

                <button
                  type="button"
                  onClick={() => setSkillType("single")}
                  className={`p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all ${
                    skillType === "single"
                      ? "border-speecat-green bg-emerald-50 text-speecat-navy"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Single Exact Level
                </button>

                <button
                  type="button"
                  onClick={() => setSkillType("open")}
                  className={`p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all ${
                    skillType === "open"
                      ? "border-speecat-green bg-emerald-50 text-speecat-navy"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Open to All
                </button>
              </div>

              {skillType === "range" && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-speecat-navy mb-1">
                        Minimum Skill Level
                      </label>
                      <select
                        value={minSkill}
                        onChange={(e) => setMinSkill(e.target.value as SkillLevel)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy font-bold"
                      >
                        {ALL_SKILL_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-speecat-navy mb-1">
                        Maximum Skill Level
                      </label>
                      <select
                        value={maxSkill}
                        onChange={(e) => setMaxSkill(e.target.value as SkillLevel)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy font-bold"
                      >
                        {ALL_SKILL_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-center bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-semibold">Game will be marked: </span>
                    <span className="font-extrabold text-speecat-navy ml-1">
                      "{minSkill} to {maxSkill}"
                    </span>
                  </div>
                </div>
              )}

              {skillType === "single" && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <label className="block font-bold text-speecat-navy">
                    Select Required Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ALL_SKILL_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSingleSkill(lvl)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                          singleSkill === lvl
                            ? "bg-speecat-navy text-white border-speecat-navy"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {skillType === "open" && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 leading-relaxed">
                  Anyone can request to join, from first-timers to club veterans. Ideal for social and casual fitness matches.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Game Details & Rules */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div>
                <h2 className="text-xl font-black text-speecat-navy">Step 5: Match Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Give your game a clear title, format, and cost breakdown
                </p>
              </div>

              <div>
                <label className="block font-bold text-speecat-navy mb-1">Game Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-speecat-navy mb-1">Match Format</label>
                  <select
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy font-medium"
                  >
                    <option value="Doubles">Doubles</option>
                    <option value="Singles">Singles</option>
                    <option value="Team Match">Team Match</option>
                    <option value="Casual Practice">Casual Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-speecat-navy mb-1">
                    Approx Cost / Player (₹ INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={costPerPlayer}
                    onChange={(e) => setCostPerPlayer(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-speecat-navy mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-speecat-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-speecat-navy mb-1">Equipment Notes</label>
                <input
                  type="text"
                  value={equipmentNotes}
                  onChange={(e) => setEquipmentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-speecat-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-speecat-navy mb-1">
                  Joining Rules (One per line)
                </label>
                <textarea
                  rows={3}
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-speecat-navy"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Summary & Publish */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-speecat-navy">Step 6: Review & Publish</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your match summary before sharing with the Hyderabad community
                </p>
              </div>

              {/* Review Card */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏸</span>
                    <span className="font-black text-sm uppercase text-speecat-navy">{sport}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                    {skillRequirement.displayText}
                  </span>
                </div>

                <h3 className="text-lg font-black text-speecat-navy">{title}</h3>

                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Venue</span>
                    <span className="font-bold text-speecat-navy">
                      {venueChoiceType === "directory" && selectedVenue ? selectedVenue.name : customVenueName || "Hyderabad"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date & Time</span>
                    <span className="font-bold text-speecat-navy">{date} • {startTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Spots</span>
                    <span className="font-bold text-speecat-navy">
                      {maxGroupSize - 1} open spots ({maxGroupSize} total)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Price</span>
                    <span className="font-bold text-speecat-green">
                      {costPerPlayer ? `₹${costPerPlayer} / player` : "Free"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-500">
                  <span className="font-semibold text-speecat-navy">Host: </span>
                  {currentUser?.name} ({currentUser?.locality})
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-speecat-green shrink-0 mt-0.5" />
                <span>
                  After publishing, your game will appear in **Find Games**. You can accept players and communicate in the private game group chat!
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            ) : (
              <Link
                href="/games"
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </Link>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-speecat-navy hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="bg-speecat-green hover:bg-speecat-green-600 text-speecat-navy text-xs font-black px-7 py-3 rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1.5 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isSubmitting ? "Publishing to Supabase..." : "Publish Game to Community"}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function HostGamePage() {
  return (
    <RequireAuth roles={["player", "host", "admin"]}>
      <HostGameContent />
    </RequireAuth>
  );
}
