"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DetailedMountain } from "@/components/DetailedMountain";
import { cn } from "@/lib/utils";
import { ROUTES, getRoute } from "@/lib/solo/routes";
import { RotateCcw, TrendingUp, AlertTriangle, Mountain } from "lucide-react";
import { useVersusLocalGame, VERSUS_ROUND_COUNT } from "@/hooks/useVersusLocalGame";
import { RouteCard } from "@/components/versus/RouteCard";
import { VersusBackground } from "@/components/versus/VersusBackground";
import { VersusCutins } from "@/components/versus/VersusCutins";
import { VersusHud } from "@/components/versus/VersusHud";

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
                        className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-800 p-6 md:p-8 relative overflow-hidden flex flex-col"
                    >
                        {/* Corner Decorations */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Mountain className="w-24 h-24 text-slate-500" />
                        </div>

                        {isFinished ? (
                            // --- FINISHED SCREEN ---
                            <div className="flex flex-col items-center justify-center min-h-full py-8 space-y-6 animate-in fade-in zoom-in duration-500">
                                {/* Title Section */}
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

                                {/* Score Display */}
                                <div className="w-full max-w-2xl">
                                    <div className="relative">
                                        {/* Background decoration */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-purple-100 to-blue-100 dark:from-red-950/20 dark:via-purple-950/20 dark:to-blue-950/20 rounded-3xl blur-2xl opacity-50"></div>
                                        
                                        <div className="relative grid grid-cols-2 gap-4 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
                                            {/* Player 1 */}
                                            <div className={cn(
                                                "p-6 rounded-2xl border-4 transition-all duration-500",
                                                game.players[0].totalScore > game.players[1].totalScore
                                                    ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-red-400 dark:border-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/50 scale-[1.05]"
                                                    : "bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200 dark:border-red-800/50"
                                            )}>
                                                <div className="space-y-2">
                                                    <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Player 1</div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl md:text-5xl font-black text-red-600 dark:text-red-400">
                                                            {game.players[0].totalScore.toLocaleString()}
                                                        </span>
                                                        <span className="text-xl text-slate-500 dark:text-slate-400">m</span>
                                                    </div>
                                                    {game.players[0].totalScore > game.players[1].totalScore && (
                                                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 animate-pulse">
                                                            <span className="text-2xl">👑</span>
                                                            <span className="text-xs font-bold">WINNER</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Player 2 */}
                                            <div className={cn(
                                                "p-6 rounded-2xl border-4 transition-all duration-500",
                                                game.players[1].totalScore > game.players[0].totalScore
                                                    ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-400 dark:border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 scale-[1.05]"
                                                    : "bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800/50"
                                            )}>
                                                <div className="space-y-2">
                                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Player 2</div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl md:text-5xl font-black text-blue-600 dark:text-blue-400">
                                                            {game.players[1].totalScore.toLocaleString()}
                                                        </span>
                                                        <span className="text-xl text-slate-500 dark:text-slate-400">m</span>
                                                    </div>
                                                    {game.players[1].totalScore > game.players[0].totalScore && (
                                                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 animate-pulse">
                                                            <span className="text-2xl">👑</span>
                                                            <span className="text-xs font-bold">WINNER</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* VS Badge in Center */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl border-4 border-white dark:border-slate-900">
                                                VS
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Winner Announcement */}
                                <div className="py-4">
                                    {game.players[0].totalScore > game.players[1].totalScore ? (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="text-7xl mb-2 animate-bounce">🏆</div>
                                            <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                                                Player 1 WINS!
                                            </div>
                                        </motion.div>
                                    ) : game.players[1].totalScore > game.players[0].totalScore ? (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="text-7xl mb-2 animate-bounce">🏆</div>
                                            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                                Player 2 WINS!
                                            </div>
                                        </motion.div>
                                    ) : (
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
                                    )}
                                </div>

                                {/* All Rounds Summary */}
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
                                            const p1Wins = p1Alt > p2Alt;
                                            const p2Wins = p2Alt > p1Alt;
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
                                                        {/* P1 */}
                                                        <div className={cn(
                                                            "flex items-center justify-between rounded-xl px-3 py-2.5 border-2 transition-all",
                                                            p1Wins 
                                                                ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950/50 dark:to-red-900/40 border-red-400 dark:border-red-600 shadow-md" 
                                                                : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                                                        )}>
                                                            <div>
                                                                <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">P1</div>
                                                                <div className="text-base font-black text-red-700 dark:text-red-300">{p1Alt.toLocaleString()}<span className="text-xs ml-0.5">m</span></div>
                                                            </div>
                                                            {p1Wins && <span className="text-xl">🏆</span>}
                                                            {p2Wins && <span className="text-xs text-slate-400">—</span>}
                                                            {isDraw && <span className="text-base">🤝</span>}
                                                        </div>
                                                        {/* P2 */}
                                                        <div className={cn(
                                                            "flex items-center justify-between rounded-xl px-3 py-2.5 border-2 transition-all",
                                                            p2Wins 
                                                                ? "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/50 dark:to-blue-900/40 border-blue-400 dark:border-blue-600 shadow-md" 
                                                                : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50"
                                                        )}>
                                                            <div>
                                                                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">P2</div>
                                                                <div className="text-base font-black text-blue-700 dark:text-blue-300">{p2Alt.toLocaleString()}<span className="text-xs ml-0.5">m</span></div>
                                                            </div>
                                                            {p2Wins && <span className="text-xl">🏆</span>}
                                                            {p1Wins && <span className="text-xs text-slate-400">—</span>}
                                                            {isDraw && <span className="text-base">🤝</span>}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-3 max-w-md">
                                    <button 
                                        onClick={resetGame} 
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
                                                        {/* WIN/LOSE/DRAW Badge */}
                                                        {game.roundWinner === 0 ? (
                                                            <div className="mb-3 inline-block">
                                                                <div className="relative">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 blur-md opacity-50"></div>
                                                                    <div className="relative px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white font-black text-2xl rounded-full shadow-lg border-2 border-yellow-300">
                                                                        <span className="drop-shadow-md">✨ WIN ✨</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : game.roundWinner === 1 ? (
                                                            <div className="mb-3 inline-block">
                                                                <div className="px-4 py-1.5 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-full border border-slate-400 dark:border-slate-600">
                                                                    LOSE
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mb-3 inline-block">
                                                                <div className="px-5 py-2 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold text-lg rounded-full shadow-md border border-purple-300">
                                                                    🤝 DRAW
                                                                </div>
                                                            </div>
                                                        )}
                                                        
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
                                                    
                                                    {/* Player 1 AI Comment */}
                                                    <div className="mt-4 space-y-3">
                                                        {/* 実況コメント */}
                                                        <div className="relative">
                                                            <div className="absolute -left-3 top-0 text-2xl">💬</div>
                                                            <div className="bg-gradient-to-br from-red-100/80 to-red-50/80 dark:from-red-900/40 dark:to-red-950/40 border-l-4 border-red-400 dark:border-red-500 rounded-r-lg p-3 pl-8 shadow-sm">
                                                                <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">AI Judge</div>
                                                                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                                                    {p1Result?.commentary || "..."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* 攻略ヒント */}
                                                        {p1Result?.tip && (
                                                            <div className="relative">
                                                                <div className="absolute -left-3 top-0 text-xl">💡</div>
                                                                <div className="bg-gradient-to-br from-amber-100/60 to-yellow-50/60 dark:from-amber-900/30 dark:to-yellow-950/30 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-lg p-3 pl-8 shadow-sm">
                                                                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Strategy Tip</div>
                                                                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                        {p1Result.tip}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
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
                                                        {/* WIN/LOSE/DRAW Badge */}
                                                        {game.roundWinner === 1 ? (
                                                            <div className="mb-3 inline-block">
                                                                <div className="relative">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 blur-md opacity-50"></div>
                                                                    <div className="relative px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white font-black text-2xl rounded-full shadow-lg border-2 border-yellow-300">
                                                                        <span className="drop-shadow-md">✨ WIN ✨</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : game.roundWinner === 0 ? (
                                                            <div className="mb-3 inline-block">
                                                                <div className="px-4 py-1.5 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-full border border-slate-400 dark:border-slate-600">
                                                                    LOSE
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mb-3 inline-block">
                                                                <div className="px-5 py-2 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold text-lg rounded-full shadow-md border border-purple-300">
                                                                    🤝 DRAW
                                                                </div>
                                                            </div>
                                                        )}
                                                        
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
                                                    
                                                    {/* Player 2 AI Comment */}
                                                    <div className="mt-4 space-y-3">
                                                        {/* 実況コメント */}
                                                        <div className="relative">
                                                            <div className="absolute -left-3 top-0 text-2xl">💬</div>
                                                            <div className="bg-gradient-to-br from-blue-100/80 to-blue-50/80 dark:from-blue-900/40 dark:to-blue-950/40 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg p-3 pl-8 shadow-sm">
                                                                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">AI Judge</div>
                                                                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                                                    {p2Result?.commentary || "..."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* 攻略ヒント */}
                                                        {p2Result?.tip && (
                                                            <div className="relative">
                                                                <div className="absolute -left-3 top-0 text-xl">💡</div>
                                                                <div className="bg-gradient-to-br from-amber-100/60 to-yellow-50/60 dark:from-amber-900/30 dark:to-yellow-950/30 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-lg p-3 pl-8 shadow-sm">
                                                                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Strategy Tip</div>
                                                                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                        {p2Result.tip}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Next Action Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={nextTurn}
                                        className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <span>
                                            {game.roundIndex + 1 >= VERSUS_ROUND_COUNT ? "最終結果を見る" : "次のラウンドへ"}
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
