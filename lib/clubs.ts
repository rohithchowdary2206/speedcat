import initialClubsData from "@/data/clubs.json";
import { 
  Club, 
  ClubEvent, 
  EventRegistration, 
  OrganizerRevenueAnalytics, 
  ClubCategory 
} from "@/types/club";

export const STORAGE_CUSTOM_CLUBS = "speedcat_custom_clubs";
export const STORAGE_CUSTOM_EVENTS = "speedcat_custom_events";
export const STORAGE_EVENT_REGISTRATIONS = "speedcat_event_registrations";
export const STORAGE_PLATFORM_FEE_RATE = "speedcat_platform_fee_rate"; // e.g. 0.05 for 5%

const INITIAL_CLUBS: Club[] = initialClubsData.clubs as Club[];
const INITIAL_EVENTS: ClubEvent[] = initialClubsData.events as ClubEvent[];

// Initial sample registrations for realistic analytics
const SEED_REGISTRATIONS: EventRegistration[] = [
  {
    id: "reg-spd-101",
    eventId: "evt-marathon-prep-run",
    eventTitle: "Half-Marathon Pacing Run & Nutrition Clinic",
    clubId: "club-hyd-runners",
    clubName: "Hyderabad Runners Club",
    playerId: "player-rahul",
    playerName: "Rahul Verma",
    playerEmail: "rahul@speedcat.hyd",
    playerPhone: "+91 98765 11111",
    ticketPrice: 200,
    platformFeeRate: 0.05,
    platformFee: 10,
    grossTotal: 200,
    netOrganizerEarnings: 190,
    status: "checked_in",
    registeredAt: "2026-10-22T10:00:00Z",
    qrCode: "SPD-REG-101-RAHUL",
    checkInTime: "2026-11-08T05:25:00Z",
  },
  {
    id: "reg-spd-102",
    eventId: "evt-marathon-prep-run",
    eventTitle: "Half-Marathon Pacing Run & Nutrition Clinic",
    clubId: "club-hyd-runners",
    clubName: "Hyderabad Runners Club",
    playerId: "player-priya",
    playerName: "Priya Sharma",
    playerEmail: "priya@speedcat.hyd",
    playerPhone: "+91 98765 22222",
    ticketPrice: 200,
    platformFeeRate: 0.05,
    platformFee: 10,
    grossTotal: 200,
    netOrganizerEarnings: 190,
    status: "checked_in",
    registeredAt: "2026-10-23T11:30:00Z",
    qrCode: "SPD-REG-102-PRIYA",
    checkInTime: "2026-11-08T05:28:00Z",
  },
  {
    id: "reg-spd-103",
    eventId: "evt-marathon-prep-run",
    eventTitle: "Half-Marathon Pacing Run & Nutrition Clinic",
    clubId: "club-hyd-runners",
    clubName: "Hyderabad Runners Club",
    playerId: "player-arjun",
    playerName: "Arjun Reddy",
    playerEmail: "arjun@speedcat.hyd",
    playerPhone: "+91 98765 33333",
    ticketPrice: 200,
    platformFeeRate: 0.05,
    platformFee: 10,
    grossTotal: 200,
    netOrganizerEarnings: 190,
    status: "confirmed",
    registeredAt: "2026-10-24T09:15:00Z",
    qrCode: "SPD-REG-103-ARJUN",
  },
  {
    id: "reg-spd-104",
    eventId: "evt-marathon-prep-run",
    eventTitle: "Half-Marathon Pacing Run & Nutrition Clinic",
    clubId: "club-hyd-runners",
    clubName: "Hyderabad Runners Club",
    playerId: "player-suresh",
    playerName: "Suresh Kumar",
    playerEmail: "suresh@speedcat.hyd",
    playerPhone: "+91 98765 44444",
    ticketPrice: 200,
    platformFeeRate: 0.05,
    platformFee: 10,
    grossTotal: 200,
    netOrganizerEarnings: 190,
    status: "cancelled",
    registeredAt: "2026-10-21T14:00:00Z",
    cancellationTime: "2026-10-25T16:00:00Z",
    refundStatus: "refunded_demo",
    qrCode: "SPD-REG-104-SURESH",
  },
  {
    id: "reg-spd-105",
    eventId: "evt-sunrise-10k-kbr",
    eventTitle: "Sunrise 10K & 5K Guided Trail Loop",
    clubId: "club-hyd-runners",
    clubName: "Hyderabad Runners Club",
    playerId: "player-kavita",
    playerName: "Kavita Rao",
    playerEmail: "kavita.rao@speedcat.hyd",
    playerPhone: "+91 98765 43210",
    ticketPrice: 0,
    platformFeeRate: 0.05,
    platformFee: 0,
    grossTotal: 0,
    netOrganizerEarnings: 0,
    status: "confirmed",
    registeredAt: "2026-10-25T08:00:00Z",
    qrCode: "SPD-REG-105-KAVITA",
  },
  {
    id: "reg-spd-106",
    eventId: "evt-badminton-league",
    eventTitle: "Wednesday Evening Doubles League & Round Robin",
    clubId: "club-smashers-badminton",
    clubName: "Smashers Badminton Club",
    playerId: "player-tarun",
    playerName: "Tarun Varma",
    playerEmail: "tarun.varma@speedcat.hyd",
    playerPhone: "+91 98765 43210",
    ticketPrice: 300,
    platformFeeRate: 0.05,
    platformFee: 15,
    grossTotal: 300,
    netOrganizerEarnings: 285,
    status: "confirmed",
    registeredAt: "2026-10-25T11:00:00Z",
    qrCode: "SPD-REG-106-TARUN",
  }
];

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getAllClubs(): Club[] {
  if (isClient()) {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_CLUBS);
      if (stored) {
        const custom: Club[] = JSON.parse(stored);
        const customIds = new Set(custom.map((c) => c.id));
        const filteredInitial = INITIAL_CLUBS.filter((c) => !customIds.has(c.id));
        return [...custom, ...filteredInitial];
      }
    } catch {}
  }
  return INITIAL_CLUBS;
}

