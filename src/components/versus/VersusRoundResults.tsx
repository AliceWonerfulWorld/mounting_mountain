"use client";

import { TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoute } from "@/lib/solo/routes";
import { MountainResultScene } from "@/components/MountainResultScene";
import { useTimeOfDayExtended } from "@/hooks/useTimeOfDay";
import type { VersusState } from "@/hooks/useVersusLocalGame";
import type { Round } from "@/types/game";

type VersusRoundResultsProps = {
    game: VersusState;
    roundCount: number;
    onNext: () => void;
};

export function VersusRoundResults({ game, roundCount, onNext }: VersusRoundResultsProps) {
    const { timeOfDay } = useTimeOfDayExtended();
    const p1Round = game.players[0].rounds[game.roundIndex];
    const p2Round = game.players[1].rounds[game.roundIndex];

    return (
        <div className="flex h-full flex-col animate-in zoom-in duration-300">
            <div className="flex-1 space-y-5 sm:space-y-6">
                <div className="mb-4 text-center">
                    <h2 className="mb-1 text-2xl font-black text-slate-800 dark:text-white">ROUND {game.roundIndex + 1} 結果</h2>
                    <div className="text-sm leading-relaxed text-slate-500">Q. {game.prompts[game.roundIndex]}</div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <RoundPlayerResult
                        playerName="Player 1"
                        color="red"
                        round={p1Round}
                        timeOfDay={timeOfDay}
                        resultState={game.roundWinner === 0 ? "win" : game.roundWinner === 1 ? "lose" : "draw"}
                    />
                    <RoundPlayerResult
                        playerName="Player 2"
                        color="blue"
                        round={p2Round}
                        timeOfDay={timeOfDay}
                        resultState={game.roundWinner === 1 ? "win" : game.roundWinner === 0 ? "lose" : "draw"}
                    />
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={onNext}
                    className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <span>
                        {game.roundIndex + 1 >= roundCount ? "最終結果を見る" : "次のラウンドへ"}
                    </span>
                    <TrendingUp className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

type ResultState = "win" | "lose" | "draw";
type ResultColor = "red" | "blue";

function RoundPlayerResult({
    playerName,
    color,
    round,
    timeOfDay,
    resultState,
}: {
    playerName: string;
    color: ResultColor;
    round: Round;
    timeOfDay: ReturnType<typeof useTimeOfDayExtended>["timeOfDay"];
    resultState: ResultState;
}) {
    const result = round.result;
    const route = getRoute(result?.routeId || "NORMAL");
    const colorStyles = color === "red"
        ? {
            panel: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800",
            label: "text-red-600 dark:text-red-400",
            altitude: "text-red-600 dark:text-red-400",
            tag: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-700",
            comment: "from-red-100/80 to-red-50/80 dark:from-red-900/40 dark:to-red-950/40 border-red-400 dark:border-red-500",
        }
        : {
            panel: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800",
            label: "text-blue-600 dark:text-blue-400",
            altitude: "text-blue-600 dark:text-blue-400",
            tag: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700",
            comment: "from-blue-100/80 to-blue-50/80 dark:from-blue-900/40 dark:to-blue-950/40 border-blue-400 dark:border-blue-500",
        };

    return (
        <div className={cn("space-y-3 rounded-2xl border-2 p-3 sm:p-4", colorStyles.panel)}>
            <div className="text-center">
                <ResultBadge state={resultState} />

                <div className={cn("text-xs font-bold uppercase tracking-wider mb-2", colorStyles.label)}>{playerName}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-xs font-bold mb-3">
                    <span>{route.emoji}</span>
                    <span>{route.label}</span>
                </div>

                <div className="my-4">
                    <MountainResultScene
                        altitude={result?.altitude || 0}
                        color={color}
                        mode="versus"
                        timeOfDay={timeOfDay}
                        isWinner={resultState === "win"}
                        didFall={result?.didFall}
                        size="compact"
                    />
                </div>

                <div className={cn("text-4xl font-black mt-2", colorStyles.altitude)}>
                    {result?.altitude}
                    <span className="text-lg text-slate-500 ml-1">m</span>
                </div>
                {result?.didFall && (
                    <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold mt-2">
                        <AlertTriangle className="w-3 h-3" />
                        <span>滑落！</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center">
                {result?.labels.map((label, i) => (
                    <span key={i} className={cn("px-2 py-0.5 bg-white/80 dark:bg-slate-800/80 rounded-full text-xs font-bold border", colorStyles.tag)}>
                        {label}
                    </span>
                ))}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded">
                {round.inputText}
            </div>

            <div className="mt-4 space-y-3">
                <div className="relative">
                    <div className="absolute -left-3 top-0 text-2xl">💬</div>
                    <div className={cn("bg-gradient-to-br border-l-4 rounded-r-lg p-3 pl-8 shadow-sm", colorStyles.comment)}>
                        <div className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", colorStyles.label)}>AI Judge</div>
                        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {result?.commentary || "..."}
                        </div>
                    </div>
                </div>

                {result?.tip && (
                    <div className="relative">
                        <div className="absolute -left-3 top-0 text-xl">💡</div>
                        <div className="bg-gradient-to-br from-amber-100/60 to-yellow-50/60 dark:from-amber-900/30 dark:to-yellow-950/30 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-lg p-3 pl-8 shadow-sm">
                            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Strategy Tip</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {result.tip}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultBadge({ state }: { state: ResultState }) {
    if (state === "win") {
        return (
            <div className="mb-3 inline-block">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 blur-md opacity-50" />
                    <div className="relative px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white font-black text-2xl rounded-full shadow-lg border-2 border-yellow-300">
                        <span className="drop-shadow-md">✨ WIN ✨</span>
                    </div>
                </div>
            </div>
        );
    }

    if (state === "lose") {
        return (
            <div className="mb-3 inline-block">
                <div className="px-4 py-1.5 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-full border border-slate-400 dark:border-slate-600">
                    LOSE
                </div>
            </div>
        );
    }

    return (
        <div className="mb-3 inline-block">
            <div className="px-5 py-2 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold text-lg rounded-full shadow-md border border-purple-300">
                🤝 DRAW
            </div>
        </div>
    );
}
