"use client";

import { useState, useMemo, useCallback } from "react";
import { useSoloGame } from "@/hooks/useSoloGame";
import { useSoloCutins } from "@/hooks/useSoloCutins";
import { MissionBriefingScreen } from "@/components/solo/MissionBriefingScreen";
import { SoloGameMain } from "@/components/solo/SoloGameMain";
import { SoloResultView } from "@/components/solo/SoloResultView";
import { SoloHistoryPanel } from "@/components/solo/SoloHistoryPanel";
import { WeatherDetailModal } from "@/components/solo/WeatherDetailModal";
import { SoloWeatherScene } from "@/components/solo/SoloWeatherScene";
import { SoloFinalResults } from "@/components/solo/SoloFinalResults";
import SoloRoundCutin from "@/components/solo/SoloRoundCutin";
import { FallCutin } from "@/components/solo/FallCutin";
import { InsuranceCutin } from "@/components/solo/InsuranceCutin";
import { ResultCutin } from "@/components/solo/ResultCutin";
import { buildSoloSummary } from "@/lib/solo/summary";
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
          <SoloWeatherScene weather={gameHook.game.weather} backgroundClass={weatherBackground} />

          <div className="min-h-screen relative overflow-x-hidden">
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
                    isGameFinished={gameHook.game.roundIndex + 1 >= gameHook.game.players[0].rounds.length}
                    roundNumber={gameHook.game.roundIndex + 1}
                    onNext={handleNext}
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
      />

      {/* 総合結果画面 */}
      {!showMissionBriefing && isFinished && (
        <>
          <SoloWeatherScene weather={gameHook.game.weather} backgroundClass={weatherBackground} />
          <SoloFinalResults
            game={gameHook.game}
            summary={buildSoloSummary(gameHook.game)}
            onReset={handleReset}
          />
        </>
      )}

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
