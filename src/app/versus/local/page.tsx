"use client";

import Link from "next/link";
import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState, Round } from "@/types/game";
import { PROMPTS } from "@/lib/prompts";
import { DetailedMountain } from "@/components/DetailedMountain";
import { pickN } from "@/lib/random";
import { createRounds } from "@/lib/game";
import { cn } from "@/lib/utils";
import { updateStats } from "@/lib/achievementStore";
import { ROUTES, getRoute, type RouteId } from "@/lib/solo/routes";
import { computeFinalAltitude } from "@/lib/solo/score";
import { RotateCcw, TrendingUp, AlertTriangle, Mountain } from "lucide-react";
import { RoundCutin } from "@/components/RoundCutin";
import { TurnCutin } from "@/components/TurnCutin";
import { BattleCutin } from "@/components/BattleCutin";

// ルート選択カードコンポーネント（メモ化して再レンダリングを防ぐ）
const RouteCard = memo(({ routeId, isSelected, onSelect }: { 
    routeId: RouteId; 
    isSelected: boolean; 
    onSelect: (routeId: RouteId) => void;
}) => {
    const route = getRoute(routeId);
    const colorClass = routeId === "SAFE" ? "text-blue-500" : routeId === "RISKY" ? "text-red-500" : "text-amber-600";

    return (
        <button
            onClick={() => onSelect(routeId)}
            className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                isSelected
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md transform scale-[1.02]"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/50"
            )}
        >
            {isSelected && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
            )}

            <div className="text-3xl mb-2">{route.emoji}</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{route.label}</div>
            <div className={cn("text-xs font-bold mt-1", colorClass)}>
                x{route.multiplier}
            </div>
        </button>
    );
});

RouteCard.displayName = 'RouteCard';

type VersusState = GameState & {
    currentPlayerIndex: 0 | 1; // 0: Player 1, 1: Player 2
    phase: "input" | "result" | "finished" | "round_start" | "turn_change" | "both_results" | "battle_cutin";
    lastResult: Round | undefined; // 直近の判定結果表示用
    roundWinner?: 0 | 1 | null; // 0: P1, 1: P2, null: 引き分け
    selectedRoute: RouteId; // 現在のプレイヤーが選択したルート
};

