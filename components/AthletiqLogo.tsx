import React from "react";

interface AthletiqLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export function AthletiqIcon({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ATHLETIQ Monogram"
    >
      {/* Background badge in Graphite */}
      <rect width="100" height="100" rx="22" fill="#17191C" />
      <rect width="100" height="100" rx="22" stroke="#292D32" strokeWidth="2" />

      {/* Geometric Angular 'A' Monogram - Off-White (#F5F5F2) */}
      {/* Left angled ascending limb */}
      <path
        d="M 44 20 L 51 20 L 26 80 L 16 80 Z"
        fill="#F5F5F2"
      />
      {/* Right angled descending limb */}
      <path
        d="M 49 20 L 56 20 L 84 80 L 74 80 Z"
        fill="#F5F5F2"
      />
      {/* Apex peak cap */}
      <polygon
        points="44,20 56,20 50,14"
        fill="#F5F5F2"
      />

      {/* Dynamic Lime Motion Stroke (#B7F34A) slashing through the A with athletic forward momentum */}
      <polygon
        points="14,64 78,48 88,52 24,70"
        fill="#B7F34A"
      />
      {/* Subtle Mint shadow detail on stroke */}
      <polygon
        points="24,70 88,52 84,54 20,71"
        fill="#E7F2D0"
        opacity="0.7"
      />
    </svg>
  );
}

export default function AthletiqLogo({
  className = "",
  iconOnly = false,
  size = "md",
  showTagline = false,
}: AthletiqLogoProps) {
  const iconSizes = {
    sm: 30,
    md: 40,
    lg: 48,
    xl: 60,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <AthletiqIcon size={iconSizes[size]} className="shrink-0" />

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span
              className={`font-black tracking-tight text-[#F5F5F2] ${textSizes[size]} uppercase leading-none font-sans`}
              style={{ letterSpacing: "-0.03em" }}
            >
              ATHLET<span className="text-[#B7F34A]">IQ</span>
            </span>
          </div>

          {showTagline && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#AEB4B0] mt-1">
              Your Game. Our Community.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
