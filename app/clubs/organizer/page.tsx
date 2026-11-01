"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  Percent,
  PlusCircle,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Repeat,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  getAllClubs,
  getAllClubEvents,
  getAllRegistrations,
  createClubEvent,
  cancelClubEvent,
  toggleCheckIn,
  cancelRegistration,
  getConfiguredPlatformFeeRate,
  setConfiguredPlatformFeeRate,
  getOrganizerRevenueAnalytics
} from "@/lib/clubs";
import { getCurrentUser } from "@/lib/community";
import { HYDERABAD_LOCALITIES } from "@/lib/venues";
import { HyderabadLocality } from "@/types/venue";
import { ALL_CLUB_CATEGORIES, Club, ClubCategory, ClubEvent, EventRegistration } from "@/types/club";

import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";

function OrganizerDashboardContent() {
  const { profile: currentUser } = useAuth();
  const currentUserId = currentUser?.id || "";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [activeTab, setActiveTab] = useState<"events" | "attendees" | "revenue">("events");

  // Configurable Fee Rate State (percentage integer, e.g. 5)
  const [feePercentage, setFeePercentage] = useState<number>(5);

  // Filter for attendees
  const [attendeeEventFilter, setAttendeeEventFilter] = useState<string>("all");
  const [attendeeSearch, setAttendeeSearch] = useState<string>("");

  // Create Event Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<ClubCategory>("Running");
  const [formVenueName, setFormVenueName] = useState("");
  const [formLocality, setFormLocality] = useState<HyderabadLocality>("Gachibowli");
  const [formAddress, setFormAddress] = useState("");
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [formTime, setFormTime] = useState("06:00 AM - 07:30 AM");
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formRecurrencePattern, setFormRecurrencePattern] = useState("Weekly every Saturday");
  const [formCapacity, setFormCapacity] = useState<number>(20);
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formRegistrationDeadline, setFormRegistrationDeadline] = useState("Up to 2 hours before the start time");
  const [formCancellationPolicy, setFormCancellationPolicy] = useState("Full refund demo credit up to 24 hours prior");
  const [formCoverImage, setFormCoverImage] = useState("https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80");
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Load and sync data
  const refreshData = () => {
    const allClubs = getAllClubs();
    setClubs(allClubs);

    if (allClubs.length > 0) {
      // Find a club where currentUser is organizer, or default to the first club
      const myClub = allClubs.find((c) => c.organizerId === currentUserId) || allClubs[0];
      setSelectedClubId((prev) => (prev ? prev : myClub.id));
    }

    setEvents(getAllClubEvents());
    setRegistrations(getAllRegistrations());
    setFeePercentage(Math.round(getConfiguredPlatformFeeRate() * 100));
  };

  useEffect(() => {
    refreshData();

    const handleClubsChange = () => refreshData();
    const handleEventsChange = () => refreshData();
    const handleRegsChange = () => refreshData();
    const handleFeeChange = () => {
      setFeePercentage(Math.round(getConfiguredPlatformFeeRate() * 100));
    };

    window.addEventListener("speedcat_clubs_changed", handleClubsChange);
    window.addEventListener("speedcat_events_changed", handleEventsChange);
    window.addEventListener("speedcat_registrations_changed", handleRegsChange);
    window.addEventListener("speedcat_platform_fee_changed", handleFeeChange);

    return () => {
      window.removeEventListener("speedcat_clubs_changed", handleClubsChange);
      window.removeEventListener("speedcat_events_changed", handleEventsChange);
      window.removeEventListener("speedcat_registrations_changed", handleRegsChange);
      window.removeEventListener("speedcat_platform_fee_changed", handleFeeChange);
    };
  }, [currentUserId]);

  const selectedClub = useMemo(() => {
    return clubs.find((c) => c.id === selectedClubId) || clubs[0] || null;
  }, [clubs, selectedClubId]);

  // Events belonging to this club
  const clubEvents = useMemo(() => {
    if (!selectedClub) return [];
    return events.filter((e) => e.clubId === selectedClub.id);
  }, [events, selectedClub]);

  // Registrations for this club
  const clubRegistrations = useMemo(() => {
    if (!selectedClub) return [];
    return registrations.filter((r) => r.clubId === selectedClub.id);
  }, [registrations, selectedClub]);

  // Revenue analytics for current organizer & fee percentage
  const analytics = useMemo(() => {
    if (!selectedClub) {
      return {
        totalRegistrations: 0,
        confirmedRegistrations: 0,
        cancelledRegistrations: 0,
        actualAttendance: 0,
        attendanceRate: 0,
        grossTicketSales: 0,
        speedcatPlatformFees: 0,
        netOrganizerEarnings: 0,
        platformFeePercentage: feePercentage,
        repeatParticipationRate: 0,
      };
    }
    return getOrganizerRevenueAnalytics(selectedClub.organizerId, feePercentage);
  }, [selectedClub, feePercentage, registrations]);

  // Handle fee rate update
  const handleFeeRateChange = (newPercent: number) => {
    setFeePercentage(newPercent);
    setConfiguredPlatformFeeRate(newPercent / 100);
  };

  // Handle create event submission
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;

    if (!formTitle.trim() || !formVenueName.trim()) {
      alert("Please provide an event title and venue name.");
      return;
    }

    createClubEvent({
      clubId: selectedClub.id,
      clubName: selectedClub.name,
      clubSlug: selectedClub.slug,
      title: formTitle.trim(),
      description: formDescription.trim() || "Join our regular club gathering for guided play, warmups, and networking.",
      category: formCategory,
      venueName: formVenueName.trim(),
      locality: formLocality,
      address: formAddress.trim() || `${formVenueName}, ${formLocality}, Hyderabad`,
      date: formDate,
      time: formTime,
      isRecurring: formIsRecurring,
      recurrencePattern: formIsRecurring ? formRecurrencePattern : undefined,
      capacity: Number(formCapacity) || 20,
      price: Number(formPrice) || 0,
      registrationDeadline: formRegistrationDeadline,
      cancellationPolicy: formCancellationPolicy,
      organizerId: selectedClub.organizerId,
      organizerName: selectedClub.organizerName,
      organizerAvatar: selectedClub.organizerAvatar,
      coverImage: formCoverImage,
    });

    setFormSuccessMessage(`Event "${formTitle}" scheduled successfully!`);
    setShowCreateModal(false);
    refreshData();

    // Reset some form values
    setFormTitle("");
    setFormDescription("");
    setTimeout(() => setFormSuccessMessage(null), 4000);
  };

  const handleCancelEvent = (eventId: string, title: string) => {
    if (confirm(`Are you sure you want to cancel the event "${title}"? Registered participants will receive demo cancellation notices.`)) {
      cancelClubEvent(eventId);
      refreshData();
    }
  };

  const handleToggleCheckIn = (regId: string) => {
    toggleCheckIn(regId);
    refreshData();
  };

  const handleCancelRegistration = (regId: string, playerName: string) => {
    if (confirm(`Cancel registration for ${playerName}?`)) {
      cancelRegistration(regId);
      refreshData();
    }
  };

  // Filtered attendees for the attendee tab
  const filteredAttendees = useMemo(() => {
    return clubRegistrations.filter((r) => {
      if (attendeeEventFilter !== "all" && r.eventId !== attendeeEventFilter) {
        return false;
      }
      if (attendeeSearch.trim()) {
        const q = attendeeSearch.toLowerCase();
        const mName = r.playerName.toLowerCase().includes(q);
        const mQr = r.qrCode.toLowerCase().includes(q);
        const mPhone = r.playerPhone.toLowerCase().includes(q);
        if (!mName && !mQr && !mPhone) return false;
      }
      return true;
    });
  }, [clubRegistrations, attendeeEventFilter, attendeeSearch]);

  if (!selectedClub) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">No Club Configured</h2>
          <p className="text-slate-600 text-sm mt-2 mb-6">
            You need to manage or be appointed as an organiser for a club to access this dashboard.
          </p>
          <Link
            href="/clubs"
            className="px-4 py-2.5 bg-speedcat-navy text-white text-xs font-semibold rounded-xl inline-block"
          >
            Explore Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-speedcat-navy via-slate-900 to-speedcat-navy text-white border-b border-slate-800 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-speedcat-green uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Verified Organiser Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Club & Event Management
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Schedule recurring sessions, check-in attendees via QR passes, and track platform revenue.
              </p>
            </div>

            {/* Club Selector Dropdown */}
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/20">
              <span className="text-xs font-semibold text-slate-300 pl-2">Managing:</span>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="bg-speedcat-navy text-white text-sm font-bold py-1.5 px-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-speedcat-green"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Bar with Link to Club Page */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-white">{selectedClub.name}</span>
              <span>•</span>
              <span>{selectedClub.locality}, Hyderabad</span>
              <span>•</span>
              <span className="text-speedcat-green font-bold">{selectedClub.memberCount} Members</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/clubs/${selectedClub.slug}`}
                className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white font-medium transition"
              >
                View Public Club Page
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-speedcat-green hover:bg-speedcat-green-light text-speedcat-navy font-bold rounded-xl shadow-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
                Schedule New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {formSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {formSuccessMessage}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4 gap-8">
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === "events"
                ? "border-speedcat-navy text-speedcat-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4 text-speedcat-green" />
            Events & Recurring Sessions ({clubEvents.length})
          </button>

          <button
            onClick={() => setActiveTab("attendees")}
            className={`pb-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === "attendees"
                ? "border-speedcat-navy text-speedcat-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4 text-speedcat-green" />
            Attendee List & QR Check-in ({clubRegistrations.length})
          </button>

          <button
            onClick={() => setActiveTab("revenue")}
            className={`pb-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === "revenue"
                ? "border-speedcat-navy text-speedcat-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-speedcat-green" />
            Revenue & ATHLETIQ Platform Fees
          </button>
        </div>

        {/* TAB 1: EVENTS & RECURRING SESSIONS */}
        {activeTab === "events" && (
          <div className="bg-white rounded-b-2xl p-6 border-x border-b border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scheduled Club Gatherings
                </h3>
                <p className="text-xs text-slate-500">
                  Manage one-off tournaments, weekly training loops, and club social mixers.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-speedcat-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
              >
                <PlusCircle className="w-4 h-4 text-speedcat-green" />
                Schedule Event
              </button>
            </div>

            {clubEvents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No events scheduled yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Set up your first club session with recurring schedule support, capacity limits, and demo ticketing.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-speedcat-navy text-white text-xs font-semibold rounded-xl"
                >
                  Create First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 bg-slate-800">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-speedcat-navy/90 text-white text-[10px] font-bold rounded">
                            {evt.category}
                          </span>
                          {evt.isRecurring && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/90 text-white text-[10px] font-semibold rounded">
                              <Repeat className="w-3 h-3" />
                              Recurring
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                              evt.status === "scheduled"
                                ? "bg-emerald-500 text-white"
                                : evt.status === "cancelled"
                                ? "bg-red-500 text-white"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {evt.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                          {evt.title}
                        </h4>

                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-speedcat-green shrink-0" />
                            <span>{new Date(evt.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                            <span>•</span>
                            <span>{evt.time}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-speedcat-green shrink-0" />
                            <span className="truncate">{evt.venueName}, {evt.locality}</span>
                          </div>

                          {evt.isRecurring && evt.recurrencePattern && (
                            <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                              <Repeat className="w-3.5 h-3.5 shrink-0" />
                              <span>{evt.recurrencePattern}</span>
                            </div>
                          )}
                        </div>

                        {/* Capacity & Price Strip */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500">Bookings: </span>
                            <span className="font-bold text-slate-800">
                              {evt.registeredCount} / {evt.capacity}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Price: </span>
                            <span className="font-extrabold text-speedcat-navy">
                              {evt.price === 0 ? "FREE" : `₹${evt.price}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setAttendeeEventFilter(evt.id);
                          setActiveTab("attendees");
                        }}
                        className="text-xs font-bold text-speedcat-navy hover:underline flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5 text-speedcat-green" />
                        View Attendees ({evt.registeredCount})
                      </button>

                      {evt.status === "scheduled" && (
                        <button
                          onClick={() => handleCancelEvent(evt.id, evt.title)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold"
                        >
                          Cancel Event
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTENDEE LIST & QR CHECK-IN */}
        {activeTab === "attendees" && (
          <div className="bg-white rounded-b-2xl p-6 border-x border-b border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Event Registrations & QR Check-in
                </h3>
                <p className="text-xs text-slate-500">
                  Verify participant passes on match day, confirm arrivals, and manage refunds.
                </p>
              </div>

              {/* Event filter dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search by player or QR code..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-speedcat-navy w-56"
                  />
                </div>

                <select
                  value={attendeeEventFilter}
                  onChange={(e) => setAttendeeEventFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold py-1.5 px-3 rounded-xl focus:outline-none"
                >
                  <option value="all">All Events ({clubRegistrations.length})</option>
                  {clubEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.registeredCount})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendees Table */}
            {filteredAttendees.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No attendees match your criteria</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Once members register for an event, their ticket codes and check-in statuses will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Player / Contact</th>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">QR Ticket Pass</th>
                      <th className="px-4 py-3">Ticket Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div>{reg.playerName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{reg.playerPhone} • {reg.playerEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="line-clamp-1 max-w-[200px] font-medium">{reg.eventTitle}</span>
                          <span className="text-[10px] text-slate-400">
                            Booked: {new Date(reg.registeredAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-800">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            <QrCode className="w-3.5 h-3.5 text-speedcat-navy" />
                            {reg.qrCode}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800">
                            {reg.ticketPrice === 0 ? "FREE" : `₹${reg.ticketPrice}`}
                          </span>
                          {reg.ticketPrice > 0 && (
                            <div className="text-[10px] text-slate-400">
                              Fee: ₹{reg.platformFee}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {reg.status === "checked_in" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Checked In
                            </span>
                          ) : reg.status === "cancelled" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Confirmed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {reg.status !== "cancelled" && (
                            <button
                              onClick={() => handleToggleCheckIn(reg.id)}
                              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                                reg.status === "checked_in"
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  : "bg-speedcat-green hover:bg-speedcat-green-light text-speedcat-navy shadow-sm"
                              }`}
                            >
                              {reg.status === "checked_in" ? "Undo Check-in" : "Check-in Pass"}
                            </button>
                          )}

                          {reg.status === "confirmed" && (
                            <button
                              onClick={() => handleCancelRegistration(reg.id, reg.playerName)}
                              className="px-2 py-1 text-red-500 hover:text-red-700 font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVENUE & ANALYTICS */}
        {activeTab === "revenue" && (
          <div className="bg-white rounded-b-2xl p-6 border-x border-b border-slate-200 space-y-8">
            {/* Header with Configurable Fee Rate Slider */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-speedcat-navy rounded-2xl text-white shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-speedcat-green uppercase tracking-wider mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Revenue Model & Platform Commission
                  </div>
                  <h3 className="text-xl font-extrabold">Configurable ATHLETIQ Platform Fee</h3>
                  <p className="text-xs text-slate-300 max-w-xl mt-1">
                    ATHLETIQ platform fee is dynamically configurable rather than fixed. Modify the fee percentage below to inspect how it impacts estimated platform fees versus net organiser payout.
                  </p>
                </div>

                {/* Slider Component */}
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[280px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">Fee Rate:</span>
                    <span className="text-xl font-black text-speedcat-green">{feePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={feePercentage}
                    onChange={(e) => handleFeeRateChange(Number(e.target.value))}
                    className="w-full accent-speedcat-green cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0% (No Fee)</span>
                    <span>5% (Default)</span>
                    <span>15% (Max)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Distinction Cards */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Financial Breakdown (Distinguishing Gross Sales from ATHLETIQ Revenue)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Gross Ticket Sales */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Gross Ticket Sales
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    ₹{analytics.grossTicketSales.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Total amount paid by participants across all confirmed & checked-in event registrations.
                  </p>
                </div>

                {/* ATHLETIQ Platform Fees */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm relative overflow-hidden">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                    <span>ATHLETIQ Platform Fee</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                      {feePercentage}% Cut
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-900 mt-1">
                    ₹{analytics.speedcatPlatformFees.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-amber-800 mt-2">
                    Estimated ATHLETIQ platform share calculated dynamically at {feePercentage}% per ticket booking.
                  </p>
                </div>

                {/* Net Organiser Payout */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm relative overflow-hidden">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Net Organiser Payout
                  </div>
                  <div className="text-3xl font-black text-emerald-950 mt-1">
                    ₹{analytics.netOrganizerEarnings.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-2">
                    Net revenue retained by the club after deducting ATHLETIQ's platform fees.
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance & Participation Analytics */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Operational & Community Engagement Metrics
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">Total Registrations</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {analytics.totalRegistrations}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">All time signups</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">Actual Attendance</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {analytics.actualAttendance}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1">
                    {analytics.attendanceRate}% check-in rate
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">Cancellations</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {analytics.cancelledRegistrations}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">With demo refunds</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-xs text-slate-500 font-medium">Repeat Participation</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {analytics.repeatParticipationRate}%
                  </div>
                  <div className="text-[10px] text-blue-600 font-bold mt-1">
                    Multi-event attendees
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Fee Example Banner */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
              <FileText className="w-5 h-5 text-speedcat-navy shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Transparent Fee Calculation Formula:</span>
                <p className="mt-0.5">
                  Gross Ticket Price (₹) × Platform Fee Rate ({feePercentage}%) = ATHLETIQ Platform Fee. For instance, on a ₹300 ticket at {feePercentage}%, ATHLETIQ retains ₹{(300 * (feePercentage / 100)).toFixed(0)}, leaving ₹{(300 - (300 * (feePercentage / 100))).toFixed(0)} for the club organizer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Schedule New Club Event
                </h3>
                <p className="text-xs text-slate-500">
                  For {selectedClub.name}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Saturday Morning 10K Lake Loop & Breakfast"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-speedcat-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sport / Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ClubCategory)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {ALL_CLUB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality
                  </label>
                  <select
                    value={formLocality}
                    onChange={(e) => setFormLocality(e.target.value as HyderabadLocality)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {HYDERABAD_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Meeting Point *
                </label>
                <input
                  type="text"
                  required
                  value={formVenueName}
                  onChange={(e) => setFormVenueName(e.target.value)}
                  placeholder="e.g. KBR National Park Main Gate"
                  className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-speedcat-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="06:00 AM - 07:30 AM"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Recurring Switch */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="w-4 h-4 accent-speedcat-navy rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Recurring Weekly Session
                  </span>
                </label>

                {formIsRecurring && (
                  <div>
                    <input
                      type="text"
                      value={formRecurrencePattern}
                      onChange={(e) => setFormRecurrencePattern(e.target.value)}
                      placeholder="e.g. Weekly every Saturday morning"
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Participant Capacity
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="500"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ticket Price (₹) — 0 for Free
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Details regarding warmups, equipment requirements, and schedule..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-speedcat-navy hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Publish Club Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizerDashboardPage() {
  return (
    <RequireAuth roles={["host", "admin"]}>
      <OrganizerDashboardContent />
    </RequireAuth>
  );
}
