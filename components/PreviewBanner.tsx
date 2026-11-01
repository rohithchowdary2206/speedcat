"use client";

import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

export default function PreviewBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#1F2937] border-b border-[#374151] px-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-[#FF7139] bg-[#FF7139]/10 border border-[#FF7139]/30 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF7139]" />
            Preview Directory
          </span>
          <p className="font-medium text-[#A7B0C0] leading-snug">
            Venue and club details are displayed for demonstration. Listings do not imply an official partnership with ATHLETIQ.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#A7B0C0] hover:text-white p-1 rounded-md transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
