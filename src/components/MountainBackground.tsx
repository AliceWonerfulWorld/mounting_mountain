"use client";

import { useEffect, useState } from "react";

type TimeOfDay = "morning" | "day" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 11) return "morning";
    if (hour >= 11 && hour < 16) return "day";
    if (hour >= 16 && hour < 19) return "evening";
    return "night";
}

const backgrounds = {
    morning: {
        gradient: "from-orange-300 via-pink-200 to-sky-300",
        mountains: {
            far: { color: "from-purple-400 via-purple-300", opacity: "opacity-30" },
            mid: { color: "from-indigo-400 via-indigo-300", opacity: "opacity-35" },
            near: { color: "from-orange-400 via-orange-300", opacity: "opacity-45" },
            front: { color: "from-amber-500 via-amber-400", opacity: "opacity-55" },
            peak: { color: "from-indigo-500 via-indigo-400 to-pink-200", opacity: "opacity-65" }
        }
    },
    day: {
        gradient: "from-sky-400 via-blue-200 to-green-100",
        mountains: {
            far: { color: "from-blue-400 via-blue-300", opacity: "opacity-30" },
            mid: { color: "from-cyan-500 via-cyan-400", opacity: "opacity-40" },
            near: { color: "from-emerald-600 via-emerald-500", opacity: "opacity-50" },
            front: { color: "from-green-700 via-green-600", opacity: "opacity-60" },
            peak: { color: "from-slate-600 via-slate-500 to-white", opacity: "opacity-70" }
        }
    },
    evening: {
        gradient: "from-orange-500 via-pink-400 to-purple-300",
        mountains: {
            far: { color: "from-purple-600 via-purple-500", opacity: "opacity-35" },
            mid: { color: "from-orange-600 via-orange-500", opacity: "opacity-45" },
            near: { color: "from-red-700 via-red-600", opacity: "opacity-55" },
            front: { color: "from-amber-800 via-amber-700", opacity: "opacity-65" },
            peak: { color: "from-slate-700 via-slate-600 to-orange-300", opacity: "opacity-70" }
        }
    },
    night: {
        gradient: "from-indigo-900 via-purple-800 to-blue-900",
        mountains: {
            far: { color: "from-slate-800 via-slate-700", opacity: "opacity-25" },
            mid: { color: "from-slate-700 via-slate-600", opacity: "opacity-30" },
            near: { color: "from-slate-900 via-slate-800", opacity: "opacity-40" },
            front: { color: "from-gray-900 via-gray-800", opacity: "opacity-50" },
            peak: { color: "from-slate-900 via-slate-800 to-blue-200", opacity: "opacity-60" }
        }
    }
};

