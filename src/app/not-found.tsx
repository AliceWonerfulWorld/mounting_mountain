"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";


export default function NotFound() {
  // Generate particle properties on client-side only
  const [particles, setParticles] = useState<Array<{
    left: string;
    blur: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      blur: Math.random() * 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    })));
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-900 via-slate-900 to-black text-white flex items-center justify-center">
      {/* Stars background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMC41IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iMTIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTgwIiBjeT0iMTgwIiByPSIwLjgiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Approaching mountain animation */}
      <motion.div
        initial={{ scale: 0.5, y: "30%", opacity: 0 }}
        animate={{ scale: 2, y: "0%", opacity: 0.9 }}
        transition={{
          duration: 3,
          ease: [0.34, 1.56, 0.64, 1]
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <Image
          src="/mountain.png"
          alt="Mountain"
          width={800}
          height={800}
          className="w-full h-auto"
          priority
        />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* 404 Error with dramatic entrance */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            duration: 1,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.3
          }}
          className="mb-8"
        >
          <h1 className="text-[180px] md:text-[250px] font-black leading-none bg-gradient-to-b from-blue-200 via-white to-blue-300 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(59,130,246,0.7))' }}>
            404
          </h1>
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-red-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(255,100,0,0.5))' }}>
            遭難しました
          </h2>
          <p className="text-xl md:text-2xl text-blue-200 font-semibold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.6)' }}>
            お探しのページは見つかりませんでした。
          </p>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            ホームに戻る
          </Link>
        </motion.div>

        {/* Flavor text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-12 text-sm text-blue-300/70 font-medium"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)' }}
        >
          山の頂上を目指して、正しい道を選びましょう 🏔️
        </motion.p>
      </div>

      {/* Floating particles/snow effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            initial={{
              y: -20,
              opacity: 0
            }}
            animate={{
              y: "100vh",
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: particle.left,
              filter: `blur(${particle.blur}px)`
            }}
          />
        ))}
      </div>
    </main>
  );
}
