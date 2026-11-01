"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AthletiqLogo from "@/components/AthletiqLogo";

function roleHome(role?: string | null) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "host") return "/dashboard/host";
  return "/dashboard/player";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  const nextPath = searchParams.get("next");
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"player" | "host" | "admin">("player");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const message = info;
  const setMessage = setInfo;
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(nextPath || roleHome(profile?.role));
    }
  }, [authLoading, user, profile, nextPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      if (tab === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
              role: selectedRole,
            },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Account created. Check your email to confirm, then sign in.");
          setTab("login");
          return;
        }
        router.replace(nextPath || roleHome(selectedRole));
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace(nextPath || "/dashboard/player");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm font-semibold text-[#AEB4B0]">
        {user ? "Taking you into ATHLETIQ..." : "Loading account..."}
      </div>
    );
  }

  return (
    <div className="bg-[#17191C] min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <AthletiqLogo size="lg" />
          </Link>

          <h2 className="text-xl font-black text-[#F5F5F2]">
            {tab === "login" ? "Sign in to ATHLETIQ" : "Create your ATHLETIQ account"}
          </h2>

          <p className="text-xs text-[#AEB4B0]">
            PLAY • BOOK • CONNECT — Hyderabad Sports Community
          </p>
        </div>

        <div className="bg-[#292D32] rounded-2xl border border-[#373C42] p-6 shadow-2xl space-y-5">
          <div className="flex border-b border-[#373C42] pb-2">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-colors ${
                tab === "login"
                  ? "border-[#B7F34A] text-[#B7F34A]"
                  : "border-transparent text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-colors ${
                tab === "register"
                  ? "border-[#B7F34A] text-[#B7F34A]"
                  : "border-transparent text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl bg-[#B7F34A]/10 border border-[#B7F34A]/30 p-3 text-xs text-[#B7F34A]"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#F5F5F2] mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your Name"
                  className="w-full bg-[#17191C] border border-[#373C42] rounded-xl px-3 py-2 text-xs text-[#F5F5F2] placeholder-[#AEB4B0]/50 focus:outline-none focus:ring-2 focus:ring-[#B7F34A]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-[#F5F5F2] mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#AEB4B0]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#17191C] border border-[#373C42] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5F5F2] placeholder-[#AEB4B0]/50 focus:outline-none focus:ring-2 focus:ring-[#B7F34A]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#F5F5F2] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#AEB4B0]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#17191C] border border-[#373C42] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5F5F2] placeholder-[#AEB4B0]/50 focus:outline-none focus:ring-2 focus:ring-[#B7F34A]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {tab === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#F5F5F2] mb-1">Account Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "player" | "host" | "admin")}
                  className="w-full bg-[#17191C] border border-[#373C42] rounded-xl px-3 py-2 text-xs font-semibold text-[#F5F5F2] focus:outline-none focus:ring-2 focus:ring-[#B7F34A]"
                >
                  <option value="player">Player</option>
                  <option value="host">Venue Host</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-[#17191C] border border-[#373C42] rounded-xl p-2 text-center">
                    <User className="w-4 h-4 text-[#B7F34A] mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-[#F5F5F2]">Book & join</div>
                  </div>
                  <div className="bg-[#17191C] border border-[#373C42] rounded-xl p-2 text-center">
                    <Building2 className="w-4 h-4 text-[#B7F34A] mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-[#F5F5F2]">Manage courts</div>
                  </div>
                  <div className="bg-[#17191C] border border-[#373C42] rounded-xl p-2 text-center">
                    <ShieldCheck className="w-4 h-4 text-[#B7F34A] mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-[#F5F5F2]">Directory</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#B7F34A] hover:bg-[#A3E435] text-[#17191C] font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <span>{submitting ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4 text-[#17191C]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-sm text-[#AEB4B0]">Loading ATHLETIQ...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