export function saveClubs(clubs: Club[]) {
  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_CUSTOM_CLUBS, JSON.stringify(clubs));
      window.dispatchEvent(new Event("speedcat_clubs_changed"));
    } catch {}
  }
}

export function getClubBySlug(slug: string): Club | null {
  const clubs = getAllClubs();
  return (
    clubs.find(
      (c) =>
        c.slug.toLowerCase() === slug.toLowerCase() ||
        c.id.toLowerCase() === slug.toLowerCase()
    ) || null
  );
}

export function getClubById(id: string): Club | null {
  const clubs = getAllClubs();
  return clubs.find((c) => c.id === id) || null;
}

export function isPlayerInClub(clubId: string, playerId: string): boolean {
  const club = getClubById(clubId);
  if (!club) return false;
  return club.members.some((m) => m.playerId === playerId);
}

export function joinClub(clubId: string, player: { playerId: string; name: string; avatar: string }): Club {
  const clubs = getAllClubs();
  const club = clubs.find((c) => c.id === clubId);
  if (!club) throw new Error("Club not found");

  if (!club.members.some((m) => m.playerId === player.playerId)) {
    club.members.push({
      playerId: player.playerId,
      name: player.name,
      avatar: player.avatar,
      role: "member",
      joinedAt: new Date().toISOString(),
    });
    club.memberCount = club.members.length;
    saveClubs(clubs);
  }
  return club;
}

export function leaveClub(clubId: string, playerId: string): Club {
  const clubs = getAllClubs();
  const club = clubs.find((c) => c.id === clubId);
  if (!club) throw new Error("Club not found");

  if (club.organizerId === playerId) {
    throw new Error("The club organizer cannot leave the club. Transfer ownership first.");
  }

  club.members = club.members.filter((m) => m.playerId !== playerId);
  club.memberCount = club.members.length;
  saveClubs(clubs);
  return club;
}

// EVENTS MANAGEMENT
export function getAllClubEvents(): ClubEvent[] {
  if (isClient()) {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_EVENTS);
      if (stored) {
        const custom: ClubEvent[] = JSON.parse(stored);
        const customIds = new Set(custom.map((e) => e.id));
        const filteredInitial = INITIAL_EVENTS.filter((e) => !customIds.has(e.id));
        return [...custom, ...filteredInitial];
      }
    } catch {}
  }
  return INITIAL_EVENTS;
}

