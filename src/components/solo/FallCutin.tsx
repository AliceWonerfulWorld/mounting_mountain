"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FallCutinProps {
  show: boolean;
}

/**
 * 滑落演出カットイン
 * ソロモードで滑落が発生したときに表示
 */
export function FallCutin({ show }: FallCutinProps) {
  // 岩のエフェクト用のランダム値を事前計算
  const [rockEffects] = useState(() =>
    Array.from({ length: 20 }, () => ({
      initialX: Math.random() * 100,
      left: Math.random() * 100,
      rotateDirection: Math.random() > 0.5 ? 1 : -1,
      duration: 1 + Math.random() * 1,
      delay: Math.random() * 0.5
    }))
  );

  // 亀裂エフェクト用のランダム値を事前計算
  const [crackEffects] = useState(() =>
    Array.from({ length: 8 }, () => ({
      rotation: -5 + Math.random() * 10
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
          {/* 背景 - 危険な赤黒グラデーション */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-red-950 via-red-900 to-black"
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* 落下する岩のエフェクト */}
          <div className="absolute inset-0 overflow-hidden">
            {rockEffects.map((effect, i) => (
              <motion.div
                key={`rock-${i}`}
                initial={{
                  x: `${effect.initialX}%`,
                  y: -50,
                  rotate: 0,
                  opacity: 0.8
                }}
                animate={{
                  y: "110vh",
                  rotate: 360 * effect.rotateDirection,
                  opacity: [0.8, 1, 0]
                }}
                transition={{
                  duration: effect.duration,
                  delay: effect.delay,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute text-3xl will-change-transform"
                style={{
                  left: `${effect.left}%`,
                  willChange: 'transform, opacity'
                }}
              >
                🪨
              </motion.div>
            ))}
          </div>

          {/* 亀裂エフェクト */}
          <div className="absolute inset-0">
            {crackEffects.map((effect, i) => (
              <motion.div
                key={`crack-${i}`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute top-0 w-1 h-full bg-red-300 origin-top will-change-transform"
                style={{
                  left: `${10 + i * 12}%`,
                  transform: `rotate(${effect.rotation}deg)`,
                  willChange: 'transform, opacity'
                }}
              />
            ))}
          </div>

          {/* メインコンテンツ */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* 落下アイコン */}
            <motion.div
              animate={{
                y: [0, 30, 0],
                rotate: [0, 15, -15, 0]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-9xl drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] will-change-transform"
            >
              ⚠️
            </motion.div>

            {/* 滑落テキスト */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.3, 1],
                rotate: [-180, 10, 0]
              }}
              transition={{
                duration: 0.6,
                times: [0, 0.7, 1],
                ease: "easeOut"
              }}
              className="relative will-change-transform"
            >
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 20px rgba(239,68,68,0.8), 6px 6px 0px rgba(0,0,0,0.9)',
                    '0 0 40px rgba(239,68,68,1), 6px 6px 0px rgba(0,0,0,0.9)',
                    '0 0 20px rgba(239,68,68,0.8), 6px 6px 0px rgba(0,0,0,0.9)'
                  ]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl md:text-9xl font-black text-red-500 tracking-tight"
                style={{
                  WebkitTextStroke: '4px #000',
                  paintOrder: 'stroke fill'
                }}
              >
                滑落！
              </motion.div>
            </motion.div>

            {/* サブテキスト */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-2xl border-4 border-red-500"
            >
              <div className="text-2xl font-black text-red-300 tracking-wider">
                標高2000mに落下...
              </div>
            </motion.div>

            {/* 警告ライン */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-96 h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent will-change-transform"
            />

            {/* スキップヒント */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
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
