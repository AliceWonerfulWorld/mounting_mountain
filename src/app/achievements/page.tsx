"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { loadUnlocked } from "@/lib/achievementStore";

export default function AchievementsPage() {
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setUnlockedIds(loadUnlocked());
    }, []);

    if (!mounted) {
        return (
            <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-8 bg-zinc-50 dark:bg-black">
                <div className="space-y-2 text-center animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded mx-auto" />
                    <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-800 rounded mx-auto" />
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 w-full bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
            <header className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">🏆 実績一覧</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    あなたのマウンティングの記録です。
                </p>
                <div className="text-sm font-mono text-gray-500">
                    解除済み: {unlockedIds.length} / {ACHIEVEMENTS.length}
                </div>
            </header>

            <section className="space-y-4">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = unlockedIds.includes(achievement.id);

                    return (
                        <div
                            key={achievement.id}
                            className={clsx(
                                "p-4 rounded-xl border flex items-center justify-between transition-all duration-500",
                                isUnlocked
                                    ? "bg-white dark:bg-zinc-900 border-yellow-400 shadow-sm"
                                    : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 opacity-60 grayscale"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl filter-none">
                                    {isUnlocked ? achievement.icon || "🏆" : "🔒"}
                                </div>
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        {achievement.title}
                                        {isUnlocked && <span className="text-yellow-500 text-[10px] border border-yellow-500 px-1 rounded uppercase">Unlocked</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {achievement.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <div className="pt-8 space-y-4">
                <Link
                    href="/"
                    className="block w-full py-3 text-center rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-bold"
                >
                    タイトルに戻る
                </Link>
            </div>
        </main>
    );
}
