"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { GameState, Round } from "@/types/game";
import { PROMPTS } from "@/lib/prompts";
import { MountainView } from "@/components/MountainView";
import { pickN } from "@/lib/random";

function createRounds(promptTexts: string[], roundCount: number): Round[] {
  return promptTexts.slice(0, roundCount).map((p, i) => ({
    id: `r${i + 1}`,
    prompt: p,
  }));
}

export default function SoloPage() {
  // ラウンド数（まずは3で固定がデモ安定）
  const ROUND_COUNT = 3;

  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    // 初期化時にランダムに選ぶ
    const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
    const rounds = createRounds(selectedPrompts, ROUND_COUNT);
    setGame({
      mode: "solo",
      status: "playing",
      roundIndex: 0,
      prompts: rounds.map((r) => r.prompt),
      players: [
        {
          id: "p1",
          name: "Player 1",
          totalScore: 0,
          rounds,
        },
      ],
    });
  }, []);

  const [text, setText] = useState("");
  const [lastResult, setLastResult] = useState<Round | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!game) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentRound = game.players[0].rounds[game.roundIndex];

  const isFinished = game.status === "finished";


  async function submitRound() {
    if (!text.trim() || isFinished || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`API Error: ${res.status} ${msg}`);
      }

      const result = await res.json(); // MountResult想定

      setGame((prev) => {
        if (!prev) return null;
        const next = structuredClone(prev);

        const player = next.players[0];
        const round = player.rounds[next.roundIndex];

        round.inputText = text.trim();
        round.result = result;

        player.totalScore += result.altitude;

        // 次ラウンドへ
        if (next.roundIndex + 1 >= player.rounds.length) {
          next.status = "finished";
        } else {
          next.roundIndex += 1;
        }

        // 直近の結果を保存 (現在のround情報をコピー)
        setLastResult(structuredClone(round));

        return next;
      });

      setText("");
      setIsHistoryOpen(false); // 判定後は履歴を閉じて結果に集中させる
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function resetGame() {
    // リセット時もランダムに再抽選
    const selectedPrompts = pickN(PROMPTS, ROUND_COUNT).map((p) => p.text);
    const rounds = createRounds(selectedPrompts, ROUND_COUNT);
    setGame({
      mode: "solo",
      status: "playing",
      roundIndex: 0,
      prompts: rounds.map((r) => r.prompt),
      players: [
        {
          id: "p1",
          name: "Player 1",
          totalScore: 0,
          rounds,
        },
      ],
    });
    setText("");
    setLastResult(null);
    setIsHistoryOpen(false);
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">🏔 マウンティングマウンテン（ソロ）</h1>
        <p className="text-sm text-gray-600">
          お題に沿ってマウント発言を入力！標高が高いほどスコアが伸びる。
        </p>
      </header>

      {/* Block A: プレイカード / ゲーム終了表示 */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="font-semibold text-lg">
            {!isFinished
              ? `ラウンド ${Math.min(game.roundIndex + 1, ROUND_COUNT)} / ${ROUND_COUNT}`
              : "結果発表"}
          </div>
          <div className="text-sm font-mono">
            合計標高: <span className="font-bold text-lg">{game.players[0].totalScore}</span> m
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">エラー: {error}</div>}

        {!isFinished ? (
          <>
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Theme</div>
              <div className="text-xl font-bold p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                {currentRound.prompt}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">You</div>
              <textarea
                className="w-full min-h-32 rounded-lg border p-4 text-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                placeholder="ここにマウント発言を入力..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 py-3 rounded-lg bg-black text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all dark:bg-white dark:text-black"
                disabled={!text.trim() || loading}
                onClick={submitRound}
              >
                {loading ? "判定中..." : "マウントを取る！"}
              </button>

              <button
                className="px-4 py-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={resetGame}
                title="最初からやり直す"
              >
                ↺
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6 text-center py-6">
            <div className="text-3xl font-bold">🎉 Game Set!</div>
            <div>
              <div className="text-sm text-gray-500">最終合計標高</div>
              <div className="text-5xl font-black">{game.players[0].totalScore} m</div>
            </div>
            <button
              className="w-full py-3 rounded-lg bg-black text-white font-bold hover:opacity-90 dark:bg-white dark:text-black"
              onClick={resetGame}
            >
              もう一度挑戦する
            </button>
            <Link
              href="/"
              className="block w-full py-3 text-center rounded-lg border hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              タイトルに戻る
            </Link>
          </div>
        )}
      </section>

      {/* Block B: 直近の判定結果 (Last Result) */}
      {lastResult && lastResult.result && (
        <section className="bg-stone-50 dark:bg-stone-900 rounded-xl border-2 border-stone-200 dark:border-stone-700 p-6 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="text-center mb-4">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest">Latest Judgment</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <MountainView altitude={lastResult.result.altitude} size={160} />
            </div>

            <div className="flex-1 space-y-3 w-full text-center md:text-left">
              <div>
                <div className="text-4xl font-black leading-none">{lastResult.result.altitude} m</div>
                <div className="text-sm text-gray-500">Mount Score: {lastResult.result.mountScore.toFixed(2)}</div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {lastResult.result.labels.map((label) => (
                  <span key={label} className="px-2 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300">
                    {label}
                  </span>
                ))}
              </div>

              <div className="bg-white dark:bg-black p-3 rounded border text-sm text-left">
                <div className="font-bold text-xs text-gray-400 mb-1">言い換え</div>
                {lastResult.result.rewrite}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Block C: 履歴 (History) */}
      <section className="space-y-4">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-800 transition-colors px-2"
        >
          <span>📜 これまでの履歴</span>
          <span>{isHistoryOpen ? "閉じる ▲" : "開く ▼"}</span>
        </button>

        {isHistoryOpen && (
          <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
            {game.players[0].rounds.filter(r => r.result).map((r) => (
              <div key={r.id} className="rounded-lg border p-4 bg-gray-50 dark:bg-zinc-900 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{r.prompt}</span>
                  <span className="font-mono font-bold">{r.result?.altitude} m</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-300">
                  {r.inputText}
                </div>
              </div>
            ))}
            {game.players[0].rounds.filter(r => r.result).length === 0 && (
              <div className="text-center text-sm text-gray-400 py-4">まだ履歴はありません</div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
