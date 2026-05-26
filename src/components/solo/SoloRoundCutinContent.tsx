'use client';

import { motion } from 'framer-motion';
import type { SoloRoundCutinTheme } from './SoloRoundCutin';

type SoloRoundCutinContentProps = {
  roundNumber: number;
  theme: SoloRoundCutinTheme;
  mission?: string;
  showSkipHint: boolean;
};

const THEME_COPY = {
  0: {
    icon: '⛰️',
    backgroundIcon: '🏔️',
    badge: 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-400/50',
    stage: 'bg-slate-800/80 border-amber-500/30',
    accentText: 'text-amber-400',
    mission: 'bg-slate-800/90 border-amber-500/40',
    dot: 'bg-amber-500',
    pulseDot: 'bg-orange-500',
    lineForward: 'bg-gradient-to-r from-amber-500 to-orange-500',
    lineBackward: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },
  1: {
    icon: '☁️',
    backgroundIcon: '☁️',
    badge: 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/50',
    stage: 'bg-blue-900/80 border-cyan-500/30',
    accentText: 'text-cyan-400',
    mission: 'bg-blue-900/90 border-cyan-500/40',
    dot: 'bg-cyan-500',
    pulseDot: 'bg-blue-500',
    lineForward: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    lineBackward: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  2: {
    icon: '🌲',
    backgroundIcon: '🌲',
    badge: 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/50',
    stage: 'bg-emerald-900/80 border-green-500/30',
    accentText: 'text-green-400',
    mission: 'bg-emerald-900/90 border-green-500/40',
    dot: 'bg-green-500',
    pulseDot: 'bg-emerald-500',
    lineForward: 'bg-gradient-to-r from-green-500 to-emerald-500',
    lineBackward: 'bg-gradient-to-r from-emerald-500 to-green-500',
  },
} as const;

export function SoloRoundCutinContent({
  roundNumber,
  theme,
  mission,
  showSkipHint,
}: SoloRoundCutinContentProps) {
  const themeCopy = THEME_COPY[theme];

  return (
    <>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 pointer-events-none max-w-4xl px-8"
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className={`inline-flex items-center gap-3 text-white px-6 py-3 rounded-lg shadow-2xl border-2 ${themeCopy.badge}`}>
            <span className="text-2xl">{themeCopy.icon}</span>
            <span className="text-lg font-bold tracking-wider">ROUND</span>
            <span className="text-sm opacity-80">|</span>
            <span className="text-sm font-mono opacity-90">ラウンド</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 scale-150">
              <div className="text-[20rem]">{themeCopy.backgroundIcon}</div>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="text-[12rem] md:text-[16rem] font-black text-white drop-shadow-2xl leading-none tracking-tight">
                {roundNumber}
              </div>

              <div className={`mt-4 backdrop-blur-sm px-4 py-2 rounded-lg border ${themeCopy.stage}`}>
                <div className={`text-sm font-mono font-bold whitespace-nowrap ${themeCopy.accentText}`}>
                  STAGE {roundNumber}/3
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {mission && (
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className={`inline-block backdrop-blur-md border-2 rounded-2xl px-8 py-6 shadow-2xl max-w-2xl ${themeCopy.mission}`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${themeCopy.dot}`} />
                <div className={`text-xs font-bold tracking-widest ${themeCopy.accentText}`}>
                  お題
                </div>
                <div className={`w-3 h-3 rounded-full ${themeCopy.dot}`} />
              </div>

              <div className="text-2xl md:text-3xl font-bold text-white leading-relaxed">{mission}</div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${themeCopy.dot}`} />
            <div className={`w-16 h-0.5 ${themeCopy.lineForward}`} />
            <div className={`w-3 h-3 rounded-full animate-pulse ${themeCopy.pulseDot}`} />
            <div className={`w-16 h-0.5 ${themeCopy.lineBackward}`} />
            <div className={`w-2 h-2 rounded-full ${themeCopy.dot}`} />
          </div>
        </motion.div>
      </motion.div>

      {showSkipHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl border border-slate-600">
            <span className="text-lg">👆</span>
            <span className="text-sm font-medium text-slate-300">タップでスキップ</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
