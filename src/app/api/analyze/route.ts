export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { MountResult } from "@/types/game";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type LlmOut = {
  mountScore: number;
  labels: string[];
  rewrite: string;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const prompt = `
次の文章の「マウンティング度」を判定してください。
必ずJSONのみで出力してください（前後に説明文は不要）。

ルール:
- mountScore: 0.0〜1.0（小数）
- labels: マウントの種類（例: ["数値","比較","皮肉","努力"]）
- rewrite: 意図を保ちつつ角を取った言い換え

文章:
${JSON.stringify(text)}

出力JSONの例:
{"mountScore":0.78,"labels":["数値","比較"],"rewrite":"より柔らかい言い方にすると〜"}
`.trim();

    // ★ response_format でJSON出力を強制
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

    const result: MountResult = {
      mountScore,
      altitude,
      labels: Array.isArray(parsed.labels) ? parsed.labels.map(String) : [],
      rewrite: typeof parsed.rewrite === "string" ? parsed.rewrite : "",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/analyze] error:", error);
    return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
  }
}
