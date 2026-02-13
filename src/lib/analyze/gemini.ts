import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MountResult } from "@/types/game";
import { clamp01 } from "@/lib/utils";

const API_KEY = process.env.GEMINI_API_KEY;
const MAX_RETRIES = 5;
const INITIAL_WAIT_MS = 600;
const MAX_WAIT_MS = 8000;
const JITTER_MS = 250;

type GeminiOut = {
    mountScore: number;
    labels: string[];
    rewrite: string;
};

// ユーティリティ: 指定ミリ秒待機
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ユーティリティ: JSON文字列の抽出とパース
function safeJsonParse<T>(text: string): T {
    // 1. マークダウン記法の除去 (```json ... ```)
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1]);
        } catch {
            // 失敗したら次へ
        }
    }

    // 2. 最初の中括弧 { から 最後の中括弧 } までを抽出
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(jsonCandidate);
        } catch {
            // 失敗したら次へ
        }
    }

    // 3. そのままパース
    return JSON.parse(text);
}

// 指数バックオフ + ジッタ付きのリトライ関数
async function generateWithBackoff(model: any, prompt: string, retries = 0): Promise<string> {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        if (retries >= MAX_RETRIES) {
            throw error;
        }

        // 429 (Resource Exhausted) または 503 (Service Unavailable) の場合のみリトライ
        const status = error.status || error.response?.status;
        const isRateLimit = status === 429 || error.message?.includes("429") || error.message?.includes("Resource exhausted");
        const isServiceUnavailable = status === 503;

        if (isRateLimit || isServiceUnavailable) {
            console.warn(`Gemini API 429/503 detected. Retrying... (${retries + 1}/${MAX_RETRIES})`);

            // Retry-After ヘッダがあれば優先
            // (GoogleGenerativeAIError の詳細構造に依存するが、一般的には headers がある場合がある)
            // ここでは簡易的に指数バックオフを使用
            let waitMs = Math.min(INITIAL_WAIT_MS * Math.pow(2, retries), MAX_WAIT_MS);

            // ジッタを加える
            waitMs += Math.random() * JITTER_MS;

            await wait(waitMs);
            return generateWithBackoff(model, prompt, retries + 1);
        }

        throw error;
    }
}

export async function analyzeWithGemini(text: string): Promise<MountResult & { source: string }> {
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    // モデル名を指定された形式に統一
    const model = genAI.getGenerativeModel({
        model: "models/gemini-2.0-flash-lite-001",
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const prompt = `
次の文章の「マウンティング度」を判定してください。
必ずJSONのみで出力してください。

# ルール
- mountScore: 0.0〜1.0 (数値)
- labels: マウントの種類 (例: ["数値","比較","皮肉","努力","自慢","知識"])
- rewrite: 意図を保ちつつ角を取った言い換え (日本語)

# 対象の文章
${JSON.stringify(text)}

# 出力スキーマ
{
  "mountScore": number,
  "labels": string[],
  "rewrite": string
}
  `.trim();

    try {
        // リトライ付きで生成
        const textRes = await generateWithBackoff(model, prompt);

        // 堅牢なパース
        const parsed = safeJsonParse<Partial<GeminiOut>>(textRes);

        const mountScore = clamp01(Number(parsed.mountScore ?? 0));
        const altitude = Math.round(mountScore * 8848);

        return {
            mountScore,
            altitude,
            labels: Array.isArray(parsed.labels) ? parsed.labels.map(String) : [],
            rewrite: typeof parsed.rewrite === "string" ? parsed.rewrite : "",
            source: "gemini",
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error; // 呼び出し元でfallbackさせる
    }
}
