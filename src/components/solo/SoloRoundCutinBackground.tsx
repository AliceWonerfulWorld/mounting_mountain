'use client';

import { motion } from 'framer-motion';
import type { SoloRoundCutinTheme } from './SoloRoundCutin';

// Pre-generated star positions and animations (outside component to satisfy React purity rules)
const generateStars = () => 
  Array.from({ length: 40 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 40,
    delay: Math.random() * 0.5,
    repeatDelay: Math.random() * 2,
  }));

const STARS = generateStars();

// Pre-generated particles for theme 1
const generateParticles = () =>
  Array.from({ length: 30 }, () => ({
    left: Math.random() * 100,
    bottom: Math.random() * 30,
    delay: Math.random() * 2,
    repeatDelay: Math.random() * 2,
  }));

const PARTICLES = generateParticles();

// Pre-generated trees for theme 2
const generateTrees = () =>
  Array.from({ length: 15 }, () => ({
    height: 30 + Math.random() * 50,
    width: 15 + Math.random() * 10,
    opacity: 0.7 + Math.random() * 0.3,
  }));

const TREES = generateTrees();

// Pre-generated leaves for theme 2
const generateLeaves = () =>
  Array.from({ length: 15 }, () => ({
    left: Math.random() * 100,
    rotate: 360 + Math.random() * 180,
    duration: 8 + Math.random() * 4,
    delay: Math.random() * 3,
  }));

const LEAVES = generateLeaves();

// Pre-generated birds for theme 2
const generateBirds = () =>
  Array.from({ length: 5 }, () => ({
    yOffset: 20 + Math.random() * 30,
  }));

const BIRDS = generateBirds();

type SoloRoundCutinBackgroundProps = {
  theme: SoloRoundCutinTheme;
};

