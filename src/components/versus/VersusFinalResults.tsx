"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Home, Medal, RotateCcw, Swords, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VersusState } from "@/hooks/useVersusLocalGame";
import { MountainResultScene } from "@/components/MountainResultScene";
import { useTimeOfDayExtended } from "@/hooks/useTimeOfDay";

type VersusFinalResultsProps = {
    game: VersusState;
    onReset: () => void;
};

type PlayerColor = "red" | "blue";

export function VersusFinalResults({ game, onReset }: VersusFinalResultsProps) {
    const { timeOfDay } = useTimeOfDayExtended();
    const players = game.players;
    const p1Score = players[0].totalScore;
    const p2Score = players[1].totalScore;
    const p1Wins = p1Score > p2Score;
    const p2Wins = p2Score > p1Score;
    const isDraw = p1Score === p2Score;
    const winnerIndex = p1Wins ? 0 : p2Wins ? 1 : null;
    const winner = winnerIndex === null ? null : players[winnerIndex];
    const winnerColor: PlayerColor | "neutral" = winnerIndex === 0 ? "red" : winnerIndex === 1 ? "blue" : "neutral";
    const winnerScore = Math.max(p1Score, p2Score);
    const scoreGap = Math.abs(p1Score - p2Score);
    const highestRound = Math.max(
        ...players.flatMap((player) => player.rounds.map((round) => round.result?.finalAltitude ?? round.result?.altitude ?? 0)),
        0,
    );
    const stageAltitude = Math.max(highestRound, Math.round(winnerScore / Math.max(game.roundIndex + 1, 1)));

    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-6xl space-y-5 text-white"
        >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/[0.86] p-3 shadow-[0_32px_120px_rgba(15,23,42,0.48)] backdrop-blur-2xl sm:p-4 lg:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(248,113,113,0.24),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.24),transparent_30%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />

                <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]">
                    <div className="relative min-h-[430px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl">
                        <MountainResultScene
                            altitude={stageAltitude}
                            maxAltitude={16000}
                            mode="versus"
                            color={winnerColor}
                            timeOfDay={timeOfDay}
                            isWinner={!isDraw}
                            bonusAltitude={scoreGap}
                            className="h-full min-h-[430px] rounded-[1.5rem] border-0 shadow-none"
                            size="large"
                            showHud={false}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/12 to-slate-950/20" />
                        <div className="absolute inset-x-4 top-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.34em] text-white/58">
                                    <Swords className="h-3.5 w-3.5" />
                                    Local Versus
                                </div>
                                <h2 className="mt-1 max-w-full break-words text-[clamp(2.6rem,6.6vw,5.15rem)] font-black leading-[0.86] tracking-tight text-white drop-shadow-[0_10px_34px_rgba(0,0,0,0.45)]">
                                    {isDraw ? "DRAW" : "WINNER"}
                                </h2>
                                <div className="mt-2 max-w-full break-words text-lg font-black leading-tight text-white/82 sm:text-xl">
                                    {winner ? `${winner.name} takes the summit` : "同標高の頂上決戦"}
                                </div>
                            </div>
                            <div className="justify-self-start rounded-2xl border border-white/15 bg-slate-950/42 px-4 py-3 text-left shadow-xl backdrop-blur-xl sm:justify-self-end sm:text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Gap</div>
                                <div className="font-mono text-4xl font-black leading-none sm:text-5xl">
                                    {scoreGap.toLocaleString()}
                                    <span className="ml-1 text-lg text-white/65">m</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-3">
                            <FinalMetric label="勝者標高" value={winnerScore.toLocaleString()} unit="m" />
                            <FinalMetric label="最高ラウンド" value={highestRound.toLocaleString()} unit="m" />
                            <FinalMetric label="ラウンド数" value={String(players[0].rounds.length)} unit="R" />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <WinnerCard
                            p1Wins={p1Wins}
                            p2Wins={p2Wins}
                            p1Name={players[0].name}
                            p2Name={players[1].name}
                        />
                        <div className="grid gap-3">
                            <PlayerScoreCard playerName={players[0].name} score={p1Score} color="red" isWinner={p1Wins} isDraw={isDraw} />
                            <PlayerScoreCard playerName={players[1].name} score={p2Score} color="blue" isWinner={p2Wins} isDraw={isDraw} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <MiniStat label="標高差" value={scoreGap.toLocaleString()} unit="m" />
                            <MiniStat label="合計標高" value={(p1Score + p2Score).toLocaleString()} unit="m" />
                        </div>
                    </div>
                </div>
            </div>

            <RoundBreakdown game={game} />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="grid gap-3 sm:grid-cols-2"
            >
                <button
                    onClick={onReset}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-3 text-base font-black text-white shadow-xl shadow-rose-500/25 transition hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.98]"
                >
                    <RotateCcw className="h-5 w-5" />
                    再戦する
                </button>
                <Link
                    href="/"
                    className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-slate-950/70 px-5 py-3 text-base font-black text-white shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-slate-900"
                >
                    <Home className="h-5 w-5" />
                    タイトルに戻る
                </Link>
            </motion.div>
        </motion.section>
    );
}

