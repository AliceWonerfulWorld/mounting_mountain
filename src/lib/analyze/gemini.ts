// ==========================================
// 🔄 変更: Structured Output + Zod対応
// ==========================================
import { GoogleGenerativeAI, GenerativeModel, SchemaType } from "@google/generative-ai";
import type { MountResult } from "@/types/game";
import type { LabelId } from "@/lib/labels";
import { clamp01 } from "@/lib/utils";
import { z } from "zod";

const API_KEY = process.env.GEMINI_API_KEY;
const MAX_RETRIES = 5;
const INITIAL_WAIT_MS = 600;
const MAX_WAIT_MS = 8000;
const JITTER_MS = 250;

// 🔄 変更: breakdownを削除し、confidenceを追加
type GeminiOut = {
    mountScore: number;
    confidence: number;
    labels: LabelId[];
    tip: string;
    commentary: string;
};

// 🆕 新規: Zodスキーマ定義（バリデーション用）
const LabelEnum = z.enum([
    "NUMERIC",
    "COMPARISON",
    "EFFORT",
    "AUTHORITY",
    "SARCASM",
    "CONDESCENDING",
    "BACKHANDED",
    "GATEKEEP",
]);

const GeminiOutputSchema = z.object({
    mountScore: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    labels: z.array(LabelEnum).max(5),
    tip: z.string().max(60),
    commentary: z.string().max(60),
});

// 🆕 新規: Gemini Structured Output用のスキーマ定義
// 🔧 型エラー回避のため any でキャスト（実行時は正しく動作）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RESPONSE_SCHEMA: any = {
    type: SchemaType.OBJECT,
    properties: {
        mountScore: {
            type: SchemaType.NUMBER,
            description: "マウンティング度（0.0〜1.0）",
            nullable: false,
        },
        confidence: {
            type: SchemaType.NUMBER,
            description: "判定の確信度（0.0〜1.0）",
            nullable: false,
        },
        labels: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.STRING,
                format: "enum",
                enum: [
                    "NUMERIC",
                    "COMPARISON",
                    "EFFORT",
                    "AUTHORITY",
                    "SARCASM",
                    "CONDESCENDING",
                    "BACKHANDED",
                    "GATEKEEP",
                ],
            },
            description: "該当するラベル（最大5個）",
        },
        tip: {
            type: SchemaType.STRING,
            description: "攻略ヒント（最大60文字）",
            nullable: false,
        },
        commentary: {
            type: SchemaType.STRING,
            description: "コメント（最大60文字）",
            nullable: false,
        },
    },
    required: ["mountScore", "confidence", "labels", "tip", "commentary"],
};

// ユーティリティ: 指定ミリ秒待機
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 🔄 変更: Structured Outputに対応したリトライ関数
async function generateWithBackoff(model: GenerativeModel, prompt: string, retries = 0): Promise<unknown> {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Structured Outputの場合、JSONとしてパース済みのオブジェクトが返る
        const text = response.text();
        return JSON.parse(text);
    } catch (error: unknown) {
        if (retries >= MAX_RETRIES) {
            throw error;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        const status = err.status || err.response?.status;
        const isRateLimit = status === 429 || err.message?.includes("429") || err.message?.includes("Resource exhausted");
        const isServiceUnavailable = status === 503;

        if (isRateLimit || isServiceUnavailable) {
            console.warn(`Gemini API 429/503 detected. Retrying... (${retries + 1}/${MAX_RETRIES})`);
            let waitMs = Math.min(INITIAL_WAIT_MS * Math.pow(2, retries), MAX_WAIT_MS);
            waitMs += Math.random() * JITTER_MS;
            await wait(waitMs);
            return generateWithBackoff(model, prompt, retries + 1);
        }

        throw error;
    }
}

// 🆕 新規: 安全なデフォルト値を返す関数
function getSafeDefault(): GeminiOut {
    return {
        mountScore: 0,
        confidence: 0,
        labels: [],
        tip: "",
        commentary: "判定失敗",
    };
}

// 🔄 変更: Structured Output対応版メイン関数
export async function analyzeWithGemini(
    text: string, 
    mode: "solo" | "versus" = "solo"
): Promise<Partial<MountResult> & { source: string }> {
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // 🔄 変更: temperature 0.2に下げ、responseSchemaを追加
    // 🔧 型エラー回避のため generationConfig を any でキャスト
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2, // より安定した出力のため0.2に設定
    };

    const model = genAI.getGenerativeModel({
        model: "models/gemini-2.0-flash-lite-001",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generationConfig: generationConfig as any,
    });

    // 🔄 変更: プロンプトを大幅に改善
    const prompt = mode === "solo" 
        ? buildSoloPrompt(text)
        : buildVersusPrompt(text);

    try {
        // リトライ付きで生成
        const rawOutput = await generateWithBackoff(model, prompt);

        // 🆕 新規: Zodでバリデーション
        const parseResult = GeminiOutputSchema.safeParse(rawOutput);
        
        if (!parseResult.success) {
            console.error("Gemini output validation failed:", parseResult.error);
            const safeDefault = getSafeDefault();
            return {
                mountScore: safeDefault.mountScore,
                labels: safeDefault.labels,
                tip: safeDefault.tip,
                commentary: safeDefault.commentary,
                source: "gemini",
            };
        }

        const validated = parseResult.data;

        // 🔄 変更: confidenceはログ用（MountResultには含まれない）
        console.log(`[Gemini] mountScore: ${validated.mountScore.toFixed(2)}, confidence: ${validated.confidence.toFixed(2)}`);

        return {
            mountScore: clamp01(validated.mountScore),
            labels: validated.labels.slice(0, 5), // 最大5個に制限
            tip: validated.tip.slice(0, 60),
            commentary: validated.commentary.slice(0, 60),
            source: "gemini",
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error; // 呼び出し元でfallbackさせる
    }
}

