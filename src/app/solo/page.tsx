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
              roundCount={gameHook.game.players[0].rounds.length}
            />

            <SoloHistoryPanel
              rounds={gameHook.game.players[0].rounds}
              isOpen={isHistoryOpen}
              onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
            />
          </div>
        </div>
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
