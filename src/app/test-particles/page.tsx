'use client';

import { motion } from 'framer-motion';

function ChampagneBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`champagne-${i}`}
          initial={{ y: "110vh", x: `${Math.random() * 100}vw`, opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
          animate={{ y: "-10vh", opacity: [0, 1, 0] }}
          transition={{
            duration: 8 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px]"
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-white font-display text-3xl italic drop-shadow-md">Champagne Bubbles</h2>
      </div>
    </div>
  );
}

function DustMotes() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          initial={{ 
            y: `${Math.random() * 100}vh`, 
            x: `${Math.random() * 100}vw`, 
            opacity: 0, 
            scale: Math.random() * 3 + 1 
          }}
          animate={{ 
            y: `${Math.random() * 100}vh`, 
            x: `${Math.random() * 100}vw`, 
            opacity: [0, 0.15, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          className="absolute w-6 h-6 bg-white rounded-full blur-[8px]"
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-white font-display text-3xl italic drop-shadow-md">Cinematic Dust Motes</h2>
      </div>
    </div>
  );
}

function GoldDust() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={`gold-${i}`}
          initial={{ 
            y: "110vh", 
            x: `${Math.random() * 100}vw`, 
            opacity: 0 
          }}
          animate={{ 
            y: "-10vh", 
            x: `${Math.random() * 100 + 10}vw`, 
            opacity: [0, 0.8, 0] 
          }}
          transition={{
            duration: 10 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-1.5 h-1.5 bg-[#C7A96B] rounded-full blur-[1px]"
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-white font-display text-3xl italic drop-shadow-md text-[#C7A96B]">Gold Dust</h2>
      </div>
    </div>
  );
}

export default function TestParticlesPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-black">
      <div className="relative flex-1 h-[33vh] md:h-screen border-b md:border-b-0 md:border-r border-white/10">
        <ChampagneBubbles />
      </div>
      <div className="relative flex-1 h-[33vh] md:h-screen border-b md:border-b-0 md:border-r border-white/10">
        <DustMotes />
      </div>
      <div className="relative flex-1 h-[33vh] md:h-screen">
        <GoldDust />
      </div>
    </div>
  );
}
