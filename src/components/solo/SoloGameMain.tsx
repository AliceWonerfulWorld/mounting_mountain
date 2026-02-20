"use client";

import { motion } from "framer-motion";
import type { GameState, Round } from "@/types/game";
import type { Mission } from "@/lib/solo/missions";
import type { RouteId } from "@/lib/solo/routes";
import { getWeather } from "@/lib/solo/weather";
import { evaluateMission } from "@/lib/solo/missions";
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
  onWeatherClick?: () => void;
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
  onWeatherClick,
  showRoundCutin = false,
  roundCount,
}: SoloGameMainProps) {
  return (
    <>
      {/* コンパクトヘッダー */}
      <header className="flex flex-wrap gap-3 justify-between items-start text-sm md:text-base font-bold font-mono text-gray-600 dark:text-gray-400">
          <div className="flex gap-3">
            {game.weather && (
              <button
                onClick={onWeatherClick}
                className="flex items-center gap-2 bg-white/50 dark:bg-black/50 px-3 py-2 rounded backdrop-blur border border-gray-200 dark:border-zinc-800 hover:bg-white/70 dark:hover:bg-black/70 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="text-lg">{getWeather(game.weather).emoji}</span>
                <span>{getWeather(game.weather).label}</span>
                <span className="text-xs opacity-60">ℹ️</span>
              </button>
            )}
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/50 px-3 py-2 rounded backdrop-blur border border-gray-200 dark:border-zinc-800">
              <span className="text-lg">🛟</span>
              <span>保険: {game.insurance}/1</span>
            </div>
          </div>

          {game.mission && (
            <div className="bg-purple-100/80 dark:bg-purple-900/40 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 flex items-center gap-2 max-w-full overflow-hidden">
              <span className="text-lg">🎯</span>
              <span className="truncate">{game.mission.title}</span>
              <span className="opacity-70 text-xs md:text-sm">{evaluateMission(game).progressText}</span>
            </div>
          )}
        </header>

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