export function saveClubEvents(events: ClubEvent[]) {
  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_CUSTOM_EVENTS, JSON.stringify(events));
      window.dispatchEvent(new Event("speedcat_events_changed"));
    } catch {}
  }
}

export function getEventById(id: string): ClubEvent | null {
  const events = getAllClubEvents();
  return events.find((e) => e.id === id) || null;
}

export function getEventsForClub(clubId: string): ClubEvent[] {
  const events = getAllClubEvents();
  return events.filter((e) => e.clubId === clubId);
}

export function createClubEvent(eventData: Omit<ClubEvent, "id" | "registeredCount" | "status" | "createdAt">): ClubEvent {
  const events = getAllClubEvents();
  const newEvent: ClubEvent = {
    ...eventData,
    id: `evt-${Date.now()}`,
    registeredCount: 0,
    status: "scheduled",
    actualAttendanceCount: 0,
    createdAt: new Date().toISOString(),
  };

  const updated = [newEvent, ...events];
  saveClubEvents(updated);

  // Update club event count
  const clubs = getAllClubs();
  const club = clubs.find((c) => c.id === eventData.clubId);
  if (club) {
    club.upcomingEventsCount = (club.upcomingEventsCount || 0) + 1;
    saveClubs(clubs);
  }

  return newEvent;
}

export function updateClubEvent(eventId: string, updates: Partial<ClubEvent>): ClubEvent {
  const events = getAllClubEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) throw new Error("Event not found");

  events[idx] = { ...events[idx], ...updates };
  saveClubEvents(events);
  return events[idx];
}

export function cancelClubEvent(eventId: string): ClubEvent {
  return updateClubEvent(eventId, { status: "cancelled" });
}

// REGISTRATIONS & CHECK-IN
export function getAllRegistrations(): EventRegistration[] {
  if (isClient()) {
    try {
      const stored = localStorage.getItem(STORAGE_EVENT_REGISTRATIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return SEED_REGISTRATIONS;
}

export function saveRegistrations(regs: EventRegistration[]) {
  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_EVENT_REGISTRATIONS, JSON.stringify(regs));
      window.dispatchEvent(new Event("speedcat_registrations_changed"));
    } catch {}
  }
}

export function getRegistrationsForEvent(eventId: string): EventRegistration[] {
  const regs = getAllRegistrations();
  return regs.filter((r) => r.eventId === eventId);
}

export function getRegistrationsForPlayer(playerId: string): EventRegistration[] {
  const regs = getAllRegistrations();
  return regs.filter((r) => r.playerId === playerId);
}

export function getConfiguredPlatformFeeRate(): number {
  if (isClient()) {
    try {
      const rate = localStorage.getItem(STORAGE_PLATFORM_FEE_RATE);
      if (rate && !isNaN(Number(rate))) {
        return Number(rate);
      }
    } catch {}
  }
  return 0.05; // Default 5%
}

export function setConfiguredPlatformFeeRate(rateDecimal: number) {
  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_PLATFORM_FEE_RATE, rateDecimal.toString());
      window.dispatchEvent(new Event("speedcat_platform_fee_changed"));
    } catch {}
  }
}

export function registerForEvent(params: {
  eventId: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
}): EventRegistration {
  const event = getEventById(params.eventId);
  if (!event) throw new Error("Event not found");

  if (event.status !== "scheduled") {
    throw new Error("This event is no longer open for registration");
  }

  const existing = getAllRegistrations();
  const alreadyRegistered = existing.some(
    (r) =>
      r.eventId === params.eventId &&
      r.playerId === params.playerId &&
      r.status !== "cancelled"
  );

  if (alreadyRegistered) {
    throw new Error("You are already registered for this event");
  }

  const feeRate = getConfiguredPlatformFeeRate();
  const ticketPrice = event.price || 0;
  const platformFee = Math.round(ticketPrice * feeRate);
  const netEarnings = ticketPrice - platformFee;

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}`,
    eventId: event.id,
    eventTitle: event.title,
    clubId: event.clubId,
    clubName: event.clubName,
    playerId: params.playerId,
    playerName: params.playerName,
    playerEmail: params.playerEmail,
    playerPhone: params.playerPhone,
    ticketPrice,
    platformFeeRate: feeRate,
    platformFee,
    grossTotal: ticketPrice,
    netOrganizerEarnings: netEarnings,
    status: "confirmed",
    registeredAt: new Date().toISOString(),
    qrCode: `SPD-EVT-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  const updated = [newReg, ...existing];
  saveRegistrations(updated);

  // Increment event registeredCount
  updateClubEvent(event.id, {
    registeredCount: (event.registeredCount || 0) + 1,
  });

  return newReg;
}

