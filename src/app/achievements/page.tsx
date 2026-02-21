"use client";

import Link from "next/link";
import clsx from "clsx";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { groupAchievementsByCategory } from "@/lib/achievements";
import { loadUnlocked } from "@/lib/achievementStore";
import { AchievementRoute } from "@/components/achievements/AchievementRoute";

export default function AchievementsPage() {
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    const [skyClass, setSkyClass] = useState("");
    const [isNight, setIsNight] = useState(false);
    const [isDayFog, setIsDayFog] = useState(false);

    useEffect(() => {
        // 遅延させることで "Calling setState synchronously within an effect" を回避
        const timer = setTimeout(() => {
            setMounted(true);
            setUnlockedIds(loadUnlocked());

            const hour = new Date().getHours();

            if (hour >= 4 && hour < 8) {
                setSkyClass("from-amber-200 via-orange-200 to-sky-200");
            } else if (hour >= 8 && hour < 12) {
                setSkyClass("from-sky-300 via-blue-200 to-sky-100");
            } else if (hour >= 12 && hour < 16) {
                setSkyClass("from-slate-100 via-sky-100 to-white");
                setIsDayFog(true);
            } else if (hour >= 16 && hour < 19) {
                setSkyClass("from-rose-300 via-orange-200 to-amber-100");
            } else {
                setSkyClass("from-slate-900 via-slate-950 to-black");
                setIsNight(true);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return (
            <main className="min-h-screen grid place-items-center bg-black text-white">
                Loading...
            </main>
        );
    }

    const groupedAchievements = groupAchievementsByCategory();

    return (
        <main className="relative min-h-screen w-full overflow-hidden" role="main" aria-label="実績一覧ページ">

            {/* 空 */}
            <div
                className={clsx(
                    "absolute inset-0 bg-gradient-to-b transition-colors duration-1000",
                    skyClass
                )}
            />

            {/* 星 */}
            {isNight && (
                <div className="star-layer">
                    <div className="star s1" />
                    <div className="star s2" />
                    <div className="star s3" />
                    <div className="star s4" />
                    <div className="star s5" />
                </div>
            )}

            {/* 雲 */}
            <div className="cloud-layer">
                <div className="cloud cloud1" />
                <div className="cloud cloud2" />
                <div className="cloud cloud3" />
            </div>

            {/* 昼霧 */}
            {isDayFog && <div className="fog-layer" />}

            {/* 山 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 w-full h-[100vh] bg-slate-400/40
                    [clip-path:polygon(0%_100%,8%_62%,18%_78%,28%_58%,38%_72%,50%_48%,62%_70%,74%_44%,86%_64%,100%_52%,100%_100%)]" />

                <div className="absolute bottom-0 w-full h-[70vh] bg-slate-600/50
                    [clip-path:polygon(0%_100%,12%_55%,22%_70%,34%_42%,46%_60%,58%_34%,70%_52%,82%_26%,92%_46%,100%_38%,100%_100%)]" />

                <div className="absolute bottom-0 w-full h-[38vh] bg-slate-900
                    [clip-path:polygon(0%_100%,18%_38%,34%_58%,50%_26%,66%_46%,82%_18%,100%_36%,100%_100%)]" />
            </div>

            {/* UI */}
            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">

                <header 
                    className="space-y-2 text-center text-white drop-shadow-lg"
                    style={{ animation: "fadeInUp 0.6s ease-out both" }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold">🏆 実績一覧</h1>
                    <p className="text-base md:text-lg opacity-90">
                        あなたのマウンティングの記録です
                    </p>
                </header>

                {/* 登山ルート表示（3列グリッド → モバイルでは1列） */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6">
                    {/* 標高達成ルート */}
                    <div 
                        className="bg-black/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10"
                        style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
                    >
                        <AchievementRoute
                            category="altitude"
                            achievements={groupedAchievements.altitude}
                            unlockedIds={unlockedIds}
                        />
                    </div>

                    {/* 対戦ルート */}
                    <div 
                        className="bg-black/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10"
                        style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}
                    >
                        <AchievementRoute
                            category="versus"
                            achievements={groupedAchievements.versus}
                            unlockedIds={unlockedIds}
                        />
                    </div>

                    {/* 特殊ルート */}
                    <div 
                        className="bg-black/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10"
                        style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
                    >
                        <AchievementRoute
                            category="special"
                            achievements={groupedAchievements.special}
                            unlockedIds={unlockedIds}
                        />
                    </div>
                </section>

                {/* ホームに戻るボタン */}
                <div 
                    className="flex justify-center pt-4"
                    style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        <Home className="w-5 h-5" />
                        タイトルに戻る
                    </Link>
                </div>

            </div>
        </main>
    );
}