export default function VersusLocalPage() {
    const ROUND_COUNT = 3;

    const [game, setGame] = useState<VersusState | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // 初期化
    useEffect(() => {
        const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
        const roundsP1 = createRounds(selectedPrompts, ROUND_COUNT);
        const roundsP2 = createRounds(selectedPrompts, ROUND_COUNT);

        setGame({
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
        });
    }, []);

    if (!game) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Mount...</div>;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const currentRound = currentPlayer.rounds[game.roundIndex];
    const isP1 = game.currentPlayerIndex === 0;
    const isFinished = game.status === "finished";

    // --- Actions ---

    async function submitRound() {
        if (!text.trim() || loading || isFinished) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text.trim(),
                    route: game!.selectedRoute // 選択されたルートを使用
                }),
            });

            if (!res.ok) throw new Error("API Error");
            const result = await res.json();

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
                    // 対戦モードでは現状天気・保険なし（必要なら追加）
                });

                round.inputText = text.trim();
                round.result = {
                    ...result,
                    routeId: next.selectedRoute,
                    routeMultiplier: route.multiplier,
                    finalAltitude: scoreResult.finalAltitude,
                    didFall: scoreResult.didFall,
                    fallReason: scoreResult.fallReason,
                };

                player.totalScore += scoreResult.finalAltitude;

                // 称号更新
                updateStats({
                    highestAltitude: scoreResult.finalAltitude,
                    snowCount: scoreResult.finalAltitude >= 6000 ? 1 : 0,
                    everestCount: scoreResult.finalAltitude >= 8000 ? 1 : 0,
                });

                // P1終了時は交代へ、P2終了時は両結果表示へ
                if (next.currentPlayerIndex === 0) {
                    next.currentPlayerIndex = 1; // Player2に切り替え
                    next.selectedRoute = "NORMAL"; // P2のデフォルトルート
                    next.phase = "turn_change"; // Player2のTurnCutinを表示
                } else {
                    // P2終了時にラウンド勝者判定
                    const p1Res = next.players[0].rounds[next.roundIndex].result;
                    const p2Res = next.players[1].rounds[next.roundIndex].result;
                    const p1Alt = p1Res?.finalAltitude ?? 0;
                    const p2Alt = p2Res?.finalAltitude ?? 0;

                    if (p1Alt > p2Alt) next.roundWinner = 0;
                    else if (p2Alt > p1Alt) next.roundWinner = 1;
                    else next.roundWinner = null;

                    next.phase = "battle_cutin"; // BattleCutinを表示
                }

                return next;
            });
            setText("");
        } catch {
            setError("判定に失敗しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    }

    function nextTurn() {
        setGame((prev) => {
            if (!prev) return null;
            const next = structuredClone(prev);

            // both_results から次のラウンドまたは終了へ
            // ボーナス加算
            if (next.roundWinner === 0) next.players[0].totalScore += 1000;
            else if (next.roundWinner === 1) next.players[1].totalScore += 1000;

            if (next.roundIndex + 1 >= ROUND_COUNT) {
                next.status = "finished";
                next.phase = "finished";
                // 終了時称号
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
    }

    function resetGame() {
        const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
        const roundsP1 = createRounds(selectedPrompts, ROUND_COUNT);
        const roundsP2 = createRounds(selectedPrompts, ROUND_COUNT);

        setGame({
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
        });
        setText("");
        setIsHistoryOpen(false);
    }

    // Cut-in Handlers
    function handleRoundCutinComplete() {
        setGame((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                phase: "turn_change" // Round Start -> P1 Turn Cutin
            };
        });
    }

    function handleTurnCutinComplete() {
        setGame((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                phase: "input" // TurnCutin完了 -> 入力画面へ
            };
        });
    }

    function handleBattleCutinComplete() {
        setGame((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                phase: "both_results" // BattleCutin完了 -> 両結果表示
            };
        });
    }

    // ルート選択ハンドラ
    const handleRouteSelect = (routeId: RouteId) => {
        setGame(prev => prev ? { ...prev, selectedRoute: routeId } : null);
    };

    return (
        <main className="min-h-screen relative overflow-x-hidden text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* --- 背景レイヤー (Soloモードから移植・簡略化) --- */}
            <div className="fixed inset-0 bg-gradient-to-b from-sky-300 via-blue-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black transition-colors duration-1000 -z-30" />

            {/* 遠景の山 */}
            <div className="fixed bottom-0 left-0 right-0 -z-20 pointer-events-none opacity-40">
                <svg viewBox="0 0 1200 400" className="w-full h-auto text-slate-400 dark:text-slate-800 fill-current">
                    <path d="M0,400 L0,200 L200,100 L400,180 L600,80 L800,160 L1000,120 L1200,200 L1200,400 Z" />
                </svg>
            </div>

            {/* 中景の山 */}
            <div className="fixed bottom-0 left-0 right-0 -z-10 pointer-events-none opacity-60">
                <svg viewBox="0 0 1200 300" className="w-full h-auto text-slate-300 dark:text-slate-700 fill-current">
                    <path d="M0,300 L150,150 L300,220 L450,100 L600,180 L750,120 L900,200 L1050,140 L1200,250 L1200,300 Z" />
                </svg>
            </div>

            {/* コンテンツコンテナ */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-24 min-h-screen flex flex-col">

                {/* --- HUD / Header --- */}
                {!isFinished && (
                    <header className="mb-6">
                        <div className="flex items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
                            {/* Player 1 Badge */}
                            <div className={cn(
                                "flex flex-col items-center p-3 rounded-xl transition-all duration-300 w-28",
                                isP1 ? "bg-red-500 text-white shadow-red-200 dark:shadow-red-900/30 shadow-lg scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-500 scale-95 opacity-70"
                            )}>
                                <span className="text-xs font-bold uppercase tracking-wider">Player 1</span>
                                <span className="text-xl font-black">{game.players[0].totalScore.toLocaleString()}m</span>
                            </div>

                            {/* Round Info */}
                            <div className="flex flex-col items-center">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Round</div>
                                <div className="text-2xl font-black text-slate-700 dark:text-slate-200">
                                    {game.roundIndex + 1} <span className="text-slate-400 text-lg">/ {ROUND_COUNT}</span>
                                </div>
                            </div>

                            {/* Player 2 Badge */}
                            <div className={cn(
                                "flex flex-col items-center p-3 rounded-xl transition-all duration-300 w-28",
                                !isP1 ? "bg-blue-500 text-white shadow-blue-200 dark:shadow-blue-900/30 shadow-lg scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-500 scale-95 opacity-70"
                            )}>
                                <span className="text-xs font-bold uppercase tracking-wider">Player 2</span>
                                <span className="text-xl font-black">{game.players[1].totalScore.toLocaleString()}m</span>
                            </div>
                        </div>
                    </header>
                )}

                {/* Cut-in Overlays (Full Screen) */}
                <AnimatePresence>
                    {game.phase === "round_start" && (
                        <RoundCutin
                            key="round-cutin"
                            roundNumber={game.roundIndex + 1}
                            onComplete={handleRoundCutinComplete}
                        />
                    )}
                    {game.phase === "turn_change" && (
                        <TurnCutin
                            key="turn-cutin"
                            playerIndex={game.currentPlayerIndex}
                            playerName={game.players[game.currentPlayerIndex].name}
                            onComplete={handleTurnCutinComplete}
                        />
                    )}
                    {game.phase === "battle_cutin" && (
                        <BattleCutin
                            key="battle-cutin"
                            onComplete={handleBattleCutinComplete}
                        />
                    )}
                </AnimatePresence>

                {/* --- Main Game Card --- */}
                {(game.phase === "input" || game.phase === "result" || game.phase === "both_results" || game.phase === "finished") && (
                    <motion.div
                        layout
                        className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-800 p-6 md:p-8 relative overflow-hidden flex flex-col"
                    >
                        {/* Corner Decorations */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Mountain className="w-24 h-24 text-slate-500" />
                        </div>

                        {isFinished ? (
                            // --- FINISHED SCREEN ---
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-2">GAME SET!</h2>
                                    <p className="text-slate-500 dark:text-slate-400">最終結果発表</p>
                                </div>

                                <div className="flex items-end justify-center gap-8 w-full">
                                    {/* P1 Result */}
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-red-500 mb-2">Player 1</div>
                                        <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                            {game.players[0].totalScore.toLocaleString()}m
                                        </div>
                                    </div>
                                    <div className="text-2xl text-slate-300 dark:text-slate-600 font-light pb-2">vs</div>
                                    {/* P2 Result */}
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-blue-500 mb-2">Player 2</div>
                                        <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                            {game.players[1].totalScore.toLocaleString()}m
                                        </div>
                                    </div>
                                </div>

                                <div className="py-6">
                                    {game.players[0].totalScore > game.players[1].totalScore ? (
                                        <div className="flex flex-col items-center animate-bounce">
                                            <span className="text-6xl">🏆</span>
                                            <span className="text-2xl font-black text-red-500 mt-2">Player 1 WINS!</span>
                                        </div>
                                    ) : game.players[1].totalScore > game.players[0].totalScore ? (
                                        <div className="flex flex-col items-center animate-bounce">
                                            <span className="text-6xl">🏆</span>
                                            <span className="text-2xl font-black text-blue-500 mt-2">Player 2 WINS!</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span className="text-6xl">🤝</span>
                                            <span className="text-2xl font-black text-slate-500 mt-2">DRAW</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col w-full gap-3 max-w-sm">
                                    <button onClick={resetGame} className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                                        <RotateCcw className="w-5 h-5" />
                                        再戦する
                                    </button>
                                    <Link href="/" className="w-full py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold transition-colors text-center">
                                        タイトルに戻る
                                    </Link>
                                </div>
                            </div>

                        ) : game.phase === "both_results" ? (
                            // --- BOTH RESULTS PHASE ---
                            <div className="flex flex-col h-full animate-in zoom-in duration-300">
                                <div className="flex-1 space-y-6">
                                    {/* Round Title */}
                                    <div className="text-center mb-4">
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">ROUND {game.roundIndex + 1} 結果</h2>
                                        <div className="text-sm text-slate-500">Q. {game.prompts[game.roundIndex]}</div>
                                    </div>

                                    {/* Both Players Results - Side by Side */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Player 1 Result */}
                                        {(() => {
                                            const p1Round = game.players[0].rounds[game.roundIndex];
                                            const p1Result = p1Round.result;
                                            return (
                                                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 space-y-3">
                                                    <div className="text-center">
                                                        <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Player 1</div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-xs font-bold mb-3">
                                                            <span>{getRoute(p1Result?.routeId || "NORMAL").emoji}</span>
                                                            <span>{getRoute(p1Result?.routeId || "NORMAL").label}</span>
                                                        </div>
                                                        
                                                        {/* 山の描画 */}
                                                        <div className="flex justify-center my-4 -mx-2">
                                                            <DetailedMountain
                                                                altitude={p1Result?.altitude || 0}
                                                                size={280}
                                                                color="red"
                                                                isWinner={game.roundWinner === 0}
                                                                animate={true}
                                                            />
                                                        </div>
                                                        
                                                        <div className="text-4xl font-black text-red-600 dark:text-red-400 mt-2">
                                                            {p1Result?.altitude}
                                                            <span className="text-lg text-slate-500 ml-1">m</span>
                                                        </div>
                                                        {p1Result?.didFall && (
                                                            <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold mt-2">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                <span>滑落！</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 justify-center">
                                                        {p1Result?.labels.map((label, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white/80 dark:bg-slate-800/80 text-red-600 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-700">
                                                                {label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded">
                                                        {p1Round.inputText}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Player 2 Result */}
                                        {(() => {
                                            const p2Round = game.players[1].rounds[game.roundIndex];
                                            const p2Result = p2Round.result;
                                            return (
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-3">
                                                    <div className="text-center">
                                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Player 2</div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-xs font-bold mb-3">
                                                            <span>{getRoute(p2Result?.routeId || "NORMAL").emoji}</span>
                                                            <span>{getRoute(p2Result?.routeId || "NORMAL").label}</span>
                                                        </div>
                                                        
                                                        {/* 山の描画 */}
                                                        <div className="flex justify-center my-4 -mx-2">
                                                            <DetailedMountain
                                                                altitude={p2Result?.altitude || 0}
                                                                size={280}
                                                                color="blue"
                                                                isWinner={game.roundWinner === 1}
                                                                animate={true}
                                                            />
                                                        </div>
                                                        
                                                        <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                                            {p2Result?.altitude}
                                                            <span className="text-lg text-slate-500 ml-1">m</span>
                                                        </div>
                                                        {p2Result?.didFall && (
                                                            <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold mt-2">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                <span>滑落！</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 justify-center">
                                                        {p2Result?.labels.map((label, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white/80 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-700">
                                                                {label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded">
                                                        {p2Round.inputText}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Round Winner Banner */}
                                    <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 rounded-2xl shadow-lg">
                                        <div className="text-center">
                                            {game.roundWinner == null ? (
                                                <>
                                                    <div className="text-3xl mb-2">🤝</div>
                                                    <div className="font-bold text-2xl">DRAW</div>
                                                    <div className="text-sm opacity-80 mt-1">このラウンドは引き分け！</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-3xl mb-2">🏆</div>
                                                    <div className="text-sm opacity-80 mb-1">Round {game.roundIndex + 1} Winner</div>
                                                    <div className="text-3xl font-black">
                                                        Player {game.roundWinner + 1}
                                                    </div>
                                                    <div className="text-sm font-bold mt-2 bg-white/20 inline-block px-3 py-1 rounded-full">
                                                        +1000m Bonus
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Next Action Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={nextTurn}
                                        className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <span>
                                            {game.roundIndex + 1 >= ROUND_COUNT ? "最終結果を見る" : "次のラウンドへ"}
                                        </span>
                                        <TrendingUp className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : game.phase === "input" ? (
                            // --- INPUT PHASE ---
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                {/* Prompt Section */}
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", isP1 ? "bg-red-500" : "bg-blue-500")} />
                                        <span>ROUND {game.roundIndex + 1} / {ROUND_COUNT}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                        Q. <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">{currentRound.prompt}</span>
                                    </h2>
                                </div>

                                {/* Divider with Player Label */}
                                <div className="relative h-px bg-slate-200 dark:bg-slate-700 my-4">
                                    <span className={cn(
                                        "absolute left-0 -top-3 px-3 py-1 text-xs font-bold text-white rounded-full",
                                        isP1 ? "bg-red-500" : "bg-blue-500"
                                    )}>
                                        {currentPlayer.name}&apos;s Turn
                                    </span>
                                </div>

                                {/* Route Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Select Route</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {ROUTES.map(route => (
                                            <RouteCard 
                                                key={route.id} 
                                                routeId={route.id} 
                                                isSelected={game.selectedRoute === route.id}
                                                onSelect={handleRouteSelect}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Text Input */}
                                <div>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder={`${currentPlayer.name} のマウント発言を入力...`}
                                        className="w-full min-h-[160px] p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-y"
                                    />
                                    {error && (
                                        <div className="mt-2 text-red-500 text-sm font-bold flex items-center gap-2 animate-pulse">
                                            <AlertTriangle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={submitRound}
                                    disabled={!text.trim() || loading}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2",
                                        !text.trim() || loading
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : isP1
                                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-500/25"
                                                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-blue-500/25"
                                    )}
                                >
                                    {loading ? (
                                        <span className="inline-block animate-spin">⏳</span>
                                    ) : (
                                        <>
                                            <span>マウントを取る!</span>
                                            <Mountain className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                )}

                {/* --- History Toggle (Footer) --- */}
                {!isFinished && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-bold text-sm bg-white/50 dark:bg-slate-800/50 px-6 py-2 rounded-full backdrop-blur-sm"
                        >
                            <span>📜 対戦履歴 {isHistoryOpen ? "を閉じる" : "を見る"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* --- History Sheet (Overlay) --- */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
                        onClick={() => setIsHistoryOpen(false)}
                    >
                        <div
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">対戦履歴</h3>
                                <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-4">
                                {Array.from({ length: Math.max(game.players[0].rounds.length, game.players[1].rounds.length) }).map((_, i) => {
                                    const r1 = game.players[0].rounds[i];
                                    const r2 = game.players[1].rounds[i];
                                    if (!r1 && !r2) return null;

                                    return (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs font-bold text-center text-slate-400 mb-3">ROUND {i + 1}</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* P1 */}
                                                <div className={cn("p-3 rounded-lg text-sm border", r1?.result ? "bg-white dark:bg-slate-800 border-red-100 dark:border-red-900/30" : "opacity-30")}>
                                                    <div className="text-red-500 font-bold text-xs mb-1">Player 1</div>
                                                    {r1?.result ? (
                                                        <>
                                                            <div className="font-black text-lg">{r1.result.altitude}m</div>
                                                            <div className="text-slate-500 text-xs line-clamp-2 mt-1">{r1.inputText}</div>
                                                        </>
                                                    ) : <span>-</span>}
                                                </div>
                                                {/* P2 */}
                                                <div className={cn("p-3 rounded-lg text-sm border", r2?.result ? "bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30" : "opacity-30")}>
                                                    <div className="text-blue-500 font-bold text-xs mb-1">Player 2</div>
                                                    {r2?.result ? (
                                                        <>
                                                            <div className="font-black text-lg">{r2.result.altitude}m</div>
                                                            <div className="text-slate-500 text-xs line-clamp-2 mt-1">{r2.inputText}</div>
                                                        </>
                                                    ) : <span>-</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
