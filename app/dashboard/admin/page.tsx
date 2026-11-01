"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Upload, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Download,
  Users,
  Calendar,
  XCircle,
  Building,
  Check,
  Ban,
  Activity,
  Layers
} from "lucide-react";
import { 
  getVenues, 
  saveVenues, 
  INITIAL_VENUES, 
  LOCAL_STORAGE_KEY, 
  parseCsvToVenues,
  HYDERABAD_LOCALITIES
} from "@/lib/venues";
import { 
  getAllClubs, 
  saveClubs, 
  getAllClubEvents, 
  saveClubEvents, 
  getAllRegistrations,
  approveClub,
  suspendClub,
  cancelClubEvent
} from "@/lib/clubs";
import { Venue, SportType, HyderabadLocality } from "@/types/venue";
import { Club, ClubEvent, EventRegistration } from "@/types/club";

const SAMPLE_CSV = `name,sport,locality,price,address,hours,amenities
"Hyderabad Badminton Arena","Badminton","Gachibowli",550,"Near Telecom Nagar, Gachibowli, Hyderabad","05:00 AM - 11:00 PM","Parking; Changing Rooms; Drinking Water"
"Cyber Turfs 7v7","Football","Madhapur",1200,"Near Durgam Cheruvu Cable Bridge, Madhapur, Hyderabad","06:00 AM - 12:00 AM","Floodlights; Bibs Provided; Parking"
"Kukatpally Box Cricket Zone","Cricket","Kukatpally",850,"Phase 4, KPHB Colony, Kukatpally, Hyderabad","24 Hours","Floodlights; Bats Included; Parking"`;

import RequireAuth from "@/components/RequireAuth";

