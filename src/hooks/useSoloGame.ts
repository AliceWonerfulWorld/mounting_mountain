import { useState, useCallback, useEffect } from "react";
import type { GameState, Round } from "@/types/game";
import type { RouteId } from "@/lib/solo/routes";
import { pickN } from "@/lib/random";
import { PROMPTS } from "@/lib/prompts";
import { createRounds } from "@/lib/game";
import { pickWeather } from "@/lib/solo/weather";
import { pickMission } from "@/lib/solo/missions";
import { computeBonus } from "@/lib/solo/bonus";
import { getRoute } from "@/lib/solo/routes";
import { computeFinalAltitude } from "@/lib/solo/score";
import { updateStats } from "@/lib/achievementStore";

const ROUND_COUNT = 3;
const MAX_INSURANCE = 1;

/**
 * ソロゲームの状態管理カスタムフック
 * ゲームロジック・API通信・状態更新を集約
 */
export function useSoloGame() {
  const [game, setGame] = useState<GameState | null>(null);
  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<Round | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ソロゲームの状態を初期化するヘルパー関数
   */
  const initializeSoloGameState = useCallback((): GameState => {
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
      insurance: 0,
      players: [
        {
          id: "p1",
          name: "Player 1",
          totalScore: 0,
          rounds,
        },
      ],
    };
  }, []);

  /**
   * ゲーム初期化
   */
  const initializeGame = useCallback(() => {
    const newGame = initializeSoloGameState();
    setGame(newGame);
    setText("");
    setLastResult(null);
    setError(null);
  }, [initializeSoloGameState]);

  /**
   * ラウンド送信とAPI通信
   */
  const submitRound = useCallback(async () => {
    if (!game) return;
    const currentRound = game.players[0].rounds[game.roundIndex];
    const isFinished = game.status === "finished";

    if (!text.trim() || isFinished || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          route: currentRound.routeId || "NORMAL",
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`API Error: ${res.status} ${msg}`);
      }

      const result = await res.json();

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
          insurance: prev.insurance,
        });

        const {
          finalAltitude,
          didFall,
          fallReason,
          weatherApplied,
          weatherMultiplier,
          weatherBoostLabel,
          insuranceUsed,
        } = scoreResult;

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
          altitude: finalAltitude,
        };

        // 保険消費処理
        if (insuranceUsed) {
          next.insurance = Math.max(0, prev.insurance - 1);
        }

        // SAFE選択時に保険を貯める
        if (round.routeId === "SAFE") {
          next.insurance = Math.min(MAX_INSURANCE, next.insurance + 1);
        }

        player.totalScore += finalAltitude;

        // 実績更新
        updateStats({
          highestAltitude: finalAltitude,
          snowCount: finalAltitude >= 6000 ? 1 : 0,
          everestCount: finalAltitude >= 8000 ? 1 : 0,
        });

        // 直近の結果を保存
        setLastResult(structuredClone(round));

        return next;
      });

      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [game, text, loading]);

  /**
   * 次のラウンドへ進む
   */
  const proceedToNextRound = useCallback(() => {
    setGame((prev) => {
      if (!prev) return null;
      const next = structuredClone(prev);

      if (next.roundIndex + 1 >= next.players[0].rounds.length) {
        next.status = "finished";

        // ゲーム終了時の実績更新
        updateStats({
          soloPlays: 1,
          highestTotalAltitude: next.players[0].totalScore,
        });
      } else {
        next.roundIndex += 1;
      }

      return next;
    });
  }, []);

  /**
   * ゲームリセット
   */
  const resetGame = useCallback(() => {
    const newGame = initializeSoloGameState();
    setGame(newGame);
    setText("");
    setLastResult(null);
    setError(null);
  }, [initializeSoloGameState]);

  /**
   * ルート選択
   */
  const handleRouteSelect = useCallback((routeId: RouteId) => {
    setGame((prev) => {
      if (!prev) return null;
      const next = structuredClone(prev);
      next.players[0].rounds[next.roundIndex].routeId = routeId;
      return next;
    });
  }, []);

  // 初回マウント時にゲーム初期化
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    game,
    text,
    setText,
    lastResult,
    loading,
    error,
    initializeGame,
    submitRound,
    proceedToNextRound,
    resetGame,
    handleRouteSelect,
  };
}
