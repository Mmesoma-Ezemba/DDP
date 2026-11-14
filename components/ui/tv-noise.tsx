"use client";

import React from "react";

interface TVNoiseProps {
  className?: string;
  opacity?: number;
  intensity?: number;
  speed?: number;
}

// Disabled heavy canvas imageData generation to ensure 60fps smooth scrolling and instant click response
export default function TVNoise({
  className,
}: TVNoiseProps) {
  return null;
}

