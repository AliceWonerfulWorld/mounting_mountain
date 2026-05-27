import { GameWorldScene } from "@/components/GameWorldScene";

export function VersusBackground() {
    return (
        <>
            <GameWorldScene variant="versus" />
            <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-transparent via-slate-900/0 to-slate-950/20" />
        </>
    );
}
