import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import AthletiqLogo from "@/components/AthletiqLogo";

export default function Footer() {
  return (
    <footer className="bg-[#121416] text-[#AEB4B0] border-t border-[#292D32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#292D32]">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <AthletiqLogo size="md" showTagline />
            </Link>

            <p className="text-xs text-[#AEB4B0] leading-relaxed max-w-sm pt-2">
              Hyderabad’s premier sports booking and community platform: PLAY • BOOK • CONNECT. Discover badminton courts, football turfs, box cricket arenas, running groups, and tennis courts across Telangana with verified facilities and real-time slots.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#AEB4B0] pt-1">
              <MapPin className="w-4 h-4 text-[#B7F34A] shrink-0" />
              <span>Gachibowli • Madhapur • Kondapur • Hyderabad, TS</span>
            </div>
          </div>

          {/* Quick Sports Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F5F5F2] uppercase tracking-wider">
              Popular Sports
            </h4>
            <ul className="space-y-2 text-xs text-[#AEB4B0]">
              <li>
                <Link href="/explore?sport=Badminton" className="hover:text-[#B7F34A] transition-colors">
                  Badminton Courts
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Football" className="hover:text-[#B7F34A] transition-colors">
                  Football Turfs (5v5 & 7v7)
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Cricket" className="hover:text-[#B7F34A] transition-colors">
                  Box Cricket Arenas
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Tennis" className="hover:text-[#B7F34A] transition-colors">
                  Tennis (Clay & Hard)
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Pickleball" className="hover:text-[#B7F34A] transition-colors">
                  Pickleball Courts
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Swimming" className="hover:text-[#B7F34A] transition-colors">
                  Swimming Pools
                </Link>
              </li>
            </ul>
          </div>

          {/* Hyderabad Localities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F5F5F2] uppercase tracking-wider">
              Top Localities
            </h4>
            <ul className="space-y-2 text-xs text-[#AEB4B0]">
              <li>
                <Link href="/explore?locality=Gachibowli" className="hover:text-[#B7F34A] transition-colors">
                  Gachibowli
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Madhapur" className="hover:text-[#B7F34A] transition-colors">
                  Madhapur & HITEC City
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Kondapur" className="hover:text-[#B7F34A] transition-colors">
                  Kondapur
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Kukatpally" className="hover:text-[#B7F34A] transition-colors">
                  Kukatpally & Miyapur
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Manikonda" className="hover:text-[#B7F34A] transition-colors">
                  Manikonda & Nanakramguda
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Banjara Hills" className="hover:text-[#B7F34A] transition-colors">
                  Banjara & Jubilee Hills
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F5F5F2] uppercase tracking-wider">
              Athletiq Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#AEB4B0]">
              <li>
                <Link href="/clubs" className="hover:text-[#B7F34A] transition-colors flex items-center gap-1.5">
                  <span>Sports Clubs</span>
                  <span className="text-[10px] bg-[#B7F34A]/15 text-[#B7F34A] border border-[#B7F34A]/30 font-bold px-1.5 rounded-full">New</span>
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-[#B7F34A] transition-colors">
                  Find Games
                </Link>
              </li>
              <li>
                <Link href="/host-game" className="hover:text-[#B7F34A] transition-colors">
                  Host a Game
                </Link>
              </li>
              <li>
                <Link href="/friends" className="hover:text-[#B7F34A] transition-colors">
                  My Sports Friends
                </Link>
              </li>
              <li>
                <Link href="/dashboard/host" className="hover:text-[#B7F34A] transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#B7F34A] transition-colors">
                  About ATHLETIQ
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AEB4B0]">
          <div>
            © {new Date().getFullYear()} ATHLETIQ. PLAY • BOOK • CONNECT. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-[#F5F5F2] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#F5F5F2] transition-colors">
              Contact
            </Link>
            <span>•</span>
            <span className="text-[#AEB4B0]/60">Built for Hyderabad Sports Community</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
