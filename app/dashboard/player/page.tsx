"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  QrCode, 
  ArrowRight,
  AlertCircle,
  Trophy,
  History,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import { fetchMyBookings, cancelBookingGroup } from "@/lib/bookings";
import { CourtBooking } from "@/types/venue";

function PlayerDashboardContent() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<CourtBooking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    try {
      const list = await fetchMyBookings(user.id);
      setBookings(list);
    } catch (err: any) {
      console.error("Failed to load player bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    void loadBookings();

    const handleBookingsChanged = () => {
      void loadBookings();
    };

    window.addEventListener("speedcat_bookings_changed", handleBookingsChanged);
    return () => window.removeEventListener("speedcat_bookings_changed", handleBookingsChanged);
  }, [loadBookings]);

  const handleCancelBooking = async (booking: CourtBooking) => {
    if (!confirm(`Are you sure you want to cancel your booking at ${booking.venueName}?`)) {
      return;
    }
    setCancellingId(booking.id);
    setErrorMsg(null);
    try {
      await cancelBookingGroup(booking.groupId);
      await loadBookings();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const totalSpent = activeBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SP";

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Profile Banner */}
        <div className="bg-speecat-navy rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-speecat-green text-speecat-navy flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  {profile?.name || "Speedcat Player"}
                </h1>
                <span className="bg-emerald-900/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {profile?.role || "Player"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-speecat-green" />
                <span>{profile?.locality || "Hyderabad"}, Telangana • {user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/explore"
              className="bg-speecat-green hover:bg-speecat-green-600 text-speecat-navy font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Book A Court</span>
            </Link>
            <Link
              href="/host-game"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <span>Host Game</span>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Confirmed Bookings</div>
            <div className="text-2xl font-black text-speecat-navy mt-1">{activeBookings.length}</div>
            <div className="text-[11px] text-speecat-green font-medium mt-1">Live in Supabase</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Favorite Sport</div>
            <div className="text-2xl font-black text-speecat-navy mt-1">
              {profile?.favoriteSports?.[0] || "Badminton"}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              {profile?.locality || "Hyderabad"}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Total Court Spend</div>
            <div className="text-2xl font-black text-speecat-green mt-1">
              ₹{totalSpent.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Confirmed Value</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Sportsmanship Rating</div>
            <div className="text-2xl font-black text-purple-600 mt-1">
              ★ {profile?.sportsmanship?.overallScore ? profile.sportsmanship.overallScore.toFixed(1) : "5.0"}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Community Score</div>
          </div>
        </div>

        {/* Bookings List Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-speecat-green" />
              <h2 className="text-lg font-black text-speecat-navy">
                My Court Reservations ({bookings.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Real-time database sync</span>
          </div>

          {loadingBookings ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
              Loading your court bookings from Supabase...
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const isConfirmed = booking.status === "confirmed";
                return (
                  <div
                    key={booking.id}
                    className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isConfirmed ? "Confirmed" : "Cancelled"}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {booking.referenceCode}
                        </span>
                        <span className="text-xs bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {booking.sport}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-speecat-navy">
                        {booking.venueName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-speecat-green" />
                          {booking.locality}, Hyderabad
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-speecat-navy">
                          <Calendar className="w-3.5 h-3.5 text-speecat-green" />
                          {booking.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-speecat-green" />
                          {booking.timeSlot} ({booking.durationHours} hr{booking.durationHours > 1 ? "s" : ""})
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        Court: <span className="font-semibold text-speecat-navy">{booking.courtName}</span>
                      </div>
                    </div>

                    {/* Actions & Price */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                      <div className="text-left md:text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Amount</div>
                        <div className="text-base font-black text-speecat-green">
                          ₹{booking.totalPrice?.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReceipt(booking)}
                          className="bg-white hover:bg-slate-100 text-speecat-navy border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5 text-speecat-green" />
                          <span>Receipt</span>
                        </button>

                        {isConfirmed && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            disabled={cancellingId === booking.id}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">You don't have any court bookings yet</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 bg-speecat-green text-speecat-navy font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
              >
                <span>Browse Hyderabad Sports Venues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Real Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                selectedReceipt.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {selectedReceipt.status === "confirmed" ? "Confirmed Pass" : "Cancelled"}
              </span>
              <h3 className="text-base font-black text-speecat-navy">{selectedReceipt.venueName}</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedReceipt.referenceCode}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <QrCode className="w-24 h-24 mx-auto text-speecat-navy" />
              <p className="text-[10px] text-slate-500 font-medium">
                Official Check-In Pass • Present at venue reception
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Date & Time:</span>
                <span className="font-bold text-speecat-navy">{selectedReceipt.date} • {selectedReceipt.timeSlot}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Court:</span>
                <span className="font-bold text-speecat-navy">{selectedReceipt.courtName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Player:</span>
                <span className="font-bold text-speecat-navy">{selectedReceipt.playerName}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-bold">Total Price:</span>
                <span className="font-black text-speecat-green text-sm">₹{selectedReceipt.totalPrice}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full bg-speecat-navy text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayerDashboard() {
  return (
    <RequireAuth roles={["player", "host", "admin"]}>
      <PlayerDashboardContent />
    </RequireAuth>
  );
}
