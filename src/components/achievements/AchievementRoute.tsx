import { Achievement, AchievementCategory, CATEGORY_INFO } from "@/lib/achievements";
import { AchievementStep } from "./AchievementStep";
import { RouteConnector } from "./RouteConnector";

type AchievementRouteProps = {
    category: AchievementCategory;
    achievements: Achievement[];
    unlockedIds: string[];
};

/**
 * 1つのカテゴリの実績ルート全体を表示するコンポーネント
 * 実績を下から上に向かって登山ルートのように表示する
 */
export function AchievementRoute({ category, achievements, unlockedIds }: AchievementRouteProps) {
    const categoryInfo = CATEGORY_INFO[category];
    const unlockedCount = achievements.filter(a => unlockedIds.includes(a.id)).length;
    const totalCount = achievements.length;
    const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    // 次に解除すべき実績を特定
    const nextAchievementId = achievements.find(a => !unlockedIds.includes(a.id))?.id;

    return (
        <div className="space-y-3 md:space-y-4">
            {/* ルートヘッダー */}
            <div className="text-center space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl md:text-3xl animate-bounce-slow">{categoryInfo.icon}</span>
                    <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
                        {categoryInfo.label}
                    </h2>
                </div>
                <div className="text-white/90 text-xs md:text-sm drop-shadow font-semibold">
                    {unlockedCount} / {totalCount} 達成
                </div>
                
                {/* プログレスバー */}
                <div className="w-full max-w-xs mx-auto bg-black/30 rounded-full h-2.5 overflow-hidden border border-white/20 shadow-inner">
                    <div
                        className="h-2.5 transition-all duration-1000 ease-out rounded-full"
                        style={{ 
                            width: `${progressPercentage}%`,
                            background: progressPercentage === 100 
                                ? "linear-gradient(to right, #fbbf24, #f59e0b, #f59e0b)"
                                : "linear-gradient(to right, #3b82f6, #60a5fa)"
                        }}
                    />
                </div>
            </div>

            {/* ベースキャンプライン */}
            <div className="flex justify-center">
                <div className="w-24 md:w-32 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full shadow-lg" />
            </div>

            {/* 実績リスト（下から上へ） */}
            <div className="space-y-0" role="list" aria-label={`${categoryInfo.label}の実績`}>
                {achievements.map((achievement, index) => {
                    const isUnlocked = unlockedIds.includes(achievement.id);
                    const isNext = achievement.id === nextAchievementId;
                    const status = isUnlocked ? "unlocked" : isNext ? "next" : "locked";
                    const isLast = index === achievements.length - 1;

                    return (
                        <div key={achievement.id}>
                            <AchievementStep
                                achievement={achievement}
                                status={status}
                                index={index}
                            />
                            {/* 最後のステップ以外は接続線を表示 */}
                            {!isLast && (
                                <RouteConnector 
                                    isUnlocked={isUnlocked}
                                    index={index}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
