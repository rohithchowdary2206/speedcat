"use client";

import React, { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
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
  LogOut,
  ShieldCheck,
  Compass,
  BarChart3,
  Flame,
  Home
} from "lucide-react";
import { 
  getNotificationsForPlayer, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  signOut 
} from "@/lib/community";
import { SpeecatNotification } from "@/types/community";
import { useAuth } from "@/components/AuthProvider";
import AthletiqLogo from "@/components/AthletiqLogo";

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
    <header className="sticky top-0 z-40 bg-[#17191C]/95 backdrop-blur-md border-b border-[#292D32] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & City Badge */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <NextLink href="/" className="flex items-center gap-2 group">
              <AthletiqLogo size="md" showTagline />
            </NextLink>

            {/* City Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-[#292D32] hover:bg-[#32373D] px-3 py-1.5 rounded-full text-xs font-semibold text-[#F5F5F2] border border-[#373C42] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#B7F34A]" />
              <span>Hyderabad</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            <NextLink
              href="/"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/" ? "text-[#B7F34A] font-bold" : "text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              Home
            </NextLink>

            <NextLink
              href="/explore"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/explore") || pathname.startsWith("/venue")
                  ? "text-[#B7F34A] font-bold"
                  : "text-[#AEB4B0] hover:text-[#F5F5F2]"
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
                  ? "text-[#B7F34A] font-bold"
                  : "text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              <Compass className="w-4 h-4 text-[#B7F34A]" />
              <span>Clubs</span>
              <span className="text-[10px] bg-[#B7F34A]/15 text-[#B7F34A] border border-[#B7F34A]/30 font-extrabold px-1.5 py-0.2 rounded-full">
                New
              </span>
            </NextLink>

            <NextLink
              href="/games"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/games" || pathname.startsWith("/games/")
                  ? "text-[#B7F34A] font-bold"
                  : "text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Find Games</span>
            </NextLink>

            <NextLink
              href="/host-game"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/host-game"
                  ? "text-[#B7F34A] font-bold"
                  : "text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#B7F34A]" />
              <span>Host Game</span>
            </NextLink>

            <NextLink
              href="/friends"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/friends" ? "text-[#B7F34A] font-bold" : "text-[#AEB4B0] hover:text-[#F5F5F2]"
              }`}
            >
              My Friends
            </NextLink>

            <NextLink
              href="/my-games"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/my-games" ? "text-[#B7F34A] font-bold" : "text-[#AEB4B0] hover:text-[#F5F5F2]"
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
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#292D32] hover:bg-[#32373D] border border-[#373C42] text-[#F5F5F2] font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
            >
              <Flame className="w-3.5 h-3.5 text-[#B7F34A]" />
              <span>Browse Clubs</span>
            </NextLink>

            {authLoading ? (
              <div className="w-24 h-9 rounded-xl bg-[#292D32] animate-pulse" />
            ) : currentUser ? (
              <div className="flex items-center gap-2.5">
                
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2 rounded-xl text-[#AEB4B0] hover:text-[#F5F5F2] hover:bg-[#292D32] transition-colors relative"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#B7F34A] text-[#17191C] text-[10px] font-black rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Drawer */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#292D32] rounded-2xl shadow-2xl border border-[#373C42] py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-[#373C42] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#B7F34A]" />
                          <span className="text-xs font-black uppercase text-[#F5F5F2]">
                            Notifications
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllNotificationsAsRead(currentUser.id);
                              setNotifications(getNotificationsForPlayer(currentUser.id));
                            }}
                            className="text-[11px] font-semibold text-[#B7F34A] hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-[#373C42]">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 hover:bg-[#17191C]/50 transition-colors cursor-pointer text-xs ${
                                !notif.read ? "bg-[#B7F34A]/5" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-[#F5F5F2]">{notif.title}</div>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-[#B7F34A] shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[#AEB4B0] mt-0.5 leading-snug">{notif.message}</p>
                              <div className="text-[10px] text-[#AEB4B0]/60 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-[#AEB4B0]">
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
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#292D32] transition-colors"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-xl object-cover border-2 border-[#B7F34A]"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-[#AEB4B0] hidden sm:block" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#292D32] rounded-2xl shadow-2xl border border-[#373C42] py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-[#373C42]">
                        <div className="font-black text-sm text-[#F5F5F2]">{currentUser.name}</div>
                        <div className="text-[11px] text-[#AEB4B0] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#B7F34A]" />
                          <span>{currentUser.locality}, Hyderabad</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <NextLink
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F2] hover:bg-[#17191C] hover:text-[#B7F34A]"
                        >
                          <User className="w-4 h-4 text-[#B7F34A]" />
                          <span>My Profile & Skills</span>
                        </NextLink>

                        <NextLink
                          href="/my-games"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F2] hover:bg-[#17191C] hover:text-[#B7F34A]"
                        >
                          <Calendar className="w-4 h-4 text-[#B7F34A]" />
                          <span>My Games</span>
                        </NextLink>

                        <NextLink
                          href="/friends"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F2] hover:bg-[#17191C] hover:text-[#B7F34A]"
                        >
                          <Users className="w-4 h-4 text-[#B7F34A]" />
                          <span>My Friends</span>
                        </NextLink>

                        {/* ORGANISER DASHBOARD SHORTCUT */}
                        <NextLink
                          href="/clubs/organizer"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F2] hover:bg-[#17191C] hover:text-[#B7F34A]"
                        >
                          <BarChart3 className="w-4 h-4 text-[#B7F34A]" />
                          <span>Organiser Hub & Revenue</span>
                        </NextLink>

                        <NextLink
                          href={dashboardHref}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F2] hover:bg-[#17191C] hover:text-[#B7F34A]"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
                          <span>My Dashboard</span>
                        </NextLink>
                        {currentUser.role === "admin" && (
                          <NextLink
                            href="/dashboard/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F2] hover:bg-[#17191C] hover:text-[#B7F34A]"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
                            <span>ATHLETIQ Admin Dashboard</span>
                          </NextLink>
                        )}
                      </div>

                      <div className="border-t border-[#373C42] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-[#17191C] transition-colors"
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
                  className="text-xs font-bold text-[#F5F5F2] hover:text-[#B7F34A] px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </NextLink>
                <NextLink
                  href="/login?tab=register"
                  className="bg-[#B7F34A] hover:bg-[#A3E435] text-[#17191C] text-xs font-black px-4 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Sign Up
                </NextLink>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#AEB4B0] hover:text-[#F5F5F2] hover:bg-[#292D32]"
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
        <div className="lg:hidden bg-[#17191C] border-b border-[#292D32] px-4 pt-3 pb-6 space-y-3">
          <div className="pb-3 border-b border-[#292D32]">
            <AthletiqLogo size="sm" />
          </div>

          <div className="space-y-1">
            <NextLink
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              Home
            </NextLink>
            <NextLink
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              Explore Venues
            </NextLink>
            <NextLink
              href="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-[#B7F34A] hover:bg-[#292D32] rounded-lg"
            >
              🏅 Sports & Fitness Clubs
            </NextLink>
            <NextLink
              href="/games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              🏸 Find Games
            </NextLink>
            <NextLink
              href="/host-game"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              ➕ Host a Game
            </NextLink>
            <NextLink
              href="/clubs/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              📊 Organiser Dashboard
            </NextLink>
            <NextLink
              href="/friends"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              👥 My Friends
            </NextLink>
            <NextLink
              href="/my-games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
            >
              📅 My Games
            </NextLink>
            {currentUser && (
              <NextLink
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[#F5F5F2] hover:bg-[#292D32] rounded-lg"
              >
                👤 My Profile ({currentUser.name})
              </NextLink>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#17191C]/95 backdrop-blur-md border-t border-[#292D32] py-2 px-3 flex items-center justify-around shadow-lg">
        <NextLink
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/" ? "text-[#B7F34A]" : "text-[#AEB4B0]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NextLink>

        <NextLink
          href="/explore"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/explore") ? "text-[#B7F34A]" : "text-[#AEB4B0]"
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Venues</span>
        </NextLink>

        <NextLink
          href="/clubs"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/clubs") ? "text-[#B7F34A]" : "text-[#AEB4B0]"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Clubs</span>
        </NextLink>

        <NextLink
          href="/games"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/games") ? "text-[#B7F34A]" : "text-[#AEB4B0]"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Games</span>
        </NextLink>

        <NextLink
          href="/profile"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith("/profile") ? "text-[#B7F34A]" : "text-[#AEB4B0]"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NextLink>
      </div>

    </header>
  );
}
