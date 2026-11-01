"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  hydrateCommunity,
  loadProfileById,
  setCachedUser,
} from "@/lib/community";
import { startRealtimeSync, stopRealtimeSync } from "@/lib/realtime";
import { PlayerProfile } from "@/types/community";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: PlayerProfile | null;
  loading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  configured: false,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) {
      setProfile(null);
      setCachedUser(null);
      return;
    }
    const next = await loadProfileById(id);
    setProfile(next);
    setCachedUser(next);
  };

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let active = true;

    const applySession = async (nextSession: Session | null, markReady: boolean) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        const nextProfile = await loadProfileById(nextSession.user.id);
        if (!active) return;
        setProfile(nextProfile);
        setCachedUser(nextProfile);
        startRealtimeSync(nextSession.user.id);
      } else {
        setProfile(null);
        setCachedUser(null);
        startRealtimeSync(null);
      }
      await hydrateCommunity();
      if (markReady && active) setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session, true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession, true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      stopRealtimeSync();
    };
  }, [configured]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      configured,
      refreshProfile: () => refreshProfile(),
    }),
    [user, session, profile, loading, configured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
