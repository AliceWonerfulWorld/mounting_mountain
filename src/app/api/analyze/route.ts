export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { MountResult } from "@/types/game";

type LlmOut = {
  mountScore: number;
  labels: string[];
  rewrite: string;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/**
 * 🔹 fallback判定（APIキー無しでも動く）
 */
function fallbackAnalyze(text: string): MountResult & { source: string } {
  const mountScore = clamp01(text.length / 60);
  const altitude = Math.round(mountScore * 8848);

  return {
    mountScore,
    altitude,
    labels:
      altitude > 6000
        ? ["数値", "比較"]
        : altitude > 3000
        ? ["比較"]
        : ["弱め"],
    rewrite: "（fallback）もう少し柔らかく言うといいかも！",
    source: "fallback",
  };
}

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // 🔥 APIキーが無い場合はfallback
    if (!apiKey) {
      console.warn("OPENAI_API_KEY not found. Using fallback.");
      return NextResponse.json(fallbackAnalyze(text));
    }

    // 🔥 ここからOpenAI判定
    const openai = new OpenAI({ apiKey });

    const prompt = `
次の文章の「マウンティング度」を判定してください。
必ずJSONのみで出力してください（前後に説明文は不要）。

ルール:
- mountScore: 0.0〜1.0
- labels: マウントの種類（例: ["数値","比較","皮肉","努力"]）
- rewrite: 意図を保ちつつ角を取った言い換え

文章:
${JSON.stringify(text)}

出力例:
{"mountScore":0.78,"labels":["数値","比較"],"rewrite":"より柔らかい言い方にすると〜"}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You must output ONLY valid JSON object." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(content) as Partial<LlmOut>;

    const mountScore = clamp01(Number(parsed.mountScore ?? 0));
    const altitude = Math.round(mountScore * 8848);

    const result: MountResult & { source: string } = {
      mountScore,
      altitude,
      labels: Array.isArray(parsed.labels) ? parsed.labels.map(String) : [],
      rewrite: typeof parsed.rewrite === "string" ? parsed.rewrite : "",
      source: "openai",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/analyze] error:", error);

    // 🔥 万が一OpenAI側で失敗してもfallbackで返す
    try {
      const { text } = (await req.json()) as { text: string };
      return NextResponse.json(fallbackAnalyze(text));
    } catch {
      return NextResponse.json(
        { error: "解析に失敗しました（fallbackも失敗）" },
        { status: 500 }
      );
    }
  }
}
