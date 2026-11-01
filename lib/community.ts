import {
  PlayerProfile,
  CommunityGame,
  Friendship,
  ChatMessage,
  PostGameRatingSubmission,
  SpeecatNotification,
  SkillLevel,
} from "@/types/community";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  mapFriendship,
  mapGame,
  mapJoinRequest,
  mapMessage,
  mapNotification,
  mapParticipant,
  mapProfile,
  mapRating,
} from "@/lib/mappers";

function dispatch(name: string, detail?: unknown) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(detail ? new CustomEvent(name, { detail }) : new Event(name));
  }
}

let cachedUser: PlayerProfile | null = null;
let cachedPlayers: PlayerProfile[] = [];
let cachedGames: CommunityGame[] = [];
let cachedFriends: Friendship[] = [];
let cachedNotifications: SpeecatNotification[] = [];
let cachedRatings: PostGameRatingSubmission[] = [];
const cachedChats = new Map<string, ChatMessage[]>();

export function getCurrentUserId(): string {
  return cachedUser?.id || "";
}

export function getCurrentUser(): PlayerProfile | null {
  return cachedUser;
}

export function setCachedUser(user: PlayerProfile | null) {
  cachedUser = user;
  dispatch("speecat_auth_changed");
}

export function setCurrentUserId(_playerId: string | null) {
  // Demo persona switching is disabled. Use signOut() instead.
}

export function getAllPlayers(): PlayerProfile[] {
  return cachedPlayers;
}

export function getPlayerById(id: string): PlayerProfile | null {
  return cachedPlayers.find((p) => p.id === id) || (cachedUser?.id === id ? cachedUser : null);
}

export function getAllGames(): CommunityGame[] {
  return cachedGames;
}

export function getGameById(id: string): CommunityGame | null {
  return cachedGames.find((g) => g.id === id) || null;
}

export function getAllFriendships(): Friendship[] {
  return cachedFriends;
}

export function getAllRatings(): PostGameRatingSubmission[] {
  return cachedRatings;
}

export function getAllNotifications(): SpeecatNotification[] {
  return cachedNotifications;
}

export function getNotificationsForPlayer(playerId: string): SpeecatNotification[] {
  return cachedNotifications
    .filter((n) => n.recipientId === playerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getChatMessages(gameId: string): ChatMessage[] {
  return cachedChats.get(gameId) || [];
}

export function getFriendsForPlayer(playerId: string): { friend: PlayerProfile; relationship: Friendship }[] {
  const accepted = cachedFriends.filter(
    (f) => f.status === "accepted" && (f.playerId1 === playerId || f.playerId2 === playerId)
  );
  return accepted
    .map((rel) => {
      const friendId = rel.playerId1 === playerId ? rel.playerId2 : rel.playerId1;
      const friend = cachedPlayers.find((p) => p.id === friendId);
      return friend ? { friend, relationship: rel } : null;
    })
    .filter((item): item is { friend: PlayerProfile; relationship: Friendship } => Boolean(item));
}

export function getPendingFriendRequests(playerId: string): Friendship[] {
  return cachedFriends.filter((f) => f.status === "pending" && f.addresseeId === playerId);
}

function rpcError(error: { message?: string } | null): never {
  throw new Error(error?.message || "Request failed");
}

export async function refreshPlayers() {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) return;
  cachedPlayers = (data || []).map(mapProfile);
}

export async function refreshGames() {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  const [{ data: games }, { data: participants }, { data: requests }, { data: profiles }] = await Promise.all([
    supabase.from("games").select("*").order("created_at", { ascending: false }),
    supabase.from("game_participants").select("*"),
    supabase.from("game_join_requests").select("*"),
    supabase.from("profiles").select("*"),
  ]);

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, mapProfile(p)]));
  cachedPlayers = Array.from(profileMap.values());
  if (cachedUser && profileMap.has(cachedUser.id)) {
    cachedUser = profileMap.get(cachedUser.id) || cachedUser;
  }

  cachedGames = (games || []).map((g: any) =>
    mapGame(
      g,
      (participants || [])
        .filter((p: any) => p.game_id === g.id)
        .map((p: any) => mapParticipant(p, profileMap.get(p.player_id))),
      (requests || [])
        .filter((r: any) => r.game_id === g.id)
        .map((r: any) => mapJoinRequest(r, profileMap.get(r.player_id)))
    )
  );
  dispatch("speecat_games_changed");
}

