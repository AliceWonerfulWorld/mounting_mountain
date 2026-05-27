"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Trophy, BookOpen, Zap, Target, User, LogOut, LogIn, UserPlus, History, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TimedBackground } from "@/components/background/TimedBackground";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-gray-900">
      {/* Time-based Background */}
      <TimedBackground />
      {/* Header - Auth Status */}
      <header className="relative z-20 flex w-full items-center justify-center px-3 py-3 sm:justify-end sm:px-6 sm:py-4">
        {loading ? (
          <div className="text-sm text-blue-700 font-semibold">読み込み中...</div>
        ) : user ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <div className="col-span-2 flex min-w-0 items-center justify-center gap-2 rounded-full border border-blue-500/50 bg-white/90 px-3 py-2 backdrop-blur-sm shadow-md sm:max-w-[260px] sm:justify-start sm:px-4">
              <User className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate text-xs font-semibold text-blue-800 sm:text-sm">{user.email}</span>
            </div>
            <Link
              href="/history"
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-white/90 px-3 py-2 text-xs font-semibold text-green-700 backdrop-blur-sm shadow-md transition-all hover:bg-green-50 hover:shadow-lg hover:border-green-600 sm:px-4 sm:text-sm"
            >
              <History className="h-4 w-4" />
              履歴
            </Link>
            <Link
              href="/profile"
              className="flex min-h-10 items-center justify-center rounded-lg border border-purple-500/50 bg-white/90 px-3 py-2 text-xs font-semibold text-purple-700 backdrop-blur-sm shadow-md transition-all hover:bg-purple-50 hover:shadow-lg hover:border-purple-600 sm:px-4 sm:text-sm"
            >
              プロフィール
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="col-span-2 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-white/90 px-3 py-2 text-xs font-semibold text-red-700 backdrop-blur-sm shadow-md transition-all hover:bg-red-50 hover:shadow-lg hover:border-red-600 sm:col-span-1 sm:px-4 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
            <Link
              href="/auth/login"
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-white/90 px-3 py-2 text-xs font-semibold text-blue-700 backdrop-blur-sm shadow-md transition-all hover:bg-blue-50 hover:shadow-lg hover:border-blue-600 sm:px-4 sm:text-sm"
            >
              <LogIn className="h-4 w-4" />
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-orange-500/50 sm:px-4 sm:text-sm"
            >
              <UserPlus className="h-4 w-4" />
              新規登録
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[calc(100svh-64px)] flex-col items-center justify-center overflow-hidden px-3 pb-10 pt-8 text-center sm:px-6 sm:py-16">
        {/* Mountain Image Animation (Behind Hero Content) */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} // Custom ease for "majestic" feel
          className="absolute bottom-0 left-1/2 right-auto -z-10 w-[180vw] max-w-none -translate-x-1/2 pointer-events-none sm:left-0 sm:right-0 sm:w-full sm:translate-x-0"
        >
          <Image
            src="/mountain.png"
            alt="Mountain Background"
            width={1920}
            height={1080}
            className="h-auto w-full object-contain object-bottom opacity-60 drop-shadow-2xl sm:opacity-70"
            priority
          />
          {/* Overlay to blend with background/footer */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-200/60 via-transparent to-transparent" />
        </motion.div>

        {/* Title with natural color */}
        <h1 className="mb-3 text-[clamp(2.35rem,11.5vw,4.5rem)] font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] sm:mb-4 md:text-7xl lg:text-8xl">
          マウンティング
          <br />
          マウンテン
        </h1>

        {/* Altitude Badge */}
        <div className="mb-4 flex max-w-full items-center gap-2 rounded-full border-2 border-white/80 bg-white/90 px-4 py-2 backdrop-blur-md shadow-lg sm:mb-6 sm:px-6">
          <Trophy className="h-5 w-5 shrink-0 text-amber-600" />
          <span className="text-xs font-bold text-gray-800 sm:text-sm">標高で競え！マウント度測定ゲーム</span>
        </div>

        <p className="mb-8 max-w-[22rem] text-base font-semibold leading-relaxed text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] sm:mb-12 sm:max-w-2xl sm:text-xl md:text-2xl">
          『マウント』を&quot;標高&quot;で可視化するAIゲーム
        </p>

        {/* Card Dashboard Container */}
        <div className="flex w-full max-w-6xl flex-col items-center gap-7 px-0 sm:gap-10 sm:px-4">

          {/* Section 1: ゲームモード */}
          <section className="w-full">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent via-white/60 to-white/60" />
              <h2 className="flex items-center gap-2 text-xl font-black text-white drop-shadow-lg sm:text-2xl">
                🎮 <span>ゲームモード</span>
              </h2>
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-white/60 via-white/60 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-2">
              {/* Solo Mode Button - Primary */}
              <Link
                href="/solo"
                className="group relative flex min-h-[84px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-4 py-5 text-center text-lg font-black uppercase tracking-wider text-white shadow-2xl shadow-red-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/80 sm:px-8 sm:py-8 md:text-2xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <Zap className="h-7 w-7 shrink-0 animate-pulse sm:h-8 sm:w-8" />
                  ソロモード
                  <Mountain className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              {/* Versus Mode Button */}
              <Link
                href="/versus/local"
                className="group relative flex min-h-[84px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-4 py-5 text-center text-lg font-black tracking-wider text-white shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/80 sm:px-8 sm:py-8 md:text-2xl"
              >
                <span className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Target className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
                  対戦モード
                  <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-md">Beta</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          </section>

          {/* Section 2: コミュニティ */}
          <section className="w-full">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent via-white/60 to-white/60" />
              <h2 className="flex items-center gap-2 text-lg font-black text-white drop-shadow-lg sm:text-xl">
                📊 <span>コミュニティ</span>
              </h2>
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-white/60 via-white/60 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              <Link
                href="/achievements"
                className="group relative flex min-h-[64px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-4 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/80 sm:px-6 sm:py-6 sm:text-lg"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Trophy className="h-6 w-6" />
                  実績一覧
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              <Link
                href="/ranking"
                className="group relative flex min-h-[64px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 px-4 py-4 text-base font-bold text-white shadow-xl shadow-yellow-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-yellow-500/80 sm:px-6 sm:py-6 sm:text-lg"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Trophy className="h-6 w-6" />
                  ランキング
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              <Link
                href="/howto"
                className="group relative flex min-h-[64px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-slate-600 via-zinc-600 to-neutral-600 px-4 py-4 text-base font-bold text-white shadow-xl shadow-slate-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-slate-500/80 sm:col-span-2 sm:px-6 sm:py-6 sm:text-lg lg:col-span-1"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <BookOpen className="h-6 w-6" />
                  遊び方
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-500 via-slate-500 to-neutral-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          </section>

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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
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
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-200/50 bg-gradient-to-br from-white via-sky-50/80 to-blue-50/90 shadow-2xl backdrop-blur-xl">
                {/* Gradient accent line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500" />
                
                <div className="p-8">
                  {/* Close button */}
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="absolute right-4 top-5 rounded-full p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 hover:rotate-90"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Icon with animated rings */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-orange-400/30 to-red-400/30" />
                      {/* Middle ring */}
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-400/20 to-red-400/20 blur-xl" />
                      {/* Icon container */}
                      <div className="relative rounded-full bg-gradient-to-br from-orange-100 via-red-50 to-rose-100 p-4 shadow-inner">
                        <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-3 shadow-lg">
                          <LogOut className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="mb-3 text-center text-2xl font-black tracking-tight text-gray-800">
                    ログアウトしますか？
                  </h2>

                  {/* Message */}
                  <div className="mb-8 rounded-xl bg-gradient-to-br from-blue-50/80 to-sky-50/80 p-4 shadow-inner">
                    <p className="text-center text-sm leading-relaxed text-gray-700">
                      ログアウトすると、再度ログインするまで
                      <br />
                      <span className="font-bold text-orange-600">履歴の閲覧</span>や
                      <span className="font-bold text-orange-600">ゲームの保存</span>が
                      <br />
                      できなくなります。
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="group flex-1 rounded-xl border-2 border-gray-300 bg-gradient-to-b from-white to-gray-50 px-6 py-3.5 font-bold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-gray-400 hover:shadow-lg active:scale-95"
                    >
                      <span className="flex items-center justify-center gap-2">
                        キャンセル
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="group flex-1 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-orange-600 hover:via-red-600 hover:to-rose-600 hover:shadow-xl hover:shadow-red-300/50 active:scale-95"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <LogOut className="h-4 w-4" />
                        ログアウト
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
