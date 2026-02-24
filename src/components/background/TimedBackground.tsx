"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * TimedBackground コンポーネント
 * 
 * 時間帯に応じて背景を変化させるコンポーネント
 * Phase 2: 現在は昼の背景のみを完全再現（時間帯切り替えは Phase 4 で実装）
 * 
 * パフォーマンス最適化:
 * - React.memo でラップ
 * - GPU 合成を活用 (will-change, transform: translateZ(0))
 * - 画面サイズに応じて雲の表示数を調整
 */

interface TimedBackgroundProps {
  /** デバッグ用: 時間帯を強制指定（Phase 4で使用） */
  timeOfDay?: string;
}

const TimedBackgroundComponent: React.FC<TimedBackgroundProps> = ({ timeOfDay = 'day' }) => {
  // 画面幅に応じて雲の数を調整（パフォーマンス最適化）
  // SSR時は4つ、クライアント側で画面サイズに応じて調整
  const [cloudCount, setCloudCount] = useState(4);
  const [screenWidth, setScreenWidth] = useState(2000); // SSR時のデフォルト値

  useEffect(() => {
    // クライアント側でのみ実行
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

    updateCloudCount();
    window.addEventListener('resize', updateCloudCount);
    return () => window.removeEventListener('resize', updateCloudCount);
  }, []);

  return (
    <>
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-300 to-green-200" />

      {/* 太陽と雲のレイヤー */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Sun with realistic gradient */}
        <motion.div
          animate={{ 
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute right-[12%] top-[8%] h-40 w-40"
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
                background: 'radial-gradient(circle, #fef9c3 0%, #fef08a 30%, #fde047 60%, #facc15 100%)'
              }}
            />
            {/* Outer glow layers */}
            <div 
              className="absolute -inset-2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(254, 249, 195, 0.6) 0%, rgba(254, 240, 138, 0.3) 50%, transparent 100%)'
              }}
            />
            <div 
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(254, 249, 195, 0.4) 0%, rgba(254, 240, 138, 0.2) 40%, transparent 100%)'
              }}
            />
            <div className="absolute inset-0 rounded-full shadow-[0_0_100px_40px_rgba(254,240,138,0.4)]" />
          </div>
        </motion.div>

        {/* Realistic SVG Clouds - 画面サイズに応じて表示数を調整 */}
        {cloudCount >= 1 && (
          <motion.div
            animate={{ x: [-200, screenWidth + 200] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 top-[12%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="220" height="80" viewBox="0 0 220 80" className="drop-shadow-lg">
              <ellipse cx="50" cy="50" rx="35" ry="28" fill="white" opacity="0.95" />
              <ellipse cx="85" cy="45" rx="40" ry="32" fill="white" opacity="0.95" />
              <ellipse cx="120" cy="50" rx="38" ry="30" fill="white" opacity="0.95" />
              <ellipse cx="155" cy="48" rx="35" ry="28" fill="white" opacity="0.95" />
              <ellipse cx="90" cy="55" rx="45" ry="28" fill="#f8fafc" opacity="0.9" />
              <ellipse cx="125" cy="58" rx="42" ry="26" fill="#f1f5f9" opacity="0.85" />
            </svg>
          </motion.div>
        )}

        {cloudCount >= 2 && (
          <motion.div
            animate={{ x: [-250, screenWidth + 250] }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear", delay: 15 }}
            className="absolute left-0 top-[28%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="280" height="100" viewBox="0 0 280 100" className="drop-shadow-lg">
              <ellipse cx="60" cy="60" rx="45" ry="35" fill="white" opacity="0.92" />
              <ellipse cx="110" cy="55" rx="50" ry="40" fill="white" opacity="0.92" />
              <ellipse cx="160" cy="60" rx="48" ry="38" fill="white" opacity="0.92" />
              <ellipse cx="210" cy="58" rx="45" ry="36" fill="white" opacity="0.92" />
              <ellipse cx="115" cy="68" rx="55" ry="35" fill="#f8fafc" opacity="0.88" />
              <ellipse cx="165" cy="70" rx="52" ry="32" fill="#f1f5f9" opacity="0.83" />
            </svg>
          </motion.div>
        )}

        {cloudCount >= 3 && (
          <motion.div
            animate={{ x: [-180, screenWidth + 180] }}
            transition={{ duration: 55, repeat: Infinity, ease: "linear", delay: 30 }}
            className="absolute left-0 top-[48%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="200" height="70" viewBox="0 0 200 70" className="drop-shadow-lg">
              <ellipse cx="45" cy="45" rx="32" ry="25" fill="white" opacity="0.94" />
              <ellipse cx="75" cy="42" rx="36" ry="28" fill="white" opacity="0.94" />
              <ellipse cx="110" cy="45" rx="35" ry="27" fill="white" opacity="0.94" />
              <ellipse cx="140" cy="43" rx="32" ry="25" fill="white" opacity="0.94" />
              <ellipse cx="80" cy="50" rx="40" ry="25" fill="#f8fafc" opacity="0.9" />
              <ellipse cx="115" cy="52" rx="38" ry="23" fill="#f1f5f9" opacity="0.86" />
            </svg>
          </motion.div>
        )}

        {cloudCount >= 4 && (
          <motion.div
            animate={{ x: [-150, screenWidth + 150] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 8 }}
            className="absolute left-0 top-[68%]"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU合成
            }}
          >
            <svg width="180" height="65" viewBox="0 0 180 65" className="drop-shadow-md">
              <ellipse cx="40" cy="42" rx="30" ry="23" fill="white" opacity="0.93" />
              <ellipse cx="68" cy="39" rx="33" ry="26" fill="white" opacity="0.93" />
              <ellipse cx="100" cy="42" rx="32" ry="25" fill="white" opacity="0.93" />
              <ellipse cx="128" cy="40" rx="30" ry="23" fill="white" opacity="0.93" />
              <ellipse cx="72" cy="47" rx="37" ry="23" fill="#f8fafc" opacity="0.89" />
              <ellipse cx="105" cy="49" rx="35" ry="21" fill="#f1f5f9" opacity="0.85" />
            </svg>
          </motion.div>
        )}
      </div>
    </>
  );
};

// React.memo でラップして不要な再レンダリングを防ぐ
export const TimedBackground = React.memo(TimedBackgroundComponent);