export async function refreshNotifications() {
  if (!isSupabaseConfigured() || !cachedUser) {
    cachedNotifications = [];
    return;
  }
  const supabase = createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", cachedUser.id)
    .order("created_at", { ascending: false });
  cachedNotifications = (data || []).map(mapNotification);
  dispatch("speecat_notifications_changed");
}

export async function refreshFriendships() {
  if (!isSupabaseConfigured() || !cachedUser) {
    cachedFriends = [];
    return;
  }
  const supabase = createClient();
  const { data } = await supabase.from("friendships").select("*");
  cachedFriends = (data || []).map(mapFriendship);
}

export async function refreshRatings() {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  const { data } = await supabase.from("player_ratings").select("*");
  cachedRatings = (data || []).map(mapRating);
}

export async function refreshChat(gameId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  const { data } = await supabase
    .from("game_messages")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });
  cachedChats.set(gameId, (data || []).map(mapMessage));
  dispatch("speecat_chat_message", { gameId });
}

export async function hydrateCommunity() {
  await Promise.all([refreshPlayers(), refreshGames(), refreshNotifications(), refreshFriendships(), refreshRatings()]);
}

export async function loadProfileById(userId: string): Promise<PlayerProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  let { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!data) {
    // If not found in profiles table, bootstrap from auth user session metadata
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user && authData.user.id === userId) {
        const u = authData.user;
        const meta = u.user_metadata || {};
        const fullName = meta.full_name || u.email?.split("@")[0] || "ATHLETIQ Player";
        const role = meta.role || "player";
        const locality = meta.locality || "Gachibowli";
        const avatarUrl = meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0f172a&color=10b981`;

        const { data: created, error: createErr } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            email: u.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            role,
            locality,
            city: "Hyderabad",
          })
          .select("*")
          .maybeSingle();

        if (!createErr && created) {
          data = created;
        }
      }
    } catch (e) {
      console.warn("Could not auto-create profile for user", userId, e);
    }
  }

  if (!data) return null;
  const mapped = mapProfile(data);
  const idx = cachedPlayers.findIndex((p) => p.id === mapped.id);
  if (idx >= 0) cachedPlayers[idx] = mapped;
  else cachedPlayers.push(mapped);
  return mapped;
}

export async function updatePlayerProfile(
  updated: Partial<PlayerProfile> & { id: string }
): Promise<PlayerProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: updated.name,
      bio: updated.bio,
      locality: updated.locality,
      favorite_sports: updated.favoriteSports,
      sport_skills: updated.sportSkills,
      phone: updated.phone,
      avatar_url: updated.avatar,
      contact_privacy: updated.contactPrivacy,
      is_public: updated.isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updated.id)
    .select("*")
    .single();
  if (error) rpcError(error);
  const mapped = mapProfile(data);
  if (cachedUser?.id === mapped.id) setCachedUser(mapped);
  await refreshPlayers();
  return mapped;
}

export async function createGame(
  gameData: Omit<
    CommunityGame,
    "id" | "createdAt" | "participants" | "joinRequests" | "status" | "attendanceConfirmed" | "actualAttendees"
  >
): Promise<CommunityGame> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("games")
    .insert({
      sport: gameData.sport,
      title: gameData.title,
      description: gameData.description,
      match_format: gameData.matchFormat,
      venue_id: gameData.venueId || null,
      venue_name: gameData.venueName,
      locality: gameData.locality,
      venue_address: gameData.venueAddress,
      is_venue_confirmed: gameData.isVenueConfirmed,
      court_name: gameData.courtName || null,
      date: gameData.date,
      start_time: gameData.startTime,
      end_time: gameData.endTime,
      duration_hours: gameData.durationHours,
      joining_deadline: gameData.joiningDeadline,
      players_needed: gameData.playersNeeded,
      max_group_size: gameData.maxGroupSize,
      skill_requirement: gameData.skillRequirement,
      host_id: gameData.hostId,
      host_name: gameData.hostName,
      host_avatar: gameData.hostAvatar,
      cost_per_player: gameData.costPerPlayer,
      is_split_cost: gameData.isSplitCost,
      equipment_notes: gameData.equipmentNotes || null,
      visibility: gameData.visibility,
      rules: gameData.rules,
      status: "Open",
    })
    .select("*")
    .single();
  if (error) rpcError(error);

  const hostSkill =
    cachedUser?.sportSkills[gameData.sport]?.selfAssessed || "Intermediate";

  const { error: partError } = await supabase.from("game_participants").insert({
    game_id: data.id,
    player_id: gameData.hostId,
    role: "host",
    sport_skill: hostSkill,
  });
  if (partError) rpcError(partError);

  await supabase.from("game_messages").insert({
    game_id: data.id,
    sender_id: "system",
    sender_name: "ATHLETIQ",
    sender_avatar: "",
    content: `Game "${data.title}" created by ${data.host_name}. Confirmed players can chat here.`,
    is_system: true,
  });

  await refreshGames();
  const created = getGameById(data.id);
  if (!created) throw new Error("Game created but could not be loaded");
  return created;
}

export async function requestToJoinGame(gameId: string, _playerId: string, note?: string): Promise<CommunityGame> {
  const supabase = createClient();
  const { error } = await supabase.rpc("join_game", { p_game_id: gameId, p_note: note || null });
  if (error) rpcError(error);
  await refreshGames();
  const game = getGameById(gameId);
  if (!game) throw new Error("Game not found");
  return game;
}

export async function leaveGame(gameId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("leave_game", { p_game_id: gameId });
  if (error) rpcError(error);
  await refreshGames();
}

export async function respondToJoinRequest(gameId: string, playerId: string, accept: boolean): Promise<CommunityGame> {
  const supabase = createClient();
  const { error } = await supabase.rpc("respond_join_request", {
    p_game_id: gameId,
    p_player_id: playerId,
    p_accept: accept,
  });
  if (error) rpcError(error);
  await refreshGames();
  const game = getGameById(gameId);
  if (!game) throw new Error("Game not found");
  return game;
}

export async function markGameCompleted(
  gameId: string,
  _hostId: string,
  actualAttendeeIds: string[]
): Promise<CommunityGame> {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_game", {
    p_game_id: gameId,
    p_attendee_ids: actualAttendeeIds,
  });
  if (error) rpcError(error);
  await Promise.all([refreshGames(), refreshFriendships(), refreshNotifications()]);
  const game = getGameById(gameId);
  if (!game) throw new Error("Game not found");
  return game;
}

export async function cancelGame(gameId: string, reason: string): Promise<CommunityGame> {
  const supabase = createClient();
  const { error } = await supabase.rpc("cancel_game", { p_game_id: gameId, p_reason: reason });
  if (error) rpcError(error);
  await refreshGames();
  const game = getGameById(gameId);
  if (!game) throw new Error("Game not found");
  return game;
}

export async function addChatMessage(
  gameId: string,
  messageData: Omit<ChatMessage, "id" | "gameId" | "timestamp">
): Promise<ChatMessage> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_messages")
    .insert({
      game_id: gameId,
      sender_id: messageData.senderId,
      sender_name: messageData.senderName,
      sender_avatar: messageData.senderAvatar,
      content: messageData.content,
      is_system: !!messageData.isSystem,
      is_announcement: !!messageData.isAnnouncement,
    })
    .select("*")
    .single();
  if (error) rpcError(error);
  const mapped = mapMessage(data);
  const current = cachedChats.get(gameId) || [];
  cachedChats.set(gameId, [...current, mapped]);
  dispatch("speecat_chat_message", { gameId });
  return mapped;
}

export async function submitPlayerRating(
  submission: Omit<PostGameRatingSubmission, "id" | "createdAt">
): Promise<PostGameRatingSubmission> {
  if (submission.raterPlayerId === submission.ratedPlayerId) {
    throw new Error("You cannot rate yourself");
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_ratings")
    .insert({
      game_id: submission.gameId,
      sport: submission.sport,
      rater_id: submission.raterPlayerId,
      rated_id: submission.ratedPlayerId,
      skill_level: submission.skillLevel,
      punctuality: submission.punctuality,
      teamwork: submission.teamwork,
      fair_play: submission.fairPlay,
      reliability: submission.reliability,
      comment: submission.comment || null,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already submitted a rating for this player for this game");
    }
    rpcError(error);
  }

  const target = await loadProfileById(submission.ratedPlayerId);
  if (target) {
    const sportSkills = { ...target.sportSkills };
    if (!sportSkills[submission.sport]) {
      sportSkills[submission.sport] = {
        selfAssessed: "Beginner",
        ratingsCount: 0,
        distribution: { Beginner: 0, Amateur: 0, Intermediate: 0, Advanced: 0, Professional: 0 },
      };
    }
    const sportRating = sportSkills[submission.sport]!;
    sportRating.ratingsCount += 1;
    sportRating.distribution[submission.skillLevel] =
      (sportRating.distribution[submission.skillLevel] || 0) + 1;
    let maxCount = -1;
    let dominantLevel: SkillLevel = sportRating.selfAssessed;
    (Object.keys(sportRating.distribution) as SkillLevel[]).forEach((lvl) => {
      if (sportRating.distribution[lvl] > maxCount) {
        maxCount = sportRating.distribution[lvl];
        dominantLevel = lvl;
      }
    });
    sportRating.communityLevel = dominantLevel;

    const sm = { ...target.sportsmanship };
    const total = sm.totalReviews;
    const newTotal = total + 1;
    sm.punctuality = Number(((sm.punctuality * total + submission.punctuality) / newTotal).toFixed(1));
    sm.teamwork = Number(((sm.teamwork * total + submission.teamwork) / newTotal).toFixed(1));
    sm.fairPlay = Number(((sm.fairPlay * total + submission.fairPlay) / newTotal).toFixed(1));
    sm.reliability = Number(((sm.reliability * total + submission.reliability) / newTotal).toFixed(1));
    sm.overallScore = Number(
      ((sm.punctuality + sm.teamwork + sm.fairPlay + sm.communication + sm.reliability) / 5).toFixed(1)
    );
    sm.totalReviews = newTotal;

    await supabase
      .from("profiles")
      .update({ sport_skills: sportSkills, sportsmanship: sm, updated_at: new Date().toISOString() })
      .eq("id", target.id);
  }

  await refreshRatings();
  await refreshPlayers();
  return mapRating(data);
}

export async function sendNotification(
  notifData: Omit<SpeecatNotification, "id" | "createdAt" | "read">
): Promise<SpeecatNotification> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: notifData.recipientId,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type,
      link: notifData.link,
    })
    .select("*")
    .single();
  if (error) rpcError(error);
  const mapped = mapNotification(data);
  cachedNotifications = [mapped, ...cachedNotifications];
  dispatch("speecat_notifications_changed");
  return mapped;
}

export async function markNotificationAsRead(id: string) {
  const supabase = createClient();
  await supabase.from("notifications").update({ read: true }).eq("id", id);
  cachedNotifications = cachedNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  dispatch("speecat_notifications_changed");
}

export async function markAllNotificationsAsRead(playerId: string) {
  const supabase = createClient();
  await supabase.from("notifications").update({ read: true }).eq("recipient_id", playerId);
  cachedNotifications = cachedNotifications.map((n) =>
    n.recipientId === playerId ? { ...n, read: true } : n
  );
  dispatch("speecat_notifications_changed");
}

export async function sendFriendRequest(addresseeId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("send_friend_request", { p_addressee: addresseeId });
  if (error) rpcError(error);
  await Promise.all([refreshFriendships(), refreshNotifications()]);
}

export async function respondFriendRequest(friendshipId: string, accept: boolean) {
  const supabase = createClient();
  const { error } = await supabase.rpc("respond_friend_request", {
    p_friendship_id: friendshipId,
    p_accept: accept,
  });
  if (error) rpcError(error);
  await refreshFriendships();
}

export async function removeFriend(playerId: string, friendId: string) {
  const supabase = createClient();
  const rel = cachedFriends.find(
    (f) =>
      (f.playerId1 === playerId && f.playerId2 === friendId) ||
      (f.playerId1 === friendId && f.playerId2 === playerId)
  );
  if (!rel) return;
  const { error } = await supabase.from("friendships").delete().eq("id", rel.id);
  if (error) rpcError(error);
  await refreshFriendships();
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  cachedUser = null;
  cachedNotifications = [];
  cachedFriends = [];
  dispatch("speecat_auth_changed");
}
