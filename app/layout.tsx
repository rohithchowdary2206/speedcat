import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PreviewBanner from "@/components/PreviewBanner";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Speedcat | Sports Booking, Clubs & Hyderabad Community — Find Your Game. Book Your Court.",
  description:
    "Explore and preview sports venue bookings and active clubs in Hyderabad. Discover badminton courts, football turfs, cricket pitches, running clubs, and sports communities across Gachibowli, Madhapur, Kondapur, and beyond.",
  keywords: [
    "Speedcat",
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
      <body className="min-h-screen flex flex-col bg-white text-speedcat-navy antialiased selection:bg-speedcat-green selection:text-white">
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
