"use client"

import { useStableId } from "@/hooks/use-stable-id"

export function AuthLogoAnimation() {
  const gradientId = useStableId("auth-logo-gradient")

  return (
    <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {gradientId && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-chart-1)" />
            </linearGradient>
          </defs>
        )}

        {/* Outer Ring */}
        <circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke={gradientId ? `url(#${gradientId})` : "var(--color-primary)"}
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.6"
        />

        {/* Middle Ring */}
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke={gradientId ? `url(#${gradientId})` : "var(--color-primary)"}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.4"
        />

        {/* Inner Core - DDP Letters */}
        <text
          x="48"
          y="48"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="30"
          fontWeight="bold"
          fill={gradientId ? `url(#${gradientId})` : "var(--color-primary)"}
          fontFamily="var(--font-display)"
          className="uppercase tracking-wider"
        >
          DDP
        </text>

        {/* Corner Dots */}
        {[
          [20, 20],
          [76, 20],
          [20, 76],
          [76, 76],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3"
            fill="var(--color-primary)"
            opacity="0.8"
          />
        ))}

        {/* Center Ring */}
        <circle cx="48" cy="48" r="8" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  )
}