function AdminDashboardContent() {
  const [activeSection, setActiveSection] = useState<"clubs" | "venues">("clubs");

  // Venue state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("All");
  
  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState(SAMPLE_CSV);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Add Venue Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueSport, setNewVenueSport] = useState<SportType>("Badminton");
  const [newVenueLocality, setNewVenueLocality] = useState<HyderabadLocality>("Gachibowli");
  const [newVenuePrice, setNewVenuePrice] = useState<string>("500");
  const [newVenueAddress, setNewVenueAddress] = useState("");

  // Clubs and Events Moderation State
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [clubSearch, setClubSearch] = useState("");

  const refreshAllData = () => {
    setVenues(getVenues());
    setClubs(getAllClubs());
    setEvents(getAllClubEvents());
    setRegistrations(getAllRegistrations());
  };

  useEffect(() => {
    refreshAllData();

    const handleClubsChange = () => refreshAllData();
    const handleEventsChange = () => refreshAllData();
    const handleRegsChange = () => refreshAllData();

    window.addEventListener("speedcat_clubs_changed", handleClubsChange);
    window.addEventListener("speedcat_events_changed", handleEventsChange);
    window.addEventListener("speedcat_registrations_changed", handleRegsChange);

    return () => {
      window.removeEventListener("speedcat_clubs_changed", handleClubsChange);
      window.removeEventListener("speedcat_events_changed", handleEventsChange);
      window.removeEventListener("speedcat_registrations_changed", handleRegsChange);
    };
  }, []);

  const handleDeleteVenue = (id: string) => {
    if (confirm("Remove this venue from the preview directory?")) {
      const updated = venues.filter((v) => v.id !== id);
      setVenues(updated);
      saveVenues(updated);
    }
  };

  const handleResetDefault = () => {
    if (confirm("Reset directory to the original verified Hyderabad venue list?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      setVenues(INITIAL_VENUES);
    }
  };

  const handleImportCsv = () => {
    try {
      const parsed = parseCsvToVenues(csvContent);
      if (parsed.length === 0) {
        setImportNotice("No valid venue rows could be parsed. Check the CSV format.");
        return;
      }
      const updated = [...parsed, ...venues];
      setVenues(updated);
      saveVenues(updated);
      setImportNotice(`Successfully imported ${parsed.length} venues to ATHLETIQ!`);
      setTimeout(() => {
        setShowCsvModal(false);
        setImportNotice(null);
      }, 1500);
    } catch (err: any) {
      setImportNotice(`Import error: ${err.message}`);
    }
  };

  const handleAddVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;

    const slug = newVenueName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const priceNum = newVenuePrice ? Number(newVenuePrice) : null;

    const newVenue: Venue = {
      id: `custom-${Date.now()}`,
      name: newVenueName.trim(),
      slug,
      sport: newVenueSport,
      sportsAvailable: [newVenueSport],
      locality: newVenueLocality,
      city: "Hyderabad",
      address: newVenueAddress.trim() || `${newVenueLocality}, Hyderabad, Telangana`,
      mapQuery: `${newVenueName} ${newVenueLocality} Hyderabad`,
      mapLink: `https://maps.google.com/?q=${encodeURIComponent(`${newVenueName} ${newVenueLocality} Hyderabad`)}`,
      coordinates: { lat: 17.44, lng: 78.38 },
      pricePerHour: priceNum,
      isPriceVerified: priceNum !== null,
      priceNote: priceNum ? "Verified sample listing" : "Price/details to be confirmed",
      rating: 4.6,
      reviewCount: 15,
      environment: "Indoor",
      featuredImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Parking", "Changing Rooms", "Drinking Water"],
      openingHours: "06:00 AM - 10:00 PM (Daily)",
      isOpenVerified: true,
      courtsCount: 2,
      courts: [
        { id: "c1", name: "Court 1", type: "Standard Court", surface: "Synthetic", pricePerHour: priceNum },
        { id: "c2", name: "Court 2", type: "Standard Court", surface: "Synthetic", pricePerHour: priceNum },
      ],
      description: `Sports facility located in ${newVenueLocality}, Hyderabad. Added via ATHLETIQ preview admin tools.`,
      rules: ["Proper sports footwear required", "Follow court etiquette"],
      verificationBadge: "Preview Listing",
    };

    const updated = [newVenue, ...venues];
    setVenues(updated);
    saveVenues(updated);
    setShowAddModal(false);
    setNewVenueName("");
    setNewVenueAddress("");
  };

  const handleApproveClub = (clubId: string) => {
    approveClub(clubId);
    refreshAllData();
  };

  const handleSuspendClub = (clubId: string) => {
    if (confirm("Suspend this club? Its events will be hidden from recommendations.")) {
      suspendClub(clubId);
      refreshAllData();
    }
  };

  const handleModerateEvent = (eventId: string, title: string) => {
    if (confirm(`Cancel and moderate event "${title}"?`)) {
      cancelClubEvent(eventId);
      refreshAllData();
    }
  };

  const filteredVenues = venues.filter((v) => {
    const matchTerm =
      !searchFilter ||
      v.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.sport.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.locality.toLowerCase().includes(searchFilter.toLowerCase());
    const matchLoc = selectedLocality === "All" || v.locality === selectedLocality;
    return matchTerm && matchLoc;
  });

  const filteredClubs = clubs.filter((c) => {
    if (!clubSearch.trim()) return true;
    const q = clubSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.organizerName.toLowerCase().includes(q) ||
      c.locality.toLowerCase().includes(q)
    );
  });

  // Moderation summary counts
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter((c) => c.status === "active").length;
  const pendingClubs = clubs.filter((c) => c.status === "pending_review").length;
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "scheduled").length;
  const totalBookings = registrations.length;
  const cancelledBookings = registrations.filter((r) => r.status === "cancelled").length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-speedcat-navy rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  ATHLETIQ Central Administration
                </h1>
                <span className="bg-purple-900/80 border border-purple-400/40 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Review clubs & organisers, moderate community events, manage venue directory and import data
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/clubs/organizer"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition border border-white/20"
            >
              Organiser Hub
            </Link>

            <Link
              href="/clubs"
              className="bg-speedcat-green hover:bg-speedcat-green-light text-speedcat-navy text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-xs"
            >
              Public Clubs
            </Link>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4 gap-8">
          <button
            onClick={() => setActiveSection("clubs")}
            className={`pb-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeSection === "clubs"
                ? "border-speedcat-navy text-speedcat-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building className="w-4 h-4 text-speedcat-green" />
            Clubs & Events Moderation ({totalClubs} Clubs / {totalEvents} Events)
          </button>

          <button
            onClick={() => setActiveSection("venues")}
            className={`pb-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeSection === "venues"
                ? "border-speedcat-navy text-speedcat-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 text-speedcat-green" />
            Venues Directory & CSV Import ({venues.length} Venues)
          </button>
        </div>

        {/* SECTION: CLUBS & EVENTS MODERATION */}
        {activeSection === "clubs" && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Clubs</div>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-speedcat-green" />
                  {totalClubs}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  {activeClubs} Active • {pendingClubs} In Review
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Scheduled Events</div>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-speedcat-green" />
                  {totalEvents}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {activeEvents} Active Sessions
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Event Bookings</div>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-speedcat-green" />
                  {totalBookings}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Across all Hyderabad clubs
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cancellations & Refunds</div>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-amber-500" />
                  {cancelledBookings}
                </div>
                <div className="text-[11px] text-amber-700 font-bold mt-1">
                  Demo credit refunded
                </div>
              </div>
            </div>

            {/* Clubs Moderation Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Review and Approve Clubs & Organisers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage club verification badges, review pending submissions, and enforce community standards.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                    placeholder="Search clubs or organisers..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-speedcat-navy w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Club Name / Category</th>
                      <th className="px-4 py-3">Organiser</th>
                      <th className="px-4 py-3">Locality</th>
                      <th className="px-4 py-3">Members</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClubs.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {c.name}
                            {c.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{c.category} • {c.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-800">
                          <div className="font-semibold">{c.organizerName}</div>
                          <div className="text-[10px] text-slate-400">{c.organizerRole}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {c.locality}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {c.memberCount}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.status === "pending_review"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {c.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            href={`/clubs/${c.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg text-[11px] font-semibold"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          {c.status !== "active" ? (
                            <button
                              onClick={() => handleApproveClub(c.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspendClub(c.id)}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Events Moderation Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Moderate Club Events & Activities
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect scheduled sessions, participant counts, and cancel flagged or policy-violating activities.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Event Title / Club</th>
                      <th className="px-4 py-3">Schedule</th>
                      <th className="px-4 py-3">Venue</th>
                      <th className="px-4 py-3">Bookings</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div>{evt.title}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{evt.clubName}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <div>{new Date(evt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          <div className="text-[10px] text-slate-400">{evt.time}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{evt.venueName}</div>
                          <div className="text-[10px] text-slate-400">{evt.locality}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {evt.registeredCount} / {evt.capacity}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {evt.price === 0 ? "FREE" : `₹${evt.price}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              evt.status === "scheduled"
                                ? "bg-emerald-100 text-emerald-800"
                                : evt.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {evt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {evt.status === "scheduled" && (
                            <button
                              onClick={() => handleModerateEvent(evt.id, evt.title)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold"
                            >
                              Moderate / Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: VENUES DIRECTORY */}
        {activeSection === "venues" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sports Venues Preview Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Manage sports turfs, badminton courts, and multi-sport complexes in Hyderabad.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowCsvModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import CSV
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-speedcat-navy hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-speedcat-green" />
                  Add Venue
                </button>

                <button
                  onClick={handleResetDefault}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Venues Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search venues by name, sport, or locality..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-lg text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-speedcat-navy"
                />
              </div>

              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-slate-50 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200"
              >
                <option value="All">All Localities</option>
                {HYDERABAD_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Venues Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Venue Name</th>
                      <th className="px-4 py-3">Sport</th>
                      <th className="px-4 py-3">Locality</th>
                      <th className="px-4 py-3">Price / Hr</th>
                      <th className="px-4 py-3">Courts</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVenues.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {v.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {v.sport}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {v.locality}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {v.pricePerHour ? `₹${v.pricePerHour}` : "To be confirmed"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {v.courtsCount || 1}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            href={`/venue/${v.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleDeleteVenue(v.id)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CSV MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Import CSV Venues</h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste standard CSV rows with columns: <code>name,sport,locality,price,address,hours,amenities</code>
            </p>
            {importNotice && (
              <div className="mb-3 p-2 bg-purple-50 text-purple-900 rounded-lg text-xs font-semibold">
                {importNotice}
              </div>
            )}
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
              >
                Import to ATHLETIQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENUE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Add Sample Hyderabad Venue</h3>
            <form onSubmit={handleAddVenue} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="e.g. Kondapur Smash Zone"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sport</label>
                  <select
                    value={newVenueSport}
                    onChange={(e) => setNewVenueSport(e.target.value as SportType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Badminton">Badminton</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Pickleball">Pickleball</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Multi-Sport">Multi-Sport</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Locality</label>
                  <select
                    value={newVenueLocality}
                    onChange={(e) => setNewVenueLocality(e.target.value as HyderabadLocality)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {HYDERABAD_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price / Hr (₹)</label>
                  <input
                    type="number"
                    value={newVenuePrice}
                    onChange={(e) => setNewVenuePrice(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={newVenueAddress}
                    onChange={(e) => setNewVenueAddress(e.target.value)}
                    placeholder="e.g. Near Hitech City Metro"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-speedcat-navy text-white text-xs font-bold rounded-xl"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminDashboardContent />
    </RequireAuth>
  );
}
