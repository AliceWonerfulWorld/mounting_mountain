import clsx from "clsx";
import { Achievement } from "@/lib/achievements";

type StepStatus = "unlocked" | "next" | "locked";

type AchievementStepProps = {
    achievement: Achievement;
    status: StepStatus;
    showConnector?: boolean;
};

/**
 * 登山ルート上の1つの実績ステップを表示するコンポーネント
 */
export function AchievementStep({ achievement, status, showConnector = true }: AchievementStepProps) {
    return (
        <div className="relative">
            {/* ステップカード */}
            <div
                className={clsx(
                    "relative p-4 rounded-xl backdrop-blur border transition-all duration-300",
                    "hover:scale-105 hover:shadow-xl",
                    status === "unlocked" && [
                        "bg-white/95 border-yellow-400 shadow-lg",
                        "shadow-yellow-400/20",
                    ],
                    status === "next" && [
                        "bg-blue-50/95 border-blue-400 shadow-lg",
                        "shadow-blue-400/20 ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent",
                        "animate-pulse",
                    ],
                    status === "locked" && [
                        "bg-slate-800/40 border-slate-600/50 opacity-70",
                    ]
                )}
            >
                <div className="flex items-center gap-3">
                    {/* アイコン */}
                    <div className="text-3xl flex-shrink-0">
                        {status === "locked" ? "🔒" : achievement.icon || "🏆"}
                    </div>

                    {/* テキスト情報 */}
                    <div className="flex-1 min-w-0">
                        <div
                            className={clsx(
                                "font-bold text-base",
                                status === "locked" ? "text-slate-400" : "text-slate-900"
                            )}
                        >
                            {status === "locked" ? "???" : achievement.title}
                        </div>
                        <div
                            className={clsx(
                                "text-sm mt-0.5",
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
                            <div className="text-xs text-blue-600 font-semibold mt-1">
                                目標: {achievement.requiredValue.toLocaleString()}
                                {achievement.category === "altitude" && "m"}
                                {achievement.category === "versus" && "勝"}
                            </div>
                        )}
                    </div>

                    {/* 解除済みバッジ */}
                    {status === "unlocked" && (
                        <div className="text-yellow-500 text-xl flex-shrink-0">
                            ✓
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
