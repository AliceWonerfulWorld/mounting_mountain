'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { SoloRoundCutinBackground } from './SoloRoundCutinBackground';
import { SoloRoundCutinContent } from './SoloRoundCutinContent';

export type SoloRoundCutinTheme = 0 | 1 | 2;

interface SoloRoundCutinProps {
  show: boolean;
  roundNumber: number;
  theme: SoloRoundCutinTheme;
  mission?: string;
  onSkip?: () => void;
}

const THEME_BACKGROUNDS: Record<SoloRoundCutinTheme, string> = {
  0: 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900',
  1: 'bg-gradient-to-b from-blue-900 via-cyan-800 to-blue-950',
  2: 'bg-gradient-to-b from-emerald-900 via-green-800 to-emerald-950',
};

export default function SoloRoundCutin({
  show,
  roundNumber,
  theme,
  mission,
  onSkip,
}: SoloRoundCutinProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onSkip}
          className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer overflow-hidden ${THEME_BACKGROUNDS[theme]}`}
        >
          <SoloRoundCutinBackground theme={theme} />
          <SoloRoundCutinContent
            roundNumber={roundNumber}
            theme={theme}
            mission={mission}
            showSkipHint={Boolean(onSkip)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
