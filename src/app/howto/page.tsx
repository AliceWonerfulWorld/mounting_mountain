"use client";

import Link from "next/link";
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
    Home
} from "lucide-react";

export default function HowToPage() {
    return (
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-950 via-sky-900 via-sky-700 to-sky-400">

            {/* 🌫 空気感レイヤー（追加） */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl" />
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto space-y-12 relative z-10">

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 via-white to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                        遊び方ガイド
                    </h1>
                    <p className="text-xl text-blue-200/80">
                        MountAI（マウンティング・マウンテン）の歩き方
                    </p>
                </header>

                {/* 1. 概要: MountAIとは */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Mountain className="text-blue-400" />
                                MountAIとは？
                            </h2>
                            <p className="text-slate-300 leading-relaxed">
                                日常会話に潜む<span className="font-bold text-yellow-400">「マウント（優位性の誇示）」</span>をAIが判定し、
                                そのマウント度合いを<span className="font-bold text-blue-400">「標高（メートル）」</span>として可視化するゲームです。
                                <br className="hidden md:block" />
                                より高く、より鋭いマウントを取り、エベレスト級の標高を目指しましょう。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. 基本の流れ */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 px-2">
                        <ArrowRight className="text-green-400" />
                        ゲームの流れ
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                            { icon: MessageSquare, label: "お題", desc: "お題が出題されます" },
                            { icon: Brain, label: "入力", desc: "マウント発言を入力" },
                            { icon: Zap, label: "AI判定", desc: "AIがマウント度を解析" },
                            { icon: Mountain, label: "成長", desc: "山が隆起します" },
                            { icon: Trophy, label: "スコア", desc: "標高が決定！" },
                        ].map((step, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                <step.icon className="w-8 h-8 mb-3 text-blue-400" />
                                <div className="font-bold text-white mb-1">{step.label}</div>
                                <div className="text-xs text-slate-400">{step.desc}</div>

                                {i < 4 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-600 z-10">
                                        ▶
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. ソロモード詳解 */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 px-2">
                        <Zap className="text-yellow-400" />
                        ソロモード攻略
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ルート選択 */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                🛣️ ルート選択
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-900/50 rounded-lg">
                                    <Shield className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                    <div>
                                        <div className="font-bold text-green-400">SAFE (×0.7)</div>
                                        <div className="text-sm text-green-200/70">安全ルート。滑落しません。保険が1つ回復します。</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                                    <Mountain className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                                    <div>
                                        <div className="font-bold text-blue-400">NORMAL (×1.0)</div>
                                        <div className="text-sm text-blue-200/70">標準ルート。バランスが良い選択。</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                                    <Skull className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                                    <div>
                                        <div className="font-bold text-red-500">RISKY (×1.3)</div>
                                        <div className="text-sm text-red-200/70">
                                            危険ルート。高得点ですが、AIの評価が低いと<span className="font-bold text-red-400">滑落</span>します。
                                            <br />
                                            <span className="text-xs mt-1 block text-red-300">※滑落すると標高が2000mに固定されます。保険があれば防げます。</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 要素解説 */}
                        <div className="space-y-6">
                            {/* 天候 */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <CloudSun className="text-sky-400" />
                                    天候ボーナス
                                </h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    天候に合ったマウントを取るとボーナス（+20%）が発生します。
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-slate-800 p-2 rounded text-white">☀️"晴天" 「数値」を含むと+20%</div>
                                    <div className="bg-slate-800 p-2 rounded text-white">🌪"強風" 「比較」を含むと+20%</div>
                                    <div className="bg-slate-800 p-2 rounded text-white">❄️"吹雪" 「皮肉」を含むと+20%</div>
                                </div>
                            </div>

                            {/* ミッション */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Trophy className="text-yellow-500" />
                                    ミッション & 評価
                                </h3>
                                <p className="text-sm text-slate-300">
                                    ゲームごとに「合計15000m登れ」などのミッションが発生。
                                    クリアすると結果画面で高評価（★★★）が得られます。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. 対戦モード */}
                <section className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                        <Swords className="text-purple-400" />
                        ローカル対戦（Beta）
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-black/40 p-4 rounded-xl">
                            <div className="text-purple-300 font-bold mb-2">1. 交互に入力</div>
                            <div className="text-sm text-slate-400">プレイヤー同士で交代しながらマウントを取ります。</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl">
                            <div className="text-purple-300 font-bold mb-2">2. ラウンド勝者</div>
                            <div className="text-sm text-slate-400">各ラウンドで標高が高かった方に<span className="text-yellow-400">+1000m</span>のボーナス！</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl">
                            <div className="text-purple-300 font-bold mb-2">3. 合計勝負</div>
                            <div className="text-sm text-slate-400">最終的な合計標高が高い方が勝者（Winner）です。</div>
                        </div>
                    </div>
                </section>


                {/* 5. Tips / Footer Link */}
                <section className="text-center space-y-8 pt-8">
                    <div className="bg-blue-900/20 border border-blue-500/30 inline-block p-6 rounded-2xl text-left max-w-2xl mx-auto">
                        <h3 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            攻略のヒント
                        </h3>
                        <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                            <li>AIは「具体的で」「鼻につく」表現を高く評価します。</li>
                            <li>「年収」「学歴」「経験年数」などの数値は特に有効です。</li>
                            <li>「普通は〜だよね？」「まだ〜してるの？」等の比較も強力です。</li>
                            <li>RISKYルートは一発逆転のチャンスですが、滑落（確定2000m）のリスクを忘れずに。</li>
                        </ul>
                    </div>

                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <Home className="w-5 h-5" />
                            タイトルに戻る
                        </Link>
                    </div>

                </section>
            </div>


            {/* 🌄 山（ページ最下部・重なり版） */}
            <div className="pointer-events-none mt-24 relative">

                <div className="absolute bottom-0 w-full h-[80vh] bg-white/5
                    [clip-path:polygon(0%_100%,8%_62%,18%_78%,28%_58%,38%_72%,50%_48%,62%_70%,74%_44%,86%_64%,100%_52%,100%_100%)]" />

                <div className="absolute bottom-0 w-full h-[45vh] bg-white/10
                    [clip-path:polygon(0%_100%,12%_55%,22%_70%,34%_42%,46%_60%,58%_34%,70%_52%,82%_26%,92%_46%,100%_38%,100%_100%)]" />

                <div className="absolute bottom-0 w-full h-[30vh] bg-white/20
                    [clip-path:polygon(0%_100%,18%_38%,34%_58%,50%_26%,66%_46%,82%_18%,100%_36%,100%_100%)]" />
            </div>



        </main>
    );
}
