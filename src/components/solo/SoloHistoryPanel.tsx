"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Round } from "@/types/game";
import { DetailedMountain } from "@/components/DetailedMountain";
import { getRoute } from "@/lib/solo/routes";

interface SoloHistoryPanelProps {
  rounds: Round[];
  isOpen: boolean;
  onToggle: () => void;
}

export function SoloHistoryPanel({ rounds, isOpen, onToggle }: SoloHistoryPanelProps) {
  // 結果のあるラウンドのみをフィルター
  const completedRounds = rounds.filter(r => r.result);

  return (
    <section className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 font-bold text-gray-600 dark:text-gray-300">
          <span>📜 登頂履歴</span>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {completedRounds.length}
          </span>
        </div>
        <div
          className="text-gray-400 transform transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 border-t border-gray-100 dark:border-zinc-800">
              {completedRounds.map((r, i) => (
                <div
                  key={r.id}
                  className="group relative rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">#{i + 1}</span>
                      {r.routeId && (
                        <span className="text-lg" title={getRoute(r.routeId).label}>
                          {getRoute(r.routeId).emoji}
                        </span>
                      )}
                      <span className="font-bold text-gray-800 dark:text-gray-200">{r.prompt}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-lg font-mono tracking-tight text-gray-900 dark:text-white">
                        {r.result?.altitude.toLocaleString()} m
                      </div>
                      {(r.result?.bonusAltitude ?? 0) > 0 && (
                        <div className="text-[10px] text-yellow-600 font-bold">
                          (+{r.result?.bonusAltitude})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-gray-300 dark:border-zinc-700 italic">
                    &ldquo;{r.inputText}&rdquo;
                  </div>

                  <div className="absolute top-2 right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <DetailedMountain altitude={r.result?.altitude || 0} size={50} animate={false} />
                  </div>
                </div>
              ))}
              {completedRounds.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4">まだ履歴はありません</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
