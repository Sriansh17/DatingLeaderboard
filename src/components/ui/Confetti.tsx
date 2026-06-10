"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = [
  "rgb(var(--primary))",
  "rgb(var(--gold))",
  "#FF6B8A",
  "#FFB3C6",
  "#F0D78C",
  "#DCBE78",
  "#FF5E7D",
  "#E8C86A",
];

interface ConfettiProps {
  active: boolean;
  particleCount?: number;
}

export function Confetti({ active, particleCount = 60 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
    delay: number;
    duration: number;
    drift: number;
  }>>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 40,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 5000);
    return () => clearTimeout(timer);
  }, [active, particleCount]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 1,
            x: `${p.x}vw`,
            y: `${p.y}vh`,
            rotate: p.rotation,
            scale: 1,
          }}
          animate={{
            opacity: [1, 1, 0],
            y: ["0vh", "110vh"],
            x: [`${p.x}vw`, `${p.x + p.drift}vw`],
            rotate: p.rotation + 180 + Math.random() * 180,
            scale: [1, 1.2, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </div>
  );
}
