
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (tab === "register") {
        if (name.trim().length < 2) {
          setError("Please enter your full name.");
          return;
        }

        if (password.length < 8) {
          setError("Your password must be at least 8 characters.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/dashboard/player");
          router.refresh();
          return;
        }

        setMessage(
          "Registration started! Check your email for a confirmation link before signing in."
        );
        setTab("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        router.push("/dashboard/player");
        router.refresh();
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-speecat-navy flex items-center justify-center text-speecat-green shadow-md">
              <Zap className="w-6 h-6 fill-speecat-green text-speecat-green" />
            </div>
            <span className="text-2xl font-black tracking-tight text-speedcat-navy">
              SPEED<span className="text-speedcat-green">CAT</span>
            </span>
          </Link>

          <h2 className="text-xl font-black text-speedcat-navy">
            {tab === "login" ? "Welcome Back" : "Join Speedcat Hyderabad"}
          </h2>

          <p className="text-xs text-slate-500">
            Sign in to your account or create a new player account.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
                setMessage("");
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 ${
                tab === "login"
                  ? "border-speecat-green text-speedcat-navy"
                  : "border-transparent text-slate-400"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError("");
                setMessage("");
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 ${
                tab === "register"
                  ? "border-speecat-green text-speedcat-navy"
                  : "border-transparent text-slate-400"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label
                  htmlFor="full-name"
                  className="block text-xs font-bold text-speecat-navy mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-speedcat-navy"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-speecat-navy mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-speedcat-navy"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-speecat-navy mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-speedcat-navy"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-speecat-navy hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  <span>
                    {tab === "login" ? "Sign In" : "Create Account"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-speecat-green" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center">
            Your account is managed securely by Supabase Authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