// 🆕 新規: ソロモード用プロンプト生成
function buildSoloPrompt(text: string): string {
    return `
あなたは「マウンティング度」を客観的に評価するAIです。
以下の文章を分析し、マウンティング度を0.0〜1.0で評価してください。

## 評価基準（厳密に従うこと）

### mountScore基準
- **0.0-0.2**: マウントなし。事実の陳述のみ、自虐、質問など。
- **0.2-0.4**: 軽い自慢。控えめな成果報告、肯定的な表現。
- **0.4-0.6**: 明確な優位性提示。具体的な数値、比較、実績アピール。
- **0.6-0.8**: 強い優位性誇示。他者との明確な差別化、権威の提示。
- **0.8-1.0**: 攻撃的・他者を下げる。見下し、皮肉、排他的な態度。

### 加点要素
- 具体的な数値（年収、学歴偏差値、実績数など）
- 比較表現（「〜より」「〜以上」「〜超え」）
- 権威の提示（有名企業、資格、地位）
- 皮肉・上から目線の表現

### 減点要素
- 自虐的な表現
- 事実のみの客観的記述
- 質問や相談
- 謙遜や配慮の言葉

### 重要な注意
- **曖昧な場合は低めに評価すること**
- **0.5付近に集中させない**（明確な基準で判断）
- **創作的に盛らない**（文章にない要素を推測しない）

## 対象の文章
${JSON.stringify(text)}

## 出力指示
- mountScore: 上記基準に厳密に従った評価
- confidence: 判定の確信度（0.0〜1.0）
- labels: 該当するラベル（最大5個、該当しない場合は空配列）
- tip: 次に標高を伸ばすための攻略ヒント（最大60文字）
- commentary: 実況コメント（最大60文字）
`.trim();
}

// 🆕 新規: Versusモード用プロンプト生成
function buildVersusPrompt(text: string): string {
    return `
あなたは「マウンティング度」を客観的に評価し、辛辣にツッコむAIです。
以下の文章を分析し、マウンティング度を0.0〜1.0で評価してください。

## 評価基準（厳密に従うこと）

### mountScore基準
- **0.0-0.2**: マウントなし。事実の陳述のみ、自虐、質問など。
- **0.2-0.4**: 軽い自慢。控えめな成果報告、肯定的な表現。
- **0.4-0.6**: 明確な優位性提示。具体的な数値、比較、実績アピール。
- **0.6-0.8**: 強い優位性誇示。他者との明確な差別化、権威の提示。
- **0.8-1.0**: 攻撃的・他者を下げる。見下し、皮肉、排他的な態度。

### 加点要素
- 具体的な数値（年収、学歴偏差値、実績数など）
- 比較表現（「〜より」「〜以上」「〜超え」）
- 権威の提示（有名企業、資格、地位）
- 皮肉・上から目線の表現

### 減点要素
- 自虐的な表現
- 事実のみの客観的記述
- 質問や相談
- 謙遜や配慮の言葉

### 重要な注意
- **曖昧な場合は低めに評価すること**
- **0.5付近に集中させない**（明確な基準で判断）
- **創作的に盛らない**（文章にない要素を推測しない）

## commentaryの辛辣度ルール（mountScoreに比例）

### 0.0-0.3: 強く煽る
- 短く鋭いツッコミ
- 例: 「で？」「それだけ？」「弱すぎ」「全然ダメ」

### 0.3-0.6: 軽く煽る
- やや批判的なコメント
- 例: 「もっと頑張れよ」「普通すぎ」「まだまだだね」

### 0.6-0.8: 認めつつ刺す
- 認めつつも厳しい指摘
- 例: 「悪くないけど甘い」「まぁまぁだね」「もう一押し」

### 0.8-1.0: 認めつつ皮肉る
- 高評価しつつ皮肉を込める
- 例: 「すごいね（笑）」「完璧じゃん」「これは強い」

### 禁止事項
- 差別的表現
- 過度に攻撃的な表現
- 個人を特定する表現

## 対象の文章
${JSON.stringify(text)}

## 出力指示
- mountScore: 上記基準に厳密に従った評価
- confidence: 判定の確信度（0.0〜1.0）
- labels: 該当するラベル（最大5個、該当しない場合は空配列）
- tip: 次に標高を伸ばすための攻略ヒント（最大60文字）
- commentary: 上記辛辣度ルールに従った短いツッコミ（最大60文字）
`.trim();
}