export function cancelRegistration(registrationId: string): EventRegistration {
  const regs = getAllRegistrations();
  const reg = regs.find((r) => r.id === registrationId);
  if (!reg) throw new Error("Registration not found");

  reg.status = "cancelled";
  reg.cancellationTime = new Date().toISOString();
  reg.refundStatus = reg.ticketPrice > 0 ? "refunded_demo" : "not_applicable";

  saveRegistrations(regs);

  // Decrement event registeredCount
  const event = getEventById(reg.eventId);
  if (event) {
    updateClubEvent(event.id, {
      registeredCount: Math.max(0, (event.registeredCount || 1) - 1),
    });
  }

  return reg;
}

export function toggleCheckIn(registrationId: string): EventRegistration {
  const regs = getAllRegistrations();
  const reg = regs.find((r) => r.id === registrationId);
  if (!reg) throw new Error("Registration not found");

  if (reg.status === "checked_in") {
    reg.status = "confirmed";
    reg.checkInTime = undefined;
  } else {
    reg.status = "checked_in";
    reg.checkInTime = new Date().toISOString();
  }

  saveRegistrations(regs);
  return reg;
}

// REVENUE AND ANALYTICS
export function getOrganizerRevenueAnalytics(
  organizerId: string,
  feePercentage?: number
): OrganizerRevenueAnalytics {
  const allEvents = getAllClubEvents().filter((e) => e.organizerId === organizerId);
  const eventIds = new Set(allEvents.map((e) => e.id));

  const allRegs = getAllRegistrations().filter((r) => eventIds.has(r.eventId));
  const rate = feePercentage !== undefined ? feePercentage / 100 : getConfiguredPlatformFeeRate();

  const confirmed = allRegs.filter((r) => r.status === "confirmed" || r.status === "checked_in");
  const cancelled = allRegs.filter((r) => r.status === "cancelled");
  const checkedIn = allRegs.filter((r) => r.status === "checked_in");

  const grossSales = confirmed.reduce((acc, r) => acc + (r.ticketPrice || 0), 0);
  const platformFees = Math.round(grossSales * rate);
  const netEarnings = grossSales - platformFees;

  const attendanceRate =
    confirmed.length > 0 ? Math.round((checkedIn.length / confirmed.length) * 100) : 0;

  // Calculate repeat participation: players who registered for > 1 event with this organizer
  const playerFrequency: Record<string, number> = {};
  confirmed.forEach((r) => {
    playerFrequency[r.playerId] = (playerFrequency[r.playerId] || 0) + 1;
  });
  const totalUniquePlayers = Object.keys(playerFrequency).length;
  const repeatPlayers = Object.values(playerFrequency).filter((count) => count > 1).length;
  const repeatRate =
    totalUniquePlayers > 0 ? Math.round((repeatPlayers / totalUniquePlayers) * 100) : 0;

  return {
    totalRegistrations: allRegs.length,
    confirmedRegistrations: confirmed.length,
    cancelledRegistrations: cancelled.length,
    actualAttendance: checkedIn.length,
    attendanceRate,
    grossTicketSales: grossSales,
    speedcatPlatformFees: platformFees,
    netOrganizerEarnings: netEarnings,
    platformFeePercentage: Math.round(rate * 100),
    repeatParticipationRate: repeatRate,
  };
}

// ADMIN APPROVAL AND MODERATION
export function approveClub(clubId: string): Club {
  const clubs = getAllClubs();
  const club = clubs.find((c) => c.id === clubId);
  if (!club) throw new Error("Club not found");
  club.status = "active";
  club.verified = true;
  saveClubs(clubs);
  return club;
}

export function suspendClub(clubId: string): Club {
  const clubs = getAllClubs();
  const club = clubs.find((c) => c.id === clubId);
  if (!club) throw new Error("Club not found");
  club.status = "suspended";
  saveClubs(clubs);
  return club;
}
