"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getWeather, type WeatherId } from "@/lib/solo/weather";
import { getLabelJa } from "@/lib/labels";

interface WeatherDetailModalProps {
  weatherId: WeatherId;
  isOpen: boolean;
  onClose: () => void;
}

export function WeatherDetailModal({ weatherId, isOpen, onClose }: WeatherDetailModalProps) {
  const weather = getWeather(weatherId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className={`p-6 ${weatherId === "SUNNY"
              ? "bg-gradient-to-br from-blue-400 to-blue-600"
              : weatherId === "WINDY"
                ? "bg-gradient-to-br from-teal-400 to-teal-600"
                : "bg-gradient-to-br from-indigo-400 to-indigo-600"
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{weather.emoji}</span>
                  <div>
                    <div className="text-xs font-semibold text-white/80 uppercase tracking-wider">Weather</div>
                    <h3 className="text-2xl font-black text-white">{weather.label}</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-4">
              {/* 説明 */}
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  効果
                </div>
                <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                  {weather.description}
                </div>
              </div>

              {/* ブーストラベル */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚡</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    ボーナス条件
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-amber-900 dark:text-amber-100">
                    「{getLabelJa(weather.boostLabel)}」
                  </span>
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    のラベルで
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  +20% ボーナス
                </div>
              </div>

              {/* 閉じるボタン */}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
