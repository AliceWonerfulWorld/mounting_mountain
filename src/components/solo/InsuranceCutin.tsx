"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InsuranceCutinProps {
  show: boolean;
}

/**
 * 保険獲得演出カットイン
 * ソロモードで保険を獲得したときに表示
 */
export function InsuranceCutin({ show }: InsuranceCutinProps) {
  // キラキラエフェクト用のランダム値を事前計算
  const [sparkleEffects] = useState(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 2 + Math.random() * 1,
      delay: Math.random() * 1.5
    }))
  );
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* 背景 - 安全な緑青グラデーション */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-teal-900 to-cyan-950"
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* キラキラエフェクト */}
          <div className="absolute inset-0 overflow-hidden">
            {sparkleEffects.map((effect, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{
                  x: `${effect.x}%`,
                  y: `${effect.y}%`,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: effect.duration,
                  delay: effect.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute text-2xl will-change-transform"
                style={{
                  willChange: 'transform, opacity'
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>

          {/* 光の輪エフェクト */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-96 h-96 rounded-full border-4 border-green-400/50" />
          </motion.div>
          <motion.div
            animate={{
              scale: [1.2, 1.4, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[30rem] h-[30rem] rounded-full border-4 border-green-400/30" />
          </motion.div>

          {/* メインコンテンツ */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* 盾アイコン */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.2, 1],
                rotate: [-180, 0, 0]
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut"
              }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  filter: [
                    'drop-shadow(0 0 20px rgba(34,197,94,0.8))',
                    'drop-shadow(0 0 40px rgba(34,197,94,1))',
                    'drop-shadow(0 0 20px rgba(34,197,94,0.8))'
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-9xl will-change-transform"
              >
                🛡️
              </motion.div>
            </motion.div>

            {/* 保険獲得テキスト */}
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{
                scale: [0, 1.2, 1],
                y: 0
              }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                times: [0, 0.7, 1],
                ease: "easeOut"
              }}
              className="relative will-change-transform"
            >
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 20px rgba(34,197,94,0.8), 6px 6px 0px rgba(0,0,0,0.9)',
                    '0 0 40px rgba(34,197,94,1), 6px 6px 0px rgba(0,0,0,0.9)',
                    '0 0 20px rgba(34,197,94,0.8), 6px 6px 0px rgba(0,0,0,0.9)'
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-7xl md:text-8xl font-black text-green-400 tracking-tight"
                style={{
                  WebkitTextStroke: '4px #000',
                  paintOrder: 'stroke fill'
                }}
              >
                保険獲得！
              </motion.div>
            </motion.div>

            {/* サブテキスト */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-2xl border-4 border-green-500">
                <div className="text-2xl font-black text-green-300 tracking-wider">
                  安全ルートで保険を入手
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-emerald-900/50 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-emerald-400/50"
              >
                <div className="text-lg font-bold text-emerald-200 text-center">
                  次回の滑落を1回防ぐことができます
                </div>
              </motion.div>
            </motion.div>

            {/* 装飾ライン */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="w-96 h-2 bg-gradient-to-r from-transparent via-green-400 to-transparent will-change-transform"
            />

            {/* チェックマークエフェクト */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.4, ease: "backOut" }}
              className="flex gap-4 text-5xl"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 1.2, repeat: Infinity, repeatDelay: 1 }}
              >
                ✅
              </motion.span>
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 1.4, repeat: Infinity, repeatDelay: 1 }}
              >
                ✅
              </motion.span>
            </motion.div>

            {/* スキップヒント */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-4"
            >
              <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30">
                <span className="text-base">👆</span>
                <span className="text-xs text-white/90 font-bold">
                  TAP TO CONTINUE
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
