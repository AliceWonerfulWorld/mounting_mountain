"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameState, Round } from "@/types/game";
import { PROMPTS } from "@/lib/prompts";
import { pickN } from "@/lib/random";
import { createRounds } from "@/lib/game";
import { updateStats } from "@/lib/achievementStore";
import { getRoute, type RouteId } from "@/lib/solo/routes";
import { computeFinalAltitude } from "@/lib/solo/score";

export const VERSUS_ROUND_COUNT = 3;

export type VersusState = GameState & {
    currentPlayerIndex: 0 | 1;
    phase: "input" | "result" | "finished" | "round_start" | "turn_change" | "both_results" | "battle_cutin";
    lastResult: Round | undefined;
    roundWinner?: 0 | 1 | null;
    selectedRoute: RouteId;
};

function createInitialGame(): VersusState {
    const selectedPrompts = pickN(PROMPTS, VERSUS_ROUND_COUNT).map((p) => p.text);
    const roundsP1 = createRounds(selectedPrompts, VERSUS_ROUND_COUNT);
    const roundsP2 = createRounds(selectedPrompts, VERSUS_ROUND_COUNT);

    return {
        mode: "versus_local",
        status: "playing",
        roundIndex: 0,
        prompts: selectedPrompts,
        currentPlayerIndex: 0,
        phase: "round_start",
        insurance: 0,
        players: [
            { id: "p1", name: "Player 1", totalScore: 0, rounds: roundsP1 },
            { id: "p2", name: "Player 2", totalScore: 0, rounds: roundsP2 },
        ],
        lastResult: undefined,
        roundWinner: undefined,
        selectedRoute: "NORMAL",
    };
}

export function useVersusLocalGame() {
    const [game, setGame] = useState<VersusState | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        setGame(createInitialGame());
    }, []);

    const submitRound = useCallback(async () => {
        if (!game || !text.trim() || loading || game.status === "finished") return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text.trim(),
                    route: game.selectedRoute,
                    mode: "versus",
                }),
            });

            if (!res.ok) throw new Error("API Error");
            const result = await res.json();
            const submittedText = text.trim();

            setGame((prev) => {
                if (!prev) return null;
                const next = structuredClone(prev);
                const player = next.players[next.currentPlayerIndex];
                const round = player.rounds[next.roundIndex];
                const route = getRoute(next.selectedRoute);

                const scoreResult = computeFinalAltitude({
                    baseAltitude: result.altitude,
                    routeId: next.selectedRoute,
                    routeMultiplier: route.multiplier,
                    bonusAltitude: 0,
                });

                round.inputText = submittedText;
                round.result = {
                    ...result,
                    routeId: next.selectedRoute,
                    routeMultiplier: route.multiplier,
                    finalAltitude: scoreResult.finalAltitude,
                    didFall: scoreResult.didFall,
                    fallReason: scoreResult.fallReason,
                };

                player.totalScore += scoreResult.finalAltitude;

                updateStats({
                    highestAltitude: scoreResult.finalAltitude,
                    snowCount: scoreResult.finalAltitude >= 6000 ? 1 : 0,
                    everestCount: scoreResult.finalAltitude >= 8000 ? 1 : 0,
                });

                if (next.currentPlayerIndex === 0) {
                    next.currentPlayerIndex = 1;
                    next.selectedRoute = "NORMAL";
                    next.phase = "turn_change";
                } else {
                    const p1Res = next.players[0].rounds[next.roundIndex].result;
                    const p2Res = next.players[1].rounds[next.roundIndex].result;
                    const p1Alt = p1Res?.finalAltitude ?? 0;
                    const p2Alt = p2Res?.finalAltitude ?? 0;

                    if (p1Alt > p2Alt) next.roundWinner = 0;
                    else if (p2Alt > p1Alt) next.roundWinner = 1;
                    else next.roundWinner = null;

                    next.phase = "battle_cutin";
                }

                return next;
            });
            setText("");
        } catch {
            setError("判定に失敗しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    }, [game, loading, text]);

    const nextTurn = useCallback(() => {
        setGame((prev) => {
            if (!prev) return null;
            const next = structuredClone(prev);

            if (next.roundWinner === 0) next.players[0].totalScore += 1000;
            else if (next.roundWinner === 1) next.players[1].totalScore += 1000;

            if (next.roundIndex + 1 >= VERSUS_ROUND_COUNT) {
                next.status = "finished";
                next.phase = "finished";
                const p1Win = next.players[0].totalScore > next.players[1].totalScore;
                updateStats({ versusPlays: 1, versusWinsP1: p1Win ? 1 : 0 });
            } else {
                next.roundIndex += 1;
                next.currentPlayerIndex = 0;
                next.phase = "round_start";
                next.lastResult = undefined;
                next.roundWinner = undefined;
                next.selectedRoute = "NORMAL";
            }
            return next;
        });
        setText("");
    }, []);

    const resetGame = useCallback(() => {
        setGame(createInitialGame());
        setText("");
        setIsHistoryOpen(false);
        setError(null);
    }, []);

    const completeRoundCutin = useCallback(() => {
        setGame((prev) => prev ? { ...prev, phase: "turn_change" } : null);
    }, []);

    const completeTurnCutin = useCallback(() => {
        setGame((prev) => prev ? { ...prev, phase: "input" } : null);
    }, []);

    const completeBattleCutin = useCallback(() => {
        setGame((prev) => prev ? { ...prev, phase: "both_results" } : null);
    }, []);

    const selectRoute = useCallback((routeId: RouteId) => {
        setGame((prev) => prev ? { ...prev, selectedRoute: routeId } : null);
    }, []);

    return {
        game,
        text,
        setText,
        loading,
        error,
        isHistoryOpen,
        setIsHistoryOpen,
        submitRound,
        nextTurn,
        resetGame,
        completeRoundCutin,
        completeTurnCutin,
        completeBattleCutin,
        selectRoute,
    };
}
