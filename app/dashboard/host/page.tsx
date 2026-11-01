"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  IndianRupee, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Settings, 
  Sliders,
  Sparkles,
  MapPin
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import { getVenues } from "@/lib/venues";
import { fetchVenueBookings } from "@/lib/bookings";
import { CourtBooking, Venue } from "@/types/venue";

function HostDashboardContent() {
  const { profile } = useAuth();
  const allVenues = getVenues();
  const [selectedVenueId, setSelectedVenueId] = useState<string>(allVenues[0]?.id || "pgba-gachibowli");
  const selectedVenue = allVenues.find((v) => v.id === selectedVenueId) || allVenues[0];

  const [venueBookings, setVenueBookings] = useState<CourtBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [courtStatusMap, setCourtStatusMap] = useState<Record<string, "Active" | "Maintenance">>({});

  const loadBookings = useCallback(async () => {
    if (!selectedVenueId) return;
    setLoadingBookings(true);
    try {
      const list = await fetchVenueBookings(selectedVenueId);
      setVenueBookings(list);
    } catch (err) {
      console.error("Failed to load venue bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, [selectedVenueId]);

  useEffect(() => {
    void loadBookings();

    const handleChanged = () => {
      void loadBookings();
    };

    window.addEventListener("speedcat_bookings_changed", handleChanged);
    return () => window.removeEventListener("speedcat_bookings_changed", handleChanged);
  }, [loadBookings]);

  const toggleCourtStatus = (courtId: string) => {
    setCourtStatusMap((prev) => ({
      ...prev,
      [courtId]: prev[courtId] === "Maintenance" ? "Active" : "Maintenance",
    }));
  };

  const courts = selectedVenue?.courts || [];
  const confirmedBookings = venueBookings.filter((b) => b.status === "confirmed" || b.status === "Confirmed");
  const venueRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  Venue Host Management Portal
                </h1>
                <span className="bg-blue-900/80 border border-blue-400/40 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Host Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Managing: <strong className="text-white">{selectedVenue?.name}</strong> • {selectedVenue?.locality}, Hyderabad</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-xs text-slate-400 font-bold uppercase">Switch Venue:</label>
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-speecat-green"
            >
              {allVenues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.locality})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Host Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-4">
            <div className="text-xs font-semibold text-slate-500">Confirmed Reservations</div>
            <div className="text-2xl font-black text-[#F5F5F2] mt-1">{confirmedBookings.length}</div>
            <div className="text-[11px] text-[#B7F34A] font-medium mt-1">Live in Supabase</div>
          </div>

          <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-4">
            <div className="text-xs font-semibold text-slate-500">Gross Venue Revenue</div>
            <div className="text-2xl font-black text-[#B7F34A] mt-1">
              ₹{venueRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Collected Bookings</div>
          </div>

          <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-4">
            <div className="text-xs font-semibold text-slate-500">Active Inventory</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{courts.length} Courts</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">{selectedVenue?.sport}</div>
          </div>

          <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-4">
            <div className="text-xs font-semibold text-slate-500">Host Profile</div>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {profile?.name || "Host Partner"}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Hyderabad Region</div>
          </div>
        </div>

        {/* Courts Management & Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Courts List Column */}
          <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#F5F5F2] uppercase tracking-wider">
                Court Inventory ({courts.length})
              </h2>
              <span className="text-[11px] text-slate-400">Click to toggle status</span>
            </div>

            <div className="space-y-3">
              {courts.map((court) => {
                const status = courtStatusMap[court.id] || (court.isActive ? "Active" : "Maintenance");
                return (
                  <div
                    key={court.id}
                    className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#F5F5F2]">{court.name}</span>
                      <button
                        onClick={() => toggleCourtStatus(court.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                          status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {status}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Surface: {court.surface || "Synthetic PVC"}</span>
                      <span className="font-bold text-[#F5F5F2]">₹{court.pricePerHour}/hr</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule / Slots Column (2 Cols) */}
          <div className="lg:col-span-2 bg-[#292D32] rounded-2xl border border-[#373C42] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B7F34A]" />
                <h2 className="text-sm font-black text-[#F5F5F2] uppercase tracking-wider">
                  Live Court Schedule & Player Bookings
                </h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
                {confirmedBookings.length} Active Reservations
              </span>
            </div>

            {loadingBookings ? (
              <div className="py-10 text-center text-xs font-bold text-slate-400 animate-pulse">
                Syncing live schedule from Supabase...
              </div>
            ) : confirmedBookings.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {confirmedBookings.map((booking, idx) => (
                  <div
                    key={booking.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#B7F34A] flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#F5F5F2] flex items-center gap-2">
                          <span>{booking.timeSlot}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            ({booking.courtName})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Player: <span className="font-medium text-[#F5F5F2]">{booking.playerName}</span> • Ref: {booking.referenceCode}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <span className="text-xs font-bold text-[#B7F34A]">
                        ₹{booking.totalPrice}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">No bookings currently active for this venue</p>
                <p className="text-[11px] text-slate-400">When players book a slot on this venue's page, it will show up here instantly.</p>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href={`/venue/${selectedVenue?.slug}`}
                className="text-xs text-[#B7F34A] font-bold hover:underline"
              >
                Browse Public View of This Venue →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <RequireAuth roles={["host", "admin"]}>
      <HostDashboardContent />
    </RequireAuth>
  );
}
