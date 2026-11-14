"use client"

import { useStableId } from "@/hooks/use-stable-id"

export function EnhancedCyberpunkBackground() {
  const gradientId1 = useStableId("cyber-bg-gradient-1")
  const gradientId2 = useStableId("cyber-bg-gradient-2")
  const gradientId3 = useStableId("cyber-bg-gradient-3")
  const glowFilterId = useStableId("cyber-bg-glow")
  const noiseFilterId = useStableId("cyber-bg-noise")

  return (
    <>
      {/* Base Dark Layer */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-background via-background to-background/95" />

      {/* Animated SVG Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Advanced Gradients */}
            <radialGradient id={gradientId1} cx="30%" cy="30%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4">
                <animate
                  attributeName="stop-opacity"
                  values="0.4;0.8;0.4"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="var(--color-chart-1)" stopOpacity="0.2">
                <animate
                  attributeName="stop-opacity"
                  values="0.2;0.5;0.2"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <radialGradient id={gradientId2} cx="70%" cy="70%">
              <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity="0.3">
                <animate
                  attributeName="stop-opacity"
                  values="0.3;0.6;0.3"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.15">
                <animate
                  attributeName="stop-opacity"
                  values="0.15;0.4;0.15"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={gradientId3} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="var(--color-chart-1)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity="0.6" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id={glowFilterId}>
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Noise Filter */}
            <filter id={noiseFilterId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
              <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
            </filter>
          </defs>

          {/* Radial Gradient Orbs */}
          <circle cx="576" cy="324" r="600" fill={`url(#${gradientId1})`} />
          <circle cx="1344" cy="756" r="600" fill={`url(#${gradientId2})`} />

          {/* Animated Grid Lines - Enhanced */}
          <g className="grid-lines" opacity="0.15">
            {[...Array(25)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 43.2}
                x2="1920"
                y2={i * 43.2}
                stroke={`url(#${gradientId3})`}
                strokeWidth="0.5"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.4;0.1"
                  dur={`${4 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}
            {[...Array(35)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 54.86}
                y1="0"
                x2={i * 54.86}
                y2="1080"
                stroke={`url(#${gradientId3})`}
                strokeWidth="0.5"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.4;0.1"
                  dur={`${3 + (i % 4)}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </g>

          {/* Hexagonal Pattern */}
          <g className="hex-pattern" opacity="0.08">
            {[...Array(15)].map((_, row) =>
              [...Array(20)].map((_, col) => {
                const x = col * 100 + (row % 2) * 50
                const y = row * 86.6
                return (
                  <polygon
                    key={`hex-${row}-${col}`}
                    points={`${x},${y - 30} ${x + 25.98},${y - 15} ${x + 25.98},${y + 15} ${x},${y + 30} ${x - 25.98},${y + 15} ${x - 25.98},${y - 15}`}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="0.5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur={`${5 + ((row + col) % 3)}s`}
                      begin={`${(row + col) * 0.1}s`}
                      repeatCount="indefinite"
                    />
                  </polygon>
                )
              })
            )}
          </g>

          {/* Data Stream Lines */}
          {[...Array(12)].map((_, i) => {
            const x = (i * 160) % 1920
            const delay = i * 0.8
            return (
              <g key={`stream-${i}`}>
                <line
                  x1={x}
                  y1="0"
                  x2={x + 80}
                  y2="1080"
                  stroke={`url(#${gradientId3})`}
                  strokeWidth="2"
                  strokeDasharray="20 10"
                  opacity="0"
                  filter={`url(#${glowFilterId})`}
                >
                  <animate
                    attributeName="opacity"
                    values="0;0.6;0"
                    dur="6s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,-1080;0,0;0,1080"
                    dur="12s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            )
          })}

          {/* Pulsing Nodes */}
          {[...Array(20)].map((_, i) => {
            const cx = (i * 200 + Math.sin(i) * 150) % 1920
            const cy = (i * 150 + Math.cos(i) * 100) % 1080
            const delay = i * 0.3
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="var(--color-primary)"
                  opacity="0.8"
                  filter={`url(#${glowFilterId})`}
                >
                  <animate
                    attributeName="r"
                    values="3;6;3"
                    dur="3s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="3s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Connection Lines */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="20"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values="20;40;20"
                    dur="4s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.4;0"
                    dur="4s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )
          })}

          {/* Scanning Beams */}
          <g className="scan-beams">
            {[0, 1, 2].map((i) => (
              <rect
                key={`beam-${i}`}
                x="0"
                y="0"
                width="1920"
                height="3"
                fill="var(--color-primary)"
                opacity="0"
                filter={`url(#${glowFilterId})`}
              >
                <animate
                  attributeName="y"
                  values="-10;1090;-10"
                  dur="15s"
                  begin={`${i * 5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.7;0"
                  dur="15s"
                  begin={`${i * 5}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>

          {/* Cyberpunk Geometric Shapes */}
          <g className="cyber-shapes" opacity="0.3" filter={`url(#${glowFilterId})`}>
            {[...Array(10)].map((_, i) => {
              const x = (i * 200) % 1920
              const y = (i * 150) % 1080
              const delay = i * 0.6
              const rotation = i * 36
              return (
                <g key={`shape-${i}`} transform={`translate(${x}, ${y})`}>
                  <polygon
                    points="0,-40 34.64,20 -34.64,20"
                    fill="none"
                    stroke={`url(#${gradientId3})`}
                    strokeWidth="2"
                    opacity="0"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;0.6;0"
                      dur="6s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`${rotation}`}
                      to={`${rotation + 360}`}
                      dur="12s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                  </polygon>
                </g>
              )
            })}
          </g>

          {/* Corner Tech Frames */}
          <g className="corner-frames" opacity="0.5">
            {/* Top Left */}
            <g>
              <path
                d="M 0,0 L 250,0 L 250,3 L 3,3 L 3,250 L 0,250 Z"
                fill={`url(#${gradientId3})`}
              >
                <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
              </path>
              <circle cx="15" cy="15" r="3" fill="var(--color-primary)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* Top Right */}
            <g>
              <path
                d="M 1920,0 L 1670,0 L 1670,3 L 1917,3 L 1917,250 L 1920,250 Z"
                fill={`url(#${gradientId3})`}
              >
                <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" repeatCount="indefinite" />
              </path>
              <circle cx="1905" cy="15" r="3" fill="var(--color-chart-1)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* Bottom Left */}
            <g>
              <path
                d="M 0,1080 L 250,1080 L 250,1077 L 3,1077 L 3,830 L 0,830 Z"
                fill={`url(#${gradientId3})`}
              >
                <animate attributeName="opacity" values="0.5;1;0.5" dur="5s" repeatCount="indefinite" />
              </path>
              <circle cx="15" cy="1065" r="3" fill="var(--color-chart-2)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* Bottom Right */}
            <g>
              <path
                d="M 1920,1080 L 1670,1080 L 1670,1077 L 1917,1077 L 1917,830 L 1920,830 Z"
                fill={`url(#${gradientId3})`}
              >
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
              </path>
              <circle cx="1905" cy="1065" r="3" fill="var(--color-primary)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        </svg>
      </div>

      {/* Noise/Grain Overlay */}
      <div 
        className="fixed inset-0 -z-[5] opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette Effect */}
      <div 
        className="fixed inset-0 -z-[5] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </>
  )
}
