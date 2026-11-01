import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PreviewBanner from "@/components/PreviewBanner";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ATHLETIQ | Sports Booking, Clubs & Hyderabad Community — Your Game. Our Community.",
  description:
    "ATHLETIQ: PLAY • BOOK • CONNECT. Discover sports venues, find players, join active clubs, and book courts across Hyderabad with instant real-time availability.",
  keywords: [
    "ATHLETIQ",
    "Sports Booking Hyderabad",
    "Hyderabad Running Clubs",
    "Badminton courts Hyderabad",
    "Football turf Madhapur",
    "Box cricket Gachibowli",
    "Pickleball Hyderabad",
    "Playo Hyderabad alternative",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0B1020] text-[#F8FAFC] antialiased selection:bg-[#2563EB] selection:text-white">
        <Providers>
          <PreviewBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
