import { cn } from "@/lib/utils";
import type { VersusState } from "@/hooks/useVersusLocalGame";

type VersusHudProps = {
    game: VersusState;
    roundCount: number;
};

export function VersusHud({ game, roundCount }: VersusHudProps) {
    const isP1 = game.currentPlayerIndex === 0;

    return (
        <header className="mb-6">
            <div className="flex items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
                <div className={cn(
                    "flex flex-col items-center p-3 rounded-xl transition-all duration-300 w-28",
                    isP1 ? "bg-red-500 text-white shadow-red-200 dark:shadow-red-900/30 shadow-lg scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-500 scale-95 opacity-70"
                )}>
                    <span className="text-xs font-bold uppercase tracking-wider">Player 1</span>
                    <span className="text-xl font-black">{game.players[0].totalScore.toLocaleString()}m</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Round</div>
                    <div className="text-2xl font-black text-slate-700 dark:text-slate-200">
                        {game.roundIndex + 1} <span className="text-slate-400 text-lg">/ {roundCount}</span>
                    </div>
                </div>

                <div className={cn(
                    "flex flex-col items-center p-3 rounded-xl transition-all duration-300 w-28",
                    !isP1 ? "bg-blue-500 text-white shadow-blue-200 dark:shadow-blue-900/30 shadow-lg scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-500 scale-95 opacity-70"
                )}>
                    <span className="text-xs font-bold uppercase tracking-wider">Player 2</span>
                    <span className="text-xl font-black">{game.players[1].totalScore.toLocaleString()}m</span>
                </div>
            </div>
        </header>
    );
}
