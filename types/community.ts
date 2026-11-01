import { SportType, HyderabadLocality } from "./venue";

export type SkillLevel =
  | "Beginner"
  | "Amateur"
  | "Intermediate"
  | "Advanced"
  | "Professional";

export const ALL_SKILL_LEVELS: SkillLevel[] = [
  "Beginner",
  "Amateur",
  "Intermediate",
  "Advanced",
  "Professional",
];

export const SKILL_LEVEL_SCORES: Record<SkillLevel, number> = {
  Beginner: 1,
  Amateur: 2,
  Intermediate: 3,
  Advanced: 4,
  Professional: 5,
};

export const SKILL_LEVEL_BADGE_COLORS: Record<SkillLevel, { bg: string; text: string; border: string }> = {
  Beginner: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Amateur: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Intermediate: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  Advanced: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Professional: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300" },
};

export interface SportSkillRating {
  selfAssessed: SkillLevel;
  communityLevel?: SkillLevel;
  ratingsCount: number;
  distribution: Record<SkillLevel, number>;
}

export interface SportsmanshipReputation {
  overallScore: number; // e.g. 4.9 out of 5
  totalReviews: number;
  punctuality: number; // 1 to 5
  teamwork: number;
  fairPlay: number;
  communication: number;
  reliability: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  city: "Hyderabad";
  locality: HyderabadLocality;
  favoriteSports: SportType[];
  sportSkills: Partial<Record<SportType, SportSkillRating>>;
  sportsmanship: SportsmanshipReputation;
  gamesPlayed: number;
  gamesHosted: number;
  friendsCount: number;
  availability: {
    weekdays: string[];
    weekends: string[];
  };
  isPublic: boolean;
  contactPrivacy: "private" | "friends_only" | "public";
  createdAt: string;
  email?: string;
  phone?: string;
  role?: "player" | "host" | "admin";
}

export type GameStatus =
  | "Open"
  | "Full"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Expired";

export interface SkillRequirement {
  type: "single" | "range" | "open";
  level?: SkillLevel;
  minLevel?: SkillLevel;
  maxLevel?: SkillLevel;
  displayText: string;
}

export interface GameParticipant {
  playerId: string;
  name: string;
  avatar: string;
  sportSkill: SkillLevel;
  role: "host" | "co-host" | "player";
  joinedAt: string;
  attended?: boolean; // filled upon game completion
}

export interface JoinRequest {
  playerId: string;
  name: string;
  avatar: string;
  sportSkill: SkillLevel;
  note?: string;
  requestedAt: string;
  status: "pending" | "accepted" | "declined";
}

export interface CommunityGame {
  id: string;
  sport: SportType;
  title: string;
  description: string;
  matchFormat: "Singles" | "Doubles" | "Team Match" | "Casual Practice";
  venueId?: string;
  venueName: string;
  locality: HyderabadLocality;
  venueAddress: string;
  isVenueConfirmed: boolean;
  courtName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "07:00 PM"
  endTime: string; // e.g. "08:30 PM"
  durationHours: number;
  joiningDeadline: string;
  playersNeeded: number;
  maxGroupSize: number;
  participants: GameParticipant[];
  joinRequests: JoinRequest[];
  skillRequirement: SkillRequirement;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  costPerPlayer: number | null;
  isSplitCost: boolean;
  equipmentNotes?: string;
  visibility: "public" | "invite-only";
  rules: string[];
  status: GameStatus;
  attendanceConfirmed: boolean;
  actualAttendees: string[]; // List of playerIds confirmed present
  cancellationReason?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  gameId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
  isAnnouncement?: boolean;
}

export interface Friendship {
  id: string;
  playerId1: string;
  playerId2: string;
  connectedAt: string;
  connectedViaGameId: string;
  gamesPlayedTogether: number;
  lastGameDate: string;
  status?: "pending" | "accepted" | "declined";
  requesterId?: string;
  addresseeId?: string;
}

export interface PostGameRatingSubmission {
  id: string;
  gameId: string;
  sport: SportType;
  raterPlayerId: string;
  ratedPlayerId: string;
  skillLevel: SkillLevel;
  punctuality: number;
  teamwork: number;
  fairPlay: number;
  reliability: number;
  comment?: string;
  createdAt: string;
}

export interface SpeecatNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type:
    | "join_request"
    | "request_accepted"
    | "request_declined"
    | "game_full"
    | "game_cancelled"
    | "rate_players"
    | "friend_added"
    | "friend_invite"
    | "booking_confirmed"
    | "booking_cancelled"
    | "player_joined"
    | "player_left";
  link: string;
  read: boolean;
  createdAt: string;
}
