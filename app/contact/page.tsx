"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "What is ATHLETIQ?",
      a: "ATHLETIQ is a modern sports venue discovery, clubs, and booking preview platform built for Hyderabad, Telangana. It allows sports enthusiasts to explore verified badminton courts, football turfs, cricket pitches, and tennis facilities, as well as join active local clubs with transparent pricing in Indian Rupees (₹).",
    },
    {
      q: "Are the bookings on this preview website real?",
      a: "No. This current website is a prototype demonstration. All booking flows, court availability, event tickets, and confirmations are simulated demo previews. No live financial payments are charged and physical courts are not booked without real-world confirmation.",
    },
    {
      q: "What sports and activities are featured on ATHLETIQ?",
      a: "ATHLETIQ covers Badminton, Football and football turfs (5v5 and 7v7), Cricket and box cricket, Tennis (clay & hard court), Pickleball, Basketball, Table tennis, Swimming, Running clubs, Cycling groups, and Multi-sport facilities.",
    },
    {
      q: "Which Hyderabad localities are included?",
      a: "The directory covers Gachibowli, Kondapur, Madhapur, Hitech City, Kukatpally, Miyapur, Manikonda, Jubilee Hills, Banjara Hills, Secunderabad, Uppal, LB Nagar, and Financial District.",
    },
    {
      q: "How can I add my club or venue to ATHLETIQ?",
      a: "Organisers and venue managers can preview adding venues and clubs through the Admin Dashboard, the Organiser Hub, or import multiple listings using the CSV import tool.",
    },
  ];

  return (
    <div className="bg-[#17191C] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F2]">
            Contact & FAQs
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Frequently asked questions about the ATHLETIQ Hyderabad sports & clubs platform preview
          </p>
        </div>

        {/* FAQs */}
        <div className="bg-[#292D32] rounded-3xl border border-[#373C42] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-[#B7F34A]" />
            <h2 className="text-xl font-bold text-[#F5F5F2]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-sm text-[#F5F5F2] flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    Q
                  </span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form & Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-[#F5F5F2]">
              Get in Touch
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have questions regarding demo venue additions, club setups, or feedback on the ATHLETIQ platform prototype? Send us a message.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#B7F34A] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span>hello@speedcat.hyd (Demo)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#B7F34A] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+91 40 2300 0000 (Preview)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#B7F34A] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Hitech City, Hyderabad 500081</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#292D32] rounded-3xl border border-[#373C42] p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[#F5F5F2]">
                  Message Sent (Demo Mode)
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for trying out ATHLETIQ. Your sample enquiry has been acknowledged in local prototype mode.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#F5F5F2] font-bold underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Reddy"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-speedcat-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vikram@example.com"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-speedcat-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Feedback / Club inquiry / Venue listing"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-speedcat-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your feedback or question regarding ATHLETIQ..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-speedcat-navy"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-speedcat-navy text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Demo Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
