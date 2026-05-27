"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/solo/routes";
import { AlertTriangle, Mountain } from "lucide-react";
import { useVersusLocalGame, VERSUS_ROUND_COUNT } from "@/hooks/useVersusLocalGame";
import { RouteCard } from "@/components/versus/RouteCard";
import { VersusBackground } from "@/components/versus/VersusBackground";
import { VersusCutins } from "@/components/versus/VersusCutins";
import { VersusFinalResults } from "@/components/versus/VersusFinalResults";
import { VersusHud } from "@/components/versus/VersusHud";
import { VersusRoundResults } from "@/components/versus/VersusRoundResults";

export default function VersusLocalPage() {
    const {
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
    } = useVersusLocalGame();

    if (!game) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Mount...</div>;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const currentRound = currentPlayer.rounds[game.roundIndex];
    const isP1 = game.currentPlayerIndex === 0;
    const isFinished = game.status === "finished";

    return (
        <main className="min-h-screen relative overflow-x-hidden text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-100 selection:text-blue-900">
            <VersusBackground />

            {/* コンテンツコンテナ */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-24 min-h-screen flex flex-col">

                {/* --- HUD / Header --- */}
                {!isFinished && (
                    <VersusHud game={game} roundCount={VERSUS_ROUND_COUNT} />
                )}

                {/* Cut-in Overlays (Full Screen) */}
                <VersusCutins
                    game={game}
                    onRoundComplete={completeRoundCutin}
                    onTurnComplete={completeTurnCutin}
                    onBattleComplete={completeBattleCutin}
                />

                {/* --- Main Game Card --- */}
                {(game.phase === "input" || game.phase === "result" || game.phase === "both_results" || game.phase === "finished") && (
                    <motion.div
                        layout
                        className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/45 bg-white/82 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 md:p-8"
                    >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                        <div className="pointer-events-none absolute -left-32 top-0 h-full w-44 rotate-12 bg-white/10 blur-2xl" />
                        {/* Corner Decorations */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Mountain className="w-24 h-24 text-slate-500" />
                        </div>

                        {isFinished ? (
                            <VersusFinalResults game={game} onReset={resetGame} />
                        ) : game.phase === "both_results" ? (
                            <VersusRoundResults
                                game={game}
                                roundCount={VERSUS_ROUND_COUNT}
                                onNext={nextTurn}
                            />
                        ) : game.phase === "input" ? (
                            // --- INPUT PHASE ---
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                {/* Prompt Section */}
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", isP1 ? "bg-red-500" : "bg-blue-500")} />
                                        <span>ROUND {game.roundIndex + 1} / {VERSUS_ROUND_COUNT}</span>
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
                                                onSelect={selectRoute}
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

                                    // 勝者判定
                                    const p1Alt = r1?.result?.altitude || 0;
                                    const p2Alt = r2?.result?.altitude || 0;
                                    const p1Wins = p1Alt > p2Alt;
                                    const p2Wins = p2Alt > p1Alt;
                                    const isDraw = p1Alt === p2Alt;

                                    return (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs font-bold text-center text-slate-400 mb-3">ROUND {i + 1}</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* P1 */}
                                                <div className={cn("p-3 rounded-lg text-sm border", r1?.result ? "bg-white dark:bg-slate-800 border-red-100 dark:border-red-900/30" : "opacity-30")}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-red-500 font-bold text-xs">Player 1</div>
                                                        {r1?.result && r2?.result && (
                                                            <>
                                                                {p1Wins && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-white text-[10px] font-black rounded">
                                                                        WIN
                                                                    </span>
                                                                )}
                                                                {p2Wins && (
                                                                    <span className="px-2 py-0.5 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded">
                                                                        LOSE
                                                                    </span>
                                                                )}
                                                                {isDraw && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-[10px] font-bold rounded">
                                                                        DRAW
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    {r1?.result ? (
                                                        <>
                                                            <div className="font-black text-lg">{r1.result.altitude}m</div>
                                                            <div className="text-slate-500 text-xs line-clamp-2 mt-1">{r1.inputText}</div>
                                                        </>
                                                    ) : <span>-</span>}
                                                </div>
                                                {/* P2 */}
                                                <div className={cn("p-3 rounded-lg text-sm border", r2?.result ? "bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30" : "opacity-30")}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-blue-500 font-bold text-xs">Player 2</div>
                                                        {r1?.result && r2?.result && (
                                                            <>
                                                                {p2Wins && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-white text-[10px] font-black rounded">
                                                                        WIN
                                                                    </span>
                                                                )}
                                                                {p1Wins && (
                                                                    <span className="px-2 py-0.5 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded">
                                                                        LOSE
                                                                    </span>
                                                                )}
                                                                {isDraw && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-[10px] font-bold rounded">
                                                                        DRAW
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
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
