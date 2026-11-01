"use client";

import React from "react";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Clock
} from "lucide-react";
import { Venue } from "@/types/venue";

interface VenueCardProps {
  venue: Venue;
  viewMode?: "grid" | "list";
}

export default function VenueCard({ venue, viewMode = "grid" }: VenueCardProps) {
  const isList = viewMode === "list";

  return (
    <div
      className={`bg-[#292D32] rounded-2xl border border-[#373C42] overflow-hidden venue-card-hover group flex flex-col ${
        isList ? "md:flex-row md:items-center" : ""
      }`}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden bg-[#17191C] ${
          isList ? "md:w-72 h-56 md:h-64 shrink-0" : "h-52 w-full"
        }`}
      >
        <img
          src={venue.featuredImage}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17191C]/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="bg-[#17191C]/95 backdrop-blur-md text-[#F5F5F2] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#373C42]">
            <span className="w-2 h-2 rounded-full bg-[#B7F34A]" />
            {venue.sport}
          </span>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md bg-[#17191C]/80 text-[#AEB4B0] border border-[#373C42]">
            {venue.environment}
          </span>
        </div>

        {/* Bottom Image Info: Locality */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-medium drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-[#B7F34A] shrink-0" />
            <span className="truncate">{venue.locality}, Hyd</span>
          </div>

          <div className="flex items-center gap-1 bg-[#17191C]/80 backdrop-blur-md border border-[#373C42] px-2 py-0.5 rounded-md text-[#B7F34A] font-bold">
            <Star className="w-3.5 h-3.5 fill-[#B7F34A] text-[#B7F34A]" />
            <span>{venue.rating.toFixed(1)}</span>
            <span className="text-[10px] text-[#AEB4B0] font-normal">({venue.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Verification indicator */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1 bg-[#17191C] text-[#B7F34A] border border-[#B7F34A]/30">
              <ShieldCheck className="w-3 h-3 text-[#B7F34A]" />
              {venue.verificationBadge}
            </span>

            <span className="text-[11px] text-[#AEB4B0] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#B7F34A]" />
              {venue.courtsCount} {venue.courtsCount > 1 ? "Courts" : "Court"}
            </span>
          </div>

          {/* Title */}
          <Link href={`/venue/${venue.slug}`}>
            <h3 className="font-bold text-base sm:text-lg text-[#F5F5F2] group-hover:text-[#B7F34A] transition-colors line-clamp-1">
              {venue.name}
            </h3>
          </Link>

          <p className="text-xs text-[#AEB4B0] line-clamp-2 mt-1 leading-relaxed">
            {venue.description}
          </p>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {venue.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-[10px] bg-[#17191C] text-[#AEB4B0] border border-[#373C42] px-2 py-0.5 rounded-md font-medium"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[10px] text-[#AEB4B0]/60 px-1 py-0.5">
                +{venue.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Price & CTA */}
        <div className="pt-3 border-t border-[#373C42] flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#AEB4B0] tracking-wider">
              Starting from
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#F5F5F2]">
              {venue.pricePerHour ? (
                <span className="text-[#B7F34A]">
                  ₹{venue.pricePerHour.toLocaleString("en-IN")}
                  <span className="text-xs text-[#AEB4B0] font-normal"> / hour</span>
                </span>
              ) : (
                <span className="text-xs text-[#AEB4B0] font-medium italic">
                  Price to be confirmed
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/venue/${venue.slug}`}
            className="inline-flex items-center gap-1.5 bg-[#17191C] group-hover:bg-[#B7F34A] text-[#F5F5F2] group-hover:text-[#17191C] border border-[#373C42] group-hover:border-[#B7F34A] text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
