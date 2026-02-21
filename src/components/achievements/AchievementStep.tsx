import clsx from "clsx";
import { Achievement } from "@/lib/achievements";

type StepStatus = "unlocked" | "next" | "locked";

type AchievementStepProps = {
    achievement: Achievement;
    status: StepStatus;
    showConnector?: boolean;
    index?: number; // アニメーション用のインデックス
};

/**
 * 登山ルート上の1つの実績ステップを表示するコンポーネント
 */
export function AchievementStep({ achievement, status, showConnector = true, index = 0 }: AchievementStepProps) {
    return (
        <div 
            className="relative"
            style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
            }}
        >
            {/* ステップカード */}
            <div
                className={clsx(
                    "relative p-3 md:p-4 rounded-xl backdrop-blur border transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-2xl cursor-pointer",
                    status === "unlocked" && [
                        "bg-white/95 border-yellow-400 shadow-lg",
                        "shadow-yellow-400/30",
                        "hover:shadow-yellow-400/40",
                    ],
                    status === "next" && [
                        "bg-blue-50/95 border-blue-500 shadow-lg",
                        "shadow-blue-400/30 ring-2 ring-blue-400/50 ring-offset-2 ring-offset-transparent",
                        "animate-pulse-slow",
                        "hover:shadow-blue-400/50",
                    ],
                    status === "locked" && [
                        "bg-slate-800/50 border-slate-600/50 opacity-70",
                        "hover:opacity-85",
                    ]
                )}
            >
                <div className="flex items-center gap-2 md:gap-3">
                    {/* アイコン */}
                    <div className={clsx(
                        "text-2xl md:text-3xl flex-shrink-0 transition-transform duration-300",
                        "hover:scale-110"
                    )}>
                        {status === "locked" ? "🔒" : achievement.icon || "🏆"}
                    </div>

                    {/* テキスト情報 */}
                    <div className="flex-1 min-w-0">
                        <div
                            className={clsx(
                                "font-bold text-sm md:text-base",
                                status === "locked" ? "text-slate-400" : "text-slate-900"
                            )}
                        >
                            {status === "locked" ? "???" : achievement.title}
                        </div>
                        <div
                            className={clsx(
                                "text-xs md:text-sm mt-0.5",
                                status === "locked"
                                    ? "text-slate-500"
                                    : "text-slate-600"
                            )}
                        >
                            {status === "locked"
                                ? "まだ解除されていません"
                                : achievement.description}
                        </div>

                        {/* 達成条件の表示（次の目標の場合） */}
                        {status === "next" && achievement.requiredValue && (
                            <div className="text-xs text-blue-600 font-semibold mt-1.5 flex items-center gap-1">
                                <span>🎯</span>
                                <span>目標: {achievement.requiredValue.toLocaleString()}</span>
                                {achievement.category === "altitude" && <span>m</span>}
                                {achievement.category === "versus" && <span>勝</span>}
                            </div>
                        )}
                    </div>

                    {/* 解除済みバッジ */}
                    {status === "unlocked" && (
                        <div className="text-yellow-500 text-xl md:text-2xl flex-shrink-0 animate-bounce-slow">
                            ✓
                        </div>
                    )}

                    {/* 次の目標マーク */}
                    {status === "next" && (
                        <div className="text-blue-500 text-xl md:text-2xl flex-shrink-0 animate-pulse">
                            ➤
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
