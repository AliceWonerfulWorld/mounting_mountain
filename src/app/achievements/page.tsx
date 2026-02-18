"use client";

import Link from "next/link";
import clsx from "clsx";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { loadUnlocked } from "@/lib/achievementStore";

export default function AchievementsPage() {
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    const [skyClass, setSkyClass] = useState("");
    const [isNight, setIsNight] = useState(false);
    const [isDayFog, setIsDayFog] = useState(false);

    useEffect(() => {
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
    }, []);

    if (!mounted) {
        return (
            <main className="min-h-screen grid place-items-center bg-black text-white">
                Loading...
            </main>
        );
    }

    const unlockedCount = unlockedIds.length;
    const totalCount = ACHIEVEMENTS.length;
    const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

    return (
        <main className="relative min-h-screen w-full overflow-hidden">

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
            <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-8">

                <header className="space-y-2 text-center text-white drop-shadow-lg">
                    <h1 className="text-2xl font-bold">🏆 実績一覧</h1>
                    <p className="text-sm opacity-80">
                        あなたのマウンティングの記録です。
                    </p>
                </header>

                {/* 進捗バー */}
                <section className="bg-white/90 backdrop-blur p-6 rounded-xl shadow">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 transition-all duration-1000"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </section>

                {/* ✅ 実績リスト（これが重要） */}
                <section className="space-y-4">
                    {ACHIEVEMENTS.map((achievement) => {
                        const isUnlocked = unlockedIds.includes(achievement.id);

                        return (
                            <div
                                key={achievement.id}
                                className={clsx(
                                    "p-4 rounded-xl backdrop-blur border transition",
                                    isUnlocked
                                        ? "bg-white/90 border-yellow-400 shadow"
                                        : "bg-black/30 text-white border-white/20 opacity-60"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">
                                        {isUnlocked ? achievement.icon || "🏆" : "🔒"}
                                    </div>
                                    <div>
                                        <div className="font-bold">
                                            {isUnlocked ? achievement.title : "???"}
                                        </div>
                                        <div className="text-sm opacity-70">
                                            {isUnlocked
                                                ? achievement.description
                                                : "まだ解除されていません"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                <div className="flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <Home className="w-5 h-5" />
                        タイトルに戻る
                    </Link>
                </div>


            </div>
        </main>
    );
}