export function MountainBackground() {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");

    useEffect(() => {
        setTimeOfDay(getTimeOfDay());
        
        // 1分ごとに時間帯をチェック
        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const theme = backgrounds[timeOfDay];

    return (
        <>
            {/* グラデーション背景 */}
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} transition-colors duration-1000`} />

            {/* 山の背景 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* 遠景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[500px] ${theme.mountains.far.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.far.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 5% 50%, 12% 58%, 18% 42%, 25% 52%, 32% 38%, 40% 48%, 48% 32%, 55% 45%, 62% 28%, 70% 42%, 78% 25%, 85% 38%, 92% 22%, 100% 35%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 中景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[400px] ${theme.mountains.mid.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.mid.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 8% 42%, 15% 52%, 23% 35%, 32% 45%, 42% 28%, 52% 38%, 62% 25%, 72% 35%, 82% 22%, 90% 32%, 100% 20%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 近景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[320px] ${theme.mountains.near.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.near.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 10% 35%, 20% 45%, 30% 25%, 40% 38%, 50% 18%, 60% 32%, 70% 22%, 80% 35%, 90% 25%, 100% 32%, 100% 100%)'
                         }}>
                    </div>
                    {/* 山の陰影 */}
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-br from-transparent via-black/20 to-black/30 transition-opacity duration-1000"
                         style={{
                             clipPath: 'polygon(0% 100%, 10% 35%, 20% 45%, 30% 25%, 40% 38%, 50% 18%, 60% 32%, 70% 22%, 80% 35%, 90% 25%, 100% 32%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 最前景の山々 */}
                <div className={`absolute bottom-0 left-0 right-0 h-[240px] ${theme.mountains.front.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.front.color} to-transparent`}
                         style={{
                             clipPath: 'polygon(0% 100%, 15% 45%, 25% 55%, 35% 35%, 45% 48%, 55% 28%, 65% 42%, 75% 32%, 85% 45%, 95% 35%, 100% 42%, 100% 100%)'
                         }}>
                    </div>
                    {/* 最前景の山の陰影 */}
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-br from-transparent via-black/25 to-black/40 transition-opacity duration-1000"
                         style={{
                             clipPath: 'polygon(0% 100%, 15% 45%, 25% 55%, 35% 35%, 45% 48%, 55% 28%, 65% 42%, 75% 32%, 85% 45%, 95% 35%, 100% 42%, 100% 100%)'
                         }}>
                    </div>
                </div>

                {/* 雪を被った最高峰（中央のランドマーク） */}
                <div className={`absolute bottom-0 left-[40%] w-[20%] h-[280px] ${theme.mountains.peak.opacity} transition-opacity duration-1000`}>
                    <div className={`absolute bottom-0 w-full h-full bg-gradient-to-t ${theme.mountains.peak.color}`}
                         style={{
                             clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                         }}>
                    </div>
                    {/* 雪の輝き */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-gradient-to-b from-white/90 to-transparent blur-sm transition-opacity duration-1000"
                         style={{
                             clipPath: 'polygon(50% 0%, 20% 100%, 80% 100%)'
                         }}>
                    </div>
                </div>

                {/* 夜の場合は星を追加 */}
                {timeOfDay === "night" && (
                    <>
                        {/* 星空 */}
                        <div className="absolute inset-0 animate-pulse" style={{ animationDuration: '4s' }}>
                            {[...Array(50)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 60}%`,
                                        opacity: Math.random() * 0.8 + 0.2,
                                        animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`
                                    }}
                                />
                            ))}
                        </div>
                        {/* 流れ星 */}
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={`shooting-${i}`}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                    left: `${20 + Math.random() * 60}%`,
                                    top: `${Math.random() * 30}%`,
                                    boxShadow: '0 0 4px 2px rgba(255,255,255,0.8)',
                                    animation: `shootingStar ${3 + i * 2}s linear infinite`,
                                    animationDelay: `${i * 4}s`
                                }}
                            />
                        ))}
                    </>
                )}

                {/* 朝の場合は太陽光線と鳥 */}
                {timeOfDay === "morning" && (
                    <>
                        {/* 太陽光線 */}
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={`ray-${i}`}
                                className="absolute top-0 right-[20%] origin-bottom-right bg-gradient-to-b from-yellow-300/20 to-transparent"
                                style={{
                                    width: '2px',
                                    height: '40%',
                                    transform: `rotate(${-30 + i * 10}deg)`,
                                    animation: `fadeInOut ${4 + i * 0.5}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.3}s`
                                }}
                            />
                        ))}
                        {/* 鳥のシルエット */}
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={`bird-${i}`}
                                className="absolute text-xl opacity-60"
                                style={{
                                    left: `${-10 + i * 5}%`,
                                    top: `${15 + i * 8}%`,
                                    animation: `flyAcross ${15 + i * 5}s linear infinite`,
                                    animationDelay: `${i * 3}s`
                                }}
                            >
                                🦅
                            </div>
                        ))}
                    </>
                )}

                {/* 昼の場合は雲が流れる */}
                {timeOfDay === "day" && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={`cloud-${i}`}
                                className="absolute opacity-70"
                                style={{
                                    fontSize: `${2 + Math.random() * 2}rem`,
                                    left: `${-20 + i * 15}%`,
                                    top: `${10 + i * 10}%`,
                                    animation: `floatAcross ${25 + i * 8}s linear infinite`,
                                    animationDelay: `${i * 4}s`
                                }}
                            >
                                ☁️
                            </div>
                        ))}
                    </>
                )}

                {/* 夕方の場合は夕日の光線 */}
                {timeOfDay === "evening" && (
                    <>
                        {/* 夕日の光線 */}
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={`sunset-ray-${i}`}
                                className="absolute top-[20%] left-[15%] origin-bottom-left bg-gradient-to-b from-orange-400/25 to-transparent"
                                style={{
                                    width: '3px',
                                    height: '50%',
                                    transform: `rotate(${-20 + i * 8}deg)`,
                                    animation: `fadeInOut ${3 + i * 0.4}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.2}s`
                                }}
                            />
                        ))}
                        {/* 夕焼け雲 */}
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={`evening-cloud-${i}`}
                                className="absolute opacity-50"
                                style={{
                                    fontSize: `${2.5 + Math.random() * 1.5}rem`,
                                    left: `${-10 + i * 20}%`,
                                    top: `${15 + i * 12}%`,
                                    animation: `floatAcross ${30 + i * 10}s linear infinite`,
                                    animationDelay: `${i * 5}s`,
                                    filter: 'hue-rotate(330deg)'
                                }}
                            >
                                ☁️
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* アニメーション用のスタイル */}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
                @keyframes shootingStar {
                    0% {
                        transform: translate(0, 0);
                        opacity: 1;
                    }
                    70% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-300px, 300px);
                        opacity: 0;
                    }
                }
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.3; }
                }
                @keyframes flyAcross {
                    0% {
                        transform: translateX(0) translateY(0);
                    }
                    100% {
                        transform: translateX(120vw) translateY(-30px);
                    }
                }
                @keyframes floatAcross {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(120vw);
                    }
                }
            `}</style>
        </>
    );
}
