"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Sparkles,
  MapPin,
  Check
} from "lucide-react";
import VenueCard from "@/components/VenueCard";
import HyderabadMap from "@/components/HyderabadMap";
import { getVenues, HYDERABAD_LOCALITIES } from "@/lib/venues";
import { Venue, SportType, HyderabadLocality } from "@/types/venue";

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

const ALL_AMENITIES = [
  "Parking",
  "Floodlights",
  "Changing Rooms",
  "Showers",
  "Air Conditioned",
  "Equipment Rental",
  "Drinking Water",
  "Pro Shop",
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const allVenues = useMemo(() => getVenues(), []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [selectedLocality, setSelectedLocality] = useState<string>("All");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("All"); // All, Indoor, Outdoor, Both
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [onlyVerifiedPrice, setOnlyVerifiedPrice] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("recommended"); // recommended, price-asc, price-desc, rating, name
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync initial params from URL
  useEffect(() => {
    const sportParam = searchParams.get("sport");
    const locParam = searchParams.get("locality");
    const viewParam = searchParams.get("view");
    const qParam = searchParams.get("q");

    if (sportParam) setSelectedSport(sportParam);
    if (locParam) setSelectedLocality(locParam);
    if (viewParam === "map" || viewParam === "list") setViewMode(viewParam);
    if (qParam) setSearchTerm(qParam);
  }, [searchParams]);

  // Toggle amenity
  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSport("All");
    setSelectedLocality("All");
    setSelectedEnvironment("All");
    setSelectedAmenities([]);
    setMaxPrice(1500);
    setOnlyVerifiedPrice(false);
    setSortBy("recommended");
  };

  // Filter & Sort Logic
  const filteredVenues = useMemo(() => {
    return allVenues
      .filter((v) => {
        // Search by name, sport, address, locality
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = v.name.toLowerCase().includes(term);
          const matchSport = v.sport.toLowerCase().includes(term);
          const matchLoc = v.locality.toLowerCase().includes(term);
          const matchAddr = v.address.toLowerCase().includes(term);
          if (!matchName && !matchSport && !matchLoc && !matchAddr) return false;
        }

        // Sport filter
        if (selectedSport !== "All") {
          const matchSport =
            v.sport.toLowerCase() === selectedSport.toLowerCase() ||
            v.sportsAvailable?.some((s) => s.toLowerCase() === selectedSport.toLowerCase());
          if (!matchSport) return false;
        }

        // Locality filter
        if (selectedLocality !== "All") {
          if (v.locality.toLowerCase() !== selectedLocality.toLowerCase()) return false;
        }

        // Environment filter (Indoor/Outdoor)
        if (selectedEnvironment !== "All") {
          if (v.environment !== selectedEnvironment && v.environment !== "Both") return false;
        }

        // Only verified price
        if (onlyVerifiedPrice && !v.isPriceVerified) {
          return false;
        }

        // Price range filter
        if (v.pricePerHour !== null && v.pricePerHour > maxPrice) {
          return false;
        }

        // Amenities filter (must contain all selected)
        if (selectedAmenities.length > 0) {
          const hasAll = selectedAmenities.every((amenity) =>
            v.amenities?.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
          );
          if (!hasAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          const priceA = a.pricePerHour ?? 999999;
          const priceB = b.pricePerHour ?? 999999;
          return priceA - priceB;
        }
        if (sortBy === "price-desc") {
          const priceA = a.pricePerHour ?? -1;
          const priceB = b.pricePerHour ?? -1;
          return priceB - priceA;
        }
        if (sortBy === "rating") {
          return b.rating - a.rating;
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        // Recommended / default: featured first, then rating
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
      });
  }, [
    allVenues,
    searchTerm,
    selectedSport,
    selectedLocality,
    selectedEnvironment,
    onlyVerifiedPrice,
    maxPrice,
    selectedAmenities,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedSport !== "All" ? 1 : 0) +
    (selectedLocality !== "All" ? 1 : 0) +
    (selectedEnvironment !== "All" ? 1 : 0) +
    (onlyVerifiedPrice ? 1 : 0) +
    (maxPrice < 1500 ? 1 : 0) +
    selectedAmenities.length +
    (searchTerm ? 1 : 0);

  return (
    <div className="bg-[#17191C] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Heading & Search Bar */}
        <div className="bg-[#292D32] rounded-2xl border border-[#373C42]/90 p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F2]">
                  Explore Hyderabad Sports Venues
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {filteredVenues.length} {filteredVenues.length === 1 ? "Venue" : "Venues"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Filter by sport, locality, indoor/outdoor surface, and hourly rates in ₹
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-[#F5F5F2] shadow-xs"
                    : "text-slate-600 hover:text-[#F5F5F2]"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-white text-[#F5F5F2] shadow-xs"
                    : "text-slate-600 hover:text-[#F5F5F2]"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>

              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "map"
                    ? "bg-white text-[#F5F5F2] shadow-xs"
                    : "text-slate-600 hover:text-[#F5F5F2]"
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4 text-[#B7F34A]" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by venue name, locality (e.g. Gachibowli, Madhapur), or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F5F5F2] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-speecat-green focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Layout: Sidebar Filters + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#F5F5F2]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#B7F34A]" />
              <span>Filters ({activeFiltersCount})</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Filters Sidebar */}
          <aside
            className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6 ${
              mobileFilterOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#B7F34A]" />
                <h3 className="text-sm font-extrabold text-[#F5F5F2] uppercase tracking-wider">
                  Filter Venues
                </h3>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Sport Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F5F5F2]">Sport Category</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              >
                <option value="All">All Sports</option>
                {ALL_SPORTS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F5F5F2]">Locality (Hyderabad)</label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green"
              >
                <option value="All">All Localities</option>
                {HYDERABAD_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Indoor / Outdoor Environment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F5F5F2]">Surface / Environment</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["All", "Indoor", "Outdoor"].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setSelectedEnvironment(env)}
                    className={`text-xs py-1.5 px-2 rounded-lg font-bold border transition-all ${
                      selectedEnvironment === env
                        ? "bg-speecat-navy text-white border-speecat-navy shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F5F5F2]">Max Hourly Price</span>
                <span className="font-extrabold text-[#B7F34A]">
                  Up to ₹{maxPrice.toLocaleString("en-IN")}/hr
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-speecat-green cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>₹200/hr</span>
                <span>₹1,500/hr</span>
              </div>
            </div>

            {/* Verified Price Only Checkbox */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-[#F5F5F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyVerifiedPrice}
                  onChange={(e) => setOnlyVerifiedPrice(e.target.checked)}
                  className="rounded text-[#B7F34A] focus:ring-speecat-green w-4 h-4 accent-speecat-green"
                />
                <span className="font-medium">Show only venues with verified pricing</span>
              </label>
            </div>

            {/* Amenities Multi-Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-[#F5F5F2]">Amenities & Facilities</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {ALL_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-[#F5F5F2] cursor-pointer py-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="rounded text-[#B7F34A] focus:ring-speecat-green w-3.5 h-3.5 accent-speecat-green"
                        />
                        <span>{amenity}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* Main Results Column */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Sorting & Filter Summary Bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing <span className="font-bold text-[#F5F5F2]">{filteredVenues.length}</span> sports venues in Hyderabad
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-speecat-green cursor-pointer"
                >
                  <option value="recommended">Featured / Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Ratings</option>
                  <option value="name">Alphabetical (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Display Mode: Map View */}
            {viewMode === "map" && (
              <div className="space-y-4">
                <HyderabadMap venues={filteredVenues} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVenues.slice(0, 4).map((venue) => (
                    <VenueCard key={venue.id} venue={venue} viewMode="grid" />
                  ))}
                </div>
              </div>
            )}

            {/* Display Mode: Grid View */}
            {viewMode === "grid" && (
              <div>
                {filteredVenues.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredVenues.map((venue) => (
                      <VenueCard key={venue.id} venue={venue} viewMode="grid" />
                    ))}
                  </div>
                ) : (
                  <EmptyState onReset={handleResetFilters} />
                )}
              </div>
            )}

            {/* Display Mode: List View */}
            {viewMode === "list" && (
              <div>
                {filteredVenues.length > 0 ? (
                  <div className="space-y-4">
                    {filteredVenues.map((venue) => (
                      <VenueCard key={venue.id} venue={venue} viewMode="list" />
                    ))}
                  </div>
                ) : (
                  <EmptyState onReset={handleResetFilters} />
                )}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-12 text-center space-y-4 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
        <Search className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[#F5F5F2]">No Hyderabad venues match your filters</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try expanding your price range, clearing some selected amenities, or choosing "All Sports".
        </p>
      </div>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 bg-speecat-navy text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#B7F34A] hover:text-[#F5F5F2] transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset All Filters</span>
      </button>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading Hyderabad venue directory...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
