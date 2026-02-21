"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Mountain,
    Home,
    Users
} from "lucide-react";
import { MountainBackground } from "@/components/MountainBackground";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";

type GameMode = "solo" | "versus";

export default function HowToPage() {
    const [activeTab, setActiveTab] = useState<GameMode>("solo");
    const timeOfDay = useTimeOfDay();

    // 時間帯に応じた文字色のテーマ
    const textColors = {
        morning: {
            primary: "text-amber-900",
            secondary: "text-orange-800",
            muted: "text-orange-700/80",
            card: "text-slate-800",
            cardMuted: "text-slate-600"
        },
        day: {
            primary: "text-sky-900",
            secondary: "text-cyan-800",
            muted: "text-cyan-700/80",
            card: "text-slate-800",
            cardMuted: "text-slate-600"
        },
        evening: {
            primary: "text-orange-950",
            secondary: "text-red-900",
            muted: "text-amber-800/80",
            card: "text-slate-900",
            cardMuted: "text-slate-700"
        },
        night: {
            primary: "text-slate-100",
            secondary: "text-indigo-200",
            muted: "text-slate-300/80",
            card: "text-slate-50",
            cardMuted: "text-slate-300"
        }
    };

    const colors = textColors[timeOfDay];

    return (
        <main className="min-h-screen relative overflow-hidden">

            {/* 時間帯に応じた背景 */}
            <MountainBackground />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 relative z-10">

                {/* Header */}
                <header className="text-center space-y-3 sm:space-y-4 mb-8">
                    <div className="inline-block">
                        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black ${colors.primary} drop-shadow-sm px-2 relative transition-colors duration-1000`}>
                            🏔️ 遊び方ガイド
                        </h1>
                        <div className={`h-2 ${timeOfDay === 'night' ? 'bg-slate-300/30' : 'bg-amber-900/20'} rounded-full mt-2 transition-colors duration-1000`}></div>
                    </div>
                    <p className={`text-base sm:text-lg ${colors.secondary} font-medium px-2 transition-colors duration-1000`}>
                        マウントを標高で競おう！ エベレスト級の発言を目指せ 🎯
                    </p>
                </header>

                {/* 1. 概要: MountAIとは */}
                <section className={`${
                    timeOfDay === 'night' 
                        ? 'bg-slate-800/80 border-slate-600' 
                        : 'bg-white/80 border-amber-900/30 hover:border-amber-900/50'
                } backdrop-blur-sm border-4 rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                        <div className="flex-1 space-y-3">
                            <h2 className={`text-2xl sm:text-3xl font-black ${colors.secondary} flex items-center gap-2 sm:gap-3 transition-colors duration-1000`}>
                                🎮 このゲームについて
                            </h2>
                            <p className={`text-sm sm:text-base ${colors.card} leading-relaxed transition-colors duration-1000`}>
                                日常会話の<span className={`font-bold ${timeOfDay === 'night' ? 'text-orange-300 bg-orange-900/30' : 'text-orange-600 bg-orange-100'} px-1 rounded transition-colors duration-1000`}>「マウント（自慢）」</span>を
                                AIが判定して、<span className={`font-bold ${timeOfDay === 'night' ? 'text-blue-300 bg-blue-900/30' : 'text-blue-600 bg-blue-100'} px-1 rounded transition-colors duration-1000`}>標高（0〜8848m）</span>で表示するゲームです！
                                <br className="hidden md:block" />
                                より高い山を目指して、戦略的にマウントを積み上げよう 🏔️
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. 基本の流れ */}
                <section className="space-y-4">
                    <h2 className={`text-2xl sm:text-3xl font-black ${colors.primary} flex items-center gap-2 px-2 transition-colors duration-1000`}>
                        📝 基本の流れ
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        {[
                            { emoji: "📋", label: "お題", desc: "出題される", color: "blue", bgDay: "bg-blue-100", borderDay: "border-blue-300", bgNight: "bg-blue-900/30", borderNight: "border-blue-600" },
                            { emoji: "✍️", label: "入力", desc: "マウントを書く", color: "green", bgDay: "bg-green-100", borderDay: "border-green-300", bgNight: "bg-green-900/30", borderNight: "border-green-600" },
                            { emoji: "🤖", label: "AI判定", desc: "AIが解析", color: "purple", bgDay: "bg-purple-100", borderDay: "border-purple-300", bgNight: "bg-purple-900/30", borderNight: "border-purple-600" },
                            { emoji: "⛰️", label: "成長", desc: "山が隆起", color: "amber", bgDay: "bg-amber-100", borderDay: "border-amber-300", bgNight: "bg-amber-900/30", borderNight: "border-amber-600" },
                            { emoji: "🎯", label: "スコア", desc: "標高確定！", color: "red", bgDay: "bg-red-100", borderDay: "border-red-300", bgNight: "bg-red-900/30", borderNight: "border-red-600" },
                        ].map((step, i) => (
                            <div key={i} className={`relative flex flex-col items-center text-center p-3 sm:p-4 ${
                                timeOfDay === 'night' ? step.bgNight : step.bgDay
                            } border-2 ${
                                timeOfDay === 'night' ? step.borderNight : step.borderDay
                            } rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default`}>
                                <div className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 hover:scale-125">{step.emoji}</div>
                                <div className={`font-bold ${colors.card} mb-1 text-sm sm:text-base transition-colors duration-1000`}>{step.label}</div>
                                <div className={`text-xs ${colors.cardMuted} transition-colors duration-1000`}>{step.desc}</div>

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
                                    : timeOfDay === 'night'
                                    ? "bg-slate-700/90 text-amber-200 hover:bg-slate-600 hover:scale-105 hover:shadow-lg active:scale-95"
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
                                    : timeOfDay === 'night'
                                    ? "bg-slate-700/90 text-purple-200 hover:bg-slate-600 hover:scale-105 hover:shadow-lg active:scale-95"
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
                            <div className={`${
                                timeOfDay === 'night' 
                                    ? 'bg-slate-800/80 border-slate-600' 
                                    : 'bg-amber-100/80 border-amber-900/20 hover:border-amber-900/40'
                            } backdrop-blur-sm border-3 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300`}>
                                <h3 className={`text-xl sm:text-2xl font-black ${colors.secondary} mb-4 flex items-center gap-2 transition-colors duration-1000`}>
                                    ⛰️ ソロモードの遊び方
                                </h3>
                                <p className={`text-sm sm:text-base ${colors.card} mb-4 transition-colors duration-1000`}>
                                    3ラウンド制で、ルート選択や天候、ミッションなど戦略要素が満載！
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* ルート選択 */}
                                    <div className={`${
                                        timeOfDay === 'night' 
                                            ? 'bg-slate-700/90 border-slate-500' 
                                            : 'bg-white/90 border-amber-900/20'
                                    } border-2 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                                        <h4 className={`text-base sm:text-lg font-bold ${colors.secondary} mb-3 flex items-center gap-2 transition-colors duration-1000`}>
                                            🛣️ ルート選択
                                        </h4>
                                        <div className="space-y-2">
                                            <div className={`flex items-start gap-2 p-2 sm:p-3 ${
                                                timeOfDay === 'night'
                                                    ? 'bg-green-900/30 border-green-600 hover:bg-green-900/40'
                                                    : 'bg-green-50 border-green-400 hover:bg-green-100 hover:border-green-500'
                                            } border-2 rounded-lg transition-all duration-200 cursor-pointer`}>
                                                <div className="text-2xl">🛡️</div>
                                                <div>
                                                    <div className={`font-bold ${timeOfDay === 'night' ? 'text-green-300' : 'text-green-700'} text-sm sm:text-base transition-colors duration-1000`}>SAFE (×0.7)</div>
                                                    <div className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>安全第一！保険も回復するよ</div>
                                                </div>
                                            </div>
                                            <div className={`flex items-start gap-2 p-2 sm:p-3 ${
                                                timeOfDay === 'night'
                                                    ? 'bg-blue-900/30 border-blue-600 hover:bg-blue-900/40'
                                                    : 'bg-blue-50 border-blue-400 hover:bg-blue-100 hover:border-blue-500'
                                            } border-2 rounded-lg transition-all duration-200 cursor-pointer`}>
                                                <div className="text-2xl">⛰️</div>
                                                <div>
                                                    <div className={`font-bold ${timeOfDay === 'night' ? 'text-blue-300' : 'text-blue-700'} text-sm sm:text-base transition-colors duration-1000`}>NORMAL (×1.0)</div>
                                                    <div className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>バランス重視の王道</div>
                                                </div>
                                            </div>
                                            <div className={`flex items-start gap-2 p-2 sm:p-3 ${
                                                timeOfDay === 'night'
                                                    ? 'bg-red-900/30 border-red-600 hover:bg-red-900/40'
                                                    : 'bg-red-50 border-red-400 hover:bg-red-100 hover:border-red-500'
                                            } border-2 rounded-lg transition-all duration-200 cursor-pointer`}>
                                                <div className="text-2xl">💀</div>
                                                <div>
                                                    <div className={`font-bold ${timeOfDay === 'night' ? 'text-red-300' : 'text-red-700'} text-sm sm:text-base transition-colors duration-1000`}>RISKY (×1.3)</div>
                                                    <div className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>
                                                        ハイリスク・ハイリターン！
                                                        <span className={`block ${timeOfDay === 'night' ? 'text-red-400' : 'text-red-600'} font-medium mt-1 transition-colors duration-1000`}>※評価が低いと滑落して2000m固定</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 天候 */}
                                        <div className={`${
                                            timeOfDay === 'night' 
                                                ? 'bg-slate-700/90 border-slate-500' 
                                                : 'bg-white/90 border-amber-900/20'
                                        } border-2 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                                            <h4 className={`text-base sm:text-lg font-bold ${colors.secondary} mb-2 flex items-center gap-2 transition-colors duration-1000`}>
                                                🌤️ 天候ボーナス
                                            </h4>
                                            <p className={`text-xs sm:text-sm ${colors.cardMuted} mb-3 transition-colors duration-1000`}>
                                                天候に合わせたマウントで+20%！
                                            </p>
                                            <div className="space-y-1.5 text-xs sm:text-sm">
                                                <div className={`p-2 rounded border ${
                                                    timeOfDay === 'night'
                                                        ? 'bg-yellow-900/30 border-yellow-600 text-yellow-200 hover:bg-yellow-900/40'
                                                        : 'bg-yellow-50 border-yellow-300 text-gray-700 hover:bg-yellow-100'
                                                } transition-colors duration-200`}>☀️ <span className="font-bold">晴天</span> →「数値」で+20%</div>
                                                <div className={`p-2 rounded border ${
                                                    timeOfDay === 'night'
                                                        ? 'bg-cyan-900/30 border-cyan-600 text-cyan-200 hover:bg-cyan-900/40'
                                                        : 'bg-cyan-50 border-cyan-300 text-gray-700 hover:bg-cyan-100'
                                                } transition-colors duration-200`}>💨 <span className="font-bold">強風</span> →「比較」で+20%</div>
                                                <div className={`p-2 rounded border ${
                                                    timeOfDay === 'night'
                                                        ? 'bg-blue-900/30 border-blue-600 text-blue-200 hover:bg-blue-900/40'
                                                        : 'bg-blue-50 border-blue-300 text-gray-700 hover:bg-blue-100'
                                                } transition-colors duration-200`}>❄️ <span className="font-bold">吹雪</span> →「皮肉」で+20%</div>
                                            </div>
                                        </div>

                                        {/* ミッション */}
                                        <div className={`${
                                            timeOfDay === 'night' 
                                                ? 'bg-slate-700/90 border-slate-500' 
                                                : 'bg-white/90 border-amber-900/20'
                                        } border-2 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                                            <h4 className={`text-base sm:text-lg font-bold ${colors.secondary} mb-2 flex items-center gap-2 transition-colors duration-1000`}>
                                                🎯 ミッション
                                            </h4>
                                            <p className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>
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
                            <div className={`${
                                timeOfDay === 'night' 
                                    ? 'bg-slate-800/80 border-slate-600' 
                                    : 'bg-purple-100/80 border-purple-900/20 hover:border-purple-900/40'
                            } backdrop-blur-sm border-3 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300`}>
                                <h3 className={`text-xl sm:text-2xl font-black ${colors.secondary} mb-4 flex items-center gap-2 transition-colors duration-1000`}>
                                    ⚔️ ローカル対戦の遊び方
                                </h3>
                                <p className={`text-sm sm:text-base ${colors.card} mb-4 transition-colors duration-1000`}>
                                    友達と同じ画面で交代しながらプレイ！誰が一番マウント取れるかな？
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
                                    <div className={`${
                                        timeOfDay === 'night'
                                            ? 'bg-slate-700/90 border-slate-500'
                                            : 'bg-white/90 border-purple-300'
                                    } p-4 rounded-xl border-2 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer`}>
                                        <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-125">🔄</div>
                                        <div className={`font-bold ${timeOfDay === 'night' ? 'text-purple-300' : 'text-purple-700'} mb-1 text-sm sm:text-base transition-colors duration-1000`}>1. 交互にプレイ</div>
                                        <div className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>プレイヤー1と2で交代しながらマウントを入力！</div>
                                    </div>
                                    <div className={`${
                                        timeOfDay === 'night'
                                            ? 'bg-slate-700/90 border-slate-500'
                                            : 'bg-white/90 border-purple-300'
                                    } p-4 rounded-xl border-2 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer`}>
                                        <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-125">🏆</div>
                                        <div className={`font-bold ${timeOfDay === 'night' ? 'text-purple-300' : 'text-purple-700'} mb-1 text-sm sm:text-base transition-colors duration-1000`}>2. ラウンド勝者</div>
                                        <div className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>各ラウンドで標高が高い方に<span className="text-yellow-500 font-bold">+1000m</span>ボーナス！</div>
                                    </div>
                                    <div className={`${
                                        timeOfDay === 'night'
                                            ? 'bg-slate-700/90 border-slate-500'
                                            : 'bg-white/90 border-purple-300'
                                    } p-4 rounded-xl border-2 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer sm:col-span-2 md:col-span-1`}>
                                        <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-125">👑</div>
                                        <div className={`font-bold ${timeOfDay === 'night' ? 'text-purple-300' : 'text-purple-700'} mb-1 text-sm sm:text-base transition-colors duration-1000`}>3. 合計勝負</div>
                                        <div className={`text-xs sm:text-sm ${colors.cardMuted} transition-colors duration-1000`}>最終的な合計標高で勝敗が決定！</div>
                                    </div>
                                </div>

                                <div className={`mt-6 ${
                                    timeOfDay === 'night'
                                        ? 'bg-yellow-900/40 border-yellow-600 hover:bg-yellow-900/50'
                                        : 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100'
                                } border-2 rounded-xl p-4 transition-colors duration-300`}>
                                    <div className="flex items-start gap-2">
                                        <div className="text-2xl">💡</div>
                                        <div>
                                            <div className={`font-bold ${timeOfDay === 'night' ? 'text-yellow-300' : 'text-amber-900'} mb-1 transition-colors duration-1000`}>ヒント</div>
                                            <p className={`text-sm ${colors.card} transition-colors duration-1000`}>
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
                <section className={`${
                    timeOfDay === 'night'
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600'
                        : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-900/30'
                } border-4 rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300`}>
                    <h3 className={`text-xl sm:text-2xl font-black ${timeOfDay === 'night' ? 'text-green-300' : 'text-green-900'} mb-4 flex items-center gap-2 transition-colors duration-1000`}>
                        💡 攻略のヒント
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className={`${
                            timeOfDay === 'night' 
                                ? 'bg-slate-700/80 border-slate-500' 
                                : 'bg-white/80 border-green-300'
                        } p-4 rounded-xl border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">🎯</div>
                            <div className={`font-bold ${colors.card} mb-1 transition-colors duration-1000`}>具体的な数値が強い</div>
                            <div className={`text-sm ${colors.cardMuted} transition-colors duration-1000`}>「年収」「学歴」「経験年数」など数字を入れるとAIの評価UP！</div>
                        </div>
                        <div className={`${
                            timeOfDay === 'night' 
                                ? 'bg-slate-700/80 border-slate-500' 
                                : 'bg-white/80 border-green-300'
                        } p-4 rounded-xl border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">🔍</div>
                            <div className={`font-bold ${colors.card} mb-1 transition-colors duration-1000`}>比較表現を使おう</div>
                            <div className={`text-sm ${colors.cardMuted} transition-colors duration-1000`}>「普通は〜」「まだ〜してるの？」などの比較が効果的！</div>
                        </div>
                        <div className={`${
                            timeOfDay === 'night' 
                                ? 'bg-slate-700/80 border-slate-500' 
                                : 'bg-white/80 border-green-300'
                        } p-4 rounded-xl border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">😏</div>
                            <div className={`font-bold ${colors.card} mb-1 transition-colors duration-1000`}>鼻につく表現</div>
                            <div className={`text-sm ${colors.cardMuted} transition-colors duration-1000`}>AIは「具体的で鼻につく」表現を高く評価する傾向あり</div>
                        </div>
                        <div className={`${
                            timeOfDay === 'night' 
                                ? 'bg-slate-700/80 border-slate-500' 
                                : 'bg-white/80 border-green-300'
                        } p-4 rounded-xl border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                            <div className="text-3xl mb-2 transition-transform duration-300 hover:scale-110">🎲</div>
                            <div className={`font-bold ${colors.card} mb-1 transition-colors duration-1000`}>RISKYルートは慎重に</div>
                            <div className={`text-sm ${colors.cardMuted} transition-colors duration-1000`}>一発逆転のチャンスだけど、滑落のリスクも忘れずに！</div>
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
