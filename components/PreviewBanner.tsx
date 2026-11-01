"use client";

import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

export default function PreviewBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#292D32] border-b border-[#373C42] px-4 py-2.5 text-xs sm:text-sm text-[#F5F5F2]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-[#B7F34A] bg-[#B7F34A]/10 border border-[#B7F34A]/30 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B7F34A]" />
            Preview Directory
          </span>
          <p className="font-medium text-[#AEB4B0] leading-snug">
            Venue and club details are displayed for demonstration. Listings do not imply an official partnership with ATHLETIQ.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#AEB4B0] hover:text-[#F5F5F2] p-1 rounded-md transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
