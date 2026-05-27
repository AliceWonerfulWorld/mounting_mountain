"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, BookOpen, Zap, Target, User, LogOut, LogIn, UserPlus, History, X, ChevronRight, BarChart3, Sparkles, Gauge, Route } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TitleWorldScene } from "@/components/TitleWorldScene";

function StatusPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/[0.18] px-4 py-3 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-900/[0.45]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-950/[0.85]">{value}</div>
    </div>
  );
}

function ModePanel({
  href,
  title,
  subtitle,
  icon,
  accent,
  badge,
  hotkey,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent: string;
  badge?: string;
  hotkey: string;
}) {
  return (
    <Link
      href={href}
      className="group relative grid min-h-[150px] overflow-hidden rounded-[1.6rem] border border-white/[0.28] bg-slate-950/[0.42] p-4 text-left shadow-[0_24px_80px_rgba(74,31,87,0.26)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.45] hover:bg-slate-950/[0.52] sm:p-5"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl transition-opacity group-hover:opacity-35`} />
      <div className="relative z-10 flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-slate-950 shadow-lg`}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs font-black text-white/[0.72]">
                {badge}
              </span>
            )}
            <span className="rounded-full border border-white/[0.12] bg-white/[0.08] px-2 py-1 font-mono text-xs font-black text-white/[0.45]">
              {hotkey}
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">{title}</h2>
            <ChevronRight className="h-7 w-7 shrink-0 text-white/[0.38] transition-transform group-hover:translate-x-1 group-hover:text-white" />
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-white/60">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

function UtilityButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-white/[0.24] bg-slate-950/[0.36] px-4 py-3 text-sm font-black text-white shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-slate-950/[0.48]"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-white/[0.36] transition-transform group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <TitleWorldScene />
      {/* Header - Auth Status */}
      <header className="relative z-20 flex w-full items-center justify-center px-3 py-3 sm:justify-end sm:px-6 sm:py-4">
        {loading ? (
          <div className="rounded-full border border-white/15 bg-slate-950/[0.46] px-4 py-2 text-sm font-semibold text-white/[0.72] backdrop-blur-xl">読み込み中...</div>
        ) : user ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <div className="col-span-2 flex min-w-0 items-center justify-center gap-2 rounded-full border border-white/15 bg-slate-950/[0.48] px-3 py-2 shadow-lg backdrop-blur-xl sm:max-w-[260px] sm:justify-start sm:px-4">
              <User className="h-4 w-4 shrink-0 text-cyan-200" />
              <span className="truncate text-xs font-semibold text-white/[0.82] sm:text-sm">{user.email}</span>
            </div>
            <Link
              href="/history"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/[0.82] shadow-lg backdrop-blur-xl transition-all hover:bg-white/[0.16] sm:px-4 sm:text-sm"
            >
              <History className="h-4 w-4" />
              履歴
            </Link>
            <Link
              href="/profile"
              className="flex min-h-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/[0.82] shadow-lg backdrop-blur-xl transition-all hover:bg-white/[0.16] sm:px-4 sm:text-sm"
            >
              プロフィール
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="col-span-2 flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-300/25 bg-red-500/[0.12] px-3 py-2 text-xs font-semibold text-red-100 shadow-lg backdrop-blur-xl transition-all hover:bg-red-500/20 sm:col-span-1 sm:px-4 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
            <Link
              href="/auth/login"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-950/[0.44] px-3 py-2 text-xs font-semibold text-white/[0.85] shadow-lg backdrop-blur-xl transition-all hover:bg-white/[0.12] sm:px-4 sm:text-sm"
            >
              <LogIn className="h-4 w-4" />
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-orange-500/30 transition-all hover:from-amber-300 hover:to-orange-400 sm:px-4 sm:text-sm"
            >
              <UserPlus className="h-4 w-4" />
              新規登録
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-7xl flex-col justify-center px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/[0.18] p-5 shadow-[0_30px_120px_rgba(74,31,87,0.25)] backdrop-blur-2xl sm:p-7 lg:min-h-[560px]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,0.2),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(56,189,248,0.17),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/[0.12] px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-amber-100">
                  <Sparkles className="h-4 w-4" />
                  AI Mountaineering Battle
                </div>
                <h1 className="text-[clamp(2.75rem,10vw,7.5rem)] font-black leading-[0.9] tracking-tight text-white drop-shadow-[0_10px_32px_rgba(52,25,76,0.5)]">
                  マウンティング
                  <br />
                  マウンテン
                </h1>
                <div className="mt-4 font-mono text-sm font-black uppercase tracking-[0.32em] text-cyan-100/60">
                  Mounting Mountain
                </div>
                <p className="mt-5 max-w-xl text-base font-bold leading-relaxed text-white drop-shadow-[0_3px_14px_rgba(52,25,76,0.45)] sm:text-xl">
                  自慢、言い訳、経験談。AIがマウント発言を解析して、標高として可視化する登頂ゲーム。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatusPill icon={<Gauge className="h-3.5 w-3.5" />} label="判定単位" value="ALTITUDE" />
                <StatusPill icon={<Route className="h-3.5 w-3.5" />} label="ルート" value="SAFE / NORMAL / RISKY" />
                <StatusPill icon={<Target className="h-3.5 w-3.5" />} label="モード" value="SOLO / VERSUS" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4"
          >
            <ModePanel
              href="/solo"
              icon={<Zap className="h-7 w-7" />}
              title="ソロ登頂"
              subtitle="3ラウンドでミッション達成を狙う。天候、ルート、保険が登頂結果を左右します。"
              accent="from-amber-300 via-orange-400 to-rose-500"
              hotkey="01"
            />
            <ModePanel
              href="/versus/local"
              icon={<Target className="h-7 w-7" />}
              title="ローカル対戦"
              subtitle="交互に発言して標高勝負。各ラウンドの勝者と合計標高で競います。"
              accent="from-cyan-300 via-blue-500 to-violet-500"
              badge="Beta"
              hotkey="02"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <UtilityButton href="/achievements" icon={<Trophy className="h-5 w-5" />} label="実績" />
              <UtilityButton href="/ranking" icon={<BarChart3 className="h-5 w-5" />} label="ランキング" />
              <UtilityButton href="/howto" icon={<BookOpen className="h-5 w-5" />} label="遊び方" />
            </div>
          </motion.div>
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
