"use client"

import { useStableId } from "@/hooks/use-stable-id"

export function VaultIconAnimated() {
  // Generate unique IDs for this component instance to avoid SVG ID collisions
  const gradientId = useStableId("vault-gradient")
  const filterId = useStableId("vault-filter")

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative"
    >
      {/* Only render defs with IDs on client to avoid hydration issues */}
      {gradientId && filterId && (
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)">
            <animate
              attributeName="stop-color"
              values="var(--color-primary);var(--color-chart-1);var(--color-primary)"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="var(--color-chart-1)">
            <animate
              attributeName="stop-color"
              values="var(--color-chart-1);var(--color-chart-2);var(--color-chart-1)"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <filter id={filterId}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      )}

      {/* Outer rotating ring */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke={gradientId ? `url(#${gradientId})` : "var(--color-primary)"}
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 4"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 24 24"
          to="360 24 24"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Main cube layers */}
      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {/* Back layer */}
        <path
          d="M24 8L14 13L24 18L34 13L24 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          opacity="0.3"
        >
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
        </path>

        {/* Middle layer */}
        <path
          d="M14 22L24 27L34 22"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.6;0.8;0.6" dur="2s" repeatCount="indefinite" />
        </path>

        {/* Front layer */}
        <path
          d="M14 31L24 36L34 31"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.9"
        />

        {/* Vertical connections */}
        <path d="M14 13L14 31" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <path d="M24 18L24 36" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <path d="M34 13L34 31" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Corner nodes */}
      {[
        [14, 13],
        [34, 13],
        [14, 31],
        [34, 31],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2"
          fill="var(--color-primary)"
          opacity="0.5"
        >
          <animate
            attributeName="r"
            values="2;3;2"
            dur="2s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Center pulse */}
      <circle cx="24" cy="27" r="2" fill="var(--color-chart-1)">
        <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

