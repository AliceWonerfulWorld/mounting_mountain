"use client";

import { useState, useMemo, useCallback } from "react";
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

    await gameHook.submitRound();

    // 結果カットインを表示
    const currentRound = gameHook.game.players[0].rounds[gameHook.game.roundIndex];
    cutinHook.triggerResultCutin(currentRound, () => {
      setShowingResult(true);
      setIsHistoryOpen(false);
    });
  }, [gameHook, cutinHook]);

  /**
   * 次のラウンドへ進む
   */
  const handleNext = useCallback(() => {
    if (!gameHook.game) return;

    const currentRoundIndex = gameHook.game.roundIndex;
    gameHook.proceedToNextRound();
    setShowingResult(false);

    // 次のラウンドのカットインを表示（ゲーム終了時は表示しない）
    if (currentRoundIndex + 1 < gameHook.game.players[0].rounds.length) {
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

      {/* メインゲーム画面 */}
      {!showMissionBriefing && !showingResult && (
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
            onWeatherClick={() => setShowWeatherDetail(true)}
            onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
            isHistoryOpen={isHistoryOpen}
            weatherBackground={weatherBackground}
            roundCount={gameHook.game.players[0].rounds.length}
          />

          <SoloHistoryPanel
            rounds={gameHook.game.players[0].rounds}
            isOpen={isHistoryOpen}
            onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          />
        </>
      )}

      {/* 結果表示画面 */}
      {showingResult && gameHook.lastResult && (
        <SoloResultView
          round={gameHook.lastResult}
          totalScore={gameHook.game.players[0].totalScore}
          isGameFinished={isFinished}
          roundNumber={gameHook.game.roundIndex + 1}
          onNext={handleNext}
          onReset={handleReset}
        />
      )}

      {/* ラウンドカットイン */}
      <SoloRoundCutin
        show={cutinHook.showRoundCutin}
        roundNumber={cutinHook.cutinRoundNumber}
        theme={cutinHook.cutinTheme}
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
