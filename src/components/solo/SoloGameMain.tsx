"use client";

import type { GameState, Round } from "@/types/game";
import type { RouteId } from "@/lib/solo/routes";
import { SoloInputArea } from "@/components/SoloInputArea";

interface SoloGameMainProps {
  game: GameState;
  currentRound: Round;
  text: string;
  loading: boolean;
  error: string | null;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRouteSelect: (routeId: RouteId) => void;
  onSubmit: () => void;
  showRoundCutin?: boolean;
  roundCount: number;
}

export function SoloGameMain({
  game,
  currentRound,
  text,
  loading,
  error,
  onTextChange,
  onRouteSelect,
  onSubmit,
  showRoundCutin = false,
  roundCount,
}: SoloGameMainProps) {
  return (
    <>
      {/* メインゲーム画面 */}
      <section className="relative overflow-hidden rounded-xl border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-500 dark:bg-zinc-900/90 sm:p-6">
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <div className="text-8xl">⛰️</div>
          </div>

          <div className="relative z-10">
            {/* ラウンド情報 */}
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-base font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 md:text-xl">
                ROUND {game.roundIndex + 1} / {roundCount}
              </span>
              <span className="text-sm font-mono text-gray-500 md:text-lg">TOTAL: {game.players[0].totalScore.toLocaleString()}m</span>
            </div>

            {/* お題 */}
            <h2 className="mb-5 text-2xl font-black leading-tight text-gray-800 dark:text-gray-100 sm:text-3xl md:mb-6 md:text-4xl">
              Q. {currentRound.prompt}
            </h2>

            {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/50 md:text-lg">エラー: {error}</div>}

            {/* 入力エリア - メモ化されたコンポーネント */}
            <SoloInputArea
              text={text}
              onTextChange={onTextChange}
              onSubmit={onSubmit}
              onReset={() => {}} // リセットは親で管理
              loading={loading}
              disabled={showRoundCutin}
              selectedRoute={currentRound.routeId}
              onRouteSelect={onRouteSelect}
            />
          </div>
        </section>
    </>
  );
}
