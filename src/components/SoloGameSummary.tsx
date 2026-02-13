import type { SoloSummary } from "@/lib/solo/summary";

interface SoloGameSummaryProps {
    summary: SoloSummary;
    onReset: () => void;
}

/**
 * ソロゲーム終了時のサマリー表示コンポーネント
 */
export function SoloGameSummary({ summary, onReset }: SoloGameSummaryProps) {
    const starDisplay = "★".repeat(summary.stars) + "☆".repeat(3 - summary.stars);

    return (
        <div className="space-y-6 py-6">
            {/* 星評価 */}
            <div className="text-center">
                <div className="text-6xl mb-2">{starDisplay}</div>
                <div className="text-2xl font-bold">
                    {summary.stars === 3 ? "完璧！" : summary.stars === 2 ? "惜しい！" : "次回に期待！"}
                </div>
            </div>

            {/* ミッション結果 */}
            <div className={`p-4 rounded-lg border-2 ${summary.mission.cleared
                    ? 'bg-green-50 border-green-300 dark:bg-green-900 dark:border-green-700'
                    : 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                }`}>
                <div className={`text-xl font-bold ${summary.mission.cleared
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {summary.mission.cleared ? '🎉 MISSION CLEAR!' : '😔 MISSION FAILED...'}
                </div>
                <div className="text-sm mt-2 font-bold">
                    {summary.mission.title}: {summary.mission.description}
                </div>
                <div className="text-sm mt-1 font-mono">
                    {summary.mission.progressText}
                </div>
            </div>

            {/* 結果サマリー */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 text-sm">
                <div className="font-bold text-lg border-b pb-2">結果サマリー</div>

                {/* スコア */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <div className="text-xs text-gray-500">合計標高</div>
                        <div className="font-bold">{summary.score.total.toLocaleString()}m</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">最高標高</div>
                        <div className="font-bold">{summary.score.max.toLocaleString()}m</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">平均標高</div>
                        <div className="font-bold">{summary.score.avg.toLocaleString()}m</div>
                    </div>
                </div>

                {/* 天候 */}
                <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-gray-600 dark:text-gray-400">天候</span>
                    <span className="font-mono">{summary.weather.emoji} {summary.weather.label}</span>
                </div>

                {/* ルート */}
                <div className="py-2 border-t">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">ルート選択</div>
                    <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                            🛡️ SAFE: {summary.routes.SAFE}回
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            ⛰️ NORMAL: {summary.routes.NORMAL}回
                        </span>
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 rounded">
                            🔥 RISKY: {summary.routes.RISKY}回
                        </span>
                    </div>
                </div>

                {/* 滑落 */}
                {summary.falls > 0 && (
                    <div className="flex items-center justify-between py-2 border-t">
                        <span className="text-gray-600 dark:text-gray-400">滑落回数</span>
                        <span className="font-bold text-red-600">{summary.falls}回</span>
                    </div>
                )}
            </div>

            <button
                className="w-full py-3 rounded-lg bg-black text-white font-bold hover:opacity-90 dark:bg-white dark:text-black"
                onClick={onReset}
            >
                もう一度挑戦する
            </button>
        </div>
    );
}
