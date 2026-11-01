export type SportType =
  | "Badminton"
  | "Football"
  | "Cricket"
  | "Tennis"
  | "Pickleball"
  | "Basketball"
  | "Table Tennis"
  | "Swimming"
  | "Multi-Sport";

export type HyderabadLocality =
  | "Gachibowli"
  | "Kondapur"
  | "Madhapur"
  | "Hitech City"
  | "Kukatpally"
  | "Miyapur"
  | "Manikonda"
  | "Jubilee Hills"
  | "Banjara Hills"
  | "Secunderabad"
  | "Uppal"
  | "LB Nagar"
  | "Financial District";

export interface VenueCourt {
  id: string;
  name: string;
  type: string; // e.g. "Synthetic Court", "Wooden Flooring", "AstroTurf 5v5", "Clay Court"
  surface: string;
  pricePerHour: number | null; // null means "Price/details to be confirmed"
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  sport: SportType;
  sportsAvailable: SportType[];
  locality: HyderabadLocality;
  city: "Hyderabad";
  address: string;
  mapQuery: string;
  mapLink: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pricePerHour: number | null; // in INR (₹)
  isPriceVerified: boolean;
  priceNote?: string;
  rating: number; // e.g. 4.8
  reviewCount: number;
  environment: "Indoor" | "Outdoor" | "Both";
  images: string[];
  featuredImage: string;
  amenities: string[];
  openingHours: string;
  isOpenVerified: boolean;
  courtsCount: number;
  courts: VenueCourt[];
  description: string;
  rules: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  verificationBadge: "Verified Public Listing" | "Preview Listing";
}

export interface BookingDemo {
  id: string;
  venueId: string;
  venueName: string;
  sport: SportType;
  locality: string;
  courtName: string;
  date: string;
  timeSlot: string;
  durationHours: number;
  courtPrice: number;
  platformFee: number;
  taxes: number;
  totalPrice: number;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  status: "Confirmed (Demo)" | "Cancelled (Demo)" | "Confirmed" | "Cancelled";
  createdAt: string;
  isDemoNotice?: string;
}

export interface CourtBooking {
  id: string;
  groupId: string;
  venueId: string;
  venueName: string;
  sport: SportType;
  locality: string;
  courtName: string;
  courtId: string;
  date: string;
  timeSlot: string;
  durationHours: number;
  courtPrice: number;
  platformFee: number;
  taxes: number;
  totalPrice: number;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  status: "Confirmed" | "Cancelled";
  createdAt: string;
  userId: string;
}
