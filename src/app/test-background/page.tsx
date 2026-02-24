"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TimedBackground } from "@/components/background/TimedBackground";
import type { TimeOfDay } from "@/lib/timeOfDayConfig";

/**
 * TimedBackground コンポーネントのテストページ
 * Phase 4: 各時間帯の背景を確認
 * 
 * アクセス方法: http://localhost:3000/test-background
 */
export default function TestBackgroundPage() {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [cloudCount, setCloudCount] = useState<number | null>(null);
  const [debugTime, setDebugTime] = useState<TimeOfDay | undefined>(undefined);

  useEffect(() => {
    // クライアント側でのみ実行
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth);
      const width = window.innerWidth;
      if (width < 768) {
        setCloudCount(2);
      } else if (width < 1024) {
        setCloudCount(3);
      } else {
        setCloudCount(4);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const timeLabels: Record<TimeOfDay, string> = {
    dawn: "朝焼け (5:00-6:30)",
    morning: "朝 (6:30-11:00)",
    day: "昼 (11:00-15:00)",
    afternoon: "午後 (15:00-17:30)",
    sunset: "夕焼け (17:30-19:00)",
    night: "夜 (19:00-5:00)",
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-gray-900">
      {/* TimedBackground コンポーネントをテスト */}
      <TimedBackground debugTimeOfDay={debugTime} />

      {/* テスト用のコンテンツ */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-8">
        <div className="mb-8 rounded-2xl border-2 border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-md max-w-2xl">
          <h1 className="mb-4 text-4xl font-black text-gray-900">
            TimedBackground テスト
          </h1>
          <p className="mb-6 text-lg text-gray-700">
            現在の背景: <strong>{debugTime ? timeLabels[debugTime] : '自動（現在時刻）'}</strong>
          </p>
          
          {/* 時間帯切り替えボタン */}
          <div className="mb-6 rounded-lg bg-purple-50 p-4">
            <h2 className="mb-3 font-bold text-purple-900">時間帯切り替え</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDebugTime(undefined)}
                className={`rounded px-3 py-2 text-sm font-bold transition-all ${
                  debugTime === undefined
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50'
                }`}
              >
                自動
              </button>
              {(Object.keys(timeLabels) as TimeOfDay[]).map((time) => (
                <button
                  key={time}
                  onClick={() => setDebugTime(time)}
                  className={`rounded px-3 py-2 text-sm font-bold transition-all ${
                    debugTime === time
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  {timeLabels[time]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2 text-sm text-gray-600">
            <p>✅ 背景グラデーション: 時間帯に応じて変化</p>
            <p>✅ 太陽/月: 位置と色が時間帯で変化</p>
            <p>✅ 雲: 色が時間帯で変化</p>
            <p>✅ パフォーマンス最適化: GPU合成、React.memo</p>
          </div>

          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h2 className="mb-2 font-bold text-blue-900">Phase 4.1: Dawn（朝焼け）確認ポイント</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>背景: オレンジ→ピンク→紫のグラデーション</li>
              <li>太陽: 地平線近く（右下）、オレンジ色</li>
              <li>雲: ピンク〜オレンジに染まる</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              元のページに戻る
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border-2 border-blue-600 px-6 py-3 font-bold text-blue-600 transition-all hover:bg-blue-50"
            >
              リロード
            </button>
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="mt-4 rounded-lg border border-gray-300 bg-white/90 p-4 text-xs text-gray-600">
          <p><strong>画面幅:</strong> {windowWidth !== null ? `${windowWidth}px` : '計算中...'}</p>
          <p><strong>雲の数:</strong> {cloudCount !== null ? cloudCount : '計算中...'}</p>
        </div>
      </div>
    </div>
  );
}
