"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VersusState } from "@/hooks/useVersusLocalGame";

type VersusFinalResultsProps = {
    game: VersusState;
    onReset: () => void;
};

export function VersusFinalResults({ game, onReset }: VersusFinalResultsProps) {
    const p1Score = game.players[0].totalScore;
    const p2Score = game.players[1].totalScore;
    const p1Wins = p1Score > p2Score;
    const p2Wins = p2Score > p1Score;

    return (
        <div className="flex flex-col items-center justify-center min-h-full py-8 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                >
                    <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">
                        GAME SET!
                    </h2>
                </motion.div>
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium">最終結果発表</p>
            </div>

            <div className="w-full max-w-2xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-purple-100 to-blue-100 dark:from-red-950/20 dark:via-purple-950/20 dark:to-blue-950/20 rounded-3xl blur-2xl opacity-50" />

                    <div className="relative grid grid-cols-2 gap-4 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
                        <FinalPlayerScore playerName="Player 1" score={p1Score} color="red" isWinner={p1Wins} />
                        <FinalPlayerScore playerName="Player 2" score={p2Score} color="blue" isWinner={p2Wins} />

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl border-4 border-white dark:border-slate-900">
                            VS
                        </div>
                    </div>
                </div>
            </div>

            <WinnerAnnouncement p1Wins={p1Wins} p2Wins={p2Wins} />

            <div className="w-full max-w-lg">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg">
                    <h3 className="text-lg font-black text-slate-700 dark:text-slate-300 mb-4 text-center flex items-center justify-center gap-2">
                        <span>📊</span>
                        <span>全ラウンド結果</span>
                    </h3>
                    <div className="space-y-2.5">
                        {game.players[0].rounds.map((r1, idx) => {
                            const r2 = game.players[1].rounds[idx];
                            const p1Alt = r1?.result?.altitude || 0;
                            const p2Alt = r2?.result?.altitude || 0;
                            const p1RoundWins = p1Alt > p2Alt;
                            const p2RoundWins = p2Alt > p1Alt;
                            const isDraw = p1Alt === p2Alt;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-center gap-2 mb-2.5">
                                        <div className="px-3 py-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-xs font-black rounded-full">
                                            ROUND {idx + 1}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <RoundSummaryScore player="P1" altitude={p1Alt} color="red" isWinner={p1RoundWins} didLose={p2RoundWins} isDraw={isDraw} />
                                        <RoundSummaryScore player="P2" altitude={p2Alt} color="blue" isWinner={p2RoundWins} didLose={p1RoundWins} isDraw={isDraw} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full gap-3 max-w-md">
                <button
                    onClick={onReset}
                    className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-700"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>再戦する</span>
                </button>
                <Link
                    href="/"
                    className="w-full py-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all text-center border-2 border-slate-200 dark:border-slate-700 shadow-md"
                >
                    タイトルに戻る
                </Link>
            </div>
        </div>
    );
}

type PlayerColor = "red" | "blue";

function FinalPlayerScore({
    playerName,
    score,
    color,
    isWinner,
}: {
    playerName: string;
    score: number;
    color: PlayerColor;
    isWinner: boolean;
}) {
    const styles = color === "red"
        ? {
            winner: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-red-400 dark:border-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/50 scale-[1.05]",
            normal: "bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200 dark:border-red-800/50",
            text: "text-red-600 dark:text-red-400",
        }
        : {
            winner: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-400 dark:border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 scale-[1.05]",
            normal: "bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800/50",
            text: "text-blue-600 dark:text-blue-400",
        };

    return (
        <div className={cn("p-6 rounded-2xl border-4 transition-all duration-500", isWinner ? styles.winner : styles.normal)}>
            <div className="space-y-2">
                <div className={cn("text-xs font-bold uppercase tracking-wider", styles.text)}>{playerName}</div>
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl md:text-5xl font-black", styles.text)}>
                        {score.toLocaleString()}
                    </span>
                    <span className="text-xl text-slate-500 dark:text-slate-400">m</span>
                </div>
                {isWinner && (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 animate-pulse">
                        <span className="text-2xl">👑</span>
                        <span className="text-xs font-bold">WINNER</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function WinnerAnnouncement({ p1Wins, p2Wins }: { p1Wins: boolean; p2Wins: boolean }) {
    if (p1Wins || p2Wins) {
        return (
            <div className="py-4">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-7xl mb-2 animate-bounce">🏆</div>
                    <div className={cn(
                        "text-3xl font-black bg-clip-text text-transparent",
                        p1Wins ? "bg-gradient-to-r from-red-600 to-red-500" : "bg-gradient-to-r from-blue-600 to-blue-500"
                    )}>
                        {p1Wins ? "Player 1 WINS!" : "Player 2 WINS!"}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex flex-col items-center"
            >
                <div className="text-7xl mb-2">🤝</div>
                <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    DRAW!
                </div>
            </motion.div>
        </div>
    );
}

function RoundSummaryScore({
    player,
    altitude,
    color,
    isWinner,
    didLose,
    isDraw,
}: {
    player: string;
    altitude: number;
    color: PlayerColor;
    isWinner: boolean;
    didLose: boolean;
    isDraw: boolean;
}) {
    const styles = color === "red"
        ? {
            winner: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950/50 dark:to-red-900/40 border-red-400 dark:border-red-600 shadow-md",
            normal: "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50",
            text: "text-red-700 dark:text-red-300",
            label: "text-red-600 dark:text-red-400",
        }
        : {
            winner: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/50 dark:to-blue-900/40 border-blue-400 dark:border-blue-600 shadow-md",
            normal: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
            text: "text-blue-700 dark:text-blue-300",
            label: "text-blue-600 dark:text-blue-400",
        };

    return (
        <div className={cn("flex items-center justify-between rounded-xl px-3 py-2.5 border-2 transition-all", isWinner ? styles.winner : styles.normal)}>
            <div>
                <div className={cn("text-[10px] font-bold uppercase", styles.label)}>{player}</div>
                <div className={cn("text-base font-black", styles.text)}>
                    {altitude.toLocaleString()}<span className="text-xs ml-0.5">m</span>
                </div>
            </div>
            {isWinner && <span className="text-xl">🏆</span>}
            {didLose && <span className="text-xs text-slate-400">-</span>}
            {isDraw && <span className="text-base">🤝</span>}
        </div>
    );
}
