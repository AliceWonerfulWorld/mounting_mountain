"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Mountain,
    Brain,
    Trophy,
    Shield,
    Zap,
    Skull,
    CloudSun,
    Swords,
    MessageSquare,
    ArrowRight,
    Home,
    Users
} from "lucide-react";

type GameMode = "solo" | "versus";

export default function HowToPage() {
    const [activeTab, setActiveTab] = useState<GameMode>("solo");

    return (
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-400 via-orange-200 to-amber-100">

            {/* 🏔️ 山の背景（CSS描画） */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* 遠景の山々（最も薄く、小さく） */}
                <div className="absolute bottom-0 left-0 right-0 h-[500px] opacity-35">
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-slate-700 via-slate-600 to-transparent"
                         style={{
                             clipPath: 'polygon(0% 100%, 5% 50%, 12% 58%, 18% 42%, 25% 52%, 32% 38%, 40% 48%, 48% 32%, 55% 45%, 62% 28%, 70% 42%, 78% 25%, 85% 38%, 92% 22%, 100% 35%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 中景の山々（やや濃く、やや大きく） */}
                <div className="absolute bottom-0 left-0 right-0 h-[400px] opacity-45">
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-slate-600 via-slate-500 to-transparent"
                         style={{
                             clipPath: 'polygon(0% 100%, 8% 42%, 15% 52%, 23% 35%, 32% 45%, 42% 28%, 52% 38%, 62% 25%, 72% 35%, 82% 22%, 90% 32%, 100% 20%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 近景の山々（最も濃く、大きく） */}
                <div className="absolute bottom-0 left-0 right-0 h-[320px] opacity-55">
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-amber-800 via-amber-700 to-transparent"
                         style={{
                             clipPath: 'polygon(0% 100%, 10% 35%, 20% 45%, 30% 25%, 40% 38%, 50% 18%, 60% 32%, 70% 22%, 80% 35%, 90% 25%, 100% 32%, 100% 100%)'
                         }}>
                    </div>
                    {/* 山の陰影 */}
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-br from-transparent via-black/20 to-black/30"
                         style={{
                             clipPath: 'polygon(0% 100%, 10% 35%, 20% 45%, 30% 25%, 40% 38%, 50% 18%, 60% 32%, 70% 22%, 80% 35%, 90% 25%, 100% 32%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 最前景の山々（エッジがはっきり） */}
                <div className="absolute bottom-0 left-0 right-0 h-[240px] opacity-65">
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-orange-900 via-orange-800 to-transparent"
                         style={{
                             clipPath: 'polygon(0% 100%, 15% 45%, 25% 55%, 35% 35%, 45% 48%, 55% 28%, 65% 42%, 75% 32%, 85% 45%, 95% 35%, 100% 42%, 100% 100%)'
                         }}>
                    </div>
                    {/* 最前景の山の陰影 */}
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-br from-transparent via-black/25 to-black/40"
                         style={{
                             clipPath: 'polygon(0% 100%, 15% 45%, 25% 55%, 35% 35%, 45% 48%, 55% 28%, 65% 42%, 75% 32%, 85% 45%, 95% 35%, 100% 42%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 雪を被った最高峰（アクセント） */}
                <div className="absolute bottom-0 left-[40%] w-[20%] h-[280px] opacity-70">
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-slate-800 via-slate-700 to-white/80"
                         style={{
                             clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                         }}>
                    </div>
                    {/* 雪の輝き */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-gradient-to-b from-white/90 to-transparent blur-sm"
                         style={{
                             clipPath: 'polygon(50% 0%, 20% 100%, 80% 100%)'
                         }}>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 relative z-10">

                {/* Header */}
                <header className="text-center space-y-3 sm:space-y-4 mb-8">
                    <div className="inline-block">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-900 drop-shadow-sm px-2 relative">
                            🏔️ 遊び方ガイド
                        </h1>
                        <div className="h-2 bg-amber-900/20 rounded-full mt-2"></div>
                    </div>
                    <p className="text-base sm:text-lg text-amber-800/90 font-medium px-2">
                        マウントを標高で競おう！ エベレスト級の発言を目指せ 🎯
                    </p>
                </header>

                {/* 1. 概要: MountAIとは */}
                <section className="bg-white/80 backdrop-blur-sm border-4 border-amber-900/30 rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-amber-900/50">
                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                        <div className="flex-1 space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-black text-amber-900 flex items-center gap-2 sm:gap-3">
                                🎮 このゲームについて
                            </h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                日常会話の<span className="font-bold text-orange-600 bg-orange-100 px-1 rounded">「マウント（自慢）」</span>を
                                AIが判定して、<span className="font-bold text-blue-600 bg-blue-100 px-1 rounded">標高（0〜8848m）</span>で表示するゲームです！
                                <br className="hidden md:block" />
                                より高い山を目指して、戦略的にマウントを積み上げよう 🏔️
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. 基本の流れ */}
                <section className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-900 flex items-center gap-2 px-2">
                        📝 基本の流れ
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        {[
                            { emoji: "📋", label: "お題", desc: "出題される", color: "bg-blue-100 border-blue-300" },
                            { emoji: "✍️", label: "入力", desc: "マウントを書く", color: "bg-green-100 border-green-300" },
                            { emoji: "🤖", label: "AI判定", desc: "AIが解析", color: "bg-purple-100 border-purple-300" },
                            { emoji: "⛰️", label: "成長", desc: "山が隆起", color: "bg-amber-100 border-amber-300" },
                            { emoji: "🎯", label: "スコア", desc: "標高確定！", color: "bg-red-100 border-red-300" },
                        ].map((step, i) => (
                            <div key={i} className={`relative flex flex-col items-center text-center p-3 sm:p-4 ${step.color} border-2 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default`}>
                                <div className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 hover:scale-125">{step.emoji}</div>
                                <div className="font-bold text-gray-800 mb-1 text-sm sm:text-base">{step.label}</div>
                                <div className="text-xs text-gray-600">{step.desc}</div>

                                {i < 4 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-2xl z-10 animate-pulse">
                                        ➡️
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. モード選択タブ */}
                <section className="space-y-4">
                    <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-2">
                        <button
                            onClick={() => setActiveTab("solo")}
                            className={`relative flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-md overflow-hidden
                                ${activeTab === "solo" 
                                    ? "bg-amber-500 text-white scale-105 shadow-xl" 
                                    : "bg-white/90 text-amber-900 hover:bg-amber-100 hover:scale-105 hover:shadow-lg active:scale-95"
                                }`}
                        >
                            {activeTab === "solo" && (
                                <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 animate-pulse"></span>
                            )}
                            <Mountain className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                            <span className="relative z-10">ソロモード</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("versus")}
                            className={`relative flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-md overflow-hidden
                                ${activeTab === "versus" 
                                    ? "bg-purple-500 text-white scale-105 shadow-xl" 
                                    : "bg-white/90 text-purple-900 hover:bg-purple-100 hover:scale-105 hover:shadow-lg active:scale-95"
                                }`}
                        >
                            {activeTab === "versus" && (
                                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 animate-pulse"></span>
                            )}
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                            <span className="relative z-10">ローカル対戦</span>
                        </button>
                    </div>

                    {/* ソロモードコンテンツ */}
                    {activeTab === "solo" && (
                        <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                            <div className="bg-amber-100/80 backdrop-blur-sm border-3 border-amber-900/20 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:border-amber-900/40">
                                <h3 className="text-xl sm:text-2xl font-black text-amber-900 mb-4 flex items-center gap-2">
                                    ⛰️ ソロモードの遊び方
                                </h3>
                                <p className="text-sm sm:text-base text-gray-700 mb-4">
                                    3ラウンド制で、ルート選択や天候、ミッションなど戦略要素が満載！
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* ルート選択 */}
                                    <div className="bg-white/90 border-2 border-amber-900/20 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                        <h4 className="text-base sm:text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                                            🛣️ ルート選択
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2 p-2 sm:p-3 bg-green-50 border-2 border-green-400 rounded-lg hover:bg-green-100 hover:border-green-500 transition-all duration-200 cursor-pointer">
                                                <div className="text-2xl">🛡️</div>
                                                <div>
                                                    <div className="font-bold text-green-700 text-sm sm:text-base">SAFE (×0.7)</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">安全第一！保険も回復するよ</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 sm:p-3 bg-blue-50 border-2 border-blue-400 rounded-lg hover:bg-blue-100 hover:border-blue-500 transition-all duration-200 cursor-pointer">
                                                <div className="text-2xl">⛰️</div>
                                                <div>
                                                    <div className="font-bold text-blue-700 text-sm sm:text-base">NORMAL (×1.0)</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">バランス重視の王道</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 sm:p-3 bg-red-50 border-2 border-red-400 rounded-lg hover:bg-red-100 hover:border-red-500 transition-all duration-200 cursor-pointer">
                                                <div className="text-2xl">💀</div>
                                                <div>
                                                    <div className="font-bold text-red-700 text-sm sm:text-base">RISKY (×1.3)</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">
                                                        ハイリスク・ハイリターン！
                                                        <span className="block text-red-600 font-medium mt-1">※評価が低いと滑落して2000m固定</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 天候 */}
                                        <div className="bg-white/90 border-2 border-amber-900/20 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                            <h4 className="text-base sm:text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                🌤️ 天候ボーナス
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-600 mb-3">
                                                天候に合わせたマウントで+20%！
                                            </p>
                                            <div className="space-y-1.5 text-xs sm:text-sm">
                                                <div className="bg-yellow-50 p-2 rounded border border-yellow-300 text-gray-700 hover:bg-yellow-100 transition-colors duration-200">☀️ <span className="font-bold">晴天</span> →「数値」で+20%</div>
                                                <div className="bg-cyan-50 p-2 rounded border border-cyan-300 text-gray-700 hover:bg-cyan-100 transition-colors duration-200">💨 <span className="font-bold">強風</span> →「比較」で+20%</div>
                                                <div className="bg-blue-50 p-2 rounded border border-blue-300 text-gray-700 hover:bg-blue-100 transition-colors duration-200">❄️ <span className="font-bold">吹雪</span> →「皮肉」で+20%</div>
                                            </div>
                                        </div>

                                        {/* ミッション */}
                                        <div className="bg-white/90 border-2 border-amber-900/20 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                            <h4 className="text-base sm:text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                🎯 ミッション
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                「合計15000m登れ」などのミッションが発生！
                                                クリアすると★★★評価GET 🌟
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ローカル対戦モードコンテンツ */}
                    {activeTab === "versus" && (
                        <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-500">
                            <div className="bg-purple-100/80 backdrop-blur-sm border-3 border-purple-900/20 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-900/40">
                                <h3 className="text-xl sm:text-2xl font-black text-purple-900 mb-4 flex items-center gap-2">
                                    ⚔️ ローカル対戦の遊び方
                                </h3>
                                <p className="text-sm sm:text-base text-gray-700 mb-4">
                                    友達と同じ画面で交代しながらプレイ！誰が一番マウント取れるかな？
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
                                    <div className="bg-white/90 p-4 rounded-xl border-2 border-purple-300 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                        <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-125">🔄</div>
                                        <div className="font-bold text-purple-700 mb-1 text-sm sm:text-base">1. 交互にプレイ</div>
                                        <div className="text-xs sm:text-sm text-gray-600">プレイヤー1と2で交代しながらマウントを入力！</div>
                                    </div>
                                    <div className="bg-white/90 p-4 rounded-xl border-2 border-purple-300 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                        <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-125">🏆</div>
                                        <div className="font-bold text-purple-700 mb-1 text-sm sm:text-base">2. ラウンド勝者</div>
                                        <div className="text-xs sm:text-sm text-gray-600">各ラウンドで標高が高い方に<span className="text-yellow-600 font-bold">+1000m</span>ボーナス！</div>
                                    </div>
                                    <div className="bg-white/90 p-4 rounded-xl border-2 border-purple-300 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer sm:col-span-2 md:col-span-1">
                                        <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-125">👑</div>
                                        <div className="font-bold text-purple-700 mb-1 text-sm sm:text-base">3. 合計勝負</div>
                                        <div className="text-xs sm:text-sm text-gray-600">最終的な合計標高で勝敗が決定！</div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 hover:bg-yellow-100 transition-colors duration-300">
                                    <div className="flex items-start gap-2">
                                        <div className="text-2xl">💡</div>
                                        <div>
                                            <div className="font-bold text-amber-900 mb-1">ヒント</div>
                                            <p className="text-sm text-gray-700">
                                                現在はシンプルな対戦モードです。ルート選択や天候システムはソロモード限定！
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 4. 攻略のヒント */}
                <section className="bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-900/30 rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <h3 className="text-xl sm:text-2xl font-black text-green-900 mb-4 flex items-center gap-2">
                        💡 攻略のヒント
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/80 p-4 rounded-xl border-2 border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">🎯</div>
                            <div className="font-bold text-gray-800 mb-1">具体的な数値が強い</div>
                            <div className="text-sm text-gray-600">「年収」「学歴」「経験年数」など数字を入れるとAIの評価UP！</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl border-2 border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">🔍</div>
                            <div className="font-bold text-gray-800 mb-1">比較表現を使おう</div>
                            <div className="text-sm text-gray-600">「普通は〜」「まだ〜してるの？」などの比較が効果的！</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl border-2 border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">😏</div>
                            <div className="font-bold text-gray-800 mb-1">鼻につく表現</div>
                            <div className="text-sm text-gray-600">AIは「具体的で鼻につく」表現を高く評価する傾向あり</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl border-2 border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">🎲</div>
                            <div className="font-bold text-gray-800 mb-1">RISKYルートは慎重に</div>
                            <div className="text-sm text-gray-600">一発逆転のチャンスだけど、滑落のリスクも忘れずに！</div>
                        </div>
                    </div>
                </section>

                {/* 5. Footer */}
                <section className="text-center pt-4 pb-8">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 relative overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                        <Home className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10">タイトルに戻る</span>
                    </Link>
                </section>
            </div>

        </main>
    );
}
