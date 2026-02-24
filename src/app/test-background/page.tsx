"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TimedBackground } from "@/components/background/TimedBackground";

/**
 * TimedBackground コンポーネントのテストページ
 * Phase 2: 新しいコンポーネントの動作確認用
 * 
 * アクセス方法: http://localhost:3000/test-background
 */
export default function TestBackgroundPage() {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [cloudCount, setCloudCount] = useState<number | null>(null);

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

  return (
    <div className="relative min-h-screen overflow-hidden text-gray-900">
      {/* TimedBackground コンポーネントをテスト */}
      <TimedBackground />

      {/* テスト用のコンテンツ */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mb-8 rounded-2xl border-2 border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-md">
          <h1 className="mb-4 text-4xl font-black text-gray-900">
            TimedBackground テスト
          </h1>
          <p className="mb-6 text-lg text-gray-700">
            現在の背景は<strong>昼（Day）</strong>の設定です
          </p>
          
          <div className="mb-6 space-y-2 text-sm text-gray-600">
            <p>✅ 背景グラデーション: from-sky-400 via-blue-300 to-green-200</p>
            <p>✅ 太陽: 右上、脈動アニメーション</p>
            <p>✅ 雲: 4つ（画面サイズによって調整）、横移動アニメーション</p>
            <p>✅ パフォーマンス最適化: GPU合成、React.memo</p>
          </div>

          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h2 className="mb-2 font-bold text-blue-900">確認ポイント</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>背景グラデーションが表示されているか</li>
              <li>太陽が右上にあり、ゆっくり脈動しているか</li>
              <li>雲が左から右へ流れているか（4つ）</li>
              <li>アニメーションがスムーズか（60FPS）</li>
              <li>モバイルでも正常に表示されるか</li>
            </ul>
          </div>

          <div className="mb-6 rounded-lg bg-yellow-50 p-4">
            <h2 className="mb-2 font-bold text-yellow-900">パフォーマンス確認方法</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-yellow-800">
              <li>Chrome DevTools を開く（F12）</li>
              <li>Performance タブで記録開始</li>
              <li>3秒後に停止</li>
              <li>FPS が 60 に近いか確認</li>
              <li>Layers タブで GPU 合成を確認</li>
            </ol>
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
