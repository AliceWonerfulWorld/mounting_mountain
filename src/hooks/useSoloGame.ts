import { useState, useCallback, useEffect, useRef } from "react";
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
import { createClient } from "@/lib/supabase/client";

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
  const savedGameRef = useRef<Set<string>>(new Set()); // 保存済みゲームのIDを記録

  /**
   * ソロゲームの状態を初期化するヘルパー関数
   */
  const initializeSoloGameState = useCallback((): GameState => {
    const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
    const rounds = createRounds(selectedPrompts, ROUND_COUNT);
    const weather = pickWeather();
    const mission = pickMission();

    return {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ユニークなID生成
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
   * @returns 送信完了したRoundオブジェクト、または失敗時はundefined
   */
  const submitRound = useCallback(async (): Promise<Round | undefined> => {
    if (!game) return undefined;
    const currentRound = game.players[0].rounds[game.roundIndex];
    const isFinished = game.status === "finished";

    if (!text.trim() || isFinished || loading) return undefined;

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

      // 完了したラウンドデータを事前に構築
      const route = getRoute(currentRound.routeId);
      const routeMultiplier = route.multiplier;
      const bonus = computeBonus(result.labels);
      const baseAltitude = result.altitude;
      const bonusAltitude = bonus.bonusAltitude;

      const scoreResult = computeFinalAltitude({
        baseAltitude,
        routeId: currentRound.routeId || "NORMAL",
        routeMultiplier,
        bonusAltitude,
        weatherId: game.weather,
        labels: result.labels,
        insurance: game.insurance,
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

      // 完了したラウンドオブジェクトを構築
      const completedRound: Round = {
        ...currentRound,
        inputText: text.trim(),
        result: {
          ...result,
          baseAltitude,
          bonusAltitude,
          finalAltitude,
          bonusReasons: bonus.reasons,
          routeId: currentRound.routeId,
          routeMultiplier,
          didFall,
          fallReason,
          weatherApplied,
          weatherMultiplier,
          weatherBoostLabel,
          altitude: finalAltitude,
        },
      };

      // ゲーム状態を更新
      setGame((prev) => {
        if (!prev) return null;
        const next = structuredClone(prev);

        const player = next.players[0];
        const round = player.rounds[next.roundIndex];

        // 結果を反映
        round.inputText = text.trim();
        round.result = completedRound.result;

        // 保険消費処理
        if (insuranceUsed) {
          next.insurance = Math.max(0, prev.insurance - 1);
        }

        // SAFE選択時に保険を貯める
        if (round.routeId === "SAFE") {
          next.insurance = Math.min(MAX_INSURANCE, next.insurance + 1);
        }

        player.totalScore += finalAltitude;

        return next;
      });

      // 実績更新
      updateStats({
        highestAltitude: finalAltitude,
        snowCount: finalAltitude >= 6000 ? 1 : 0,
        everestCount: finalAltitude >= 8000 ? 1 : 0,
      });

      setLastResult(completedRound);
      setText("");
      
      // 完了したラウンドを返す（state更新を待たずに使用可能）
      return completedRound;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [game, text, loading]);

  /**
   * ゲーム履歴をSupabaseに保存
   */
  const saveGameHistory = useCallback(async (gameState: GameState) => {
    try {
      // ゲームIDで重複チェック
      if (!gameState.id || savedGameRef.current.has(gameState.id)) {
        console.log('Game already saved, skipping...', gameState.id);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // ユーザーがログインしていない場合は保存しない
      if (!user) return;

      const player = gameState.players[0];
      const totalScore = player.totalScore;
      const roundsData = player.rounds.map(round => ({
        prompt: round.prompt,
        routeId: round.routeId,
        inputText: round.inputText,
        finalAltitude: round.result?.finalAltitude || 0,
        didFall: round.result?.didFall || false,
      }));

      // @ts-expect-error - Supabase SSR type issue
      await supabase.from('solo_game_history').insert({
        user_id: user.id,
        total_score: totalScore,
        weather_id: gameState.weather,
        mission_id: gameState.mission?.id || null,
        rounds_data: roundsData,
        completed: gameState.status === 'finished',
      });

      // 保存成功したらIDを記録
      savedGameRef.current.add(gameState.id);
      console.log('Game saved successfully:', gameState.id);
    } catch (err) {
      console.error('Failed to save game history:', err);
      // エラーが発生してもゲームプレイには影響させない
    }
  }, []);

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

        // ゲーム履歴を保存
        saveGameHistory(next);
      } else {
        next.roundIndex += 1;
      }

      return next;
    });
  }, [saveGameHistory]);

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
