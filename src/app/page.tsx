"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Trophy, BookOpen, Zap, Target, User, LogOut, LogIn, UserPlus, History, AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Header - Auth Status */}
      <header className="relative z-20 flex items-center justify-end px-6 py-4 gap-4">
        {loading ? (
          <div className="text-sm text-blue-300">読み込み中...</div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-900/30 px-4 py-2 backdrop-blur-sm">
              <User className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-semibold text-blue-100">{user.email}</span>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-2 rounded-lg border border-green-400/50 bg-green-900/30 px-4 py-2 text-sm font-semibold text-green-100 backdrop-blur-sm transition-all hover:bg-green-800/50 hover:shadow-lg hover:shadow-green-500/20"
            >
              <History className="h-4 w-4" />
              履歴
            </Link>
            <Link
              href="/profile"
              className="rounded-lg border border-purple-400/50 bg-purple-900/30 px-4 py-2 text-sm font-semibold text-purple-100 backdrop-blur-sm transition-all hover:bg-purple-800/50 hover:shadow-lg hover:shadow-purple-500/20"
            >
              プロフィール
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 rounded-lg border border-red-400/50 bg-red-900/30 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur-sm transition-all hover:bg-red-800/50 hover:shadow-lg hover:shadow-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-lg border border-blue-400/50 bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur-sm transition-all hover:bg-blue-800/50 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <LogIn className="h-4 w-4" />
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-orange-500/50"
            >
              <UserPlus className="h-4 w-4" />
              新規登録
            </Link>
          </div>
        )}
      </header>

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

          {/* Row 2: Achievements, Ranking and HowTo */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
            <Link
              href="/achievements"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/80 w-full md:flex-1 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                実績一覧
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/ranking"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-yellow-500/40 transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/80 w-full md:flex-1 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                ランキング
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/howto"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-600 via-zinc-600 to-neutral-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-slate-500/40 transition-all duration-300 hover:scale-105 hover:shadow-slate-500/80 w-full md:flex-1 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                遊び方
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-500 via-slate-500 to-neutral-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
          </div>
        </div>
      </section>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-md rounded-2xl border border-red-400/50 bg-gradient-to-br from-slate-800/95 to-zinc-900/95 p-8 shadow-2xl backdrop-blur-md">
                {/* Close button */}
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-red-500/20 p-3">
                    <AlertTriangle className="h-12 w-12 text-red-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-center text-2xl font-black text-white">
                  ログアウトしますか？
                </h2>

                {/* Message */}
                <p className="mb-8 text-center text-sm text-gray-300">
                  ログアウトすると、再度ログインするまで
                  <br />
                  履歴の閲覧やゲームの保存ができなくなります。
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700/50 px-6 py-3 font-bold text-white transition-all hover:bg-gray-600/50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-red-500/50"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
