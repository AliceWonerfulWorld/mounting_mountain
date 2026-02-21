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
      <section className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 space-y-6 relative overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-500">
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <div className="text-8xl">⛰️</div>
          </div>

          <div className="relative z-10">
            {/* ラウンド情報 */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                ROUND {game.roundIndex + 1} / {roundCount}
              </span>
              <span className="text-base md:text-lg font-mono text-gray-500">TOTAL: {game.players[0].totalScore}m</span>
            </div>

            {/* お題 */}
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-100 mb-6">
              Q. {currentRound.prompt}
            </h2>

            {error && <div className="text-base md:text-lg text-red-600 bg-red-50 dark:bg-red-900/50 p-3 rounded mb-4">エラー: {error}</div>}

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
