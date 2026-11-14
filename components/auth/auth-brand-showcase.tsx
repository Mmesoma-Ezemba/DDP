"use client"

import { useEffect, useMemo, useState } from "react"
import { useStableId } from "@/hooks/use-stable-id"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Slide {
  id: string
  eyebrow: string
  title: string
  description: string
  tagline: string
  stats: Array<{
    label: string
    value: string
  }>
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
}

interface AuthBrandShowcaseProps {
  mode: "login" | "signup"
}

export function AuthBrandShowcase({ mode }: AuthBrandShowcaseProps) {
  const slides = useMemo<Slide[]>(() => [
    {
      id: "continuum",
      eyebrow: "Legacy Continuum",
      title: "Automated custody orchestration",
      description: "Blueprint vault inheritance rules, execute trustless transfers, and monitor digital estates with zero downtime observability.",
      tagline: "Quantum-safe encryption envelopes every timeline.",
      stats: [
        { label: "Smart vaults live", value: "4,600+" },
        { label: "Continuity triggers", value: "99.98%" },
      ],
      palette: {
        primary: "rgba(99, 102, 241, 1)",
        secondary: "rgba(6, 182, 212, 1)",
        accent: "rgba(236, 72, 153, 1)",
        background: "rgba(15, 23, 42, 0.65)",
      },
    },
    {
      id: "guardian",
      eyebrow: "Guardian Mesh",
      title: "Programmable beneficiary matrix",
      description: "Compose adaptive beneficiary rings with live attestations, status pings, and verifiable recovery trails across chains.",
      tagline: "Adaptive protocols verify signers in real-time.",
      stats: [
        { label: "Guardian cohorts", value: "12.3K" },
        { label: "False positives", value: "0.004%" },
      ],
      palette: {
        primary: "rgba(34, 197, 94, 1)",
        secondary: "rgba(59, 130, 246, 1)",
        accent: "rgba(56, 189, 248, 1)",
        background: "rgba(17, 24, 39, 0.65)",
      },
    },
    {
      id: "terminal",
      eyebrow: "Cerulean Terminal",
      title: "Immersive vault intelligence",
      description: "Visualize vault telemetry, AI-scout estate anomalies, and deploy executor scripts with cinematic precision.",
      tagline: "Every execution leaves an immutable aurora.",
      stats: [
        { label: "Anomaly detection", value: "AI+" },
        { label: "Latency window", value: "<41ms" },
      ],
      palette: {
        primary: "rgba(147, 51, 234, 1)",
        secondary: "rgba(236, 72, 153, 1)",
        accent: "rgba(16, 185, 129, 1)",
        background: "rgba(24, 24, 42, 0.7)",
      },
    },
  ], [])

  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center gap-3 text-xs font-mono uppercase text-muted-foreground">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary tracking-[0.2em]">
          {mode === "login" ? "DDP ACCESS GRID" : "DDP ORIGIN FLOW"}
        </Badge>
        <span className="hidden md:inline">•</span>
        <span>{slides[activeSlide]?.eyebrow}</span>
      </div>

      <div className="relative flex-1 mt-8">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]",
              index === activeSlide
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-6 scale-95 pointer-events-none"
            )}
          >
            <div className="grid gap-10 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] h-full">
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
                    {slide.eyebrow}
                  </p>
                  <h3 className="text-3xl xl:text-[2.4rem] leading-tight font-display uppercase bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                    {slide.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xl">
                  {slide.description}
                </p>
                <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur">
                  <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
                    {slide.tagline}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-4 pt-2">
                  {slide.stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-white/10 bg-background/30 px-4 py-3 flex flex-col justify-start">
                      <dt className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        {stat.label}
                      </dt>
                      <dd className="text-2xl font-display text-foreground leading-none">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/40 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
                <AnimatedIllustration palette={slide.palette} seed={slide.id} isActive={index === activeSlide} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Switch to ${slide.eyebrow}`}
              onClick={() => setActiveSlide(index)}
              className={cn(
                "group relative h-2 w-full rounded-full overflow-hidden border border-white/10 transition",
                index === activeSlide ? "border-primary/60 shadow-[0_0_18px_rgba(59,130,246,0.4)]" : "opacity-60"
              )}
            >
              <span
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-primary via-chart-1 to-chart-2 transition-transform duration-700",
                  index === activeSlide ? "translate-x-0" : "-translate-x-full group-hover:-translate-x-1/2"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface AnimatedIllustrationProps {
  palette: Slide["palette"]
  seed: string
  isActive: boolean
}

function AnimatedIllustration({ palette, seed, isActive }: AnimatedIllustrationProps) {
  const gradientId = useStableId(`${seed}-gradient`)
  const pulseId = useStableId(`${seed}-pulse`)
  const warpId = useStableId(`${seed}-warp`)
  const orbitId = useStableId(`${seed}-orbit`)

  if (!gradientId || !pulseId || !warpId || !orbitId) {
    return (
      <div className="h-64 w-full bg-gradient-to-r from-primary/20 via-chart-1/15 to-chart-2/20 animate-pulse" />
    )
  }

  return (
    <svg
      className={cn(
        "h-64 w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
        isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}
      viewBox="0 0 640 420"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={palette.primary} stopOpacity="0.95">
            <animate attributeName="stop-opacity" values="0.95;0.75;0.95" dur="9s" repeatCount="indefinite" />
          </stop>
          <stop offset="45%" stopColor={palette.secondary} stopOpacity="0.7">
            <animate attributeName="offset" values="0.35;0.45;0.35" dur="7.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={palette.background} stopOpacity="0.2" />
        </radialGradient>

        <linearGradient id={pulseId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.85">
            <animate attributeName="stop-color" values={`${palette.secondary};${palette.accent};${palette.secondary}`} dur="6.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={palette.accent} stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        <filter id={warpId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feBlend in="SourceGraphic" in2="blur" mode="screen">
            <animate attributeName="in2" values="blur;SourceGraphic;blur" dur="14s" repeatCount="indefinite" />
          </feBlend>
        </filter>

        <filter id={orbitId} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="3" seed="7" result="noise">
            <animate attributeName="baseFrequency" values="0.004;0.002;0.004" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="28">
            <animate attributeName="scale" values="28;40;28" dur="9s" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
      </defs>

      <rect x="0" y="0" width="640" height="420" fill={`url(#${gradientId})`} />

      <g filter={`url(#${warpId})`}>
        <path
          fill="none"
          stroke={`url(#${pulseId})`}
          strokeWidth="2.5"
          d="M120 230 C 180 110, 320 100, 420 180 S 560 340, 520 360"
        >
          <animate
            attributeName="d"
            dur="12s"
            repeatCount="indefinite"
            values="
              M120 230 C 180 110, 320 100, 420 180 S 560 340, 520 360;
              M100 210 C 220 140, 360 120, 440 210 S 580 340, 520 340;
              M120 230 C 180 110, 320 100, 420 180 S 560 340, 520 360
            "
          />
        </path>
        <path
          fill={palette.background}
          fillOpacity="0.18"
          stroke={palette.accent}
          strokeOpacity="0.35"
          d="M80 280 C 200 180, 360 260, 520 160 L 580 220 C 480 320, 320 380, 140 340 Z"
        >
          <animate
            attributeName="d"
            dur="11s"
            repeatCount="indefinite"
            values="
              M80 280 C 200 180, 360 260, 520 160 L 580 220 C 480 320, 320 380, 140 340 Z;
              M60 260 C 220 200, 340 240, 500 180 L 560 240 C 460 320, 320 360, 160 320 Z;
              M80 280 C 200 180, 360 260, 520 160 L 580 220 C 480 320, 320 380, 140 340 Z
            "
          />
        </path>
      </g>

      <g filter={`url(#${orbitId})`}>
        <circle cx="220" cy="150" r="68" fill={palette.accent} fillOpacity="0.12">
          <animate attributeName="r" values="68;82;68" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="420" cy="260" r="52" fill={palette.secondary} fillOpacity="0.16">
          <animate attributeName="cy" values="260;240;260" dur="6s" repeatCount="indefinite" />
          <animate attributeName="r" values="52;64;52" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="320" r="36" fill={palette.primary} fillOpacity="0.22">
          <animate attributeName="cx" values="300;340;300" dur="9s" repeatCount="indefinite" />
        </circle>
      </g>

      <g strokeWidth="1.5" stroke={palette.accent} strokeOpacity="0.5">
        {[0, 1, 2, 3].map((orbit) => (
          <g key={orbit}>
            <circle cx="320" cy="210" r={80 + orbit * 26} fill="none" strokeDasharray="6 18">
              <animateTransform attributeName="transform" type="rotate" from="0 320 210" to="360 320 210" dur={`${18 - orbit * 2}s`} repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy={210 - (80 + orbit * 26)} r="5" fill={palette.secondary}>
              <animateTransform attributeName="transform" type="rotate" from="0 320 210" to="360 320 210" dur={`${14 - orbit * 1.5}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </g>
    </svg>
  )
}
