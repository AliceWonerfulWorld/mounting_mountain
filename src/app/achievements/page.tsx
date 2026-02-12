"use client";

import Link from "next/link";
import clsx from "clsx";

type Achievement = {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
};

const ACHIEVEMENTS: Achievement[] = [
    { id: "1", title: "初登頂", description: "初めてマウントを取った", unlocked: true },
    { id: "2", title: "高山病知らず", description: "標高1000mを超えた", unlocked: false },
    { id: "3", title: "連峰の覇者", description: "3ラウンド連続で相手より高い標高を出した", unlocked: false },
    { id: "4", title: "エベレスト級", description: "標高8848mを超えた", unlocked: false },
    { id: "5", title: "マウントマスター", description: "通算100回マウントを取った", unlocked: false },
];

export default function AchievementsPage() {
    return (
        <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
            <header className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">🏆 実績一覧</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    あなたのマウンティングの記録です。
                </p>
            </header>

            <section className="space-y-4">
                {ACHIEVEMENTS.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={clsx(
                            "p-4 rounded-xl border flex items-center justify-between transition-colors",
                            achievement.unlocked
                                ? "bg-white dark:bg-zinc-900 border-yellow-400 shadow-sm"
                                : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 opacity-60"
                        )}
                    >
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                {achievement.title}
                                {achievement.unlocked && <span className="text-yellow-500 text-xs">★ UNLOCKED</span>}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {achievement.description}
                            </div>
                        </div>
                        <div className="text-2xl">
                            {achievement.unlocked ? "🔓" : "🔒"}
                        </div>
                    </div>
                ))}
            </section>

            <div className="pt-8">
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
