"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  QrCode,
  Tag,
  Repeat
} from "lucide-react";
import { ClubEvent, EventRegistration } from "@/types/club";
import { getCurrentUser } from "@/lib/community";
import { getRegistrationsForEvent, registerForEvent } from "@/lib/clubs";

interface ClubEventCardProps {
  event: ClubEvent;
  onRegistered?: () => void;
  showClubName?: boolean;
}

export default function ClubEventCard({ event, onRegistered, showClubName = true }: ClubEventCardProps) {
  const currentUser = getCurrentUser();
  const [registrations, setRegistrations] = useState(() => getRegistrationsForEvent(event.id));
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [justRegistered, setJustRegistered] = useState<EventRegistration | null>(null);

  const isUserRegistered = registrations.some(
    (r) => r.playerId === currentUser?.id && r.status !== "cancelled"
  );
  const userRegistration = registrations.find(
    (r) => r.playerId === currentUser?.id && r.status !== "cancelled"
  );

  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in with a demo persona to register.");
      return;
    }

    try {
      const reg = registerForEvent({
        eventId: event.id,
        playerId: currentUser.id,
        playerName: currentUser.name,
        playerEmail: "player.demo@speedcat.hyd",
        playerPhone: "+91 98765 43210",
      });

      setJustRegistered(reg);
      setRegistrations(getRegistrationsForEvent(event.id));
      if (onRegistered) onRegistered();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-[#292D32] rounded-3xl border border-[#373C42]/90 hover:border-slate-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      
      {/* Top Banner & Date */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {showClubName && (
            <Link
              href={`/clubs/${event.clubSlug}`}
              className="text-xs font-black text-[#B7F34A] hover:underline truncate"
            >
              {event.clubName}
            </Link>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {event.isRecurring && (
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {event.recurrencePattern ? "Weekly" : "Recurring"}
              </span>
            )}

            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                event.price === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-900 text-white"
              }`}
            >
              {event.price === 0 ? "FREE" : `₹${event.price}`}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-[#F5F5F2] group-hover:text-[#B7F34A] transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Locality & Address */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#B7F34A] shrink-0" />
          <span className="truncate">{event.venueName} • {event.locality}, Hyd</span>
        </div>
      </div>

      {/* Schedule & Description */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-700 font-semibold">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#B7F34A]" />
            <span>{event.date}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#B7F34A]" />
            <span>{event.time}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Spots Left Bar */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-[#F5F5F2]">
              {event.registeredCount}/{event.capacity} Registered
            </span>
          </div>

          <span className="text-[11px] font-semibold text-emerald-700">
            {spotsLeft > 0 ? `${spotsLeft} spots open` : "Event Full"}
          </span>
        </div>
      </div>

      {/* Action / Registration Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {isUserRegistered ? (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
              <span>Registered (QR Confirmed)</span>
            </span>

            {userRegistration && (
              <button
                type="button"
                onClick={() => setJustRegistered(userRegistration)}
                className="text-xs text-[#F5F5F2] font-bold hover:underline flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>View Ticket</span>
              </button>
            )}
          </div>
        ) : spotsLeft === 0 ? (
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl w-full text-center">
            Event at Full Capacity
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowCheckoutModal(true)}
            className="w-full bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-black text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{event.price === 0 ? "Register Free" : `Reserve Ticket (₹${event.price})`}</span>
          </button>
        )}
      </div>

      {/* CHECKOUT / REGISTRATION MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-[#F5F5F2]">
                Event Registration (Demo)
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-extrabold text-sm text-[#F5F5F2]">{event.title}</div>
                <div className="text-slate-500 font-medium">
                  {event.clubName} • {event.date} • {event.time}
                </div>
                <div className="text-slate-500">{event.venueName}, {event.locality}</div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Ticket Price:</span>
                  <span className="font-bold text-[#F5F5F2]">
                    {event.price === 0 ? "FREE (₹0)" : `₹${event.price}`}
                  </span>
                </div>

                {event.price > 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>ATHLETIQ Platform Fee (5%):</span>
                    <span>₹{Math.round(event.price * 0.05)} (Included in price)</span>
                  </div>
                )}

                <div className="pt-2 border-t border-emerald-200/60 flex justify-between font-black text-sm text-[#F5F5F2]">
                  <span>Total Due (INR):</span>
                  <span className="text-[#B7F34A] text-base">
                    {event.price === 0 ? "₹0.00" : `₹${event.price}`}
                  </span>
                </div>
              </div>

              {/* Demo Mode Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 font-medium">
                Demo Booking Mode — No real payment gateway is contacted. Your registration and check-in QR code will be generated instantly.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setShowCheckoutModal(false);
                  handleRegister(e);
                }}
                className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] text-xs font-black px-5 py-2.5 rounded-xl shadow-xs"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR TICKET VIEW MODAL */}
      {justRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#292D32] rounded-3xl border border-[#373C42] max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ATHLETIQ Event Pass
            </span>

            <div className="space-y-1">
              <h3 className="text-base font-black text-[#F5F5F2]">{event.title}</h3>
              <p className="text-xs text-slate-500">{event.date} • {event.time}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-28 h-28 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center p-2 shadow-xs">
                <QrCode className="w-20 h-20 text-[#F5F5F2]" />
              </div>
              <p className="font-mono text-xs font-bold text-[#F5F5F2]">{justRegistered.qrCode}</p>
              <p className="text-[10px] text-slate-400">
                Present this QR code to the club organiser for session check-in
              </p>
            </div>

            <div className="text-left text-xs space-y-1 bg-slate-50 p-3 rounded-xl text-slate-600">
              <div className="flex justify-between">
                <span>Attendee:</span>
                <span className="font-bold text-[#F5F5F2]">{justRegistered.playerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{justRegistered.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Price:</span>
                <span className="font-bold text-[#F5F5F2]">
                  {justRegistered.ticketPrice === 0 ? "FREE" : `₹${justRegistered.ticketPrice}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setJustRegistered(null)}
              className="w-full bg-speecat-navy hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
            >
              Close Ticket
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
