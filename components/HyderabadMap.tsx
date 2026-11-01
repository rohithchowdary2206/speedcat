"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  ExternalLink, 
  Star, 
  ArrowRight, 
  Compass, 
  Layers,
  Sparkles
} from "lucide-react";
import { Venue } from "@/types/venue";

interface HyderabadMapProps {
  venues: Venue[];
  onSelectVenue?: (venue: Venue) => void;
}

export default function HyderabadMap({ venues, onSelectVenue }: HyderabadMapProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venues[0] || null);

  // Approximate Hyderabad Bounding Box for SVG rendering:
  // Lat: 17.32 (South - LB Nagar) to 17.52 (North - Miyapur/Kukatpally)
  // Lng: 78.32 (West - Gachibowli/Financial District) to 78.58 (East - Uppal/LB Nagar)
  const MIN_LAT = 17.32;
  const MAX_LAT = 17.52;
  const MIN_LNG = 78.32;
  const MAX_LNG = 78.58;

  const getCoordinates = (lat: number, lng: number) => {
    // Map to 0-100%
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    // Latitude inverted for SVG Y
    const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white relative shadow-xl">
      {/* Map Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#B7F34A] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#B7F34A]" />
            Interactive Hyderabad Sports Map Preview
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="bg-slate-800 px-2.5 py-1 rounded-full text-[#B7F34A] font-semibold">
            {venues.length} Venues Plotted
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click pins to preview details
          </span>
        </div>
      </div>

      {/* Map Canvas / Visualization */}
      <div className="relative w-full h-[420px] sm:h-[480px] bg-radial-gradient from-slate-900 via-slate-950 to-speecat-navy-950 overflow-hidden select-none p-4">
        
        {/* Subtle Map Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#34D399 1px, transparent 1px), radial-gradient(#64748b 1px, transparent 1px)`,
            backgroundSize: `40px 40px`,
            backgroundPosition: `0 0, 20px 20px`,
          }}
        />

        {/* Hyderabad Landmark Labels */}
        <div className="absolute left-6 top-10 text-[10px] uppercase font-black tracking-widest text-slate-700 pointer-events-none">
          North-West / Miyapur • Kukatpally
        </div>
        <div className="absolute left-6 bottom-10 text-[10px] uppercase font-black tracking-widest text-slate-700 pointer-events-none">
          IT Corridor / Gachibowli • Financial Dist
        </div>
        <div className="absolute right-6 top-10 text-[10px] uppercase font-black tracking-widest text-slate-700 pointer-events-none">
          Secunderabad • Begumpet
        </div>
        <div className="absolute right-6 bottom-10 text-[10px] uppercase font-black tracking-widest text-slate-700 pointer-events-none">
          East / Uppal • LB Nagar
        </div>

        {/* Outer Ring Road (ORR) simulated curve */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800/80 fill-none" strokeWidth="1.5" strokeDasharray="4 6">
          <ellipse cx="50%" cy="52%" rx="44%" ry="40%" />
        </svg>

        {/* Venue Markers */}
        {venues.map((venue) => {
          const { x, y } = getCoordinates(venue.coordinates.lat, venue.coordinates.lng);
          const isSelected = selectedVenue?.id === venue.id;

          return (
            <button
              key={venue.id}
              onClick={() => {
                setSelectedVenue(venue);
                if (onSelectVenue) onSelectVenue(venue);
              }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-20 ${
                isSelected ? "scale-125 z-30" : "hover:scale-115"
              }`}
              title={`${venue.name} (${venue.locality})`}
            >
              <div
                className={`relative flex items-center justify-center p-2 rounded-full transition-all shadow-lg ${
                  isSelected
                    ? "bg-[#B7F34A] text-[#F5F5F2] ring-4 ring-emerald-400/40"
                    : "bg-slate-800 text-white hover:bg-[#B7F34A] hover:text-[#F5F5F2] border border-slate-700"
                }`}
              >
                <MapPin className="w-4 h-4 fill-current" />
              </div>

              {/* Pin tooltip / label */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xl border border-slate-700 pointer-events-none transition-all ${
                  isSelected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <span>{venue.name.split(" ")[0]}</span>
                <span className="text-[#B7F34A] ml-1">
                  {venue.pricePerHour ? `₹${venue.pricePerHour}` : ""}
                </span>
              </div>
            </button>
          );
        })}

        {/* Selected Venue Floating Preview Card */}
        {selectedVenue && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-3">
              <img
                src={selectedVenue.featuredImage}
                alt={selectedVenue.name}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-[#B7F34A] uppercase">
                    {selectedVenue.sport}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{selectedVenue.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {selectedVenue.name}
                </h4>

                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#B7F34A] shrink-0" />
                  {selectedVenue.locality}, Hyderabad
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Rate: </span>
                <span className="font-bold text-[#B7F34A]">
                  {selectedVenue.pricePerHour ? `₹${selectedVenue.pricePerHour}/hr` : "TBC"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedVenue.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Map</span>
                </a>

                <Link
                  href={`/venue/${selectedVenue.slug}`}
                  className="bg-[#B7F34A] hover:bg-[#B7F34A]-600 text-[#F5F5F2] font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Book Demo</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
