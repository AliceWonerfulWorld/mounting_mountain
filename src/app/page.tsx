"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mountain, Brain, TrendingUp, Sparkles, Trophy, Zap, Target } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Background Elements (Stars) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
        {/* Mountain Image Animation (Behind Hero Content) */}
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} // Custom ease for "majestic" feel
          className="absolute bottom-0 left-0 right-0 -z-10 pointer-events-none"
        >
          <Image
            src="/mountain.png"
            alt="Mountain Background"
            width={1920}
            height={1080}
            className="w-full h-auto object-contain object-bottom opacity-90 drop-shadow-2xl"
            priority
          />
          {/* Overlay to blend with background/footer */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        </motion.div>

        {/* Floating Icons */}
        {/*<div className="mb-6 flex items-center gap-4">
          <div className="animate-bounce">
            <Mountain className="h-20 w-20 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
          </div>
          <div className="animate-pulse">
            <Sparkles className="h-10 w-10 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]" />
          </div>
        </div>
        */}


        {/* Title with Glow Effect */}
        <h1 className="mb-4 bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-6xl font-black leading-tight tracking-tight text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] md:text-7xl lg:text-8xl">
          マウンティング
          <br />
          マウンテン
        </h1>
        
        {/* Altitude Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border-2 border-yellow-400/50 bg-yellow-400/10 px-6 py-2 backdrop-blur-md shadow-lg shadow-black/40">
          <Trophy className="h-5 w-5 text-yellow-400 drop-shadow-md" />
          <span className="text-sm font-bold text-yellow-300 drop-shadow-md">標高で競え！マウント度測定ゲーム</span>
        </div>
        
        <p className="mb-12 max-w-2xl text-xl font-semibold text-blue-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] md:text-2xl">
          『マウント』を“標高”で可視化するAIゲーム
        </p>
        
        {/* Main Actions Container */}
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
          
          {/* Row 1: Solo and Versus */}
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 w-full">
            {/* Solo Mode Button - Primary */}
            <Link
              href="/solo"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-8 py-6 text-xl font-black uppercase tracking-wider text-white shadow-2xl shadow-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-red-500/80 md:flex-1 md:text-2xl flex items-center justify-center text-center"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="h-7 w-7 animate-pulse" />
                ソロモード
                <Mountain className="h-7 w-7" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            {/* Versus Mode Button - Secondary (Now Styled Like Solo) */}
            <Link
              href="/versus/local"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-8 py-6 text-xl font-black tracking-wider text-white shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/80 md:flex-1 md:text-2xl flex items-center justify-center text-center"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Target className="h-7 w-7" />
                対戦モード (Beta)
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
          </div>

          {/* Row 2: Achievements - Tertiary (Now Styled Like Solo) */}
          <Link
            href="/achievements"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-12 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/80 w-full md:w-auto flex items-center justify-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              実績一覧
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 border-t border-blue-400/20 bg-slate-900/50 px-6 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-black text-blue-100 md:text-5xl">
            登頂への道
          </h2>
          <p className="mb-12 text-center text-lg text-blue-300">
            3つのステップで頂点を目指せ
          </p>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1: AI Analysis */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/60 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/40">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/20 blur-3xl transition-all group-hover:bg-blue-400/30" />
              
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Brain className="h-10 w-10 text-white" />
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl font-black text-blue-400">01</span>
                <h3 className="text-2xl font-bold text-white">AI解析</h3>
              </div>
              <p className="text-lg leading-relaxed text-blue-200">
                あなたの何気ない一言をAIが判定。
                
              </p>
            </div>

            {/* Feature 2: Scoring */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-red-900/60 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/40">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-500/20 blur-3xl transition-all group-hover:bg-red-400/30" />
              
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl font-black text-red-400">02</span>
                <h3 className="text-2xl font-bold text-white">標高アップ</h3>
              </div>
              <p className="text-lg leading-relaxed text-red-200">
                マウント度が高いほど、標高アップ。
              </p>
            </div>

            {/* Feature 3: Solo Training */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/60 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-500/20 blur-3xl transition-all group-hover:bg-purple-400/30" />
              
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Mountain className="h-10 w-10 text-white" />
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl font-black text-purple-400">03</span>
                <h3 className="text-2xl font-bold text-white">ソロトレーニング</h3>
              </div>
              <p className="text-lg leading-relaxed text-purple-200">
                まずはソロモードで耐性をつけよう。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-400/20 bg-slate-950/80 px-6 py-8 text-center backdrop-blur-sm">
        <p className="text-sm text-blue-300/80">© 2026 マウンティングマウンテン - 頂点を目指せ 🏔️</p>
      </footer>
    </main>
  );
}
