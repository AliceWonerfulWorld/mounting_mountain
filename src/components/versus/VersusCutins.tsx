"use client";

import { AnimatePresence } from "framer-motion";
import type { VersusState } from "@/hooks/useVersusLocalGame";
import { RoundCutin } from "@/components/RoundCutin";
import { TurnCutin } from "@/components/TurnCutin";
import { BattleCutin } from "@/components/BattleCutin";

type VersusCutinsProps = {
    game: VersusState;
    onRoundComplete: () => void;
    onTurnComplete: () => void;
    onBattleComplete: () => void;
};

export function VersusCutins({
    game,
    onRoundComplete,
    onTurnComplete,
    onBattleComplete,
}: VersusCutinsProps) {
    return (
        <AnimatePresence>
            {game.phase === "round_start" && (
                <RoundCutin
                    key="round-cutin"
                    roundNumber={game.roundIndex + 1}
                    onComplete={onRoundComplete}
                />
            )}
            {game.phase === "turn_change" && (
                <TurnCutin
                    key="turn-cutin"
                    playerIndex={game.currentPlayerIndex}
                    playerName={game.players[game.currentPlayerIndex].name}
                    onComplete={onTurnComplete}
                />
            )}
            {game.phase === "battle_cutin" && (
                <BattleCutin
                    key="battle-cutin"
                    onComplete={onBattleComplete}
                />
            )}
        </AnimatePresence>
    );
}
