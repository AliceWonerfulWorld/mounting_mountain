export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/analyze/gemini";
import { fallbackAnalyze } from "@/lib/analyze/fallback";

// 同一プロセス内での同時実行数を簡易的に制限するためのカウンタ
// 注意: Vercelなどのサーバレス環境ではLambdaインスタンスごとにメモリが独立しているため、
// グローバルな制限としては機能しません。あくまで単一インスタンス内でのバースト防止用です。
let inFlight = 0;
const MAX_CONCURRENT = 1;

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Gemini APIキーがある場合はGeminiで解析
    if (process.env.GEMINI_API_KEY) {
      // 簡易同時実行ガード
      if (inFlight >= MAX_CONCURRENT) {
        console.warn("Too many in-flight requests. Returning 429 Busy.");
        // クライアント側でエラーハンドリングさせるか、あるいはここでfallbackするかは要件次第だが、
        // ユーザー指示「429 Busyを返す」に従う。
        return NextResponse.json(
          { error: "Server Busy (Rate Limit Protection)" },
          { status: 429 }
        );
      }

      inFlight++;
      try {
        const result = await analyzeWithGemini(text);
        return NextResponse.json(result);
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
    return NextResponse.json(fallbackAnalyze(text));
  } catch (error) {
    console.error("[/api/analyze] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
