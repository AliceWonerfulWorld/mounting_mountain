import type { Round } from "@/types/game";

export function createRounds(promptTexts: string[], roundCount: number): Round[] {
    return promptTexts.slice(0, roundCount).map((p, i) => ({
        id: `r${i + 1}`,
        prompt: p,
    }));
}
