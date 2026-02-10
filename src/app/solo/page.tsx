"use client";

import { useMemo, useState } from "react";
import type { GameState, Round } from "@/types/game";
import { PROMPTS } from "@/lib/prompts";
import { MountainView } from "@/components/MountainView";

function createRounds(promptTexts: string[], roundCount: number): Round[] {
  return promptTexts.slice(0, roundCount).map((p, i) => ({
    id: `r${i + 1}`,
    prompt: p,
  }));
}

export default function SoloPage() {
  // ラウンド数（まずは3で固定がデモ安定）
  const ROUND_COUNT = 3;

  // PROMPTS から text だけ抜き出し（GameStateはstring[]で運用）
  const promptTexts = useMemo(() => PROMPTS.map((p) => p.text), []);

  const [game, setGame] = useState<GameState>(() => {
    const rounds = createRounds(promptTexts, ROUND_COUNT);
    return {
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
    };
  });

  const currentRound = game.players[0].rounds[game.roundIndex];
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        return next;
      });

      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function resetGame() {
    const rounds = createRounds(promptTexts, ROUND_COUNT);
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
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">🏔 マウンティングマウンテン（ソロ）</h1>
        <p className="text-sm text-gray-600">
          お題に沿ってマウント発言を入力！標高が高いほどスコアが伸びる（今はダミー判定）。
        </p>
      </header>

      <section className="rounded border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">
            ラウンド {Math.min(game.roundIndex + 1, ROUND_COUNT)} / {ROUND_COUNT}
          </div>
          {error && <div className="text-sm text-red-600">エラー: {error}</div>}
          <div className="text-sm">
            合計標高: <span className="font-semibold">{game.players[0].totalScore}</span> m
          </div>
        </div>

        {!isFinished ? (
          <>
            <div className="pt-2">
              <div className="text-sm text-gray-600">お題</div>
              <div className="font-medium">{currentRound.prompt}</div>
            </div>

            <textarea
              className="w-full min-h-28 rounded border p-3"
              placeholder="ここにマウント発言を入力"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                disabled={!text.trim() || loading}
                onClick={submitRound}
              >
                {loading ? "判定中..." : "判定して次へ"}
              </button>

              <button className="px-4 py-2 rounded border" onClick={resetGame}>
                リセット
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="text-lg font-semibold">🎉 終了！</div>
            <div>
              合計標高: <span className="font-semibold">{game.players[0].totalScore}</span> m
            </div>
            <button className="px-4 py-2 rounded bg-black text-white" onClick={resetGame}>
              もう一回やる
            </button>
          </div>
        )}
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="font-semibold">履歴</div>
        <div className="space-y-3">
          {game.players[0].rounds.map((r) => (
            <div key={r.id} className="rounded border p-3">
              <div className="text-sm text-gray-600">{r.id} お題</div>
              <div className="font-medium">{r.prompt}</div>

              <div className="pt-2 text-sm text-gray-600">入力</div>
              <div>{r.inputText ?? "（未入力）"}</div>

              <div className="pt-2 text-sm text-gray-600">結果</div>
              {r.result ? (
                <div className="flex items-start gap-4">
                  <MountainView altitude={r.result.altitude} size={120} />
                  <div className="space-y-1 flex-1">
                    <div className="text-lg font-bold">{r.result.altitude} m</div>
                    <div>スコア: {r.result.mountScore.toFixed(2)}</div>
                    <div>ラベル: {r.result.labels.join(", ")}</div>
                    <div className="pt-1">
                      <div className="font-semibold text-xs text-gray-500">言い換え</div>
                      <div className="text-sm">{r.result.rewrite}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>（未判定）</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
