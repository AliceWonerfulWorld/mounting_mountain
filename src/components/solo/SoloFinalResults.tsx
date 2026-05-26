'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import type { SoloSummary } from '@/lib/solo/summary';
import { DetailedMountain } from '@/components/DetailedMountain';
import { getRoute } from '@/lib/solo/routes';

type SoloFinalResultsProps = {
  game: GameState;
  summary: SoloSummary;
  onReset: () => void;
};

export function SoloFinalResults({ game, summary, onReset }: SoloFinalResultsProps) {
  const rounds = game.players[0].rounds;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full space-y-6"
      >
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="relative z-10"
          >
            <div className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">SUMMIT!</div>
            <div className="text-2xl md:text-3xl font-bold text-white/90 mb-2">
              全{rounds.length}ラウンド 完走！
            </div>
            <div className="text-lg text-white/80">
              Total: <span className="font-black text-3xl">{game.players[0].totalScore.toLocaleString()}</span>m
            </div>
          </motion.div>
        </div>

        <MissionResult summary={summary} />
        <RoundResults rounds={rounds} />
        <SummaryStats summary={summary} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <button
            onClick={onReset}
            className="py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>もう一度挑戦する</span>
          </button>
          <Link
            href="/"
            className="py-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold text-lg hover:from-gray-800 hover:to-black hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            <span>タイトルに戻る</span>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}

function MissionResult({ summary }: { summary: SoloSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className={`rounded-2xl p-6 border-2 shadow-lg ${
        summary.mission.cleared
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-600'
          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 dark:from-gray-800/50 dark:to-slate-800/50 dark:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl">{summary.mission.cleared ? '🎯' : '😔'}</span>
        <div>
          <div className={`text-2xl font-black ${
            summary.mission.cleared
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {summary.mission.cleared ? 'MISSION CLEAR!' : 'MISSION FAILED'}
          </div>
          <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
            {summary.mission.title}
          </div>
        </div>
      </div>
      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-2">
        <div className="text-sm text-gray-700 dark:text-gray-300">{summary.mission.description}</div>
        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">
          {summary.mission.progressText}
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-5xl mb-2">
          {'★'.repeat(summary.stars)}{'☆'.repeat(3 - summary.stars)}
        </div>
        <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
          {summary.stars === 3 ? '完璧！' : summary.stars === 2 ? '惜しい！' : '次回に期待！'}
        </div>
      </div>
    </motion.div>
  );
}

function RoundResults({ rounds }: { rounds: GameState['players'][number]['rounds'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
    >
      <div className="text-2xl font-black mb-6 text-center text-gray-800 dark:text-gray-100">
        📊 ラウンド別結果
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {rounds.map((round, idx) => (
          <div
            key={round.id}
            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 shadow-md"
          >
            <div className="text-center mb-3">
              <div className="text-xs font-bold text-gray-500 mb-1">ROUND {idx + 1}</div>
              <div className="flex justify-center mb-3">
                <DetailedMountain altitude={round.result?.altitude || 0} size={120} />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {round.result?.altitude.toLocaleString() || 0}<span className="text-lg text-gray-500">m</span>
              </div>
            </div>
            {round.routeId && (
              <div className="flex justify-center mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 font-bold">
                  {getRoute(round.routeId).emoji} {getRoute(round.routeId).label}
                </span>
              </div>
            )}
            {round.result?.didFall && (
              <div className="text-center">
                <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold">
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
      className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
    >
      <div className="text-xl font-black mb-4 text-gray-800 dark:text-gray-100">📈 統計データ</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="合計標高" value={summary.score.total.toLocaleString()} unit="m" className="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20" valueClassName="text-blue-700 dark:text-blue-300" />
        <StatCard label="最高標高" value={summary.score.max.toLocaleString()} unit="m" className="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" valueClassName="text-purple-700 dark:text-purple-300" />
        <StatCard label="平均標高" value={summary.score.avg.toLocaleString()} unit="m" className="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" valueClassName="text-green-700 dark:text-green-300" />
        <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">天候</div>
          <div className="text-3xl">{summary.weather.emoji}</div>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{summary.weather.label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  unit,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  unit: string;
  className: string;
  valueClassName: string;
}) {
  return (
    <div className={`text-center p-4 bg-gradient-to-br rounded-xl ${className}`}>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-black ${valueClassName}`}>{value}</div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  );
}
