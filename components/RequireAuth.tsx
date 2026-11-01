"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<"player" | "host" | "admin">;
}) {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (roles && profile && !roles.includes(profile.role || "player")) {
      const fallback =
        profile.role === "admin"
          ? "/dashboard/admin"
          : profile.role === "host"
          ? "/dashboard/host"
          : "/dashboard/player";
      router.replace(fallback);
    }
  }, [loading, configured, user, profile, roles, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Checking your Speedcat account...</div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-600 max-w-md">
          Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY, then reload.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
