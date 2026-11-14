"use client"

import { useStableId } from "@/hooks/use-stable-id"
import Image from "next/image"

interface BeneficiaryAvatarAnimatedProps {
  avatar?: string
  name: string
  isPrimary?: boolean
}

export function BeneficiaryAvatarAnimated({
  avatar,
  name,
  isPrimary = false,
}: BeneficiaryAvatarAnimatedProps) {
  const ringGradientId = useStableId("avatar-gradient")
  const glowFilterId = useStableId("avatar-glow")

  return (
    <div className="relative w-20 h-20">
      {/* SVG Ring Animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isPrimary ? "var(--color-chart-1)" : "var(--color-primary)"}>
              <animate
                attributeName="stop-color"
                values={
                  isPrimary
                    ? "var(--color-chart-1);var(--color-chart-2);var(--color-chart-1)"
                    : "var(--color-primary);var(--color-chart-3);var(--color-primary)"
                }
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="var(--color-chart-2)">
              <animate
                attributeName="stop-color"
                values="var(--color-chart-2);var(--color-primary);var(--color-chart-2)"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <filter id={glowFilterId}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rotating outer ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={`url(#${ringGradientId})`}
          strokeWidth="2"
          strokeDasharray="10 5"
          opacity="0.6"
          filter={`url(#${glowFilterId})`}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur={isPrimary ? "12s" : "16s"}
            repeatCount="indefinite"
          />
        </circle>

        {/* Inner ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={`url(#${ringGradientId})`}
          strokeWidth="1"
          opacity="0.3"
        >
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Primary indicator */}
        {isPrimary && (
          <circle cx="50" cy="10" r="3" fill="var(--color-chart-1)">
            <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Avatar Image */}
      <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-border bg-accent">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-display">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

