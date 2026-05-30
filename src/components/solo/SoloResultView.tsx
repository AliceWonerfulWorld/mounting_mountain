"use client";

import type { Round } from "@/types/game";
import { MountainResultScene } from "@/components/MountainResultScene";
import { getLabelJa } from "@/lib/labels";
import { getRoute } from "@/lib/solo/routes";
import { useTimeOfDayExtended } from "@/hooks/useTimeOfDay";
import type { WeatherId } from "@/lib/solo/weather";

interface SoloResultViewProps {
  round: Round;
  isGameFinished: boolean;
  roundNumber: number;
  weather?: WeatherId;
  onNext: () => void;
}

export function SoloResultView({
  round,
  isGameFinished,
  roundNumber,
  weather,
  onNext,
}: SoloResultViewProps) {
  const { timeOfDay } = useTimeOfDayExtended();

  if (!round.result) return null;

  const route = round.result.routeId ? getRoute(round.result.routeId) : null;
  const hasEvent =
    round.result.insuranceUsed ||
    round.result.didFall ||
    round.result.weatherApplied ||
    (round.result.bonusAltitude ?? 0) > 0;

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-slate-950/86 shadow-[0_30px_110px_rgba(15,23,42,0.42)] backdrop-blur-2xl animate-in slide-in-from-top-4 fade-in duration-500 dark:border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(96,165,250,0.22),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(251,191,36,0.18),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      <div className="relative z-10 grid min-h-[720px] grid-rows-[auto_1fr_auto] gap-4 p-3 sm:p-4 md:min-h-[620px] md:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:grid-rows-[auto_1fr]">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-xl lg:col-span-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-200/85">
              Round {roundNumber} Result
            </div>
            <h2 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
              登頂判定
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-3 py-2 text-sm font-bold text-white/85">
            {route && (
              <>
                <span>{route.emoji}</span>
                <span>{route.label}</span>
              </>
            )}
            {round.result.routeMultiplier && round.result.routeMultiplier !== 1.0 && (
              <span className="font-mono text-white/60">x{round.result.routeMultiplier}</span>
            )}
          </div>
        </header>

        <div className="relative min-h-[430px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl lg:min-h-0">
          <MountainResultScene
            altitude={round.result.altitude}
            weather={weather}
            timeOfDay={timeOfDay}
            didFall={round.result.didFall}
            bonusAltitude={round.result.bonusAltitude}
            className="h-full min-h-[430px] rounded-3xl border-0 shadow-none lg:min-h-full"
            size="large"
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
            <div className="rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-3 text-white shadow-xl backdrop-blur-xl">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55">Final Altitude</div>
              <div className="mt-1 font-mono text-5xl font-black leading-none tracking-tight sm:text-6xl">
                {round.result.altitude.toLocaleString()}
                <span className="ml-1 text-xl text-white/70">m</span>
              </div>
            </div>
            {hasEvent && (
              <div className="flex max-w-[280px] flex-col gap-2 text-right">
                {(round.result.bonusAltitude ?? 0) > 0 && (
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-amber-950 shadow-lg">
                    +{round.result.bonusAltitude?.toLocaleString()}m Bonus
                  </span>
                )}
                {round.result.weatherApplied && (
                  <span className="rounded-full bg-sky-300 px-3 py-1 text-xs font-black text-sky-950 shadow-lg">
                    天候ボーナス +20%
                  </span>
                )}
                {round.result.insuranceUsed && (
                  <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950 shadow-lg">
                    保険発動
                  </span>
                )}
                {round.result.didFall && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-lg">
                    {round.result.fallReason || "滑落発生"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/62 p-4 text-white shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Altitude</div>
              <div className="mt-2 font-mono text-3xl font-black leading-none">
                {round.result.altitude.toLocaleString()}
                <span className="ml-1 text-sm text-white/55">m</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Round</div>
              <div className="mt-2 text-3xl font-black leading-none">
                {roundNumber}
                <span className="ml-1 text-sm text-white/55">/ 3</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Tags</div>
            <div className="flex flex-wrap gap-2">
              {round.result.labels.map((label) => (
                <span key={label} className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-bold text-white/82">
                  #{getLabelJa(label)}
                </span>
              ))}
              {round.result.labels.length === 0 && (
                <span className="text-sm text-white/45">タグなし</span>
              )}
            </div>
          </div>

          <div className="grid flex-1 content-start gap-3">
            {round.result.commentary && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">Live Commentary</div>
                <p className="text-sm font-medium leading-relaxed text-amber-50">
                  {round.result.commentary}
                </p>
              </div>
            )}

            {round.result.tip && (
              <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Strategy Tip</div>
                <p className="text-sm leading-relaxed text-sky-50/90">
                  {round.result.tip}
                </p>
              </div>
            )}
          </div>

          {round.result.didFall && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/15 p-3 text-sm font-bold text-red-100">
              標高が 2,000m に固定されました
            </div>
          )}
        </aside>

        <div className="lg:col-span-2">
          <button
            onClick={onNext}
            className={`group relative w-full overflow-hidden rounded-2xl py-4 text-lg font-black text-white shadow-2xl transition-transform hover:scale-[1.01] active:scale-[0.99] sm:py-5 sm:text-xl ${
              isGameFinished
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500'
            }`}
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.24)_40%,transparent_62%)] opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center justify-center gap-2">
              {isGameFinished ? (
                <>
                  <span>結果を見る</span>
                  <span className="text-2xl">🎉</span>
                </>
              ) : (
                <>
                  <span>次のラウンドへ</span>
                  <span className="text-2xl">🏔️</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
