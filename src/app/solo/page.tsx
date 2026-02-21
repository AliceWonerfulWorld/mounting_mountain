"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSoloGame } from "@/hooks/useSoloGame";
import { useSoloCutins } from "@/hooks/useSoloCutins";
import { MissionBriefingScreen } from "@/components/solo/MissionBriefingScreen";
import { SoloGameMain } from "@/components/solo/SoloGameMain";
import { SoloResultView } from "@/components/solo/SoloResultView";
import { SoloHistoryPanel } from "@/components/solo/SoloHistoryPanel";
import { WeatherDetailModal } from "@/components/solo/WeatherDetailModal";
import SoloRoundCutin from "@/components/solo/SoloRoundCutin";
import { FallCutin } from "@/components/solo/FallCutin";
import { InsuranceCutin } from "@/components/solo/InsuranceCutin";
import { ResultCutin } from "@/components/solo/ResultCutin";
import { buildSoloSummary } from "@/lib/solo/summary";
import { DetailedMountain } from "@/components/DetailedMountain";
import { getRoute } from "@/lib/solo/routes";
import { getWeather } from "@/lib/solo/weather";
import { evaluateMission } from "@/lib/solo/missions";

export default function SoloPage() {
  const gameHook = useSoloGame();
  const cutinHook = useSoloCutins();

  const [showMissionBriefing, setShowMissionBriefing] = useState(true);
  const [showingResult, setShowingResult] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [missionTheme] = useState(() => Math.floor(Math.random() * 3) as 0 | 1 | 2);

  /**
   * ミッション説明画面からゲーム開始
   */
  const handleStart = useCallback(() => {
    setShowMissionBriefing(false);
    cutinHook.triggerRoundCutin(1);
  }, [cutinHook]);

  /**
   * ラウンド送信
   */
  const handleSubmit = useCallback(async () => {
    if (!gameHook.game) return;

    const completedRound = await gameHook.submitRound();

    // submitRoundから返された結果を直接使用（state更新を待たない）
    if (completedRound) {
      cutinHook.triggerResultCutin(completedRound, () => {
        setShowingResult(true);
        setIsHistoryOpen(false);
      });
    }
  }, [gameHook, cutinHook]);

  /**
   * 次のラウンドへ進む
   */
  const handleNext = useCallback(() => {
    if (!gameHook.game) return;

    const currentRoundIndex = gameHook.game.roundIndex;
    const isLastRound = currentRoundIndex + 1 >= gameHook.game.players[0].rounds.length;

    if (isLastRound) {
      // 最終ラウンド: ゲーム終了状態にして総合結果画面へ
      gameHook.proceedToNextRound();
      setShowingResult(false);
    } else {
      // 次のラウンドへ
      gameHook.proceedToNextRound();
      setShowingResult(false);

      // 次のラウンドのカットインを表示
      setTimeout(() => {
        cutinHook.triggerRoundCutin(currentRoundIndex + 2);
      }, 100);
    }
  }, [gameHook, cutinHook]);

  /**
   * ゲームリセット
   */
  const handleReset = useCallback(() => {
    gameHook.resetGame();
    setShowingResult(false);
    setShowMissionBriefing(true);
  }, [gameHook]);

  /**
   * 天候に応じた背景グラデーションを取得
   */
  const weatherBackground = useMemo(() => {
    if (!gameHook.game?.weather) {
      return "bg-gradient-to-b from-blue-200 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-black";
    }

    switch (gameHook.game.weather) {
      case "SUNNY":
        return "bg-gradient-to-b from-sky-300 via-blue-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black";
      case "WINDY":
        return "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100 dark:from-slate-700 dark:via-slate-800 dark:to-black";
      case "BLIZZARD":
        return "bg-gradient-to-b from-slate-300 via-slate-200 to-blue-50 dark:from-slate-700 dark:via-slate-800 dark:to-black";
      default:
        return "bg-gradient-to-b from-blue-200 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-black";
    }
  }, [gameHook.game?.weather]);

  // Loading state
  if (!gameHook.game) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentRound = gameHook.game.players[0].rounds[gameHook.game.roundIndex];
  const isFinished = gameHook.game.status === "finished";

  return (
    <main className="min-h-screen relative overflow-x-hidden text-gray-800 dark:text-gray-200 font-sans">
      {/* ミッション説明画面 */}
      {showMissionBriefing && (
        <MissionBriefingScreen
          mission={gameHook.game.mission}
          missionTheme={missionTheme}
          onStart={handleStart}
        />
      )}

      {/* メインゲーム画面・結果画面（ゲーム進行中） */}
      {!showMissionBriefing && !isFinished && (
        <>
          {/* 天候に応じた背景 */}
          <div className={`fixed inset-0 ${weatherBackground} -z-20 transition-colors duration-1000`} />

          <div className="min-h-screen relative overflow-x-hidden">
            {/* 吹雪エフェクト */}
            {gameHook.game.weather === "BLIZZARD" && (
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
              {/* 雪のパーティクル */}
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-white opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    fontSize: `${Math.random() * 10 + 10}px`,
                    animation: `snowfall ${Math.random() * 3 + 2}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                >
                  ❄
                </div>
              ))}
            </div>
          )}

          {/* 強風エフェクト */}
          {gameHook.game.weather === "WINDY" && (
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
              {/* 飛んでいく葉っぱ */}
              {Array.from({ length: 20 }).map((_, i) => {
                const leaves = ['🍁', '🌿'];
                const leaf = leaves[Math.floor(Math.random() * leaves.length)];
                return (
                  <div
                    key={`leaf-${i}`}
                    className="absolute"
                    style={{
                      top: `${Math.random() * 80}%`,
                      left: '-50px',
                      fontSize: `${Math.random() * 20 + 15}px`,
                      animation: `windLeaf ${Math.random() * 3 + 2}s linear infinite`,
                      animationDelay: `${Math.random() * 4}s`,
                    }}
                  >
                    {leaf}
                  </div>
                );
              })}
              {/* 強い風の線 */}
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={`line-${i}`}
                  className="absolute bg-white/40"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: '-150px',
                    width: `${Math.random() * 150 + 100}px`,
                    height: '2px',
                    animation: `windBlow ${Math.random() * 1.5 + 0.8}s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`,
                    transform: 'rotate(-5deg)',
                  }}
                />
              ))}
            </div>
          )}

          {/* 遠景の山シルエット (下層) */}
          <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10 opacity-30 dark:opacity-20 transition-all duration-1000">
            <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${gameHook.game.weather === "SUNNY" ? "fill-green-600 dark:fill-green-700" : "fill-stone-400 dark:fill-stone-600"}`}>
              <path d="M0,320 L200,160 L400,280 L600,100 L800,240 L1000,140 L1200,320 Z" />
            </svg>
          </div>
          <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none -z-10 opacity-50 dark:opacity-40 transition-all duration-1000">
            <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${gameHook.game.weather === "SUNNY" ? "fill-green-700 dark:fill-green-800" : "fill-stone-500 dark:fill-stone-700"}`}>
              <path d="M0,320 L150,200 L350,300 L550,150 L850,280 L1100,180 L1200,320 Z" />
 </svg>
          </div>

          <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 space-y-6 relative z-10">
            {/* コンパクトヘッダー */}
            <header className="flex flex-wrap gap-3 justify-between items-start text-sm md:text-base font-bold font-mono text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                {gameHook.game.weather && (
                  <button
                    onClick={() => setShowWeatherDetail(true)}
                    className="flex items-center gap-2 bg-white/50 dark:bg-black/50 px-3 py-2 rounded backdrop-blur border border-gray-200 dark:border-zinc-800 hover:bg-white/70 dark:hover:bg-black/70 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span className="text-lg">{getWeather(gameHook.game.weather).emoji}</span>
                    <span>{getWeather(gameHook.game.weather).label}</span>
                    <span className="text-xs opacity-60">ℹ️</span>
                  </button>
                )}
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/50 px-3 py-2 rounded backdrop-blur border border-gray-200 dark:border-zinc-800">
                  <span className="text-lg">🛟</span>
                  <span>保険: {gameHook.game.insurance}/1</span>
                </div>
              </div>

              {gameHook.game.mission && (
                <div className="bg-purple-100/80 dark:bg-purple-900/40 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 flex items-center gap-2 max-w-full overflow-hidden">
                  <span className="text-lg">🎯</span>
                  <span className="truncate">{gameHook.game.mission.title}</span>
                  <span className="opacity-70 text-xs md:text-sm">{evaluateMission(gameHook.game).progressText}</span>
                </div>
              )}
            </header>

            {!showingResult ? (
              <>
                <SoloGameMain
                  game={gameHook.game}
                  currentRound={currentRound}
                  text={gameHook.text}
                  loading={gameHook.loading}
                  error={gameHook.error}
                  onTextChange={(e) => gameHook.setText(e.target.value)}
                  onRouteSelect={gameHook.handleRouteSelect}
                  onSubmit={handleSubmit}
                  roundCount={gameHook.game.players[0].rounds.length}
                />

                <SoloHistoryPanel
                  rounds={gameHook.game.players[0].rounds}
                  isOpen={isHistoryOpen}
                  onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
                />
              </>
            ) : (
              gameHook.lastResult && (
                <>
                  <SoloResultView
                    round={gameHook.lastResult}
                    totalScore={gameHook.game.players[0].totalScore}
                    isGameFinished={gameHook.game.roundIndex + 1 >= gameHook.game.players[0].rounds.length}
                    roundNumber={gameHook.game.roundIndex + 1}
                    onNext={handleNext}
                    onReset={handleReset}
                  />

                  <SoloHistoryPanel
                    rounds={gameHook.game.players[0].rounds}
                    isOpen={isHistoryOpen}
                    onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
                  />
                </>
              )
            )}
          </div>
        </div>
        </>
      )}

      {/* ラウンドカットイン */}
      <SoloRoundCutin
        show={cutinHook.showRoundCutin}
        roundNumber={cutinHook.cutinRoundNumber}
        theme={cutinHook.cutinTheme}
        mission={gameHook.game?.prompts[cutinHook.cutinRoundNumber - 1]}
        onSkip={() => {
          // カットインは自動で2.3秒後に閉じるため、スキップ機能は現在未実装
          // 必要に応じて useSoloCutins に skipRoundCutin メソッドを追加可能
        }}
      />

      {/* 滑落カットイン */}
      <FallCutin show={cutinHook.showFallCutin} />

      {/* 保険獲得カットイン */}
      <InsuranceCutin show={cutinHook.showInsuranceCutin} />

      {/* 結果カットイン */}
      <ResultCutin
        show={cutinHook.showResultCutin}
        altitude={gameHook.lastResult?.result?.finalAltitude || 0}
      />

      {/* 総合結果画面 */}
      {!showMissionBriefing && isFinished && (() => {
        const summary = buildSoloSummary(gameHook.game);
        return (
          <>
            {/* 天候に応じた背景 */}
            <div className={`fixed inset-0 ${weatherBackground} -z-20 transition-colors duration-1000`} />

            {/* 遠景の山シルエット (下層) */}
            <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10 opacity-30 dark:opacity-20 transition-all duration-1000">
              <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${gameHook.game.weather === "SUNNY" ? "fill-green-600 dark:fill-green-700" : "fill-stone-400 dark:fill-stone-600"}`}>
                <path d="M0,320 L200,160 L400,280 L600,100 L800,240 L1000,140 L1200,320 Z" />
              </svg>
            </div>
            <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none -z-10 opacity-50 dark:opacity-40 transition-all duration-1000">
              <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${gameHook.game.weather === "SUNNY" ? "fill-green-700 dark:fill-green-800" : "fill-stone-500 dark:fill-stone-700"}`}>
                <path d="M0,320 L150,200 L350,300 L550,150 L850,280 L1100,180 L1200,320 Z" />
              </svg>
            </div>

            <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl w-full space-y-6"
            >
              {/* ヘッダー */}
              <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="relative z-10"
                >
                  <div className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">SUMMIT!</div>
                  <div className="text-2xl md:text-3xl font-bold text-white/90 mb-2">
                    全{gameHook.game.players[0].rounds.length}ラウンド 完走！
                  </div>
                  <div className="text-lg text-white/80">
                    Total: <span className="font-black text-3xl">{gameHook.game.players[0].totalScore.toLocaleString()}</span>m
                  </div>
                </motion.div>
              </div>

              {/* ミッション結果 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-2xl p-6 border-2 shadow-lg ${
                  summary.mission.cleared
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-600'
                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 dark:from-gray-800/50 dark:to-slate-800/50 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">{summary.mission.cleared ? '🎯' : '😔'}</span>
                  <div>
                    <div className={`text-2xl font-black ${
                      summary.mission.cleared
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {summary.mission.cleared ? 'MISSION CLEAR!' : 'MISSION FAILED'}
                    </div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {summary.mission.title}
                    </div>
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">{summary.mission.description}</div>
                  <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                    {summary.mission.progressText}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-5xl mb-2">
                    {"★".repeat(summary.stars)}{"☆".repeat(3 - summary.stars)}
                  </div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {summary.stars === 3 ? "完璧！" : summary.stars === 2 ? "惜しい！" : "次回に期待！"}
                  </div>
                </div>
              </motion.div>

              {/* 各ラウンドの結果 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <div className="text-2xl font-black mb-6 text-center text-gray-800 dark:text-gray-100">
                  📊 ラウンド別結果
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {gameHook.game.players[0].rounds.map((round, idx) => (
                    <div
                      key={round.id}
                      className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 shadow-md"
                    >
                      <div className="text-center mb-3">
                        <div className="text-xs font-bold text-gray-500 mb-1">ROUND {idx + 1}</div>
                        <div className="flex justify-center mb-3">
                          <DetailedMountain altitude={round.result?.altitude || 0} size={120} />
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white">
                          {round.result?.altitude.toLocaleString() || 0}<span className="text-lg text-gray-500">m</span>
                        </div>
                      </div>
                      {round.routeId && (
                        <div className="flex justify-center mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 font-bold">
                            {getRoute(round.routeId).emoji} {getRoute(round.routeId).label}
                          </span>
                        </div>
                      )}
                      {round.result?.didFall && (
                        <div className="text-center">
                          <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold">
                            ⚠️ 滑落
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 統計情報 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <div className="text-xl font-black mb-4 text-gray-800 dark:text-gray-100">📈 統計データ</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">合計標高</div>
                    <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                      {summary.score.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">m</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">最高標高</div>
                    <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
                      {summary.score.max.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">m</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">平均標高</div>
                    <div className="text-2xl font-black text-green-700 dark:text-green-300">
                      {summary.score.avg.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">m</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">天候</div>
                    <div className="text-3xl">{summary.weather.emoji}</div>
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{summary.weather.label}</div>
                  </div>
                </div>
              </motion.div>

              {/* アクションボタン */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid gap-4 md:grid-cols-2"
              >
                <button
                  onClick={handleReset}
                  className="py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>もう一度挑戦する</span>
                </button>
                <Link
                  href="/"
                  className="py-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold text-lg hover:from-gray-800 hover:to-black hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🏠</span>
                  <span>タイトルに戻る</span>
                </Link>
              </motion.div>
            </motion.section>
          </div>
          </>
        );
      })()}

      {/* 天候詳細モーダル */}
      {gameHook.game.weather && (
        <WeatherDetailModal
          weatherId={gameHook.game.weather}
          isOpen={showWeatherDetail}
          onClose={() => setShowWeatherDetail(false)}
        />
      )}
    </main>
  );
}
