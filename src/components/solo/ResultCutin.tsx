"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ResultCutinProps {
  show: boolean;
  altitude: number;
}

/**
 * 結果演出カットイン - Let's マウント！
 * ソロモードで各ラウンド終了時に標高測定中を表示
 */
export function ResultCutin({ show, altitude }: ResultCutinProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* 背景 - 山の空 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-orange-400 to-yellow-300" />

          {/* 山のシルエット - 多層で立体感を出す */}
          <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden">
            {/* 最遠景の山々 - 淡い青 */}
            <motion.svg
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewBox="0 0 1200 800"
              className="absolute bottom-0 w-full h-full will-change-transform"
              preserveAspectRatio="xMidYMax slice"
              style={{ willChange: 'transform, opacity' }}
            >
              <path
                d="M0,800 L0,500 L150,400 L300,450 L450,350 L600,380 L750,320 L900,380 L1050,340 L1200,420 L1200,800 Z"
                fill="rgba(30,58,138,0.4)"
              />
            </motion.svg>

            {/* 遠景の山 - より濃い */}
            <motion.svg
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 0.35 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              viewBox="0 0 1200 800"
              className="absolute bottom-0 w-full h-full will-change-transform"
              preserveAspectRatio="xMidYMax slice"
            >
              <path
                d="M0,800 L0,450 L200,320 L400,380 L600,250 L800,320 L1000,280 L1200,380 L1200,800 Z"
                fill="rgba(20,40,100,0.5)"
              />
            </motion.svg>

            {/* 中景の山 - はっきりした山 */}
            <motion.svg
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              viewBox="0 0 1200 800"
              className="absolute bottom-0 w-full h-full will-change-transform"
              preserveAspectRatio="xMidYMax slice"
            >
              <path
                d="M0,800 L0,520 L150,420 L300,480 L450,350 L600,280 L750,380 L900,340 L1050,420 L1200,480 L1200,800 Z"
                fill="rgba(15,30,80,0.7)"
              />
            </motion.svg>

            {/* 近景の山 - 最も濃い */}
            <motion.svg
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 0.85 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
              viewBox="0 0 1200 800"
              className="absolute bottom-0 w-full h-full will-change-transform"
              preserveAspectRatio="xMidYMax slice"
            >
              <path
                d="M0,800 L0,550 L200,450 L400,520 L600,380 L800,480 L1000,440 L1200,540 L1200,800 Z"
                fill="rgba(10,20,60,0.9)"
              />
              {/* 雪の頂 */}
              <path
                d="M600,380 L580,390 L560,385 L540,395 L600,380 L660,395 L640,385 L620,390 Z"
                fill="rgba(255,255,255,0.8)"
              />
              <path
                d="M800,480 L780,490 L760,485 L740,495 L800,480 L860,495 L840,485 L820,490 Z"
                fill="rgba(255,255,255,0.7)"
              />
            </motion.svg>

            {/* 山頂の光の効果 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"
            />
          </div>

          {/* 雲のエフェクト（軽量版） */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              initial={{ x: -100, opacity: 0 }}
              animate={{
                x: "100vw",
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: 12 + i * 2,
                repeat: Infinity,
                delay: i * 3,
                ease: "linear"
              }}
              className="absolute text-5xl will-change-transform z-10"
              style={{
                top: `${25 + i * 20}%`,
                willChange: 'transform, opacity'
              }}
            >
              ☁️
            </motion.div>
          ))}

          {/* 集中線エフェクト（軽量版） */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.15 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.02,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white origin-top will-change-transform"
                style={{
                  transform: `rotate(${(360 / 12) * i}deg) translateX(-50%)`,
                  willChange: 'transform, opacity'
                }}
              />
            ))}
          </div>

          {/* メインカットイン */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">

            {/* 斜めストライプ装飾 - 上 */}
            <motion.div
              initial={{ x: "-100%", rotate: -15 }}
              animate={{ x: "0%", rotate: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-1/4 -left-20 w-[120vw] h-32 bg-gradient-to-r from-black/80 via-black/60 to-transparent border-y-4 border-yellow-300 will-change-transform"
              style={{ transformOrigin: "left center", willChange: 'transform' }}
            >
              {/* 標高メーター風装飾 */}
              <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white font-mono font-bold">
                <span className="text-2xl">📏</span>
                <span className="text-xl">ALTITUDE MEASURING...</span>
              </div>
            </motion.div>

            {/* 斜めストライプ装飾 - 下 */}
            <motion.div
              initial={{ x: "100%", rotate: -15 }}
              animate={{ x: "0%", rotate: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute bottom-1/4 -right-20 w-[120vw] h-32 bg-gradient-to-l from-black/80 via-black/60 to-transparent border-y-4 border-yellow-300 will-change-transform"
              style={{ transformOrigin: "right center", willChange: 'transform' }}
            >
              {/* 山頂到達風装飾 */}
              <div className="absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white font-mono font-bold">
                <span className="text-xl">CLIMBING TO THE TOP</span>
              </div>
            </motion.div>

            {/* メインテキスト */}
            <div className="relative">
              {/* Let's マウント！ */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [90, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  times: [0, 0.6, 1],
                  ease: "easeOut"
                }}
                className="text-center will-change-transform"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  {/* Let's */}
                  <div className="text-5xl md:text-6xl font-black text-white tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                    style={{
                      textShadow: '4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,0,0.8)'
                    }}
                  >
                    Let&apos;s
                  </div>

                  {/* マウント！ */}
                  <motion.div
                    className="text-7xl md:text-9xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 bg-clip-text text-transparent tracking-tight will-change-transform"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      textShadow: '6px 6px 0px rgba(0,0,0,0.9), -3px -3px 0px rgba(255,255,255,0.3)',
                      WebkitTextStroke: '3px #000',
                      paintOrder: 'stroke fill'
                    }}
                  >
                    マウント！
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* サブテキスト - 標高測定中 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <div className="inline-block bg-black/70 backdrop-blur-sm px-8 py-4 rounded-full border-4 border-yellow-400">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div className="text-2xl font-black text-yellow-300 tracking-widest uppercase">
                      標高測定中
                    </div>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-2xl will-change-transform"
                    >
                      🧭
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 下部装飾 - 山頂到達マーク */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl will-change-transform"
                >
                  🏔️
                </motion.div>
                <div className="text-white font-black text-xl tracking-wider">
                  REACH THE SUMMIT
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  className="text-4xl will-change-transform"
                >
                  🏔️
                </motion.div>
              </div>
            </motion.div>

            {/* スキップヒント */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >

            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
