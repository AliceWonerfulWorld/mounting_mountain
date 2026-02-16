"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState, Round } from "@/types/game";
import { PROMPTS } from "@/lib/prompts";
import { MountainView } from "@/components/MountainView";
import { pickN } from "@/lib/random";
import { createRounds } from "@/lib/game";
import { updateStats } from "@/lib/achievementStore";
import { computeBonus } from "@/lib/solo/bonus";
import { ROUTES, getRoute, type RouteId } from "@/lib/solo/routes";
import { computeFinalAltitude } from "@/lib/solo/score";
import { pickWeather, getWeather } from "@/lib/solo/weather";
import { pickMission, evaluateMission, type Mission } from "@/lib/solo/missions";
import { buildSoloSummary } from "@/lib/solo/summary";
import { SoloGameSummary } from "@/components/SoloGameSummary";
import { getLabelJa } from "@/lib/labels";


export default function SoloPage() {
  const ROUND_COUNT = 3;

  const [game, setGame] = useState<GameState | null>(null);

  /**
   * ソロゲームの状態を初期化するヘルパー関数
   */
  function initializeSoloGameState(): GameState {
    const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
    const rounds = createRounds(selectedPrompts, ROUND_COUNT);
    const weather = pickWeather();
    const mission = pickMission();

    return {
      mode: "solo",
      status: "playing",
      roundIndex: 0,
      prompts: rounds.map((r) => r.prompt),
      weather: weather.id,
      mission,
      insurance: 0, // 保険の初期値
      players: [
        {
          id: "p1",
          name: "Player 1",
          totalScore: 0,
          rounds,
        },
      ],
    };
  }

  useEffect(() => {
    setGame(initializeSoloGameState());
    // ミッション説明画面を表示 (カットインは後で)
    setShowMissionBriefing(true);
  }, []);

  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<Round | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カットインエフェクト用の状態
  const [showRoundCutin, setShowRoundCutin] = useState(false);
  const [cutinRoundNumber, setCutinRoundNumber] = useState(1);

  // 結果演出用の状態
  const [showResultCutin, setShowResultCutin] = useState(false);
  const [showFallCutin, setShowFallCutin] = useState(false); // 滑落演出
  const [showInsuranceCutin, setShowInsuranceCutin] = useState(false); // 保険獲得演出

  // 結果表示中かどうかの状態
  const [showingResult, setShowingResult] = useState(false);

  // ミッション説明画面の表示状態
  const [showMissionBriefing, setShowMissionBriefing] = useState(true);

  // 天気詳細モーダルの表示状態
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);

  // ミッション画面のデザインパターン（ランダム選択）
  const [missionTheme] = useState(() => Math.floor(Math.random() * 3) as 0 | 1 | 2);

  if (!game) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentRound = game.players[0].rounds[game.roundIndex];

  const isFinished = game.status === "finished";


  async function submitRound() {
    if (!text.trim() || isFinished || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          route: currentRound.routeId || "NORMAL"
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`API Error: ${res.status} ${msg}`);
      }

      const result = await res.json(); // MountResult想定

      setGame((prev) => {
        if (!prev) return null;
        const next = structuredClone(prev);

        const player = next.players[0];
        const round = player.rounds[next.roundIndex];

        round.inputText = text.trim();

        // ルート取得
        const route = getRoute(round.routeId);
        const routeMultiplier = route.multiplier;

        // ボーナス計算
        const bonus = computeBonus(result.labels);
        const baseAltitude = result.altitude;
        const bonusAltitude = bonus.bonusAltitude;

        // 最終標高計算（滑落判定・天候を含む）
        const scoreResult = computeFinalAltitude({
          baseAltitude,
          routeId: round.routeId || "NORMAL",
          routeMultiplier,
          bonusAltitude,
          weatherId: prev.weather,
          labels: result.labels,
          insurance: prev.insurance, // 保険を渡す
        });

        const { finalAltitude, didFall, fallReason, weatherApplied, weatherMultiplier, weatherBoostLabel, insuranceUsed } = scoreResult;

        // 結果オブジェクトを拡張更新
        round.result = {
          ...result,
          baseAltitude,
          bonusAltitude,
          finalAltitude,
          bonusReasons: bonus.reasons,
          routeId: round.routeId,
          routeMultiplier,
          didFall,
          fallReason,
          weatherApplied,
          weatherMultiplier,
          weatherBoostLabel,
          altitude: finalAltitude, // 互換性のため、表示等は final を使う
        };

        // 保険消費処理
        if (insuranceUsed) {
          next.insurance = Math.max(0, prev.insurance - 1);
        }

        // SAFE選択時に保険を貸める
        const MAX_INSURANCE = 1;
        if (round.routeId === "SAFE") {
          next.insurance = Math.min(MAX_INSURANCE, next.insurance + 1);
        }

        player.totalScore += finalAltitude;

        // --- 称号判定 (ラウンド毎) ---
        // 非同期で実行（UIをブロックしない）
        updateStats({
          highestAltitude: finalAltitude,
          snowCount: finalAltitude >= 6000 ? 1 : 0,
          everestCount: finalAltitude >= 8000 ? 1 : 0,
        });

        // 直近の結果を保存 (現在のround情報をコピー)
        setLastResult(structuredClone(round));

        return next;
      });

      setText("");
      setIsHistoryOpen(false); // 判定後は履歴を閉じて結果に集中させる
      
      // 結果に応じて演出を選択
      setGame((prev) => {
        if (!prev) return prev;
        
        const currentRound = prev.players[0].rounds[prev.roundIndex];
        const result = currentRound.result;
        
        if (result) {
          // 滑落した場合（保険未使用）
          if (result.didFall && !result.insuranceUsed) {
            setShowFallCutin(true);
            setTimeout(() => {
              setShowFallCutin(false);
              setShowingResult(true);
            }, 2500);
          }
          // 安全ルートで保険獲得
          else if (currentRound.routeId === "SAFE") {
            setShowInsuranceCutin(true);
            setTimeout(() => {
              setShowInsuranceCutin(false);
              setShowingResult(true);
            }, 2500);
          }
          // その他の通常結果
          else {
            setShowResultCutin(true);
            setTimeout(() => {
              setShowResultCutin(false);
              setShowingResult(true);
            }, 2500);
          }
        }
        
        return prev;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function proceedToNextRound() {
    setGame((prev) => {
      if (!prev) return null;
      const next = structuredClone(prev);

      // ラウンドを進める
      if (next.roundIndex + 1 >= next.players[0].rounds.length) {
        next.status = "finished";

        // --- 称号判定 (ゲーム終了時) ---
        updateStats({
          soloPlays: 1,
          highestTotalAltitude: next.players[0].totalScore,
        });
      } else {
        next.roundIndex += 1;
      }

      return next;
    });

    setShowingResult(false);

    // 次のラウンドのカットインを表示
    setGame((prev) => {
      if (!prev || prev.status === "finished") return prev;

      setTimeout(() => {
        setCutinRoundNumber(prev.roundIndex + 1);
        setShowRoundCutin(true);
        setTimeout(() => setShowRoundCutin(false), 2300);
      }, 100);

      return prev;
    });
  }

  function startGame() {
    setShowMissionBriefing(false);

    // Round 1のカットインを表示
    setCutinRoundNumber(1);
    setShowRoundCutin(true);
    setTimeout(() => setShowRoundCutin(false), 2300);
  }

  function getMissionConditionText(mission: Mission | undefined): string {
    if (!mission) return '';

    switch (mission.id) {
      case 'TOTAL_15000':
        return `合計標高 ${mission.target?.toLocaleString() || '15,000'}m 以上`;
      case 'EVEREST_1':
        return `1回でも ${mission.target?.toLocaleString() || '8,000'}m 以上`;
      case 'LABELS_3':
        return `${mission.target || 3}種類以上のラベルを出す`;
      default:
        return '';
    }
  }

  function resetGame() {
    setGame(initializeSoloGameState());
    setText("");
    setLastResult(null);
    setError(null);
    setShowingResult(false); // 結果表示モードをリセット
  }

  // 天候に応じた背景グラデーションを取得
  const getWeatherBackground = () => {
    if (!game.weather) {
      return "bg-gradient-to-b from-blue-200 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-black";
    }

    switch (game.weather) {
      case "SUNNY":
        // 晴れ - 明るい青空
        return "bg-gradient-to-b from-sky-300 via-blue-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black";
      case "WINDY":
        // 風 - やや曇りがち
        return "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100 dark:from-slate-700 dark:via-slate-800 dark:to-black";
      case "BLIZZARD":
        // 吹雪 - 白っぽい暗い雪空
        return "bg-gradient-to-b from-slate-300 via-slate-200 to-blue-50 dark:from-slate-700 dark:via-slate-800 dark:to-black";
      default:
        return "bg-gradient-to-b from-blue-200 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-black";
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden text-gray-800 dark:text-gray-200 font-sans">
      {/* ミッション説明画面 */}
      <AnimatePresence>
        {showMissionBriefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${
              missionTheme === 0 
                ? "bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900"
                : missionTheme === 1
                ? "bg-gradient-to-b from-orange-400 via-pink-400 to-purple-600"
                : "bg-gradient-to-b from-cyan-200 via-blue-300 to-indigo-400"
            }`}
          >
            {/* 背景装飾 - パターン1: 夜の山と星空 */}
            {missionTheme === 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 遠景の山々 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 0.3, y: 0 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="absolute bottom-0 left-0 right-0"
                >
                  <svg viewBox="0 0 1200 400" className="w-full h-auto opacity-40">
                    <path d="M0,400 L0,200 L200,100 L400,180 L600,80 L800,160 L1000,120 L1200,200 L1200,400 Z" fill="url(#mountainGrad)" />
                    <defs>
                      <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* 星空エフェクト */}
                <div className="absolute inset-0">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ delay: Math.random() * 2, duration: 2 + Math.random() * 2, repeat: Infinity }}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 60}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 背景装飾 - パターン2: 朝焼けの山 */}
            {missionTheme === 1 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 太陽 */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ delay: 0.3, duration: 1.5 }}
                  className="absolute top-20 right-20 w-40 h-40 bg-yellow-300 rounded-full blur-2xl"
                />
                
                {/* 朝焼けの山々 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="absolute bottom-0 left-0 right-0"
                >
                  <svg viewBox="0 0 1200 400" className="w-full h-auto">
                    <path d="M0,400 L0,250 L150,150 L300,200 L500,100 L700,180 L900,140 L1100,220 L1200,280 L1200,400 Z" fill="rgba(139,92,246,0.4)" />
                    <path d="M0,400 L0,300 L200,220 L400,280 L600,180 L800,260 L1000,220 L1200,320 L1200,400 Z" fill="rgba(168,85,247,0.6)" />
                  </svg>
                </motion.div>

                {/* 光の粒子 */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ 
                        opacity: [0, 0.6, 0],
                        y: [100, -100]
                      }}
                      transition={{ 
                        delay: Math.random() * 3,
                        duration: 4 + Math.random() * 2,
                        repeat: Infinity
                      }}
                      className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        bottom: '0%',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 背景装飾 - パターン3: 雪山 */}
            {missionTheme === 2 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 雪の山々 */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="absolute bottom-0 left-0 right-0"
                >
                  <svg viewBox="0 0 1200 400" className="w-full h-auto">
                    <path d="M0,400 L0,200 L250,80 L500,160 L750,60 L1000,140 L1200,180 L1200,400 Z" fill="rgba(255,255,255,0.3)" />
                    {/* 雪の頂 */}
                    <path d="M250,80 L230,95 L220,88 L250,80 L280,88 L270,95 Z" fill="rgba(255,255,255,0.9)" />
                    <path d="M750,60 L730,75 L720,68 L750,60 L780,68 L770,75 Z" fill="rgba(255,255,255,0.9)" />
                  </svg>
                </motion.div>

                {/* 雪のエフェクト */}
                <div className="absolute inset-0">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ 
                        opacity: [0, 0.8, 0],
                        y: ['0vh', '100vh']
                      }}
                      transition={{ 
                        delay: Math.random() * 5,
                        duration: 5 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute text-white text-xl"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: '-5%',
                      }}
                    >
                      ❄️
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* メインコンテンツ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10 max-w-3xl px-8 w-full"
            >
              {/* ヘッダー */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className={`text-5xl md:text-6xl font-black mb-4 tracking-tight ${
                    missionTheme === 2 ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  MISSION BRIEFING
                </motion.div>
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className={missionTheme === 2 ? 'text-xl text-slate-600' : 'text-xl text-slate-300'}
                >
                  今回の挑戦
                </motion.div>
              </div>

              {/* ミッションカード */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className={`bg-white/95 dark:bg-zinc-900/95 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm border-4 ${
                  missionTheme === 0
                    ? 'border-amber-500/50'
                    : missionTheme === 1
                    ? 'border-yellow-400/60'
                    : 'border-cyan-400/60'
                }`}
              >
                {/* ミッションアイコンとタイトル */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                    className="text-7xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <div className="text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-100">
                    {game.mission?.title || 'ミッション'}
                  </div>
                </div>

                {/* ミッション説明 */}
                <div className="bg-blue-50 dark:bg-blue-950/50 rounded-2xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                    Mission Description
                  </div>
                  <div className="text-lg text-gray-800 dark:text-gray-100 leading-relaxed">
                    {game.mission?.description || ''}
                  </div>
                </div>

                {/* 達成条件 */}
                <div className="bg-amber-50 dark:bg-amber-950/50 rounded-2xl p-6 mb-8 border border-amber-200 dark:border-amber-800">
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <span>🎯</span>
                    <span>Clear Condition</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-amber-800 dark:text-amber-100">
                    {getMissionConditionText(game.mission)}
                  </div>
                </div>

                {/* スタートボタン */}
                <motion.button
                  onClick={startGame}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-6 rounded-xl text-white font-bold text-2xl transition-transform shadow-lg hover:shadow-xl ${
                    missionTheme === 0
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      : missionTheme === 1
                      ? 'bg-gradient-to-r from-orange-600 to-pink-600'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>挑戦を開始する</span>
                    <span className="text-3xl">🏔️</span>
                  </div>
                </motion.button>
              </motion.div>

              {/* ヒント */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className={`text-center mt-6 text-sm ${
                  missionTheme === 2 ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ラウンドカットインエフェクト */}
      <AnimatePresence>
        {showRoundCutin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setShowRoundCutin(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 cursor-pointer overflow-hidden"
          >
            {/* 背景の山シルエット */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 遠景の山々 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.3, y: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute bottom-0 left-0 w-full h-2/3"
              >
                <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full fill-slate-600">
                  <path d="M0,400 L200,200 L400,320 L600,120 L800,280 L1000,160 L1200,400 Z" />
                </svg>
              </motion.div>

              {/* 中景の山 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="absolute bottom-0 left-0 w-full h-1/2"
              >
                <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full fill-slate-500">
                  <path d="M0,400 L300,150 L600,80 L900,200 L1200,400 Z" />
                </svg>
              </motion.div>

              {/* 星空 */}
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 40}%`
                  }}
                />
              ))}
            </div>

            {/* メインコンテンツ - 左からフェードイン */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 pointer-events-none max-w-4xl px-8"
            >
              {/* 標高表示風のバッジ */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-amber-400/50">
                  <span className="text-2xl">⛰️</span>
                  <span className="text-lg font-bold tracking-wider">ROUND</span>
                  <span className="text-sm opacity-80">|</span>
                  <span className="text-sm font-mono opacity-90">ラウンド</span>
                </div>
              </motion.div>

              {/* 数字 - 標高風の大きな表示 */}
              <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                className="text-center mb-8"
              >
                <div className="relative inline-block">
                  {/* 山のアイコン背景 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 scale-150">
                    <div className="text-[20rem]">🏔️</div>
                  </div>

                  {/* メイン数字 */}
                  <div className="relative">
                    <div className="text-[12rem] md:text-[16rem] font-black text-white drop-shadow-2xl leading-none tracking-tight">
                      {cutinRoundNumber}
                    </div>

                    {/* 標高風のサブテキスト */}
                    <div className="absolute -bottom-4 right-0 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-500/30">
                      <div className="text-amber-400 text-sm font-mono font-bold">
                        STAGE {cutinRoundNumber}/3
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* お題 - 登山ルート風 */}
              {game && game.prompts[cutinRoundNumber - 1] && (
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-block bg-slate-800/90 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl px-8 py-6 shadow-2xl max-w-2xl">
                    {/* ルートマーカー */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="text-xs text-amber-400 font-bold tracking-widest">MISSION</div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>

                    {/* お題テキスト */}
                    <div className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                      {game.prompts[cutinRoundNumber - 1]}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 装飾 - 登山ルートライン */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex justify-center mt-8"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </motion.div>
            </motion.div>

            {/* スキップヒント */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto"
            >
              <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl border border-slate-600">
                <span className="text-lg">👆</span>
                <span className="text-sm font-medium text-slate-300">
                  タップでスキップ
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 結果判定演出 - マウント！カットイン */}
      <AnimatePresence>
        {showResultCutin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            onClick={() => {
              setShowResultCutin(false);
              setShowingResult(true);
            }}
          >
            {/* 背景 - 山の空 */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-orange-400 to-yellow-300" />

            {/* 山のシルエット - 多層で立体感を出す */}
            <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden">
              {/* 最遠景の山々 - 淡い青 */}
              <motion.svg
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewBox="0 0 1200 800"
                className="absolute bottom-0 w-full h-full will-change-transform"
                preserveAspectRatio="xMidYMax slice"
                style={{ willChange: 'transform, opacity' }}
              >
                <path
                  d="M0,800 L0,500 L150,400 L300,450 L450,350 L600,380 L750,320 L900,380 L1050,340 L1200,420 L1200,800 Z"
                  fill="rgba(30,58,138,0.4)"
                />
              </motion.svg>

              {/* 遠景の山 - より濃い */}
              <motion.svg
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 0.35 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                viewBox="0 0 1200 800"
                className="absolute bottom-0 w-full h-full will-change-transform"
                preserveAspectRatio="xMidYMax slice"
              >
                <path
                  d="M0,800 L0,450 L200,320 L400,380 L600,250 L800,320 L1000,280 L1200,380 L1200,800 Z"
                  fill="rgba(20,40,100,0.5)"
                />
              </motion.svg>

              {/* 中景の山 - はっきりした山 */}
              <motion.svg
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 0.6 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                viewBox="0 0 1200 800"
                className="absolute bottom-0 w-full h-full will-change-transform"
                preserveAspectRatio="xMidYMax slice"
              >
                <path
                  d="M0,800 L0,520 L150,420 L300,480 L450,350 L600,280 L750,380 L900,340 L1050,420 L1200,480 L1200,800 Z"
                  fill="rgba(15,30,80,0.7)"
                />
              </motion.svg>

              {/* 近景の山 - 最も濃い */}
              <motion.svg
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 0.85 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
                viewBox="0 0 1200 800"
                className="absolute bottom-0 w-full h-full will-change-transform"
                preserveAspectRatio="xMidYMax slice"
              >
                <path
                  d="M0,800 L0,550 L200,450 L400,520 L600,380 L800,480 L1000,440 L1200,540 L1200,800 Z"
                  fill="rgba(10,20,60,0.9)"
                />
                {/* 雪の頂 */}
                <path
                  d="M600,380 L580,390 L560,385 L540,395 L600,380 L660,395 L640,385 L620,390 Z"
                  fill="rgba(255,255,255,0.8)"
                />
                <path
                  d="M800,480 L780,490 L760,485 L740,495 L800,480 L860,495 L840,485 L820,490 Z"
                  fill="rgba(255,255,255,0.7)"
                />
              </motion.svg>

              {/* 山頂の光の効果 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl"
              />
            </div>

            {/* 雲のエフェクト（軽量版） */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`cloud-${i}`}
                initial={{ x: -100, opacity: 0 }}
                animate={{ 
                  x: "100vw",
                  opacity: [0, 0.4, 0]
                }}
                transition={{
                  duration: 12 + i * 2,
                  repeat: Infinity,
                  delay: i * 3,
                  ease: "linear"
                }}
                className="absolute text-5xl will-change-transform z-10"
                style={{ 
                  top: `${25 + i * 20}%`,
                  willChange: 'transform, opacity'
                }}
              >
                ☁️
              </motion.div>
            ))}

            {/* 集中線エフェクト（軽量版） */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.15 }}
                  transition={{ 
                    duration: 0.3,
                    delay: i * 0.02,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white origin-top will-change-transform"
                  style={{
                    transform: `rotate(${(360 / 12) * i}deg) translateX(-50%)`,
                    willChange: 'transform, opacity'
                  }}
                />
              ))}
            </div>

            {/* メインカットイン */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              
              {/* 斜めストライプ装飾 - 上 */}
              <motion.div
                initial={{ x: "-100%", rotate: -15 }}
                animate={{ x: "0%", rotate: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-1/4 -left-20 w-[120vw] h-32 bg-gradient-to-r from-black/80 via-black/60 to-transparent border-y-4 border-yellow-300 will-change-transform"
                style={{ transformOrigin: "left center", willChange: 'transform' }}
              >
                {/* 標高メーター風装飾 */}
                <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white font-mono font-bold">
                  <span className="text-2xl">📏</span>
                  <span className="text-xl">ALTITUDE MEASURING...</span>
                </div>
              </motion.div>

              {/* 斜めストライプ装飾 - 下 */}
              <motion.div
                initial={{ x: "100%", rotate: -15 }}
                animate={{ x: "0%", rotate: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute bottom-1/4 -right-20 w-[120vw] h-32 bg-gradient-to-l from-black/80 via-black/60 to-transparent border-y-4 border-yellow-300 will-change-transform"
                style={{ transformOrigin: "right center", willChange: 'transform' }}
              >
                {/* 山頂到達風装飾 */}
                <div className="absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white font-mono font-bold">
                  <span className="text-xl">CLIMBING TO THE TOP</span>
                </div>
              </motion.div>

              {/* メインテキスト */}
              <div className="relative">
                {/* Let's マウント！ */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [90, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    times: [0, 0.6, 1],
                    ease: "easeOut"
                  }}
                  className="text-center will-change-transform"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    {/* Let's */}
                    <div className="text-5xl md:text-6xl font-black text-white tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                      style={{
                        textShadow: '4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,0,0.8)'
                      }}
                    >
                      Let's
                    </div>
                    
                    {/* マウント！ */}
                    <motion.div 
                      className="text-7xl md:text-9xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 bg-clip-text text-transparent tracking-tight will-change-transform"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        textShadow: '6px 6px 0px rgba(0,0,0,0.9), -3px -3px 0px rgba(255,255,255,0.3)',
                        WebkitTextStroke: '3px #000',
                        paintOrder: 'stroke fill'
                      }}
                    >
                      マウント！
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* サブテキスト - 標高測定中 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <div className="inline-block bg-black/70 backdrop-blur-sm px-8 py-4 rounded-full border-4 border-yellow-400">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div className="text-2xl font-black text-yellow-300 tracking-widest uppercase">
                        標高測定中
                      </div>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-2xl will-change-transform"
                      >
                        🧭
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 下部装飾 - 山頂到達マーク */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-4xl will-change-transform"
                  >
                    🏔️
                  </motion.div>
                  <div className="text-white font-black text-xl tracking-wider">
                    REACH THE SUMMIT
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                    className="text-4xl will-change-transform"
                  >
                    🏔️
                  </motion.div>
                </div>
              </motion.div>

              {/* スキップヒント */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30">
                  <span className="text-base">👆</span>
                  <span className="text-xs text-white/90 font-bold">
                    TAP TO SKIP
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 滑落演出 */}
      <AnimatePresence>
        {showFallCutin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            onClick={() => {
              setShowFallCutin(false);
              setShowingResult(true);
            }}
          >
            {/* 背景 - 危険な赤黒グラデーション */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-red-950 via-red-900 to-black"
              animate={{
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* 落下する岩のエフェクト */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`rock-${i}`}
                  initial={{ 
                    x: `${Math.random() * 100}%`,
                    y: -50,
                    rotate: 0,
                    opacity: 0.8
                  }}
                  animate={{
                    y: "110vh",
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    opacity: [0.8, 1, 0]
                  }}
                  transition={{
                    duration: 1 + Math.random() * 1,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute text-3xl will-change-transform"
                  style={{
                    left: `${Math.random() * 100}%`,
                    willChange: 'transform, opacity'
                  }}
                >
                  🪨
                </motion.div>
              ))}
            </div>

            {/* 亀裂エフェクト */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`crack-${i}`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.3 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 w-1 h-full bg-red-300 origin-top will-change-transform"
                  style={{
                    left: `${10 + i * 12}%`,
                    transform: `rotate(${-5 + Math.random() * 10}deg)`,
                    willChange: 'transform, opacity'
                  }}
                />
              ))}
            </div>

            {/* メインコンテンツ */}
            <div className="relative z-10 flex flex-col items-center gap-8">
              {/* 落下アイコン */}
              <motion.div
                animate={{
                  y: [0, 30, 0],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-9xl drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] will-change-transform"
              >
                ⚠️
              </motion.div>

              {/* 滑落テキスト */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: [0, 1.3, 1],
                  rotate: [-180, 10, 0]
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.7, 1],
                  ease: "easeOut"
                }}
                className="relative will-change-transform"
              >
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(239,68,68,0.8), 6px 6px 0px rgba(0,0,0,0.9)',
                      '0 0 40px rgba(239,68,68,1), 6px 6px 0px rgba(0,0,0,0.9)',
                      '0 0 20px rgba(239,68,68,0.8), 6px 6px 0px rgba(0,0,0,0.9)'
                    ]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl md:text-9xl font-black text-red-500 tracking-tight"
                  style={{
                    WebkitTextStroke: '4px #000',
                    paintOrder: 'stroke fill'
                  }}
                >
                  滑落！
                </motion.div>
              </motion.div>

              {/* サブテキスト */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-2xl border-4 border-red-500"
              >
                <div className="text-2xl font-black text-red-300 tracking-wider">
                  標高2000mに落下...
                </div>
              </motion.div>

              {/* 警告ライン */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-96 h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent will-change-transform"
              />

              {/* スキップヒント */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4"
              >
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30">
                  <span className="text-base">👆</span>
                  <span className="text-xs text-white/90 font-bold">
                    TAP TO CONTINUE
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 保険獲得演出 */}
      <AnimatePresence>
        {showInsuranceCutin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            onClick={() => {
              setShowInsuranceCutin(false);
              setShowingResult(true);
            }}
          >
            {/* 背景 - 安全な緑青グラデーション */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-teal-900 to-cyan-950"
              animate={{
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* キラキラエフェクト */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{ 
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 1,
                    delay: Math.random() * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute text-2xl will-change-transform"
                  style={{
                    willChange: 'transform, opacity'
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* 光の輪エフェクト */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-96 h-96 rounded-full border-4 border-green-400/50" />
            </motion.div>
            <motion.div
              animate={{
                scale: [1.2, 1.4, 1.2],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-[30rem] h-[30rem] rounded-full border-4 border-green-400/30" />
            </motion.div>

            {/* メインコンテンツ */}
            <div className="relative z-10 flex flex-col items-center gap-8">
              {/* 盾アイコン */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [-180, 0, 0]
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    filter: [
                      'drop-shadow(0 0 20px rgba(34,197,94,0.8))',
                      'drop-shadow(0 0 40px rgba(34,197,94,1))',
                      'drop-shadow(0 0 20px rgba(34,197,94,0.8))'
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-9xl will-change-transform"
                >
                  🛡️
                </motion.div>
              </motion.div>

              {/* 保険獲得テキスト */}
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  y: 0
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  times: [0, 0.7, 1],
                  ease: "easeOut"
                }}
                className="relative will-change-transform"
              >
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(34,197,94,0.8), 6px 6px 0px rgba(0,0,0,0.9)',
                      '0 0 40px rgba(34,197,94,1), 6px 6px 0px rgba(0,0,0,0.9)',
                      '0 0 20px rgba(34,197,94,0.8), 6px 6px 0px rgba(0,0,0,0.9)'
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-7xl md:text-8xl font-black text-green-400 tracking-tight"
                  style={{
                    WebkitTextStroke: '4px #000',
                    paintOrder: 'stroke fill'
                  }}
                >
                  保険獲得！
                </motion.div>
              </motion.div>

              {/* サブテキスト */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-2xl border-4 border-green-500">
                  <div className="text-2xl font-black text-green-300 tracking-wider">
                    安全ルートで保険を入手
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-emerald-900/50 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-emerald-400/50"
                >
                  <div className="text-lg font-bold text-emerald-200 text-center">
                    次回の滑落を1回防ぐことができます
                  </div>
                </motion.div>
              </motion.div>

              {/* 装飾ライン */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="w-96 h-2 bg-gradient-to-r from-transparent via-green-400 to-transparent will-change-transform"
              />

              {/* チェックマークエフェクト */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.4, ease: "backOut" }}
                className="flex gap-4 text-5xl"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 1.2, repeat: Infinity, repeatDelay: 1 }}
                >
                  ✅
                </motion.span>
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 1.4, repeat: Infinity, repeatDelay: 1 }}
                >
                  ✅
                </motion.span>
              </motion.div>

              {/* スキップヒント */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="mt-4"
              >
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30">
                  <span className="text-base">👆</span>
                  <span className="text-xs text-white/90 font-bold">
                    TAP TO CONTINUE
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 天候に応じた背景 */}
      <div className={`fixed inset-0 ${getWeatherBackground()} -z-20 transition-colors duration-1000`} />

      {/* 吹雪エフェクト */}
      {game.weather === "BLIZZARD" && (
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
          <style jsx>{`
            @keyframes snowfall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0.7;
              }
              70% {
                opacity: 0.7;
              }
              100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* 強風エフェクト */}
      {game.weather === "WINDY" && (
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
          <style jsx>{`
            @keyframes windLeaf {
              0% {
                transform: translateX(0) translateY(0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 0.8;
              }
              90% {
                opacity: 0.8;
              }
              100% {
                transform: translateX(calc(100vw + 100px)) translateY(${Math.random() * 200 - 100}px) rotate(${Math.random() * 720}deg);
                opacity: 0;
              }
            }
            @keyframes windBlow {
              0% {
                transform: translateX(0) rotate(-5deg);
                opacity: 0;
              }
              10% {
                opacity: 0.6;
              }
              90% {
                opacity: 0.6;
              }
              100% {
                transform: translateX(calc(100vw + 200px)) rotate(-5deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* 遠景の山シルエット (下層) */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10 opacity-30 dark:opacity-20 transition-all duration-1000">
        <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${game.weather === "SUNNY" ? "fill-green-600 dark:fill-green-700" : "fill-stone-400 dark:fill-stone-600"}`}>
          <path d="M0,320 L200,160 L400,280 L600,100 L800,240 L1000,140 L1200,320 Z" />
        </svg>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none -z-10 opacity-50 dark:opacity-40 transition-all duration-1000">
        <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${game.weather === "SUNNY" ? "fill-green-700 dark:fill-green-800" : "fill-stone-500 dark:fill-stone-700"}`}>
          <path d="M0,320 L150,200 L350,300 L550,150 L850,280 L1100,180 L1200,320 Z" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 space-y-6 relative z-10">
        {/* コンパクトヘッダー */}
        <header className="flex flex-wrap gap-3 justify-between items-start text-sm md:text-base font-bold font-mono text-gray-600 dark:text-gray-400">
          <div className="flex gap-3">
            {game.weather && (
              <button
                onClick={() => setShowWeatherDetail(true)}
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

        {/* Block A: プレイカード / 結果表示 / ゲーム終了表示 */}
        {!isFinished ? (
          <>
            {!showingResult ? (
              // 入力画面
              <section className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 space-y-6 relative overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-500">
                {/* 背景装飾 */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <div className="text-8xl">⛰️</div>
                </div>

                <div className="relative z-10">
                  {/* ラウンド情報 */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      ROUND {game.roundIndex + 1} / {ROUND_COUNT}
                    </span>
                    <span className="text-base md:text-lg font-mono text-gray-500">TOTAL: {game.players[0].totalScore}m</span>
                  </div>

                  {/* お題 */}
                  <h2 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-100 mb-6">
                    Q. {currentRound.prompt}
                  </h2>

                  {error && <div className="text-base md:text-lg text-red-600 bg-red-50 dark:bg-red-900/50 p-3 rounded mb-4">エラー: {error}</div>}

                  {/* ルート選択 */}
                  <div className="mb-6">
                    <div className="text-sm md:text-base font-bold text-gray-500 mb-3 uppercase tracking-wide">Select Route</div>
                    <div className="grid grid-cols-3 gap-4">
                      {ROUTES.map((route) => {
                        const isSelected = (currentRound.routeId || "NORMAL") === route.id;

                        let activeClass = "";
                        let borderClass = "border-gray-200 dark:border-zinc-700 opacity-70 hover:opacity-100";

                        if (isSelected) {
                          if (route.id === "SAFE") activeClass = "bg-green-100 border-green-500 text-green-900 dark:bg-green-900 dark:text-green-100";
                          else if (route.id === "RISKY") activeClass = "bg-red-100 border-red-500 text-red-900 dark:bg-red-900 dark:text-red-100";
                          else activeClass = "bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
                          borderClass = "border-2 opacity-100 shadow-md transform scale-105";
                        }

                        return (
                          <button
                            key={route.id}
                            onClick={() => {
                              setGame((prev) => {
                                if (!prev) return null;
                                const next = structuredClone(prev);
                                next.players[0].rounds[next.roundIndex].routeId = route.id;
                                return next;
                              });
                            }}
                            className={`relative py-4 md:py-5 px-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] ${borderClass} ${activeClass} ${isSelected ? "" : "hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                          >
                            <div className="text-3xl md:text-4xl">{route.emoji}</div>
                            <div className="text-sm md:text-base font-bold">{route.label}</div>
                            <div className="text-xs md:text-sm font-mono">x{route.multiplier}</div>

                            {isSelected && (
                              <div className="absolute -top-2 -right-2">
                                <span className="flex h-5 w-5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 入力エリア */}
                  <div className="space-y-4">
                    <textarea
                      className="w-full min-h-40 rounded-xl border-2 border-transparent bg-gray-50/50 dark:bg-black/50 p-5 text-xl md:text-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black outline-none transition-all resize-y shadow-inner"
                      placeholder="ここにマウント発言を入力... (例: 「まあ、俺なら3秒で終わるけどね」)"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={showRoundCutin || loading}
                    />

                    <div className="flex gap-6">
                      <button
                        className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[2px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
                        disabled={!text.trim() || loading || showRoundCutin}
                        onClick={submitRound}
                      >
                        <div className="relative h-full w-full rounded-[10px] bg-transparent transition-all group-hover:bg-white/10 px-8 py-4">
                          <div className="flex items-center justify-center gap-3 text-white font-bold text-xl md:text-2xl">
                            {loading ? (
                              <>
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>判定中...</span>
                              </>
                            ) : (
                              <>
                                <span>マウントを取る!</span>
                                <span className="text-2xl md:text-3xl">🏔️</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        className="px-5 rounded-xl border-2 border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 hover:scale-[1.02] transition-all text-xl md:text-2xl flex-shrink-0"
                        onClick={resetGame}
                        title="最初からやり直す"
                      >
                        ↺
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              // 結果表示画面
              lastResult && lastResult.result && (
                <section className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border-4 border-white/50 dark:border-zinc-700/50 shadow-2xl p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500 overflow-hidden relative">
                  {/* 背景の光るエフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/20 pointer-events-none" />

                  {/* 結果ヘッダー */}
                  <div className="relative z-10 text-center mb-6">
                    <div className="text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-100">
                      ROUND {game.roundIndex + 1} 結果
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 mb-8">
                    {/* 左側: マウンテンビュー */}
                    <div className="flex-shrink-0 relative group">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform scale-75 group-hover:scale-110 transition-transform duration-700"></div>
                      <MountainView altitude={lastResult.result.altitude} size={320} />
                    </div>

                    {/* 右側: 情報エリア */}
                    <div className="flex-1 space-y-4 w-full text-center md:text-left">
                      {/* メイン標高表示 */}
                      <div>
                        <div className="text-base md:text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Current Altitude</div>
                        <div className="flex items-baseline justify-center md:justify-start gap-3">
                          <span className="text-7xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 drop-shadow-sm">
                            {lastResult.result.altitude.toLocaleString()}
                          </span>
                          <span className="text-2xl md:text-3xl font-bold text-gray-400">m</span>
                        </div>

                        {/* スコア・ボーナス表示 */}
                        <div className="flex items-center justify-center md:justify-start gap-3 text-base md:text-lg mt-2">
                          <span className="bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded text-gray-600 dark:text-gray-300 font-mono">
                            Score: {lastResult.result.mountScore.toFixed(2)}
                          </span>
                          {lastResult.result.bonusAltitude && lastResult.result.bonusAltitude > 0 && (
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-2 animate-pulse">
                              <span className="text-xl">✨</span><span>+{lastResult.result.bonusAltitude}m Bonus!</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-px bg-gray-200 dark:bg-zinc-700 w-full" />

                      {/* 重要イベント通知エリア */}
                      <div className="space-y-2">
                        {/* 保険発動 */}
                        {lastResult.result.insuranceUsed && (
                          <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg p-3 flex items-center justify-center gap-2 shadow-sm">
                            <span className="text-xl">🛟</span>
                            <span className="text-green-800 dark:text-green-200 font-bold">保険発動!滑落を回避しました</span>
                          </div>
                        )}

                        {/* 滑落 */}
                        {lastResult.result.didFall && (
                          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-4 shadow-lg animate-[shake_0.5s_ease-in-out]">
                            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-black text-lg">
                              <span>⚠️</span>
                              <span>{lastResult.result.fallReason || "滑落発生!"}</span>
                            </div>
                            <div className="text-center text-sm text-red-500 mt-1 font-bold">
                              標高が 2,000m に固定されました
                            </div>
                          </div>
                        )}

                        {/* 天候ボーナス */}
                        {lastResult.result.weatherApplied && (
                          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-2 text-center">
                            <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                              🌤 天候ボーナス発動!「{lastResult.result.weatherBoostLabel}」で+20%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ルート情報 */}
                      {lastResult.result.routeId && (
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center text-sm">
                          <span className="text-gray-400 font-bold text-xs uppercase">Route Info:</span>
                          <span className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 font-bold border border-gray-200 dark:border-zinc-700">
                            {getRoute(lastResult.result.routeId).emoji} {getRoute(lastResult.result.routeId).label}
                          </span>
                          {lastResult.result.routeMultiplier && lastResult.result.routeMultiplier !== 1.0 && (
                            <span className="text-gray-500 font-mono text-xs">x{lastResult.result.routeMultiplier}</span>
                          )}
                        </div>
                      )}

                      {/* ラベルタグ */}
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {lastResult.result.labels.map((label) => (
                          <span key={label} className="px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300">
                            #{getLabelJa(label)}
                          </span>
                        ))}
                      </div>

                      {/* 実況コメント & ヒント */}
                      <div className="grid gap-3 pt-2">
                        {lastResult.result.commentary && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-400 text-sm">
                            <div className="font-bold text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                              <span>🎤</span><span>実況</span>
                            </div>
                            <div className="text-amber-900 dark:text-amber-100 font-medium leading-relaxed">
                              {lastResult.result.commentary}
                            </div>
                          </div>
                        )}

                        {lastResult.result.tip && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400 text-sm">
                            <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                              <span>💡</span><span>攻略ヒント</span>
                            </div>
                            <div className="text-blue-900 dark:text-blue-100">
                              {lastResult.result.tip}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 次のラウンドへボタン */}
                  <div className="relative z-10">
                    <button
                      onClick={proceedToNextRound}
                      className={`w-full py-5 rounded-xl text-white font-bold text-xl md:text-2xl hover:scale-[1.02] transition-transform shadow-lg ${game.roundIndex + 1 >= game.players[0].rounds.length
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {game.roundIndex + 1 >= game.players[0].rounds.length ? (
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
              )
            )}
          </>
        ) : (
          <section className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border-2 border-yellow-400 p-6 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="text-4xl font-black mb-2 flex justify-center gap-2">
              <span>🎉</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                FINISH!
              </span>
              <span>🎉</span>
            </div>

            <SoloGameSummary summary={buildSoloSummary(game)} onReset={resetGame} />

            <Link
              href="/"
              className="block w-full py-4 text-center rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-700 hover:scale-105 transition-all shadow-lg"
            >
              タイトルに戻る
            </Link>
          </section>
        )}


        {/* Block C: 履歴 (History) */}
        <section className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden transition-all duration-300">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 font-bold text-gray-600 dark:text-gray-300">
              <span>📜 登頂履歴</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{game.players[0].rounds.filter(r => r.result).length}</span>
            </div>
            <div className="text-gray-400 transform transition-transform duration-300" style={{ transform: isHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </div>
          </button>

          {isHistoryOpen && (
            <div className="p-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-gray-100 dark:border-zinc-800">
              {game.players[0].rounds.filter(r => r.result).map((r, i) => (
                <div key={r.id} className="group relative rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black p-4 hover:shadow-md transition-shadow">

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">#{i + 1}</span>
                      {r.routeId && (
                        <span className="text-lg" title={getRoute(r.routeId).label}>{getRoute(r.routeId).emoji}</span>
                      )}
                      <span className="font-bold text-gray-800 dark:text-gray-200">{r.prompt}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-lg font-mono tracking-tight text-gray-900 dark:text-white">
                        {r.result?.altitude.toLocaleString()} m
                      </div>
                      {r.result?.bonusAltitude && r.result.bonusAltitude > 0 && (
                        <div className="text-[10px] text-yellow-600 font-bold">
                          (+{r.result.bonusAltitude})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-gray-300 dark:border-zinc-700 italic">
                    &ldquo;{r.inputText}&rdquo;
                  </div>

                  <div className="absolute top-2 right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <MountainView altitude={r.result?.altitude || 0} size={50} />
                  </div>
                </div>
              ))}
              {game.players[0].rounds.filter(r => r.result).length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4">まだ履歴はありません</div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 天気詳細モーダル */}
      <AnimatePresence>
        {showWeatherDetail && game.weather && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowWeatherDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className={`p-6 ${
                game.weather === "SUNNY" 
                  ? "bg-gradient-to-br from-blue-400 to-blue-600" 
                  : game.weather === "WINDY"
                  ? "bg-gradient-to-br from-teal-400 to-teal-600"
                  : "bg-gradient-to-br from-indigo-400 to-indigo-600"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{getWeather(game.weather).emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-white/80 uppercase tracking-wider">Weather</div>
                      <h3 className="text-2xl font-black text-white">{getWeather(game.weather).label}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWeatherDetail(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="p-6 space-y-4">
                {/* 説明 */}
                <div>
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    効果
                  </div>
                  <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                    {getWeather(game.weather).description}
                  </div>
                </div>

                {/* ブーストラベル */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⚡</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                      ボーナス条件
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-amber-900 dark:text-amber-100">
                      「{getLabelJa(getWeather(game.weather).boostLabel)}」
                    </span>
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      のラベルで
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    +20% ボーナス
                  </div>
                </div>

                {/* 閉じるボタン */}
                <button
                  onClick={() => setShowWeatherDetail(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
