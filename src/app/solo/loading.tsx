"use client";

import { motion } from "framer-motion";
import { Mountain, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function SoloLoading() {
  const [dots] = useState<number[]>([0, 1, 2]); // Initial state for stability
  const [particles, setParticles] = useState<{ x1: number; x2: number; duration: number; delay: number; left: number }[]>([]);

  useEffect(() => {
    // Generate random particles on client side only
    const timer = setTimeout(() => {
      const newParticles = Array.from({ length: 15 }).map(() => ({
        x1: Math.random() * 100 - 50,
        x2: Math.random() * 100 - 50,
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 3,
        left: Math.random() * 100,
      }));
      setParticles(newParticles);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Mountain Silhouettes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Back Layer Mountains */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-800/40 to-transparent blur-sm"
          style={{
            clipPath: "polygon(0% 100%, 0% 60%, 20% 40%, 40% 55%, 60% 35%, 80% 50%, 100% 30%, 100% 100%)",
          }}
        />

        {/* Front Layer Mountains */}
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-700/60 to-transparent"
          style={{
            clipPath: "polygon(0% 100%, 0% 70%, 15% 45%, 35% 60%, 50% 30%, 70% 55%, 85% 40%, 100% 50%, 100% 100%)",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Climbing Icon Animation */}
        <motion.div
          animate={{
            y: [20, -10, 20],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <Mountain className="h-24 w-24 text-blue-300 drop-shadow-[0_0_30px_rgba(147,197,253,0.8)]" />

          {/* Arrow Moving Up */}
          <motion.div
            animate={{
              y: [10, -40],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-0 -translate-x-1/2"
          >
            <ArrowUp className="h-8 w-8 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-4">
          <motion.h2
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-4xl font-black text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          >
            登山準備中...
          </motion.h2>

          {/* Loading Dots */}
          <div className="flex gap-2">
            {dots.map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                className="h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
              />
            ))}
          </div>
        </div>

        {/* Flavor Text */}
        <motion.p
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-lg font-semibold text-blue-200/80"
        >
          ミッションを準備しています
        </motion.p>
      </div>

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [600, -100],
              x: [p.x1, p.x2],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
            className="absolute h-1 w-1 rounded-full bg-blue-300/60"
            style={{
              left: `${p.left}%`,
              bottom: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