export function SoloRoundCutinBackground({ theme }: SoloRoundCutinBackgroundProps) {
  return (
    <>
          {/* テーマ0: 雪山・星空 */}
          {theme === 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {/* 最遠景の山脈 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.2, y: 0 }}
                transition={{ duration: 1 }}
                className="absolute bottom-0 left-0 w-full h-3/4"
              >
                <svg viewBox="0 0 1200 500" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="mountain-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,500 L100,300 L250,350 L400,200 L550,280 L700,180 L850,260 L1000,220 L1200,340 L1200,500 Z"
                    fill="url(#mountain-grad-1)"
                  />
                </svg>
              </motion.div>

              {/* 遠景の雪山 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute bottom-0 left-0 w-full h-2/3"
              >
                <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="mountain-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#334155" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,400 L200,180 L400,280 L600,100 L800,240 L1000,140 L1200,300 L1200,400 Z"
                    fill="url(#mountain-grad-2)"
                  />
                  {/* 雪の頂 */}
                  <path
                    d="M600,100 L580,115 L570,108 L560,118 L600,100 L640,118 L630,108 L620,115 Z"
                    fill="rgba(255,255,255,0.9)"
                  />
                  <path
                    d="M1000,140 L980,155 L970,148 L960,158 L1000,140 L1040,158 L1030,148 L1020,155 Z"
                    fill="rgba(255,255,255,0.85)"
                  />
                </svg>
              </motion.div>

              {/* 中景の山 - より立体的 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="absolute bottom-0 left-0 w-full h-1/2"
              >
                <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="mountain-grad-3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#334155" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,400 L150,200 L300,280 L450,120 L600,80 L750,180 L900,150 L1050,240 L1200,200 L1200,400 Z"
                    fill="url(#mountain-grad-3)"
                  />
                  {/* 雪の頂（メイン） */}
                  <path
                    d="M450,120 L430,138 L420,130 L410,142 L400,135 L450,120 L500,135 L490,142 L480,130 L470,138 Z"
                    fill="rgba(255,255,255,0.95)"
                  />
                  <path
                    d="M600,80 L580,98 L570,90 L560,102 L550,95 L600,80 L650,95 L640,102 L630,90 L620,98 Z"
                    fill="rgba(255,255,255,1)"
                  />
                </svg>
              </motion.div>

              {/* 近景の岩山 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="absolute bottom-0 left-0 w-full h-1/3"
              >
                <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="w-full h-full fill-slate-700">
                  <path d="M0,300 L200,180 L400,240 L600,160 L800,220 L1000,180 L1200,260 L1200,300 Z" />
                </svg>
              </motion.div>

              {/* 星空 */}
              {STARS.map((star, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{
                    duration: 2,
                    delay: star.delay,
                    repeat: Infinity,
                    repeatDelay: star.repeatDelay
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                  style={{
                    left: `${star.left}%`,
                    top: `${star.top}%`
                  }}
                />
              ))}
            </div>
          )}

          {/* テーマ1: 雲上の山々 */}
          {theme === 1 && (
            <div className="absolute inset-0 pointer-events-none">
              {/* 遠くの山脈（雲の下） */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute bottom-0 left-0 w-full h-2/3"
              >
                <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="sky-mountain-1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#075985" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,400 L150,250 L300,300 L500,180 L700,260 L900,200 L1100,280 L1200,320 L1200,400 Z"
                    fill="url(#sky-mountain-1)"
                  />
                </svg>
              </motion.div>

              {/* 雲海の上に突き出る山頂 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute bottom-1/3 left-0 w-full h-1/2"
              >
                <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="sky-mountain-2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#1e40af" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {/* 左の山頂 */}
                  <path d="M0,300 L100,180 L200,220 L300,300" fill="url(#sky-mountain-2)" />
                  <path d="M100,180 L90,188 L85,182 L100,180 L115,182 L110,188 Z" fill="rgba(255,255,255,0.8)" />

                  {/* 中央の主峰 */}
                  <path d="M400,300 L550,80 L700,300" fill="url(#sky-mountain-2)" />
                  <path
                    d="M550,80 L535,95 L528,88 L520,98 L550,80 L580,98 L572,88 L565,95 Z"
                    fill="rgba(255,255,255,0.95)"
                  />
                  <circle cx="550" cy="85" r="3" fill="rgba(255,223,0,0.8)" />

                  {/* 右の山頂 */}
                  <path d="M850,300 L950,160 L1050,240 L1200,300" fill="url(#sky-mountain-2)" />
                  <path d="M950,160 L940,170 L935,164 L950,160 L965,164 L960,170 Z" fill="rgba(255,255,255,0.85)" />
                </svg>
              </motion.div>

              {/* 雲海レイヤー（下層） */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/20 to-transparent"
              />

              {/* 流れる雲 */}
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={`cloud-${i}`}
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: '120%', opacity: [0, 0.7, 0.7, 0] }}
                  transition={{
                    duration: 12 + i * 2,
                    delay: i * 0.5,
                    ease: 'linear',
                    repeat: Infinity
                  }}
                  className="absolute text-6xl"
                  style={{
                    top: `${20 + (i % 3) * 25}%`
                  }}
                >
                  ☁️
                </motion.div>
              ))}

              {/* 光の粒子（朝日の光） */}
              {PARTICLES.slice(0, 20).map((particle, i) => (
                <motion.div
                  key={`light-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: [0, -30]
                  }}
                  transition={{
                    duration: 3,
                    delay: particle.delay,
                    repeat: Infinity,
                    repeatDelay: particle.repeatDelay
                  }}
                  className="absolute w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(103,232,249,0.8)]"
                  style={{
                    left: `${particle.left}%`,
                    top: `${40 + particle.bottom}%`
                  }}
                />
              ))}
            </div>
          )}

          {/* テーマ2: 森林と山岳 */}
          {theme === 2 && (
            <div className="absolute inset-0 pointer-events-none">
              {/* 背景の山脈 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ duration: 1 }}
                className="absolute bottom-0 left-0 w-full h-3/4"
              >
                <svg viewBox="0 0 1200 500" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="forest-mountain-1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#064e3b" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#065f46" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,500 L150,280 L350,340 L550,220 L750,300 L950,240 L1150,320 L1200,350 L1200,500 Z"
                    fill="url(#forest-mountain-1)"
                  />
                </svg>
              </motion.div>

              {/* 中景の山 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="absolute bottom-0 left-0 w-full h-2/3"
              >
                <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="forest-mountain-2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#047857" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,400 L200,200 L400,260 L600,140 L800,220 L1000,180 L1200,280 L1200,400 Z"
                    fill="url(#forest-mountain-2)"
                  />
                  {/* 山の稜線に雪 */}
                  <path d="M600,140 L585,152 L578,146 L600,140 L622,146 L615,152 Z" fill="rgba(255,255,255,0.6)" />
                </svg>
              </motion.div>

              {/* 森林の木々（遠景） */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute bottom-0 left-0 w-full h-1/2"
              >
                <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="forest-trees" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#065f46" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                  {/* 森のシルエット */}
                  <path
                    d="M0,300 L0,180 Q50,160 100,180 Q150,200 200,180 Q250,160 300,180 Q350,200 400,180 Q450,160 500,180 Q550,200 600,180 Q650,160 700,180 Q750,200 800,180 Q850,160 900,180 Q950,200 1000,180 Q1050,160 1100,180 Q1150,200 1200,180 L1200,300 Z"
                    fill="url(#forest-trees)"
                  />
                </svg>
              </motion.div>

              {/* 近景の森（三角形の木々） */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute bottom-0 left-0 w-full h-2/5 flex items-end justify-around px-4"
              >
                {TREES.map((tree, i) => (
                  <div
                    key={`tree-${i}`}
                    className="relative"
                    style={{
                      height: `${tree.height}%`,
                      width: `${tree.width}px`
                    }}
                  >
                    {/* 木の三角形 */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: `${tree.width / 2}px solid transparent`,
                        borderRight: `${tree.width / 2}px solid transparent`,
                        borderBottom: `${tree.height * 2}px solid rgba(5, 150, 105, ${tree.opacity})`
                      }}
                    />
                    {/* 幹 */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-amber-900"
                      style={{
                        width: `${tree.width * 0.2}px`,
                        height: `${tree.height * 0.3}%`
                      }}
                    />
                  </div>
                ))}
              </motion.div>

              {/* 葉っぱエフェクト */}
              {LEAVES.map((leaf, i) => (
                <motion.div
                  key={`leaf-${i}`}
                  initial={{ y: -50, opacity: 0, rotate: 0 }}
                  animate={{
                    y: '110vh',
                    opacity: [0, 0.8, 0.8, 0],
                    rotate: leaf.rotate
                  }}
                  transition={{
                    duration: leaf.duration,
                    delay: leaf.delay,
                    ease: 'linear',
                    repeat: Infinity
                  }}
                  className="absolute text-2xl"
                  style={{
                    left: `${leaf.left}%`
                  }}
                >
                  🍃
                </motion.div>
              ))}

              {/* 鳥のシルエット */}
              {BIRDS.map((bird, i) => (
                <motion.div
                  key={`bird-${i}`}
                  initial={{ x: '-10%', y: '30%' }}
                  animate={{
                    x: '110%',
                    y: `${bird.yOffset}%`
                  }}
                  transition={{
                    duration: 15 + i * 3,
                    delay: i * 2,
                    ease: 'linear',
                    repeat: Infinity
                  }}
                  className="absolute text-xl opacity-60"
                >
                  🦅
                </motion.div>
              ))}
            </div>
          )}
    </>
  );
}
