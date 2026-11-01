import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  hydrateCommunity,
  refreshChat,
  refreshFriendships,
  refreshGames,
  refreshNotifications,
} from "@/lib/community";

let globalChannel: RealtimeChannel | null = null;

export function startRealtimeSync(userId?: string | null) {
  stopRealtimeSync();
  const supabase = createClient();
  const channel = supabase
    .channel("speedcat-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "games" }, () => {
      void refreshGames();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "game_participants" }, () => {
      void refreshGames();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "game_join_requests" }, () => {
      void refreshGames();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("speedcat_bookings_changed"));
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => {
      void refreshFriendships();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "player_ratings" }, () => {
      void hydrateCommunity();
    })
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: userId ? `recipient_id=eq.${userId}` : undefined,
      },
      () => {
        void refreshNotifications();
      }
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "game_messages" }, (payload) => {
      const gameId = (payload.new as { game_id?: string } | null)?.game_id;
      if (gameId) void refreshChat(gameId);
    })
    .subscribe();

  globalChannel = channel;
  return channel;
}

export function stopRealtimeSync() {
  if (globalChannel) {
    const supabase = createClient();
    void supabase.removeChannel(globalChannel);
    globalChannel = null;
  }
}

export function subscribeGamePresence(
  gameId: string,
  user: { id: string; name: string; avatar: string },
  onSync: (online: { id: string; name: string }[]) => void
) {
  const supabase = createClient();
  const channel = supabase.channel(`game-presence-${gameId}`, {
    config: { presence: { key: user.id } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, { id: string; name: string }[]>;
      const online = Object.values(state)
        .flat()
        .map((item) => ({ id: item.id, name: item.name }));
      onSync(online);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ id: user.id, name: user.name, avatar: user.avatar });
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
