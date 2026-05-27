"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "@/lib/solo/missions";

interface MissionBriefingScreenProps {
  mission: Mission | undefined;
  missionTheme: 0 | 1 | 2;
  onStart: () => void;
}

/**
 * ミッション説明画面コンポーネント
 * 
 * 3種類の背景テーマでミッション情報を表示し、ゲーム開始のトリガーを提供します。
 * - Theme 0: 夜の山と星空
 * - Theme 1: 朝焼けの山
 * - Theme 2: 雪山
 */
export function MissionBriefingScreen({
  mission,
  missionTheme,
  onStart
}: MissionBriefingScreenProps) {
  // Theme 0: 星空エフェクト用のランダム値を事前計算
  const [starEffects] = useState(() =>
    Array.from({ length: 30 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 60,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2
    }))
  );

  // Theme 1: 光の粒子用のランダム値を事前計算
  const [particleEffects] = useState(() =>
    Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 2
    }))
  );

  // Theme 2: 雪のエフェクト用のランダム値を事前計算
  const [snowEffects] = useState(() =>
    Array.from({ length: 40 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 3
    }))
  );
  
  /**
   * ミッションの達成条件を日本語テキストで取得
   */
  const getMissionConditionText = (mission: Mission | undefined): string => {
    if (!mission) return '';

    switch (mission.id) {
      case 'TOTAL_15000':
        return `合計標高 ${mission.target?.toLocaleString() || '15,000'}m 以上`;
      case 'EVEREST_1':
        return `1回でも ${mission.target?.toLocaleString() || '8,000'}m 以上`;
      case 'LABELS_3':
        return `${mission.target || 3}種類以上のラベルを出す`;
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden px-3 py-5 sm:px-6 ${
          missionTheme === 0
            ? "bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900"
            : missionTheme === 1
            ? "bg-gradient-to-b from-orange-400 via-pink-400 to-purple-600"
            : "bg-gradient-to-b from-cyan-200 via-blue-300 to-indigo-400"
        }`}
      >
        {/* 背景装飾 - パターン1: 夜の山と星空 */}
        {missionTheme === 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 遠景の山々 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.3, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute bottom-0 left-0 right-0"
            >
              <svg viewBox="0 0 1200 400" className="w-full h-auto opacity-40">
                <path d="M0,400 L0,200 L200,100 L400,180 L600,80 L800,160 L1000,120 L1200,200 L1200,400 Z" fill="url(#mountainGrad)" />
                <defs>
                  <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* 星空エフェクト */}
            <div className="absolute inset-0">
              {starEffects.map((effect, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ delay: effect.delay, duration: effect.duration, repeat: Infinity }}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${effect.left}%`,
                    top: `${effect.top}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 背景装飾 - パターン2: 朝焼けの山 */}
        {missionTheme === 1 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 太陽 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ delay: 0.3, duration: 1.5 }}
              className="absolute right-6 top-16 h-28 w-28 rounded-full bg-yellow-300 blur-2xl sm:right-20 sm:top-20 sm:h-40 sm:w-40"
            />

            {/* 朝焼けの山々 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute bottom-0 left-0 right-0"
            >
              <svg viewBox="0 0 1200 400" className="w-full h-auto">
                <path d="M0,400 L0,250 L150,150 L300,200 L500,100 L700,180 L900,140 L1100,220 L1200,280 L1200,400 Z" fill="rgba(139,92,246,0.4)" />
                <path d="M0,400 L0,300 L200,220 L400,280 L600,180 L800,260 L1000,220 L1200,320 L1200,400 Z" fill="rgba(168,85,247,0.6)" />
              </svg>
            </motion.div>

            {/* 光の粒子 */}
            <div className="absolute inset-0">
              {particleEffects.map((effect, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    y: [100, -100]
                  }}
                  transition={{
                    delay: effect.delay,
                    duration: effect.duration,
                    repeat: Infinity
                  }}
                  className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                  style={{
                    left: `${effect.left}%`,
                    bottom: '0%',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 背景装飾 - パターン3: 雪山 */}
        {missionTheme === 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 雪の山々 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute bottom-0 left-0 right-0"
            >
              <svg viewBox="0 0 1200 400" className="w-full h-auto">
                <path d="M0,400 L0,200 L250,80 L500,160 L750,60 L1000,140 L1200,180 L1200,400 Z" fill="rgba(255,255,255,0.3)" />
                {/* 雪の頂 */}
                <path d="M250,80 L230,95 L220,88 L250,80 L280,88 L270,95 Z" fill="rgba(255,255,255,0.9)" />
                <path d="M750,60 L730,75 L720,68 L750,60 L780,68 L770,75 Z" fill="rgba(255,255,255,0.9)" />
              </svg>
            </motion.div>

            {/* 雪のエフェクト */}
            <div className="absolute inset-0">
              {snowEffects.map((effect, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: ['0vh', '100vh']
                  }}
                  transition={{
                    delay: effect.delay,
                    duration: effect.duration,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute text-white text-xl"
                  style={{
                    left: `${effect.left}%`,
                    top: '-5%',
                  }}
                >
                  ❄️
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-10 w-full max-w-3xl px-0 sm:px-4 md:px-8"
        >
          {/* ヘッダー */}
          <div className="mb-5 text-center sm:mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={`mb-2 text-3xl font-black tracking-tight sm:mb-4 sm:text-5xl md:text-6xl ${
                missionTheme === 2 ? 'text-slate-800' : 'text-white'
              }`}
            >
              MISSION BRIEFING
            </motion.div>
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={missionTheme === 2 ? 'text-base text-slate-600 sm:text-xl' : 'text-base text-slate-300 sm:text-xl'}
            >
              今回の挑戦
            </motion.div>
          </div>

          {/* ミッションカード */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={`rounded-2xl border-2 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:bg-zinc-900/95 sm:rounded-3xl sm:border-4 sm:p-8 md:p-12 ${
              missionTheme === 0
                ? 'border-amber-500/50'
                : missionTheme === 1
                ? 'border-yellow-400/60'
                : 'border-cyan-400/60'
            }`}
          >
            {/* ミッションアイコンとタイトル */}
            <div className="mb-4 text-center sm:mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                className="mb-2 text-5xl sm:mb-4 sm:text-7xl"
              >
                🎯
              </motion.div>
              <div className="text-2xl font-black leading-tight text-gray-800 dark:text-gray-100 sm:text-3xl md:text-4xl">
                {mission?.title || 'ミッション'}
              </div>
            </div>

            {/* ミッション説明 */}
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50 sm:mb-6 sm:rounded-2xl sm:p-6">
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                Mission Description
              </div>
              <div className="text-base leading-relaxed text-gray-800 dark:text-gray-100 sm:text-lg">
                {mission?.description || ''}
              </div>
            </div>

            {/* 達成条件 */}
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50 sm:mb-8 sm:rounded-2xl sm:p-6">
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span>🎯</span>
                <span>Clear Condition</span>
              </div>
              <div className="text-xl font-black leading-tight text-amber-800 dark:text-amber-100 sm:text-2xl md:text-3xl">
                {getMissionConditionText(mission)}
              </div>
            </div>

            {/* スタートボタン */}
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full rounded-xl py-4 text-xl font-bold text-white shadow-lg transition-transform hover:shadow-xl sm:py-6 sm:text-2xl ${
                missionTheme === 0
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  : missionTheme === 1
                  ? 'bg-gradient-to-r from-orange-600 to-pink-600'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span>挑戦を開始する</span>
                <span className="text-2xl sm:text-3xl">🏔️</span>
              </div>
            </motion.button>
          </motion.div>

          {/* ヒント */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className={`text-center mt-6 text-sm ${
              missionTheme === 2 ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