function WinnerCard({
    p1Wins,
    p2Wins,
    p1Name,
    p2Name,
}: {
    p1Wins: boolean;
    p2Wins: boolean;
    p1Name: string;
    p2Name: string;
}) {
    const winnerName = p1Wins ? p1Name : p2Wins ? p2Name : "DRAW";
    const colorClass = p1Wins
        ? "from-red-400/24 to-rose-500/12 border-red-300/30"
        : p2Wins
            ? "from-sky-400/24 to-blue-500/12 border-sky-300/30"
            : "from-violet-400/24 to-indigo-500/12 border-violet-300/30";

    return (
        <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className={cn("rounded-3xl border bg-gradient-to-br p-5 shadow-2xl backdrop-blur-xl", colorClass)}
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/14 shadow-lg backdrop-blur-xl">
                    {p1Wins || p2Wins ? <Crown className="h-8 w-8 text-amber-200" /> : <Swords className="h-8 w-8 text-violet-100" />}
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
                        Battle Result
                    </div>
                    <div className="text-3xl font-black text-white">{winnerName}</div>
                </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/32 p-4 text-sm font-bold leading-relaxed text-white/72">
                {p1Wins || p2Wins ? "頂上を制したプレイヤーが決定しました。" : "完全同着。次の登頂で決着をつけましょう。"}
            </div>
        </motion.div>
    );
}

function PlayerScoreCard({
    playerName,
    score,
    color,
    isWinner,
    isDraw,
}: {
    playerName: string;
    score: number;
    color: PlayerColor;
    isWinner: boolean;
    isDraw: boolean;
}) {
    const accent = color === "red" ? "#fb7185" : "#38bdf8";
    return (
        <motion.div
            initial={{ opacity: 0, x: color === "red" ? -14 : 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: color === "red" ? 0.24 : 0.3 }}
            className={cn(
                "relative overflow-hidden rounded-3xl border p-4 shadow-xl backdrop-blur-xl",
                isWinner
                    ? "border-white/28 bg-white/16"
                    : "border-white/12 bg-white/8",
            )}
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-white/45">{playerName}</div>
                    <div className="mt-2 font-mono text-4xl font-black leading-none text-white">
                        {score.toLocaleString()}
                        <span className="ml-1 text-lg text-white/55">m</span>
                    </div>
                </div>
                {(isWinner || isDraw) && (
                    <div className="rounded-full border border-white/16 bg-slate-950/38 px-3 py-1 text-xs font-black text-white/72">
                        {isDraw ? "DRAW" : "WIN"}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function RoundBreakdown({ game }: { game: VersusState }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-[1.75rem] border border-white/20 bg-slate-950/80 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:p-5"
        >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Round Log</div>
                    <div className="text-2xl font-black text-white">ラウンド別結果</div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-white/55">
                    <TrendingUp className="h-4 w-4" />
                    標高勝負
                </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
                {game.players[0].rounds.map((round, idx) => {
                    const p1Round = round;
                    const p2Round = game.players[1].rounds[idx];
                    const p1Alt = p1Round?.result?.finalAltitude ?? p1Round?.result?.altitude ?? 0;
                    const p2Alt = p2Round?.result?.finalAltitude ?? p2Round?.result?.altitude ?? 0;
                    const p1Wins = p1Alt > p2Alt;
                    const p2Wins = p2Alt > p1Alt;
                    const draw = p1Alt === p2Alt;

                    return (
                        <div key={round.id} className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-xl backdrop-blur-xl">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/62">
                                    Round {idx + 1}
                                </div>
                                <RoundWinnerBadge p1Wins={p1Wins} p2Wins={p2Wins} draw={draw} />
                            </div>
                            <div className="grid gap-2">
                                <RoundScoreRow player="P1" altitude={p1Alt} color="red" isWinner={p1Wins} />
                                <RoundScoreRow player="P2" altitude={p2Alt} color="blue" isWinner={p2Wins} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function RoundWinnerBadge({ p1Wins, p2Wins, draw }: { p1Wins: boolean; p2Wins: boolean; draw: boolean }) {
    if (draw) {
        return <span className="rounded-full border border-violet-200/20 bg-violet-300/12 px-2 py-1 text-[10px] font-black text-violet-100">DRAW</span>;
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/20 bg-amber-300/14 px-2 py-1 text-[10px] font-black text-amber-100">
            <Medal className="h-3 w-3" />
            {p1Wins ? "P1" : p2Wins ? "P2" : "-"}
        </span>
    );
}

function RoundScoreRow({
    player,
    altitude,
    color,
    isWinner,
}: {
    player: string;
    altitude: number;
    color: PlayerColor;
    isWinner: boolean;
}) {
    const accent = color === "red" ? "bg-red-400" : "bg-sky-400";
    return (
        <div className={cn("flex items-center justify-between rounded-xl border px-3 py-2", isWinner ? "border-white/20 bg-white/12" : "border-white/8 bg-slate-950/18")}>
            <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", accent)} />
                <span className="text-xs font-black text-white/58">{player}</span>
            </div>
            <div className="font-mono text-lg font-black text-white">
                {altitude.toLocaleString()}
                <span className="ml-1 text-xs text-white/45">m</span>
            </div>
        </div>
    );
}

function FinalMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
    return (
        <div className="rounded-2xl border border-white/12 bg-slate-950/48 px-4 py-3 shadow-xl backdrop-blur-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">{label}</div>
            <div className="mt-1 font-mono text-2xl font-black leading-none text-white">
                {value}
                {unit && <span className="ml-1 text-sm text-white/58">{unit}</span>}
            </div>
        </div>
    );
}

function MiniStat({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-center shadow-xl backdrop-blur-xl">
            <div className="text-xs font-bold text-white/45">{label}</div>
            <div className="mt-1 font-mono text-2xl font-black text-white">
                {value}
                <span className="ml-1 text-sm text-white/50">{unit}</span>
            </div>
        </div>
    );
}
