import React from "react";
import Link from "next/link";
import { Zap, MapPin, Shield, Mail, Phone, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#060A14] text-[#A7B0C0] border-t border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1F2937]">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Zap className="w-6 h-6 fill-white text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#F8FAFC]">
                ATHLET<span className="text-[#FF7139]">IQ</span>
              </span>
            </div>
            
            <p className="text-sm font-semibold text-[#FF7139] uppercase tracking-wider">
              Your Game. Our Community.
            </p>

            <p className="text-xs text-[#A7B0C0] leading-relaxed max-w-sm">
              Hyderabad’s premier sports booking and community platform: PLAY • BOOK • CONNECT. Discover badminton courts, football turfs, box cricket arenas, running groups, and tennis courts across Telangana with verified facilities and real-time slots.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#A7B0C0] pt-2">
              <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>Gachibowli • Madhapur • Kondapur • Hyderabad, TS</span>
            </div>
          </div>

          {/* Quick Sports Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Popular Sports
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B0C0]">
              <li>
                <Link href="/explore?sport=Badminton" className="hover:text-[#2563EB] transition-colors">
                  Badminton Courts
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Football" className="hover:text-[#2563EB] transition-colors">
                  Football Turfs (5v5 & 7v7)
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Cricket" className="hover:text-[#2563EB] transition-colors">
                  Box Cricket Arenas
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Tennis" className="hover:text-[#2563EB] transition-colors">
                  Tennis (Clay & Hard)
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Pickleball" className="hover:text-[#2563EB] transition-colors">
                  Pickleball Courts
                </Link>
              </li>
              <li>
                <Link href="/explore?sport=Swimming" className="hover:text-[#2563EB] transition-colors">
                  Swimming Pools
                </Link>
              </li>
            </ul>
          </div>

          {/* Hyderabad Localities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Top Localities
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B0C0]">
              <li>
                <Link href="/explore?locality=Gachibowli" className="hover:text-[#2563EB] transition-colors">
                  Gachibowli
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Madhapur" className="hover:text-[#2563EB] transition-colors">
                  Madhapur & HITEC City
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Kondapur" className="hover:text-[#2563EB] transition-colors">
                  Kondapur
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Kukatpally" className="hover:text-[#2563EB] transition-colors">
                  Kukatpally & Miyapur
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Manikonda" className="hover:text-[#2563EB] transition-colors">
                  Manikonda & Nanakramguda
                </Link>
              </li>
              <li>
                <Link href="/explore?locality=Banjara Hills" className="hover:text-[#2563EB] transition-colors">
                  Banjara & Jubilee Hills
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Athletiq Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B0C0]">
              <li>
                <Link href="/clubs" className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                  <span>Sports Clubs</span>
                  <span className="text-[10px] bg-[#FF7139]/20 text-[#FF7139] font-bold px-1.5 rounded-full">New</span>
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-[#2563EB] transition-colors">
                  Find Games
                </Link>
              </li>
              <li>
                <Link href="/host-game" className="hover:text-[#2563EB] transition-colors">
                  Host a Game
                </Link>
              </li>
              <li>
                <Link href="/friends" className="hover:text-[#2563EB] transition-colors">
                  My Sports Friends
                </Link>
              </li>
              <li>
                <Link href="/dashboard/host" className="hover:text-[#2563EB] transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#2563EB] transition-colors">
                  About ATHLETIQ
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7B0C0]">
          <div>
            © {new Date().getFullYear()} ATHLETIQ. PLAY • BOOK • CONNECT. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <span>•</span>
            <span className="text-slate-500">Built for Hyderabad Sports Community</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
