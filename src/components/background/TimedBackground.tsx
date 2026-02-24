"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimeOfDayExtended } from "@/hooks/useTimeOfDay";
import type { TimeOfDay } from "@/lib/timeOfDayConfig";

/**
 * TimedBackground コンポーネント
 * 
 * 時間帯に応じて背景を変化させるコンポーネント
 * Phase 6: 最終調整・パフォーマンス最適化完了
 * 
 * 機能:
 * - 6つの時間帯（Dawn, Morning, Day, Afternoon, Sunset, Night）
 * - 各時間帯で異なる空のグラデーション、太陽/月の位置・色
 * - 時間帯別のアニメーション速度（脈動・雲の流れ）
 * - 夜は星空エフェクト
 * - 時間帯切り替え時のスムーズなトランジション（2秒フェード）
 * 
 * パフォーマンス最適化:
 * - React.memo でラップ
 * - useMemo で設定取得を最適化
 * - GPU 合成を活用 (will-change, transform: translateZ(0))
 * - 画面サイズに応じて雲の表示数を調整（モバイル2つ、タブレット3つ、デスクトップ4つ）
 * - resize イベントのthrottling
 * - AnimatePresenceでDOMの効率的な更新
 */

// 星コンポーネント（メモ化で最適化）
const Stars = React.memo(() => {
  const stars = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 70}%`,
      baseOpacity: 0.3 + Math.random() * 0.7,
      minOpacity: 0.1 + Math.random() * 0.3,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            opacity: star.baseOpacity,
          }}
          animate={{
            opacity: [star.baseOpacity, star.minOpacity, star.baseOpacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
});

Stars.displayName = "Stars";

// 時間帯ごとの背景設定
interface TimeConfig {
  skyGradient: string;
  sun: {
    position: string;
    size: string;
    coreGradient: string;
    glowGradient1: string;
    glowGradient2: string;
    shadowColor: string;
    pulseSpeed: number; // 脈動の速度（秒）
    pulseScale: [number, number, number]; // 脈動のスケール値
  };
  clouds: {
    fill: string;
    fillAlt1: string;
    fillAlt2: string;
    opacity: number;
    baseSpeed: number; // 基本速度の倍率
  };
  stars?: boolean; // 星を表示するか
}

const TIME_CONFIGS: Record<TimeOfDay, TimeConfig> = {
  dawn: {
    skyGradient: "from-orange-300 via-pink-300 to-purple-400",
    sun: {
      position: "right-[15%] bottom-[15%]", // 地平線近く
      size: "h-32 w-32",
      coreGradient: "radial-gradient(circle, #fed7aa 0%, #fdba74 30%, #fb923c 60%, #f97316 100%)",
      glowGradient1: "radial-gradient(circle, rgba(251, 146, 60, 0.5) 0%, rgba(249, 115, 22, 0.25) 50%, transparent 100%)",
      glowGradient2: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.15) 40%, transparent 100%)",
      shadowColor: "rgba(251, 146, 60, 0.4)",
      pulseSpeed: 8,
      pulseScale: [1, 1.03, 1],
    },
    clouds: {
      fill: "#fecaca", // ピンク系
      fillAlt1: "#fde68a", // 薄いオレンジ
      fillAlt2: "#fed7aa", // 薄いピーチ
      opacity: 0.85,
      baseSpeed: 0.8,
    },
  },
  morning: {
    skyGradient: "from-sky-300 via-blue-200 to-green-100",
    sun: {
      position: "right-[12%] top-[20%]",
      size: "h-36 w-36",
      coreGradient: "radial-gradient(circle, #fef9c3 0%, #fef08a 30%, #fde047 60%, #facc15 100%)",
      glowGradient1: "radial-gradient(circle, rgba(254, 249, 195, 0.6) 0%, rgba(254, 240, 138, 0.3) 50%, transparent 100%)",
      glowGradient2: "radial-gradient(circle, rgba(254, 249, 195, 0.4) 0%, rgba(254, 240, 138, 0.2) 40%, transparent 100%)",
      shadowColor: "rgba(254, 240, 138, 0.4)",
      pulseSpeed: 7,
      pulseScale: [1, 1.025, 1],
    },
    clouds: {
      fill: "white",
      fillAlt1: "#f8fafc",
      fillAlt2: "#f1f5f9",
      opacity: 0.95,
      baseSpeed: 1.1,
    },
  },
  day: {
    skyGradient: "from-sky-400 via-blue-300 to-green-200",
    sun: {
      position: "right-[12%] top-[8%]",
      size: "h-40 w-40",
      coreGradient: "radial-gradient(circle, #fef9c3 0%, #fef08a 30%, #fde047 60%, #facc15 100%)",
      glowGradient1: "radial-gradient(circle, rgba(254, 249, 195, 0.6) 0%, rgba(254, 240, 138, 0.3) 50%, transparent 100%)",
      glowGradient2: "radial-gradient(circle, rgba(254, 249, 195, 0.4) 0%, rgba(254, 240, 138, 0.2) 40%, transparent 100%)",
      shadowColor: "rgba(254, 240, 138, 0.4)",
      pulseSpeed: 6,
      pulseScale: [1, 1.02, 1],
    },
    clouds: {
      fill: "white",
      fillAlt1: "#f8fafc",
      fillAlt2: "#f1f5f9",
      opacity: 0.95,
      baseSpeed: 1.0,
    },
  },
  afternoon: {
    skyGradient: "from-sky-400 via-blue-300 to-amber-100",
    sun: {
      position: "right-[20%] top-[15%]",
      size: "h-38 w-38",
      coreGradient: "radial-gradient(circle, #fef3c7 0%, #fde68a 30%, #fcd34d 60%, #fbbf24 100%)",
      glowGradient1: "radial-gradient(circle, rgba(253, 230, 138, 0.6) 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%)",
      glowGradient2: "radial-gradient(circle, rgba(253, 230, 138, 0.4) 0%, rgba(251, 191, 36, 0.2) 40%, transparent 100%)",
      shadowColor: "rgba(251, 191, 36, 0.4)",
      pulseSpeed: 7,
      pulseScale: [1, 1.02, 1],
    },
    clouds: {
      fill: "white",
      fillAlt1: "#fef9c3",
      fillAlt2: "#fef3c7",
      opacity: 0.92,
      baseSpeed: 0.9,
    },
  },
  sunset: {
    skyGradient: "from-orange-400 via-pink-400 to-purple-500",
    sun: {
      position: "left-[15%] bottom-[18%]",
      size: "h-36 w-36",
      coreGradient: "radial-gradient(circle, #fed7aa 0%, #fdba74 20%, #fb923c 50%, #f97316 80%, #ea580c 100%)",
      glowGradient1: "radial-gradient(circle, rgba(251, 146, 60, 0.7) 0%, rgba(249, 115, 22, 0.4) 50%, transparent 100%)",
      glowGradient2: "radial-gradient(circle, rgba(251, 146, 60, 0.5) 0%, rgba(249, 115, 22, 0.25) 40%, transparent 100%)",
      shadowColor: "rgba(249, 115, 22, 0.5)",
      pulseSpeed: 9,
      pulseScale: [1, 1.035, 1],
    },
    clouds: {
      fill: "#fca5a5",
      fillAlt1: "#fbbf24",
      fillAlt2: "#f97316",
      opacity: 0.88,
      baseSpeed: 0.7,
    },
  },
  night: {
    skyGradient: "from-indigo-950 via-purple-900 to-slate-800",
    sun: {
      position: "left-[15%] top-[12%]",
      size: "h-32 w-32",
      coreGradient: "radial-gradient(circle, #f8fafc 0%, #e2e8f0 30%, #cbd5e1 60%, #94a3b8 100%)",
      glowGradient1: "radial-gradient(circle, rgba(248, 250, 252, 0.4) 0%, rgba(203, 213, 225, 0.2) 50%, transparent 100%)",
      glowGradient2: "radial-gradient(circle, rgba(248, 250, 252, 0.3) 0%, rgba(203, 213, 225, 0.15) 40%, transparent 100%)",
      shadowColor: "rgba(203, 213, 225, 0.3)",
      pulseSpeed: 10,
      pulseScale: [1, 1.015, 1],
    },
    clouds: {
      fill: "#475569",
      fillAlt1: "#334155",
      fillAlt2: "#1e293b",
      opacity: 0.7,
      baseSpeed: 0.6,
    },
    stars: true,
  },
};

interface TimedBackgroundProps {
  /** デバッグ用: 時間帯を強制指定 */
  debugTimeOfDay?: TimeOfDay;
}

const TimedBackgroundComponent: React.FC<TimedBackgroundProps> = ({ debugTimeOfDay }) => {
  // 現在の時間帯を取得
  const { timeOfDay: currentTimeOfDay } = useTimeOfDayExtended();
  const timeOfDay = debugTimeOfDay || currentTimeOfDay;
  
  // 時間帯に応じた設定を取得（useMemoで最適化）
  const config = useMemo(() => TIME_CONFIGS[timeOfDay], [timeOfDay]);
  
  // 画面幅に応じて雲の数を調整（パフォーマンス最適化）
  // SSR時は4つ、クライアント側で画面サイズに応じて調整
  const [cloudCount, setCloudCount] = useState(4);
  const [screenWidth, setScreenWidth] = useState(2000); // SSR時のデフォルト値

  useEffect(() => {
    // クライアント側でのみ実行
    let timeoutId: NodeJS.Timeout;
    
    const updateCloudCount = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      if (width < 768) {
        setCloudCount(2); // モバイル: 2つ
      } else if (width < 1024) {
        setCloudCount(3); // タブレット: 3つ
      } else {
        setCloudCount(4); // デスクトップ: 4つ
      }
    };

    // Throttling: resize イベントを200msごとに制限
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateCloudCount, 200);
    };

    updateCloudCount();
    window.addEventListener('resize', throttledResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledResize);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={timeOfDay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {/* 背景グラデーション */}
        <div className={`absolute inset-0 bg-gradient-to-b ${config.skyGradient}`} />

        {/* 太陽と雲のレイヤー */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* 星（夜のみ表示） */}
          {config.stars && <Stars />}

          {/* Sun/Moon with realistic gradient */}
        <motion.div
          animate={{ 
            scale: config.sun.pulseScale,
          }}
          transition={{ 
            duration: config.sun.pulseSpeed, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className={`absolute ${config.sun.position} ${config.sun.size}`}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)', // GPU合成
          }}
        >
          <div className="relative h-full w-full">
            {/* Sun core with radial gradient */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: config.sun.coreGradient
              }}
            />
            {/* Outer glow layers */}
            <div 
              className="absolute -inset-2 rounded-full"
              style={{
                background: config.sun.glowGradient1
              }}
            />
            <div 
              className="absolute -inset-4 rounded-full"
              style={{
                background: config.sun.glowGradient2
              }}
            />
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                boxShadow: `0 0 100px 40px ${config.sun.shadowColor}`
              }}
            />
          </div>
        </motion.div>

        {/* Realistic SVG Clouds - 画面サイズに応じて表示数を調整 */}
        {cloudCount >= 1 && (
          <motion.div
            animate={{ x: [-200, screenWidth + 200] }}
            transition={{ duration: 50 / config.clouds.baseSpeed, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 top-[12%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="220" height="80" viewBox="0 0 220 80" className="drop-shadow-lg">
              <ellipse cx="50" cy="50" rx="35" ry="28" fill={config.clouds.fill} opacity={config.clouds.opacity} />
              <ellipse cx="85" cy="45" rx="40" ry="32" fill={config.clouds.fill} opacity={config.clouds.opacity} />
              <ellipse cx="120" cy="50" rx="38" ry="30" fill={config.clouds.fill} opacity={config.clouds.opacity} />
              <ellipse cx="155" cy="48" rx="35" ry="28" fill={config.clouds.fill} opacity={config.clouds.opacity} />
              <ellipse cx="90" cy="55" rx="45" ry="28" fill={config.clouds.fillAlt1} opacity={config.clouds.opacity - 0.05} />
              <ellipse cx="125" cy="58" rx="42" ry="26" fill={config.clouds.fillAlt2} opacity={config.clouds.opacity - 0.1} />
            </svg>
          </motion.div>
        )}

        {cloudCount >= 2 && (
          <motion.div
            animate={{ x: [-250, screenWidth + 250] }}
            transition={{ duration: 70 / config.clouds.baseSpeed, repeat: Infinity, ease: "linear", delay: 15 }}
            className="absolute left-0 top-[28%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="280" height="100" viewBox="0 0 280 100" className="drop-shadow-lg">
              <ellipse cx="60" cy="60" rx="45" ry="35" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.03} />
              <ellipse cx="110" cy="55" rx="50" ry="40" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.03} />
              <ellipse cx="160" cy="60" rx="48" ry="38" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.03} />
              <ellipse cx="210" cy="58" rx="45" ry="36" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.03} />
              <ellipse cx="115" cy="68" rx="55" ry="35" fill={config.clouds.fillAlt1} opacity={config.clouds.opacity - 0.07} />
              <ellipse cx="165" cy="70" rx="52" ry="32" fill={config.clouds.fillAlt2} opacity={config.clouds.opacity - 0.12} />
            </svg>
          </motion.div>
        )}

        {cloudCount >= 3 && (
          <motion.div
            animate={{ x: [-180, screenWidth + 180] }}
            transition={{ duration: 55 / config.clouds.baseSpeed, repeat: Infinity, ease: "linear", delay: 30 }}
            className="absolute left-0 top-[48%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="200" height="70" viewBox="0 0 200 70" className="drop-shadow-lg">
              <ellipse cx="45" cy="45" rx="32" ry="25" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.01} />
              <ellipse cx="75" cy="42" rx="36" ry="28" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.01} />
              <ellipse cx="110" cy="45" rx="35" ry="27" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.01} />
              <ellipse cx="140" cy="43" rx="32" ry="25" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.01} />
              <ellipse cx="80" cy="50" rx="40" ry="25" fill={config.clouds.fillAlt1} opacity={config.clouds.opacity - 0.05} />
              <ellipse cx="115" cy="52" rx="38" ry="23" fill={config.clouds.fillAlt2} opacity={config.clouds.opacity - 0.09} />
            </svg>
          </motion.div>
        )}

        {cloudCount >= 4 && (
          <motion.div
            animate={{ x: [-150, screenWidth + 150] }}
            transition={{ duration: 60 / config.clouds.baseSpeed, repeat: Infinity, ease: "linear", delay: 8 }}
            className="absolute left-0 top-[68%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="180" height="65" viewBox="0 0 180 65" className="drop-shadow-md">
              <ellipse cx="40" cy="42" rx="30" ry="23" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.02} />
              <ellipse cx="68" cy="39" rx="33" ry="26" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.02} />
              <ellipse cx="100" cy="42" rx="32" ry="25" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.02} />
              <ellipse cx="128" cy="40" rx="30" ry="23" fill={config.clouds.fill} opacity={config.clouds.opacity - 0.02} />
              <ellipse cx="72" cy="47" rx="37" ry="23" fill={config.clouds.fillAlt1} opacity={config.clouds.opacity - 0.06} />
              <ellipse cx="105" cy="49" rx="35" ry="21" fill={config.clouds.fillAlt2} opacity={config.clouds.opacity - 0.1} />
            </svg>
          </motion.div>
        )}
      </div>
      </motion.div>
    </AnimatePresence>
  );
};

// React.memo でラップして不要な再レンダリングを防ぐ
export const TimedBackground = React.memo(TimedBackgroundComponent);
