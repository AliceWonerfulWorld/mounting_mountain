"use client";

import type { Round } from "@/types/game";
import { DetailedMountain } from "@/components/DetailedMountain";
import { getLabelJa } from "@/lib/labels";
import { getRoute } from "@/lib/solo/routes";

interface SoloResultViewProps {
  round: Round;
  isGameFinished: boolean;
  roundNumber: number;
  onNext: () => void;
}

export function SoloResultView({
  round,
  isGameFinished,
  roundNumber,
  onNext,
}: SoloResultViewProps) {
  if (!round.result) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-white/50 bg-white/95 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-500 dark:border-zinc-700/50 dark:bg-zinc-900/95 sm:p-6 md:border-4 md:p-8">
      {/* 背景の光るエフェクト */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/20 pointer-events-none" />

      {/* 結果ヘッダー */}
      <div className="relative z-10 mb-5 text-center sm:mb-6">
        <div className="text-2xl font-black text-gray-800 dark:text-gray-100 sm:text-3xl md:text-4xl">
          ROUND {roundNumber} 結果
        </div>
      </div>

      <div className="relative z-10 mb-6 flex flex-col items-center gap-5 md:mb-8 md:flex-row md:gap-8">
        {/* 左側: マウンテンビュー */}
        <div className="flex-shrink-0 relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform scale-75 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="md:hidden">
            <DetailedMountain altitude={round.result.altitude} size={220} />
          </div>
          <div className="hidden md:block">
            <DetailedMountain altitude={round.result.altitude} size={320} />
          </div>
        </div>

        {/* 右側: 情報エリア */}
        <div className="w-full flex-1 space-y-4 text-center md:text-left">
          {/* メイン標高表示 */}
          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-500 md:text-lg">Current Altitude</div>
            <div className="flex items-baseline justify-center gap-2 md:justify-start md:gap-3">
              <span className="bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-5xl font-black tracking-tighter text-transparent drop-shadow-sm dark:from-white dark:to-gray-400 sm:text-7xl md:text-8xl">
                {round.result.altitude.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-gray-400 md:text-3xl">m</span>
            </div>

            {/* ボーナス表示 */}
            {(round.result.bonusAltitude ?? 0) > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-3 text-base md:text-lg mt-2">
                <span className="flex items-center gap-2 text-sm font-bold text-yellow-600 animate-pulse dark:text-yellow-400 sm:text-base md:text-lg">
                  <span className="text-xl">✨</span><span>+{round.result.bonusAltitude}m Bonus!</span>
                </span>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-200 dark:bg-zinc-700 w-full" />

          {/* 重要イベント通知エリア */}
          <div className="space-y-2">
            {/* 保険発動 */}
            {round.result.insuranceUsed && (
              <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg p-3 flex items-center justify-center gap-2 shadow-sm">
                <span className="text-xl">🛟</span>
                <span className="text-sm font-bold text-green-800 dark:text-green-200 sm:text-base">保険発動!滑落を回避しました</span>
              </div>
            )}

            {/* 滑落 */}
            {round.result.didFall && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-4 shadow-lg animate-[shake_0.5s_ease-in-out]">
                <div className="flex items-center justify-center gap-2 text-base font-black text-red-600 dark:text-red-400 sm:text-lg">
                  <span>⚠️</span>
                  <span>{round.result.fallReason || "滑落発生!"}</span>
                </div>
                <div className="text-center text-sm text-red-500 mt-1 font-bold">
                  標高が 2,000m に固定されました
                </div>
              </div>
            )}

            {/* 天候ボーナス */}
            {round.result.weatherApplied && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-2 text-center">
                <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                  🌤 天候ボーナス発動!「{round.result.weatherBoostLabel}」で+20%
                </span>
              </div>
            )}
          </div>

          {/* ルート情報 */}
          {round.result.routeId && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:justify-start">
              <span className="text-gray-400 font-bold text-xs uppercase">Route Info:</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 font-bold border border-gray-200 dark:border-zinc-700">
                {getRoute(round.result.routeId).emoji} {getRoute(round.result.routeId).label}
              </span>
              {round.result.routeMultiplier && round.result.routeMultiplier !== 1.0 && (
                <span className="text-gray-500 font-mono text-xs">x{round.result.routeMultiplier}</span>
              )}
            </div>
          )}

          {/* ラベルタグ */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {round.result.labels.map((label) => (
              <span key={label} className="px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300">
                #{getLabelJa(label)}
              </span>
            ))}
          </div>

          {/* 実況コメント & ヒント */}
          <div className="grid gap-3 pt-2">
            {round.result.commentary && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-400 text-sm">
                <div className="font-bold text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                  <span>🎤</span><span>実況</span>
                </div>
                <div className="text-amber-900 dark:text-amber-100 font-medium leading-relaxed">
                  {round.result.commentary}
                </div>
              </div>
            )}

            {round.result.tip && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400 text-sm">
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <span>💡</span><span>攻略ヒント</span>
                </div>
                <div className="text-blue-900 dark:text-blue-100">
                  {round.result.tip}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 次のラウンドへボタン */}
      <div className="relative z-10">
        <button
          onClick={onNext}
          className={`w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] sm:py-5 sm:text-xl md:text-2xl ${
            isGameFinished
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
              : 'bg-gradient-to-r from-green-600 to-emerald-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {isGameFinished ? (
              <>
                <span>結果を見る</span>
                <span className="text-2xl md:text-3xl">🎉</span>
              </>
            ) : (
              <>
                <span>次のラウンドへ</span>
                <span className="text-2xl md:text-3xl">🏔️</span>
              </>
            )}
          </div>
        </button>
      </div>
    </section>
  );
}
