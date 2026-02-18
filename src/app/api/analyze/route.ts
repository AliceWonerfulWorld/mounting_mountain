export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/analyze/gemini";
import { fallbackAnalyze } from "@/lib/analyze/fallback";
import { validateAiOutput } from "@/lib/analyze/validator";
import type { RouteType } from "@/lib/analyze/altitude";

// 同一プロセス内での同時実行数を簡易的に制限するためのカウンタ
// 注意: Vercelなどのサーバレス環境ではLambdaインスタンスごとにメモリが独立しているため、
// グローバルな制限としては機能しません。あくまで単一インスタンス内でのバースト防止用です。
let inFlight = 0;
const MAX_CONCURRENT = 1;

export async function POST(req: Request) {
  try {
    const { text, route = "NORMAL", mode = "solo" } = (await req.json()) as {
      text: string;
      route?: RouteType;
      mode?: "solo" | "versus";
    };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Gemini APIキーがある場合はGeminiで解析
    if (process.env.GEMINI_API_KEY) {
      // 簡易同時実行ガード
      if (inFlight >= MAX_CONCURRENT) {
        console.warn("Too many in-flight requests. Returning 429 Busy.");
        return NextResponse.json(
          { error: "Server Busy (Rate Limit Protection)" },
          { status: 429 }
        );
      }

      inFlight++;
      try {
        const rawResult = await analyzeWithGemini(text, mode);
        // バリデーションを通す（routeを渡す）
        const validated = validateAiOutput(rawResult, route);
        return NextResponse.json({ ...validated, source: "gemini" });
      } catch (e) {
        console.error("Gemini analysis failed (retries exhausted), switching to fallback:", e);
        // Gemini失敗時はfallbackへ
      } finally {
        inFlight--;
      }
    } else {
      console.warn("GEMINI_API_KEY not found. Using fallback.");
    }

    // キーが無い、またはGemini失敗時はfallback
    const fallbackResult = fallbackAnalyze(text);
    // fallbackもバリデーションを通す（routeを渡す）
    const validated = validateAiOutput(fallbackResult, route);
    return NextResponse.json({ ...validated, source: "fallback" });
  } catch (error) {
    console.error("[/api/analyze] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
