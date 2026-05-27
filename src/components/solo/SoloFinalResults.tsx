'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import type { SoloSummary } from '@/lib/solo/summary';
import { MountainResultScene } from '@/components/MountainResultScene';
import { getRoute } from '@/lib/solo/routes';
import { useTimeOfDayExtended } from '@/hooks/useTimeOfDay';

type SoloFinalResultsProps = {
  game: GameState;
  summary: SoloSummary;
  onReset: () => void;
};

export function SoloFinalResults({ game, summary, onReset }: SoloFinalResultsProps) {
  const rounds = game.players[0].rounds;
  const { timeOfDay } = useTimeOfDayExtended();
  const totalScore = game.players[0].totalScore;
  const mainAltitude = Math.max(summary.score.max, Math.round(totalScore / Math.max(rounds.length, 1)));

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-4">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl space-y-5 sm:space-y-6"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-white/35 bg-slate-950/86 p-3 shadow-[0_32px_120px_rgba(15,23,42,0.48)] backdrop-blur-2xl dark:border-white/10 sm:p-4 lg:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(250,204,21,0.25),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(96,165,250,0.2),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="relative min-h-[460px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl">
              <MountainResultScene
                altitude={mainAltitude}
                maxAltitude={15000}
                weather={game.weather}
                timeOfDay={timeOfDay}
                isWinner={summary.mission.cleared}
                bonusAltitude={Math.max(0, totalScore - summary.score.max)}
                className="h-full min-h-[460px] rounded-[1.5rem] border-0 shadow-none"
                size="large"
                showHud={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/58 via-transparent to-slate-950/12" />
              <div className="absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-3 text-white">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.34em] text-white/58">Final Expedition</div>
                  <div className="mt-1 text-5xl font-black leading-none tracking-tight sm:text-7xl">
                    {summary.mission.cleared ? 'SUMMIT' : 'BASECAMP'}
                  </div>
                  <div className="mt-2 text-base font-bold text-white/78 sm:text-xl">
                    全{rounds.length}ラウンド 完走
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-right shadow-xl backdrop-blur-xl">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Total</div>
                  <div className="font-mono text-4xl font-black leading-none sm:text-5xl">
                    {totalScore.toLocaleString()}
                    <span className="ml-1 text-lg text-white/65">m</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-4 bottom-4 grid gap-3 text-white sm:grid-cols-3">
                <FinalMetric label="最高標高" value={summary.score.max.toLocaleString()} unit="m" />
                <FinalMetric label="平均標高" value={summary.score.avg.toLocaleString()} unit="m" />
                <FinalMetric label="天候" value={`${summary.weather.emoji} ${summary.weather.label}`} />
              </div>
            </div>

            <div className="grid gap-4">
              <MissionResult summary={summary} />
              <SummaryStats summary={summary} />
            </div>
          </div>
        </div>

        <RoundResults rounds={rounds} weather={game.weather} timeOfDay={timeOfDay} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700"
          >
            <span>🔄</span>
            <span>もう一度挑戦する</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-900 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-gray-800 hover:to-black"
          >
            <span>🏠</span>
            <span>タイトルに戻る</span>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}

function FinalMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-slate-950/48 px-4 py-3 shadow-xl backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-1 font-mono text-2xl font-black leading-none">
        {value}
        {unit && <span className="ml-1 text-sm text-white/58">{unit}</span>}
      </div>
    </div>
  );
}

function MissionResult({ summary }: { summary: SoloSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl ${
        summary.mission.cleared
          ? 'border-emerald-300/30 bg-emerald-300/12 text-emerald-50'
          : 'border-slate-300/20 bg-white/10 text-white'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl">{summary.mission.cleared ? '🎯' : '😔'}</span>
        <div>
          <div className={`text-2xl font-black ${
            summary.mission.cleared
              ? 'text-emerald-100'
              : 'text-white'
          }`}>
            {summary.mission.cleared ? 'MISSION CLEAR!' : 'MISSION FAILED'}
          </div>
          <div className="text-sm font-bold text-white/62">
            {summary.mission.title}
          </div>
        </div>
      </div>
      <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <div className="text-sm text-white/72">{summary.mission.description}</div>
        <div className="text-lg font-mono font-bold text-white">
          {summary.mission.progressText}
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-5xl mb-2">
          {'★'.repeat(summary.stars)}{'☆'.repeat(3 - summary.stars)}
        </div>
        <div className="text-lg font-bold text-white/75">
          {summary.stars === 3 ? '完璧！' : summary.stars === 2 ? '惜しい！' : '次回に期待！'}
        </div>
      </div>
    </motion.div>
  );
}

function RoundResults({
  rounds,
  weather,
  timeOfDay,
}: {
  rounds: GameState['players'][number]['rounds'];
  weather?: GameState['weather'];
  timeOfDay: ReturnType<typeof useTimeOfDayExtended>['timeOfDay'];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-[1.75rem] border border-white/35 bg-slate-950/80 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-white/10 sm:p-6"
    >
      <div className="mb-6 text-center text-2xl font-black text-white">
        ラウンド別登頂ログ
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {rounds.map((round, idx) => (
          <div
            key={round.id}
            className="overflow-hidden rounded-2xl border border-white/12 bg-white/8 p-3 text-white shadow-xl backdrop-blur-xl"
          >
            <div className="mb-3 text-center">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-white/48">ROUND {idx + 1}</div>
              <MountainResultScene
                altitude={round.result?.altitude || 0}
                weather={weather}
                timeOfDay={timeOfDay}
                didFall={round.result?.didFall}
                className="h-[220px] rounded-xl border-0 shadow-none"
                size="compact"
              />
              <div className="mt-3 text-3xl font-black text-white">
                {round.result?.altitude.toLocaleString() || 0}<span className="text-lg text-white/55">m</span>
              </div>
            </div>
            {round.routeId && (
              <div className="flex justify-center mb-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold">
                  {getRoute(round.routeId).emoji} {getRoute(round.routeId).label}
                </span>
              </div>
            )}
            {round.result?.didFall && (
              <div className="text-center">
                <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-bold text-red-100">
                  ⚠️ 滑落
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SummaryStats({ summary }: { summary: SoloSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="rounded-3xl border border-white/10 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-4 text-xl font-black text-white">統計データ</div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="合計標高" value={summary.score.total.toLocaleString()} unit="m" />
        <StatCard label="最高標高" value={summary.score.max.toLocaleString()} unit="m" />
        <StatCard label="平均標高" value={summary.score.avg.toLocaleString()} unit="m" />
        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-center">
          <div className="mb-1 text-xs text-white/50">天候</div>
          <div className="text-3xl">{summary.weather.emoji}</div>
          <div className="text-xs font-bold text-white/75">{summary.weather.label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-center">
      <div className="mb-1 text-xs text-white/50">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/45">{unit}</div>
    </div>
  );
}
