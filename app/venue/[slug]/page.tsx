"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  IndianRupee, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  Share2, 
  Heart,
  Info,
  QrCode,
  X
} from "lucide-react";
import { getVenueBySlug, getVenues } from "@/lib/venues";
import { VenueCourt } from "@/types/venue";
import VenueCard from "@/components/VenueCard";
import { useAuth } from "@/components/AuthProvider";
import { bookCourt, fetchOccupiedSlots } from "@/lib/bookings";
import { COURT_TIME_SLOTS } from "@/lib/slots";

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const slug = params?.slug as string;

  const venue = useMemo(() => getVenueBySlug(slug), [slug]);
  const allVenues = useMemo(() => getVenues(), []);

  // UI States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState<VenueCourt | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>("07:00 PM - 08:00 PM");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [playerName, setPlayerName] = useState("");
  const [playerPhone, setPlayerPhone] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [demoBookingRef, setDemoBookingRef] = useState<string>("");

  // Initialize court if not selected
  React.useEffect(() => {
    if (venue && venue.courts && venue.courts.length > 0 && !selectedCourt) {
      setSelectedCourt(venue.courts[0]);
    }
  }, [venue, selectedCourt]);

  React.useEffect(() => {
    if (profile) {
      setPlayerName(profile.name);
      setPlayerPhone(profile.phone || "");
    }
  }, [profile]);

  const loadOccupied = React.useCallback(async () => {
    if (!selectedCourt) return;
    try {
      const occupied = await fetchOccupiedSlots(selectedCourt.id, selectedDate);
      setOccupiedSlots(occupied);
      if (occupied.has(selectedSlot)) {
        const nextOpen = COURT_TIME_SLOTS.find((slot) => !occupied.has(slot.time));
        if (nextOpen) setSelectedSlot(nextOpen.time);
      }
    } catch {
      setOccupiedSlots(new Set());
    }
  }, [selectedCourt, selectedDate, selectedSlot]);

  React.useEffect(() => {
    void loadOccupied();
    const onChange = () => {
      void loadOccupied();
    };
    window.addEventListener("speedcat_bookings_changed", onChange);
    return () => window.removeEventListener("speedcat_bookings_changed", onChange);
  }, [loadOccupied]);

  if (!venue) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-speecat-navy">Venue Not Found</h2>
        <p className="text-slate-500 text-sm max-w-md">
          The requested Hyderabad sports listing could not be found in the current directory.
        </p>
        <Link
          href="/explore"
          className="bg-speecat-green text-white font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  // Similar venues in same locality or sport
  const similarVenues = allVenues
    .filter((v) => v.id !== venue.id && (v.sport === venue.sport || v.locality === venue.locality))
    .slice(0, 3);

  const sampleTimeSlots = COURT_TIME_SLOTS.map((slot) => ({
    ...slot,
    discount: slot.category === "Prime Time" ? "Popular" : null,
  }));

  // Pricing calculations
  const hourlyRate = selectedCourt?.pricePerHour ?? venue.pricePerHour ?? 500;
  const courtTotal = hourlyRate * durationHours;
  const platformFee = 0; // ₹0 Demo fee
  const taxes = 0; // ₹0 Demo tax
  const grandTotal = courtTotal + platformFee + taxes;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!selectedCourt) {
      setBookingError("Please select a court first.");
      return;
    }

    if (occupiedSlots.has(selectedSlot)) {
      setBookingError("This time slot is already booked by another player. Please select an available slot.");
      return;
    }

    setBookingBusy(true);
    try {
      const res = await bookCourt({
        courtId: selectedCourt.id,
        venueId: venue.id,
        venueName: venue.name,
        sport: venue.sport,
        locality: venue.locality,
        courtName: selectedCourt.name,
        date: selectedDate,
        startSlot: selectedSlot,
        durationHours,
        courtPrice: hourlyRate,
        playerName: playerName || profile?.name || "ATHLETIQ Player",
        playerPhone: playerPhone || profile?.phone || "",
        playerEmail: user.email || "",
      });

      setDemoBookingRef(res.reference_code);
      setShowConfirmModal(true);
      void loadOccupied();
    } catch (err: any) {
      setBookingError(err.message || "Failed to book court. Please try another slot.");
    } finally {
      setBookingBusy(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-speecat-green transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hyderabad Venues</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-slate-200 text-slate-600 hover:text-rose-500"
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-speecat-navy text-white text-xs font-bold px-3 py-1 rounded-full">
                  {venue.sport}
                </span>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                    venue.verificationBadge === "Verified Public Listing"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-speecat-green" />
                  {venue.verificationBadge}
                </span>

                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
                  {venue.environment} Venue
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-speecat-navy">
                {venue.name}
              </h1>

              {/* Locality & Address */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-speecat-green shrink-0" />
                  <span>{venue.address}</span>
                </div>

                <a
                  href={venue.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-speecat-green font-bold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Rating & Pricing Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-900 font-extrabold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{venue.rating.toFixed(1)}</span>
                <span className="text-xs text-amber-700/80 font-normal">
                  ({venue.reviewCount} reviews)
                </span>
              </div>

              <div className="text-right mt-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Hourly Rate</div>
                <div className="text-xl sm:text-2xl font-black text-speecat-green">
                  {venue.pricePerHour ? (
                    `₹${venue.pricePerHour.toLocaleString("en-IN")}/hr`
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">
                      Price to be confirmed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery & Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2 Cols): Gallery, Courts, Amenities, Description, Rules */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={venue.images[selectedImageIndex] || venue.featuredImage}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  Photo {selectedImageIndex + 1} of {venue.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {venue.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {venue.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-speecat-green ring-2 ring-speecat-green/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About & Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-speecat-navy">
                About this Hyderabad Facility
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {venue.description}
              </p>
              {venue.priceNote && (
                <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="font-bold text-speecat-navy">Pricing note: </span>
                  {venue.priceNote}
                </div>
              )}
            </div>

            {/* Courts / Pitch Options */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-speecat-navy">
                  Available Courts & Surfaces ({venue.courtsCount})
                </h2>
                <span className="text-xs text-slate-400 font-medium">Click to select for demo booking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {venue.courts.map((court) => {
                  const isSelected = selectedCourt?.id === court.id;
                  return (
                    <div
                      key={court.id}
                      onClick={() => setSelectedCourt(court)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-speecat-green bg-emerald-50/40 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-speecat-navy">{court.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-speecat-green" />}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Surface: {court.surface}</div>
                      <div className="text-xs font-extrabold text-speecat-green mt-2">
                        {court.pricePerHour ? `₹${court.pricePerHour}/hr` : "Price to be confirmed"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-speecat-navy">
                Amenities & Facilities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-speecat-green shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timings & House Rules */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-speecat-navy">
                Opening Hours & Venue Rules
              </h2>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-speecat-navy bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Clock className="w-4 h-4 text-speecat-green shrink-0" />
                <span>Operating Schedule: {venue.openingHours}</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                {venue.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-speecat-green mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column (1 Col): Demo Booking Interface Preview */}
          <div className="lg:col-span-1 space-y-4 sticky top-24">
            
            {/* Booking Card */}
            <div className="bg-white rounded-2xl border-2 border-speecat-green/30 p-5 shadow-lg shadow-emerald-500/5 space-y-5">
              
              {/* Mandatory Demo Notice */}
              {/* Real-time Availability Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="w-4 h-4 text-speecat-green shrink-0" />
                  <span>Real-Time Court Booking</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800/90 font-medium">
                  Live availability powered by Supabase Realtime. Pick an open slot and confirm immediately.
                </p>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                
                {/* Selected Court Display */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-speecat-navy">Selected Court / Pitch</label>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-speecat-navy flex items-center justify-between">
                    <span>{selectedCourt?.name || venue.courts[0]?.name || "Standard Court"}</span>
                    <span className="text-speecat-green">
                      ₹{hourlyRate}/hr
                    </span>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-speecat-navy flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-speecat-green" />
                    <span>Select Date</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-speecat-navy focus:outline-none focus:ring-2 focus:ring-speecat-green"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-speecat-navy flex items-center justify-between">
                    <span>Duration</span>
                    <span className="text-speecat-green font-bold">{durationHours} Hour{durationHours > 1 ? "s" : ""}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDurationHours(hrs)}
                        className={`text-xs py-1.5 font-bold rounded-lg border transition-all ${
                          durationHours === hrs
                            ? "bg-speecat-navy text-white border-speecat-navy"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {hrs} hr{hrs > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-speecat-navy flex items-center justify-between">
                    <span>Time Slots</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {occupiedSlots.size > 0 ? `${occupiedSlots.size} booked today` : "All slots available"}
                    </span>
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {sampleTimeSlots.map((slot) => {
                      const isOccupied = occupiedSlots.has(slot.time);
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => {
                            if (!isOccupied) setSelectedSlot(slot.time);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                            isOccupied
                              ? "bg-rose-50/60 border-rose-200 text-slate-400 cursor-not-allowed opacity-75"
                              : isSelected
                              ? "bg-emerald-50 border-speecat-green text-speecat-navy shadow-xs"
                              : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isOccupied ? "text-rose-400" : "text-speecat-green"}`} />
                            <span className={isOccupied ? "line-through text-slate-400" : ""}>{slot.time}</span>
                          </span>
                          {isOccupied ? (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                              Booked
                            </span>
                          ) : slot.discount ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              {slot.discount}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Player Info Form */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Player Contact Details
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Player Name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-speecat-navy"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Mobile Number (e.g. +91 98765 43210)"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-speecat-navy"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Court Fee ({durationHours} hr x ₹{hourlyRate})</span>
                    <span className="font-semibold text-speecat-navy">₹{courtTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ATHLETIQ Platform Fee</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & GST</span>
                    <span className="text-emerald-700 font-semibold">Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-speecat-navy">
                    <span>Total Amount (INR)</span>
                    <span className="text-base text-speecat-green">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {bookingError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={bookingBusy || occupiedSlots.has(selectedSlot)}
                  className="w-full bg-speecat-green hover:bg-speecat-green-600 text-speecat-navy font-black text-sm py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>
                    {bookingBusy
                      ? "Confirming Court Booking..."
                      : occupiedSlots.has(selectedSlot)
                      ? "Selected Slot is Already Booked"
                      : "Book Court Now"}
                  </span>
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Instant live reservation saved to your ATHLETIQ account.
                </p>
              </form>
            </div>

          </div>

        </div>

        {/* Similar Hyderabad Venues */}
        {similarVenues.length > 0 && (
          <div className="pt-10 border-t border-slate-200 space-y-5">
            <div>
              <h3 className="text-xl font-black text-speecat-navy">
                Similar Venues in Hyderabad
              </h3>
              <p className="text-xs text-slate-500">
                Explore alternative sports facilities in {venue.locality} or nearby zones
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarVenues.map((v) => (
                <VenueCard key={v.id} venue={v} viewMode="grid" />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-speecat-navy text-white p-6 relative">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 bg-speecat-green/20 text-speecat-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-speecat-green" />
                <span>Confirmed Reservation</span>
              </div>

              <h3 className="text-xl font-black text-white">
                Court Booked Successfully!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Booking Reference ID: <span className="font-mono text-speecat-green font-bold">{demoBookingRef}</span>
              </p>
            </div>

            {/* Confirmed Banner */}
            <div className="bg-emerald-50 border-y border-emerald-200 px-5 py-3 text-xs text-emerald-900 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time booking confirmed in Supabase database.</span>
            </div>

            {/* Booking Details Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Venue:</span>
                  <span className="font-bold text-speecat-navy text-right">{venue.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Court / Surface:</span>
                  <span className="font-semibold text-speecat-navy">{selectedCourt?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-semibold text-speecat-navy">{selectedDate} • {selectedSlot} ({durationHours} hr)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Player:</span>
                  <span className="font-semibold text-speecat-navy">{playerName} ({playerPhone})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Price:</span>
                  <span className="font-black text-speecat-green text-sm">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* QR Code Entry Pass */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                <div className="w-20 h-20 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center p-2 shadow-xs">
                  <QrCode className="w-16 h-16 text-speecat-navy" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Entry Pass: Show this at reception upon arrival
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    router.push("/dashboard/player");
                  }}
                  className="flex-1 bg-speecat-navy hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-colors text-center"
                >
                  View in Player Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
