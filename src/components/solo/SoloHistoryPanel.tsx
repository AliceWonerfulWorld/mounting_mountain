"use client";

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
    <section className="overflow-hidden rounded-xl border border-white/20 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 dark:bg-zinc-900/80">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:p-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 sm:text-base">
          <span>⛰️ 登頂履歴</span>
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

      {isOpen && (
        <div className="space-y-3 border-t border-gray-100 p-3 animate-in slide-in-from-top-2 fade-in duration-300 dark:border-zinc-800 sm:p-4">
              {completedRounds.map((r, i) => (
                <div
                  key={r.id}
                  className="group relative rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-black sm:p-4"
                >
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-xs font-mono text-gray-400">#{i + 1}</span>
                      {r.routeId && (
                        <span className="shrink-0 text-lg" title={getRoute(r.routeId).label}>
                          {getRoute(r.routeId).emoji}
                        </span>
                      )}
                      <span className="min-w-0 font-bold leading-snug text-gray-800 dark:text-gray-200">{r.prompt}</span>
                    </div>

                    <div className="text-left sm:text-right">
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

                  <div className="border-l-2 border-gray-300 pl-3 text-sm italic text-gray-600 dark:border-zinc-700 dark:text-gray-400">
                    &ldquo;{r.inputText}&rdquo;
                  </div>

                  <div className="pointer-events-none absolute right-2 top-2 hidden opacity-5 transition-opacity group-hover:opacity-10 sm:block">
                    <DetailedMountain altitude={r.result?.altitude || 0} size={50} animate={false} />
                  </div>
                </div>
              ))}
              {completedRounds.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4">まだ履歴はありません</div>
              )}
            </div>
          )}
    </section>
  );
}
