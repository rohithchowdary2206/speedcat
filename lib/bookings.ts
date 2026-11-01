import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { CourtBooking } from "@/types/venue";
import { groupBookings, mapBooking } from "@/lib/mappers";
import { getConsecutiveSlots } from "@/lib/slots";

export async function fetchOccupiedSlots(courtId: string, date: string): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("time_slot")
    .eq("court_id", courtId)
    .eq("booking_date", date)
    .eq("status", "confirmed");
  if (error) throw new Error(error.message);
  return new Set((data || []).map((row) => row.time_slot as string));
}

export async function bookCourt(params: {
  courtId: string;
  venueId: string;
  venueName: string;
  sport: string;
  locality: string;
  courtName: string;
  date: string;
  startSlot: string;
  durationHours: number;
  courtPrice: number;
  playerName: string;
  playerPhone: string;
  playerEmail: string;
}) {
  const slots = getConsecutiveSlots(params.startSlot, params.durationHours);
  const supabase = createClient();
  const { data, error } = await supabase.rpc("book_court", {
    p_court_id: params.courtId,
    p_venue_id: params.venueId,
    p_venue_name: params.venueName,
    p_sport: params.sport,
    p_locality: params.locality,
    p_court_name: params.courtName,
    p_date: params.date,
    p_slots: slots,
    p_duration_hours: params.durationHours,
    p_court_price: params.courtPrice,
    p_player_name: params.playerName,
    p_player_phone: params.playerPhone,
    p_player_email: params.playerEmail,
  });
  if (error) throw new Error(error.message);
  return data as { group_id: string; reference_code: string; total_price: number; status: string };
}

export async function fetchMyBookings(userId: string): Promise<CourtBooking[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return groupBookings((data || []).map(mapBooking));
}

export async function fetchVenueBookings(venueId: string, date?: string): Promise<CourtBooking[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  let query = supabase.from("bookings").select("*").eq("venue_id", venueId).eq("status", "confirmed");
  if (date) query = query.eq("booking_date", date);
  const { data, error } = await query.order("time_slot");
  if (error) throw new Error(error.message);
  return groupBookings((data || []).map(mapBooking));
}

export async function cancelBookingGroup(groupId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_group_id: groupId });
  if (error) throw new Error(error.message);
}
