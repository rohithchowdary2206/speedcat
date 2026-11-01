"use client";

import React, { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Zap, 
  MapPin, 
  Search, 
  User, 
  Menu, 
  X, 
  Users, 
  Calendar, 
  PlusCircle, 
  Bell, 
  ChevronDown,
  Sparkles,
  LogOut,
  ShieldCheck,
  Check,
  Building2,
  ExternalLink,
  Compass,
  BarChart3,
  Flame
} from "lucide-react";
import { 
  getNotificationsForPlayer, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  signOut
} from "@/lib/community";
import { SpeecatNotification } from "@/types/community";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { profile: currentUser, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<SpeecatNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadState = () => {
    if (currentUser) {
      setNotifications(getNotificationsForPlayer(currentUser.id));
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadState();

    const handleAuthChange = () => loadState();
    const handleNotifChange = () => {
      if (currentUser) setNotifications(getNotificationsForPlayer(currentUser.id));
    };

    window.addEventListener("speecat_auth_changed", handleAuthChange);
    window.addEventListener("speecat_notifications_changed", handleNotifChange);
    window.addEventListener("speedcat_clubs_changed", handleNotifChange);

    return () => {
      window.removeEventListener("speecat_auth_changed", handleAuthChange);
      window.removeEventListener("speecat_notifications_changed", handleNotifChange);
      window.removeEventListener("speedcat_clubs_changed", handleNotifChange);
    };
  }, [currentUser]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: SpeecatNotification) => {
    markNotificationAsRead(notif.id);
    setNotifications(getNotificationsForPlayer(currentUser?.id || ""));
    setNotifOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setProfileMenuOpen(false);
    router.push("/");
  };

  const dashboardHref =
    currentUser?.role === "admin"
      ? "/dashboard/admin"
      : currentUser?.role === "host"
      ? "/dashboard/host"
      : "/dashboard/player";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & City Badge */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <NextLink href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-speecat-navy flex items-center justify-center text-speecat-green shadow-md group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-speecat-green text-speecat-green" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-speecat-navy">
                    SPEED<span className="text-speecat-green">CAT</span>
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 hidden sm:block">
                  Sports, Clubs & Community
                </p>
              </div>
            </NextLink>

            {/* City Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-speecat-navy border border-slate-200 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-speecat-green" />
              <span>Hyderabad</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            <NextLink
              href="/"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/" ? "text-speecat-green font-bold" : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              Home
            </NextLink>

            <NextLink
              href="/explore"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/explore") || pathname.startsWith("/venue")
                  ? "text-speecat-green font-bold"
                  : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explore Venues</span>
            </NextLink>

            {/* CLUBS TAB */}
            <NextLink
              href="/clubs"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/clubs")
                  ? "text-speecat-green font-bold"
                  : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Clubs</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">
                New
              </span>
            </NextLink>

            <NextLink
              href="/games"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/games" || pathname.startsWith("/games/")
                  ? "text-speecat-green font-bold"
                  : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Find Games</span>
            </NextLink>

            <NextLink
              href="/host-game"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/host-game"
                  ? "text-speecat-green font-bold"
                  : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-speecat-green" />
              <span>Host Game</span>
            </NextLink>

            <NextLink
              href="/friends"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/friends" ? "text-speecat-green font-bold" : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              My Friends
            </NextLink>

            <NextLink
              href="/my-games"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/my-games" ? "text-speecat-green font-bold" : "text-slate-600 hover:text-speecat-green"
              }`}
            >
              My Games
            </NextLink>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            
            {/* Quick Explore Clubs CTA */}
            <NextLink
              href="/clubs"
              className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
            >
              <Flame className="w-3.5 h-3.5 text-speecat-green" />
              <span>Browse Clubs</span>
            </NextLink>

            {authLoading ? (
              <div className="w-24 h-9 rounded-xl bg-slate-100 animate-pulse" />
            ) : currentUser ? (
              <div className="flex items-center gap-2.5">
                
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2 rounded-xl text-slate-600 hover:text-speecat-navy hover:bg-slate-100 transition-colors relative"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Drawer */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-speecat-green" />
                          <span className="text-xs font-black uppercase text-speecat-navy">
                            Notifications
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllNotificationsAsRead(currentUser.id);
                              setNotifications(getNotificationsForPlayer(currentUser.id));
                            }}
                            className="text-[11px] font-semibold text-speecat-green hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                                !notif.read ? "bg-emerald-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-speecat-navy">{notif.title}</div>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-speecat-green shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications right now
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar & Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-xl object-cover border-2 border-speecat-green"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-black text-sm text-speecat-navy">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-speecat-green" />
                          <span>{currentUser.locality}, Hyderabad</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <NextLink
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-speecat-green"
                        >
                          <User className="w-4 h-4 text-speecat-green" />
                          <span>My Profile & Skills</span>
                        </NextLink>

                        <NextLink
                          href="/my-games"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-speecat-green"
                        >
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>My Games</span>
                        </NextLink>

                        <NextLink
                          href="/friends"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-speecat-green"
                        >
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>My Friends</span>
                        </NextLink>

                        {/* ORGANISER DASHBOARD SHORTCUT */}
                        <NextLink
                          href="/clubs/organizer"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-speecat-green"
                        >
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                          <span>Organiser Hub & Revenue</span>
                        </NextLink>

                        <NextLink
                          href={dashboardHref}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-speecat-green"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>My Dashboard</span>
                        </NextLink>
                        {currentUser.role === "admin" && (
                          <NextLink
                            href="/dashboard/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-speecat-green"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Speedcat Admin Dashboard</span>
                          </NextLink>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NextLink
                  href="/login"
                  className="text-xs font-bold text-speecat-navy hover:text-speecat-green px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </NextLink>
                <NextLink
                  href="/login?tab=register"
                  className="bg-speecat-navy hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                >
                  Sign Up
                </NextLink>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-speecat-navy hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <NextLink
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              Home
            </NextLink>
            <NextLink
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              Explore Venues
            </NextLink>
            <NextLink
              href="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-speecat-green hover:bg-slate-50 rounded-lg"
            >
              🏅 Sports & Fitness Clubs
            </NextLink>
            <NextLink
              href="/games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              🏸 Find Games
            </NextLink>
            <NextLink
              href="/host-game"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              ➕ Host a Game
            </NextLink>
            <NextLink
              href="/clubs/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              📊 Organiser Dashboard
            </NextLink>
            <NextLink
              href="/friends"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              👥 My Friends
            </NextLink>
            <NextLink
              href="/my-games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
            >
              📅 My Games
            </NextLink>
            {currentUser && (
              <NextLink
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-speecat-navy hover:bg-slate-50 rounded-lg"
              >
                👤 My Profile ({currentUser.name})
              </NextLink>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <NextLink
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/" ? "text-speecat-green" : "text-slate-500"
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>Home</span>
        </NextLink>

        <NextLink
          href="/explore"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/explore") ? "text-speecat-green" : "text-slate-500"
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Venues</span>
        </NextLink>

        <NextLink
          href="/clubs"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/clubs") ? "text-speecat-green" : "text-slate-500"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Clubs</span>
        </NextLink>

        <NextLink
          href="/games"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/games") ? "text-speecat-green" : "text-slate-500"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Games</span>
        </NextLink>

        <NextLink
          href="/profile"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/profile") ? "text-speecat-green" : "text-slate-500"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NextLink>
      </div>

    </header>
  );
}
