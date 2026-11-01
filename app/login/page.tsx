"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  User,
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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
      <div className="min-h-[70vh] flex items-center justify-center text-sm font-semibold text-slate-500">
        {user ? "Taking you into Speedcat..." : "Loading account..."}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-speecat-navy flex items-center justify-center text-speecat-green shadow-md">
              <Zap className="w-6 h-6 fill-speecat-green text-speecat-green" />
            </div>
            <span className="text-2xl font-black tracking-tight text-speedcat-navy">
              SPEED<span className="text-speedcat-green">CAT</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-speedcat-navy">
            {tab === "login" ? "Sign in to Speedcat" : "Create your Speedcat account"}
          </h2>
          <p className="text-xs text-slate-500">
            Book courts, host games, and join the Hyderabad sports community
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex border-b border-slate-200 pb-2">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 text-center pb-2 text-xs font-bold border-b-2 transition-all ${
                tab === "login"
                  ? "border-speecat-green text-speecat-navy"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 text-center pb-2 text-xs font-bold border-b-2 transition-all ${
                tab === "register"
                  ? "border-speecat-green text-speecat-navy"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-bold text-speecat-navy mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-speecat-navy"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-speecat-navy mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-speecat-navy focus:outline-none focus:ring-2 focus:ring-speecat-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-speecat-navy mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-speecat-navy focus:outline-none focus:ring-2 focus:ring-speecat-green"
              />
            </div>

            {tab === "register" && (
              <div>
                <label className="block text-xs font-bold text-speecat-navy mb-1">Account Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "player" | "host" | "admin")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-speecat-navy"
                >
                  <option value="player">Player</option>
                  <option value="host">Venue Host</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <User className="w-4 h-4 text-speecat-green mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-speecat-navy">Book & join</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-speecat-navy">Manage courts</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <ShieldCheck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-speecat-navy">Directory</div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3 py-2">{error}</div>
            )}
            {info && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-speecat-navy hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              <span>{submitting ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4 text-speecat-green" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-sm">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
