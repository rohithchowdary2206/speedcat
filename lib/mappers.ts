import {
  ChatMessage,
  CommunityGame,
  Friendship,
  GameParticipant,
  JoinRequest,
  PlayerProfile,
  PostGameRatingSubmission,
  SpeecatNotification,
} from "@/types/community";
import { CourtBooking } from "@/types/venue";
import { SportType } from "@/types/venue";

export function mapProfile(row: any): PlayerProfile {
  return {
    id: row.id,
    name: row.full_name || "Speedcat Player",
    avatar:
      row.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name || "Player")}&background=0f172a&color=10b981`,
    bio: row.bio || "",
    city: "Hyderabad",
    locality: row.locality || "Gachibowli",
    favoriteSports: (row.favorite_sports || []) as SportType[],
    sportSkills: row.sport_skills || {},
    sportsmanship: row.sportsmanship || {
      overallScore: 5,
      totalReviews: 0,
      punctuality: 5,
      teamwork: 5,
      fairPlay: 5,
      communication: 5,
      reliability: 5,
    },
    gamesPlayed: row.games_played || 0,
    gamesHosted: row.games_hosted || 0,
    friendsCount: row.friends_count || 0,
    availability: row.availability || { weekdays: [], weekends: [] },
    isPublic: row.is_public !== false,
    contactPrivacy: row.contact_privacy || "friends_only",
    createdAt: row.created_at,
    email: row.email || "",
    phone: row.phone || "",
    role: row.role || "player",
  };
}

export function mapGame(
  row: any,
  participants: GameParticipant[] = [],
  joinRequests: JoinRequest[] = []
): CommunityGame {
  return {
    id: row.id,
    sport: row.sport,
    title: row.title,
    description: row.description || "",
    matchFormat: row.match_format,
    venueId: row.venue_id || undefined,
    venueName: row.venue_name,
    locality: row.locality,
    venueAddress: row.venue_address || "",
    isVenueConfirmed: row.is_venue_confirmed !== false,
    courtName: row.court_name || undefined,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    durationHours: Number(row.duration_hours || 1),
    joiningDeadline: row.joining_deadline || `${row.date}T18:00:00`,
    playersNeeded: row.players_needed,
    maxGroupSize: row.max_group_size,
    participants,
    joinRequests,
    skillRequirement: row.skill_requirement || { type: "open", displayText: "Open to All Skill Levels" },
    hostId: row.host_id,
    hostName: row.host_name,
    hostAvatar: row.host_avatar || "",
    costPerPlayer: row.cost_per_player === null ? null : Number(row.cost_per_player),
    isSplitCost: row.is_split_cost !== false,
    equipmentNotes: row.equipment_notes || undefined,
    visibility: row.visibility || "public",
    rules: row.rules || [],
    status: row.status,
    attendanceConfirmed: !!row.attendance_confirmed,
    actualAttendees: (row.actual_attendees || []).map(String),
    cancellationReason: row.cancellation_reason || undefined,
    createdAt: row.created_at,
  };
}

export function mapParticipant(row: any, profile?: PlayerProfile | null): GameParticipant {
  return {
    playerId: row.player_id,
    name: profile?.name || "Player",
    avatar: profile?.avatar || "",
    sportSkill: row.sport_skill || "Intermediate",
    role: row.role || "player",
    joinedAt: row.joined_at,
    attended: row.attended ?? undefined,
  };
}

export function mapJoinRequest(row: any, profile?: PlayerProfile | null): JoinRequest {
  return {
    playerId: row.player_id,
    name: profile?.name || "Player",
    avatar: profile?.avatar || "",
    sportSkill: row.sport_skill || "Intermediate",
    note: row.note || undefined,
    requestedAt: row.requested_at,
    status: row.status,
  };
}

export function mapFriendship(row: any): Friendship {
  return {
    id: row.id,
    playerId1: row.requester_id,
    playerId2: row.addressee_id,
    connectedAt: row.responded_at || row.created_at,
    connectedViaGameId: row.connected_via_game_id || "",
    gamesPlayedTogether: row.games_played_together || 0,
    lastGameDate: row.last_game_date || "",
    status: row.status,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
  };
}

export function mapNotification(row: any): SpeecatNotification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    title: row.title,
    message: row.message,
    type: row.type,
    link: row.link || "/",
    read: !!row.read,
    createdAt: row.created_at,
  };
}

export function mapMessage(row: any): ChatMessage {
  return {
    id: row.id,
    gameId: row.game_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar || "",
    content: row.content,
    timestamp: row.created_at,
    isSystem: !!row.is_system,
    isAnnouncement: !!row.is_announcement,
  };
}

export function mapRating(row: any): PostGameRatingSubmission {
  return {
    id: row.id,
    gameId: row.game_id,
    sport: row.sport,
    raterPlayerId: row.rater_id,
    ratedPlayerId: row.rated_id,
    skillLevel: row.skill_level,
    punctuality: row.punctuality,
    teamwork: row.teamwork,
    fairPlay: row.fair_play,
    reliability: row.reliability,
    comment: row.comment || undefined,
    createdAt: row.created_at,
  };
}

export function mapBooking(row: any): CourtBooking {
  return {
    id: row.reference_code || row.group_id,
    groupId: row.group_id,
    venueId: row.venue_id,
    venueName: row.venue_name,
    sport: row.sport,
    locality: row.locality,
    courtName: row.court_name,
    courtId: row.court_id,
    date: row.booking_date,
    timeSlot: row.time_slot,
    durationHours: row.duration_hours,
    courtPrice: Number(row.court_price || 0),
    platformFee: Number(row.platform_fee || 0),
    taxes: Number(row.taxes || 0),
    totalPrice: Number(row.total_price || 0),
    playerName: row.player_name,
    playerEmail: row.player_email || "",
    playerPhone: row.player_phone || "",
    status: row.status === "cancelled" ? "Cancelled" : "Confirmed",
    createdAt: row.created_at,
    userId: row.user_id,
  };
}

export function groupBookings(rows: CourtBooking[]): CourtBooking[] {
  const byGroup = new Map<string, CourtBooking[]>();
  rows.forEach((row) => {
    const key = row.groupId || row.id;
    const list = byGroup.get(key) || [];
    list.push(row);
    byGroup.set(key, list);
  });
  return Array.from(byGroup.values()).map((items) => {
    const first = items[0];
    const slots = items.map((i) => i.timeSlot).sort();
    return {
      ...first,
      timeSlot: slots.length > 1 ? `${slots[0].split(" - ")[0]} - ${slots[slots.length - 1].split(" - ")[1]}` : first.timeSlot,
    };
  });
}
