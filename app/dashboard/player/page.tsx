"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2
} from "lucide-react";
import { BOOKINGS_STORAGE_KEY } from "@/lib/venues";
import { BookingDemo } from "@/types/venue";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/lib/supabase/client";

const DEFAULT_SAMPLE_BOOKINGS: BookingDemo[] = [
  {
    id: "SPC-HYD-582194",
    venueId: "pgba-gachibowli",
    venueName: "Pullela Gopichand Badminton Academy",
    sport: "Badminton",
    locality: "Gachibowli",
    courtName: "Court 1 - BWF Wooden Flooring",
    date: "2026-10-25",
    timeSlot: "07:00 PM - 08:00 PM",
    durationHours: 1,
    courtPrice: 600,
    platformFee: 0,
    taxes: 0,
    totalPrice: 600,
    playerName: "Rohith Player (Demo)",
    playerEmail: "player.demo@speecat.hyd",
    playerPhone: "+91 98765 43210",
    status: "Confirmed (Demo)",
    createdAt: "2026-10-24T10:00:00Z",
    isDemoNotice: "Demo booking — not a real reservation.",
  },
  {
    id: "SPC-HYD-194028",
    venueId: "astropark-madhapur",
    venueName: "AstroPark Football & Cricket Turf",
    sport: "Football",
    locality: "Madhapur",
    courtName: "Main Arena (6v6 Football)",
    date: "2026-10-28",
    timeSlot: "08:00 PM - 09:00 PM",
    durationHours: 1,
    courtPrice: 1300,
    platformFee: 0,
    taxes: 0,
    totalPrice: 1300,
    playerName: "Rohith Player (Demo)",
    playerEmail: "player.demo@speecat.hyd",
    playerPhone: "+91 98765 43210",
    status: "Confirmed (Demo)",
    createdAt: "2026-10-23T14:30:00Z",
    isDemoNotice: "Demo booking — not a real reservation.",
  },
];

export default function PlayerDashboard() {
  const [bookings, setBookings] = useState<BookingDemo[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<BookingDemo | null>(null);
  const router = useRouter();
const [loggingOut, setLoggingOut] = useState(false);

const handleLogout = async () => {
  setLoggingOut(true);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error.message);
    alert("Logout failed. Please try again.");
    setLoggingOut(false);
    return;
  }

  router.replace("/login");
  router.refresh();
};

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookings(parsed);
          return;
        }
      }
    } catch {}
    setBookings(DEFAULT_SAMPLE_BOOKINGS);
  }, []);

  const handleCancelBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Profile Banner */}
        <div className="bg-speecat-navy rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-speecat-green text-speecat-navy flex items-center justify-center font-black text-xl shadow-md">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  Rohith Player
                </h1>
                <span className="bg-emerald-900/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Player Demo
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Hyderabad, Telangana • player.demo@speecat.hyd
              </p>
            </div>
          </div>

         
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <Link
              href="/explore"
              className="bg-speecat-green hover:bg-speecat-green-600 text-speecat-navy font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Book Another Court</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
          </div>
        </div>

        {/* Demo Notice Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-800">
              Player Dashboard Demonstration:
            </span>{" "}
            All reservations shown below are simulated demo bookings for prototype preview only. No court is reserved at physical Hyderabad venues.
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Demo Bookings</div>
            <div className="text-2xl font-black text-speecat-navy mt-1">{bookings.length}</div>
            <div className="text-[11px] text-speecat-green font-medium mt-1">Active Slots</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Favorite Sport</div>
            <div className="text-2xl font-black text-speecat-navy mt-1">Badminton</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Gachibowli Area</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Demo Spend (₹)</div>
            <div className="text-2xl font-black text-speecat-green mt-1">
              ₹{bookings.reduce((acc, b) => acc + b.totalPrice, 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Simulation Only</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500">Member Status</div>
            <div className="text-2xl font-black text-purple-600 mt-1">Gold Demo</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Hyderabad Club</div>
          </div>
        </div>

        {/* Bookings List Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-speecat-green" />
              <h2 className="text-lg font-black text-speecat-navy">
                My Demo Bookings ({bookings.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Auto-synced from browser session</span>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {booking.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {booking.id}
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
                        {booking.timeSlot}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Court: <span className="font-semibold text-speecat-navy">{booking.courtName}</span>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Demo Fee</div>
                      <div className="text-base font-black text-speecat-green">
                        ₹{booking.totalPrice.toLocaleString("en-IN")}
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

                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Cancel Demo Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">No active demo bookings</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 bg-speecat-green text-speecat-navy font-bold text-xs px-4 py-2 rounded-xl"
              >
                <span>Find and Preview a Court</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Demo Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Demo Receipt
              </span>
              <h3 className="text-base font-black text-speecat-navy">{selectedReceipt.venueName}</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedReceipt.id}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <QrCode className="w-24 h-24 mx-auto text-speecat-navy" />
              <p className="text-[10px] text-slate-500 font-medium">
                Demo QR Code for Check-in verification
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
                <span className="font-bold">Total (Demo):</span>
                <span className="font-black text-speecat-green text-sm">₹{selectedReceipt.totalPrice}</span>
              </div>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl text-[10px] text-amber-900 font-medium text-center">
              Demo only — no booking has been made.
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full bg-speecat-navy text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
