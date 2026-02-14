"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
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
import { pickMission, evaluateMission } from "@/lib/solo/missions";
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
  }, []);

  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<Round | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ text: text.trim() }),
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
        });

        const { finalAltitude, didFall, fallReason, weatherApplied, weatherMultiplier, weatherBoostLabel } = scoreResult;

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

        player.totalScore += finalAltitude;

        // --- 称号判定 (ラウンド毎) ---
        // 非同期で実行（UIをブロックしない）
        updateStats({
          highestAltitude: finalAltitude,
          snowCount: finalAltitude >= 6000 ? 1 : 0,
          everestCount: finalAltitude >= 8000 ? 1 : 0,
        });

        // 次ラウンドへ
        if (next.roundIndex + 1 >= player.rounds.length) {
          next.status = "finished";

          // --- 称号判定 (ゲーム終了時) ---
          updateStats({
            soloPlays: 1,
            highestTotalAltitude: player.totalScore,
          });
        } else {
          next.roundIndex += 1;
        }

        // 直近の結果を保存 (現在のround情報をコピー)
        setLastResult(structuredClone(round));

        return next;
      });

      setText("");
      setIsHistoryOpen(false); // 判定後は履歴を閉じて結果に集中させる
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function resetGame() {
    setGame(initializeSoloGameState());
    setText("");
    setLastResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">🏔 マウンティングマウンテン（ソロ）</h1>
        <p className="text-sm text-gray-600">
          お題に沿ってマウント発言を入力！標高が高いほどスコアが伸びる。
        </p>
        {game.weather && (
          <div className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-sm font-bold">
              天候: {getWeather(game.weather).emoji} {getWeather(game.weather).label}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
              ({getWeather(game.weather).description})
            </span>
          </div>
        )}
      </header>

      {/* Block A: プレイカード / ゲーム終了表示 */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="font-semibold text-lg">
            {!isFinished
              ? `ラウンド ${Math.min(game.roundIndex + 1, ROUND_COUNT)} / ${ROUND_COUNT}`
              : "結果発表"}
          </div>
          <div className="text-sm font-mono">
            合計標高: <span className="font-bold text-lg">{game.players[0].totalScore}</span> m
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">エラー: {error}</div>}

        {game.mission && (
          <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
              🎯 ミッション: {game.mission.title}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              {game.mission.description}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-mono">
              {evaluateMission(game).progressText}
            </div>
          </div>
        )}

        {!isFinished ? (
          <>
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Theme</div>
              <div className="text-xl font-bold p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                {currentRound.prompt}
              </div>
            </div>

            {/* ルート選択 */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Route</div>
              <div className="flex gap-2">
                {ROUTES.map((route) => {
                  const isSelected = (currentRound.routeId || "NORMAL") === route.id;
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
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold ${isSelected
                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                        : "border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500"
                        }`}
                    >
                      <div className="text-lg">{route.emoji}</div>
                      <div className="text-xs">{route.label}</div>
                      <div className="text-[10px] opacity-70">×{route.multiplier}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">You</div>
              <textarea
                className="w-full min-h-32 rounded-lg border p-4 text-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                placeholder="ここにマウント発言を入力..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 py-3 rounded-lg bg-black text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all dark:bg-white dark:text-black"
                disabled={!text.trim() || loading}
                onClick={submitRound}
              >
                {loading ? "判定中..." : "マウントを取る！"}
              </button>

              <button
                className="px-4 py-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={resetGame}
                title="最初からやり直す"
              >
                ↺
              </button>
            </div>
          </>
        ) : (() => {
          const summary = buildSoloSummary(game);

          return (
            <>
              <SoloGameSummary summary={summary} onReset={resetGame} />
              <Link
                href="/"
                className="block w-full py-3 text-center rounded-lg border hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                タイトルに戻る
              </Link>
            </>
          );
        })()}
      </section>

      {/* Block B: 直近の判定結果 (Last Result) */}
      {lastResult && lastResult.result && (
        <section className="bg-stone-50 dark:bg-stone-900 rounded-xl border-2 border-stone-200 dark:border-stone-700 p-6 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="text-center mb-4">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest">Latest Judgment</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <MountainView altitude={lastResult.result.altitude} size={160} />
            </div>

            <div className="flex-1 space-y-3 w-full text-center md:text-left">
              <div>
                <div className="text-4xl font-black leading-none">{lastResult.result.altitude} m</div>
                <div className="text-sm text-gray-500">
                  Mount Score: {lastResult.result.mountScore.toFixed(2)}
                  {lastResult.result.bonusAltitude && lastResult.result.bonusAltitude > 0 && (
                    <span className="ml-2 text-yellow-600 font-bold">
                      (+{lastResult.result.bonusAltitude}m Bonus!)
                    </span>
                  )}
                </div>
              </div>

              {lastResult.result.bonusReasons && lastResult.result.bonusReasons.length > 0 && (
                <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                  {lastResult.result.bonusReasons.map(r => <div key={r}>✨ {r}</div>)}
                </div>
              )}

              {lastResult.result.routeId && (
                <div className="text-xs">
                  <span className="font-bold text-gray-500">ルート:</span>{" "}
                  <span className="font-mono">{getRoute(lastResult.result.routeId).emoji} {getRoute(lastResult.result.routeId).label}</span>
                  {lastResult.result.routeMultiplier && lastResult.result.routeMultiplier !== 1.0 && (
                    <span className="ml-1 text-gray-500">(×{lastResult.result.routeMultiplier})</span>
                  )}
                </div>
              )}

              {lastResult.result.didFall && (
                <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded border-2 border-red-300">
                  ⚠️ {lastResult.result.fallReason || "滑落！"} 標高が2000mに固定されました
                </div>
              )}

              {lastResult.result.weatherApplied && (
                <div className="text-sm font-bold text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  🌤 天候ボーナス発動！「{lastResult.result.weatherBoostLabel}」で+20%
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {lastResult.result.labels.map((label) => (
                  <span key={label} className="px-2 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300">
                    {getLabelJa(label)}
                  </span>
                ))}
              </div>

              {/* 攻略ヒント */}
              {lastResult.result.tip && (
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded border border-blue-200 dark:border-blue-700 text-sm">
                  <div className="font-bold text-xs text-blue-600 dark:text-blue-300 mb-1">💡 攻略ヒント</div>
                  <div className="text-blue-900 dark:text-blue-100">{lastResult.result.tip}</div>
                </div>
              )}

              {/* 実況コメント */}
              {lastResult.result.commentary && (
                <div className="bg-amber-50 dark:bg-amber-900 p-3 rounded border border-amber-200 dark:border-amber-700 text-sm">
                  <div className="font-bold text-xs text-amber-600 dark:text-amber-300 mb-1">🎤 実況</div>
                  <div className="text-amber-900 dark:text-amber-100">{lastResult.result.commentary}</div>
                </div>
              )}

              {/* 言い換え（非推奨だが互換性のため残す） */}
              {lastResult.result.rewrite && (
                <div className="bg-white dark:bg-black p-3 rounded border text-sm text-left">
                  <div className="font-bold text-xs text-gray-400 mb-1">言い換え</div>
                  {lastResult.result.rewrite}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Block C: 履歴 (History) */}
      <section className="space-y-4">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-800 transition-colors px-2"
        >
          <span>📜 これまでの履歴</span>
          <span>{isHistoryOpen ? "閉じる ▲" : "開く ▼"}</span>
        </button>

        {isHistoryOpen && (
          <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
            {game.players[0].rounds.filter(r => r.result).map((r) => (
              <div key={r.id} className="rounded-lg border p-4 bg-gray-50 dark:bg-zinc-900 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {r.routeId && (
                      <span className="text-xs" title={getRoute(r.routeId).label}>
                        {getRoute(r.routeId).emoji}
                      </span>
                    )}
                    <span className="font-bold">{r.prompt}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold">{r.result?.altitude} m</span>
                    {r.result?.bonusAltitude && r.result.bonusAltitude > 0 && (
                      <div className="text-[10px] text-yellow-600 font-bold">
                        (inc. +{r.result.bonusAltitude})
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-300">
                  {r.inputText}
                </div>
              </div>
            ))}
            {game.players[0].rounds.filter(r => r.result).length === 0 && (
              <div className="text-center text-sm text-gray-400 py-4">まだ履歴はありません</div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
