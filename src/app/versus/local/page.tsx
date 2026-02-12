"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { GameState, Round } from "@/types/game";
import { PROMPTS } from "@/lib/prompts";
import { MountainView } from "@/components/MountainView";
import { pickN } from "@/lib/random";
import { createRounds } from "@/lib/game";
import clsx from "clsx";


type VersusState = GameState & {
    currentPlayerIndex: 0 | 1; // 0: Player 1, 1: Player 2
    phase: "input" | "result" | "finished";
    lastResult: Round | undefined; // 直近の判定結果表示用
};

export default function VersusLocalPage() {
    const ROUND_COUNT = 3;

    const [game, setGame] = useState<VersusState | null>(null);

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
            phase: "input",
            players: [
                { id: "p1", name: "Player 1", totalScore: 0, rounds: roundsP1 },
                { id: "p2", name: "Player 2", totalScore: 0, rounds: roundsP2 },
            ],
            lastResult: undefined,
        });
    }, []);


    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    if (!game) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // 現在のプレイヤーとラウンド
    const currentPlayer = game.players[game.currentPlayerIndex];
    const currentRound = currentPlayer.rounds[game.roundIndex];
    const opponent = game.players[game.currentPlayerIndex === 0 ? 1 : 0];

    const isFinished = game.status === "finished";

    async function submitRound() {
        if (!text.trim() || loading || isFinished) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.trim() }),
            });

            if (!res.ok) throw new Error("API Error");
            const result = await res.json();

            setGame((prev) => {
                if (!prev) return null;
                const next = structuredClone(prev);
                const player = next.players[next.currentPlayerIndex];
                const round = player.rounds[next.roundIndex];

                // 結果保存
                round.inputText = text.trim();
                round.result = result;
                player.totalScore += result.altitude;

                // 結果表示フェーズへ
                next.lastResult = structuredClone(round);
                next.phase = "result";

                return next;
            });
            setText("");
        } catch (e) {
            setError("判定に失敗しました");
        } finally {
            setLoading(false);
        }
    }

    function nextTurn() {
        setGame((prev) => {
            if (!prev) return null;
            const next = structuredClone(prev);

            // 次のプレイヤーへ
            if (next.currentPlayerIndex === 0) {
                // P1終了 -> P2へ (同じラウンド)
                next.currentPlayerIndex = 1;
                next.phase = "input";
                next.lastResult = undefined;
            } else {
                // P2終了 -> 次のラウンドへ OR 終了
                if (next.roundIndex + 1 >= ROUND_COUNT) {
                    next.status = "finished";
                    next.phase = "finished";
                } else {
                    next.roundIndex += 1;
                    next.currentPlayerIndex = 0; // P1に戻る
                    next.phase = "input";
                    next.lastResult = undefined;
                }
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
            phase: "input",
            players: [
                { id: "p1", name: "Player 1", totalScore: 0, rounds: roundsP1 },
                { id: "p2", name: "Player 2", totalScore: 0, rounds: roundsP2 },
            ],
            lastResult: undefined,
        });
        setText("");
    }


    return (
        <main className="min-h-screen p-4 max-w-xl mx-auto space-y-6">
            <header className="text-center space-y-2">
                <h1 className="text-xl font-bold">🔥 ローカル対戦モード</h1>
                {!isFinished && (
                    <div className="flex justify-between items-center bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg">
                        <div className={clsx("p-2 rounded w-1/3 text-center transition-all", game.currentPlayerIndex === 0 && "bg-red-500 text-white font-bold")}>
                            <div>P1</div>
                            <div className="text-sm">{game.players[0].totalScore}m</div>
                        </div>
                        <div className="font-bold text-gray-400">
                            Round {game.roundIndex + 1}/{ROUND_COUNT}
                        </div>
                        <div className={clsx("p-2 rounded w-1/3 text-center transition-all", game.currentPlayerIndex === 1 && "bg-blue-500 text-white font-bold")}>
                            <div>P2</div>
                            <div className="text-sm">{game.players[1].totalScore}m</div>
                        </div>
                    </div>
                )}
            </header>

            {/* 結果発表 */}
            {isFinished && (
                <section className="bg-white dark:bg-zinc-900 p-8 rounded-xl border shadow-lg text-center space-y-6 animate-in zoom-in duration-300">
                    <h2 className="text-3xl font-black">WINNER</h2>

                    <div className="text-6xl my-4">
                        {game.players[0].totalScore > game.players[1].totalScore ? "🏆 Player 1" :
                            game.players[1].totalScore > game.players[0].totalScore ? "🏆 Player 2" : "🤝 DRAW"}
                    </div>

                    <div className="flex justify-center gap-8 text-xl">
                        <div>
                            <div className="text-sm text-gray-500">Player 1</div>
                            <div className="font-bold">{game.players[0].totalScore}m</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Player 2</div>
                            <div className="font-bold">{game.players[1].totalScore}m</div>
                        </div>
                    </div>

                    <button onClick={resetGame} className="w-full py-3 bg-black text-white rounded-lg font-bold">
                        再戦する (Rematch)
                    </button>
                    <Link
                        href="/"
                        className="block w-full py-3 text-center rounded-lg border hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        タイトルに戻る
                    </Link>
                </section>
            )}

            {/* プレイエリア */}
            {!isFinished && game.phase === "input" && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={clsx("text-center py-2 text-white font-bold rounded", game.currentPlayerIndex === 0 ? "bg-red-500" : "bg-blue-500")}>
                        {currentPlayer.name} のターン
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 space-y-2">
                        <div className="text-xs text-gray-500 uppercase font-bold">Theme</div>
                        <div className="text-lg font-bold">{currentRound.prompt}</div>
                    </div>

                    <textarea
                        className="w-full min-h-32 rounded-lg border p-4 text-lg focus:ring-2 outline-none"
                        placeholder={`${currentPlayer.name} のマウントを入力...`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

                    <button
                        className={clsx("w-full py-4 rounded-lg text-white font-bold text-lg transition-all",
                            game.currentPlayerIndex === 0 ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
                            (!text.trim() || loading) && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!text.trim() || loading}
                        onClick={submitRound}
                    >
                        {loading ? "判定中..." : "マウント！"}
                    </button>
                </section>
            )}

            {/* 判定結果表示フェーズ（ターン交代前） */}
            {!isFinished && game.phase === "result" && game.lastResult && game.lastResult.result && (
                <section className="bg-stone-50 dark:bg-zinc-900 border-2 border-stone-200 p-6 rounded-xl text-center space-y-6 animate-in zoom-in duration-300">
                    <h3 className="text-stone-500 font-bold uppercase tracking-widest">Judgment</h3>

                    <div className="flex justify-center">
                        <MountainView altitude={game.lastResult.result.altitude} size={200} />
                    </div>

                    <div>
                        <div className="text-5xl font-black">{game.lastResult.result.altitude}m</div>
                        <div className="flex justify-center gap-2 mt-2">
                            {game.lastResult.result.labels.map(l => (
                                <span key={l} className="bg-stone-200 text-stone-700 px-2 py-1 rounded text-xs font-bold">{l}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-black p-3 rounded text-left text-sm border">
                        <div className="text-xs text-gray-400 font-bold mb-1">言い換え</div>
                        {game.lastResult.result.rewrite}
                    </div>

                    <button
                        onClick={nextTurn}
                        className="w-full py-3 bg-black text-white rounded-lg font-bold animate-pulse"
                    >
                        次は {game.currentPlayerIndex === 0 ? "Player 2" : "次のラウンド"} へ
                    </button>
                </section>
            )}

            {/* 履歴 (History) */}
            <section className="space-y-4 pt-4 border-t">
                <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-800 transition-colors px-2"
                >
                    <span>📜 対戦履歴</span>
                    <span>{isHistoryOpen ? "閉じる ▲" : "開く ▼"}</span>
                </button>

                {isHistoryOpen && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                        {Array.from({ length: Math.max(game.players[0].rounds.length, game.players[1].rounds.length) }).map((_, i) => {
                            const r1 = game.players[0].rounds[i];
                            const r2 = game.players[1].rounds[i];
                            if (!r1 && !r2) return null;

                            return (
                                <div key={i} className="space-y-2">
                                    <div className="text-xs font-bold text-center text-gray-400">Round {i + 1}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* P1 History */}
                                        <div className={clsx("p-2 rounded text-xs border", r1?.result ? "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900" : "bg-gray-50 border-gray-100 opacity-50")}>
                                            <div className="font-bold text-red-600 mb-1">Player 1</div>
                                            {r1?.result ? (
                                                <>
                                                    <div className="font-bold text-lg">{r1.result.altitude}m</div>
                                                    <div className="text-gray-600 dark:text-gray-400 line-clamp-2">{r1.inputText}</div>
                                                </>
                                            ) : (
                                                <div className="text-gray-400">-</div>
                                            )}
                                        </div>
                                        {/* P2 History */}
                                        <div className={clsx("p-2 rounded text-xs border", r2?.result ? "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900" : "bg-gray-50 border-gray-100 opacity-50")}>
                                            <div className="font-bold text-blue-600 mb-1">Player 2</div>
                                            {r2?.result ? (
                                                <>
                                                    <div className="font-bold text-lg">{r2.result.altitude}m</div>
                                                    <div className="text-gray-600 dark:text-gray-400 line-clamp-2">{r2.inputText}</div>
                                                </>
                                            ) : (
                                                <div className="text-gray-400">-</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
