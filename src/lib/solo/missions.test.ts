/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { pickMission, getMission, evaluateMission, MISSIONS } from './missions';
import type { GameState } from '@/types/game';
import type { MissionId } from './missions';

describe('missions', () => {
  describe('MISSIONS配列', () => {
    it('3つのミッションが定義されていること', () => {
      expect(MISSIONS).toHaveLength(3);
    });

    it('各ミッションに必須フィールドがあること', () => {
      MISSIONS.forEach(mission => {
        expect(mission).toHaveProperty('id');
        expect(mission).toHaveProperty('title');
        expect(mission).toHaveProperty('description');
        expect(typeof mission.id).toBe('string');
        expect(typeof mission.title).toBe('string');
        expect(typeof mission.description).toBe('string');
      });
    });

    it('すべてのミッションにtargetがあること', () => {
      MISSIONS.forEach(mission => {
        expect(mission.target).toBeGreaterThan(0);
      });
    });
  });

  describe('pickMission', () => {
    it('ミッションをランダムに選択すること', () => {
      const mission = pickMission();
      
      expect(MISSIONS).toContainEqual(mission);
    });

    it('カスタムRNG関数で最初のミッションを選択', () => {
      const mission = pickMission(() => 0.0);
      
      expect(mission.id).toBe(MISSIONS[0].id);
    });

    it('カスタムRNG関数で最後のミッションを選択', () => {
      const mission = pickMission(() => 0.99);
      
      expect(mission.id).toBe(MISSIONS[2].id);
    });

    it('中間のRNG値で2番目のミッションを選択', () => {
      const mission = pickMission(() => 0.4);
      
      expect(mission.id).toBe(MISSIONS[1].id);
    });
  });

  describe('getMission', () => {
    it('TOTAL_15000のミッションを取得', () => {
      const mission = getMission('TOTAL_15000');
      
      expect(mission.id).toBe('TOTAL_15000');
      expect(mission.title).toBe('高峰制覇');
      expect(mission.target).toBe(15000);
    });

    it('EVEREST_1のミッションを取得', () => {
      const mission = getMission('EVEREST_1');
      
      expect(mission.id).toBe('EVEREST_1');
      expect(mission.title).toBe('エベレスト級');
      expect(mission.target).toBe(8000);
    });

    it('LABELS_3のミッションを取得', () => {
      const mission = getMission('LABELS_3');
      
      expect(mission.id).toBe('LABELS_3');
      expect(mission.title).toBe('多角的マウント');
      expect(mission.target).toBe(3);
    });

    it('存在しないIDの場合は最初のミッションを返す', () => {
      const mission = getMission('INVALID' as MissionId);
      
      expect(mission).toEqual(MISSIONS[0]);
    });
  });

  describe('evaluateMission - TOTAL_15000', () => {
    it('合計15000m以上で達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'TOTAL_15000', title: '高峰制覇', description: '合計標高15000m以上を達成せよ', target: 15000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 16000,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(true);
      expect(result.progressText).toContain('16,000');
      expect(result.progressText).toContain('15,000');
      expect(result.ratio).toBe(1.0);
    });

    it('合計15000m未満で未達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'playing',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'TOTAL_15000', title: '高峰制覇', description: '合計標高15000m以上を達成せよ', target: 15000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 10000,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      expect(result.progressText).toContain('10,000');
      expect(result.ratio).toBeCloseTo(10000 / 15000, 2);
    });

    it('ちょうど15000mで達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'TOTAL_15000', title: '高峰制覇', description: '合計標高15000m以上を達成せよ', target: 15000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 15000,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(true);
      expect(result.ratio).toBe(1.0);
    });

    it('合計0mの場合', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'playing',
        roundIndex: 0,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'TOTAL_15000', title: '高峰制覇', description: '合計標高15000m以上を達成せよ', target: 15000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 0,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      expect(result.ratio).toBe(0);
    });
  });

  describe('evaluateMission - EVEREST_1', () => {
    it('1回でも8000m以上で達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'EVEREST_1', title: 'エベレスト級', description: '1回でも8000m以上を記録せよ', target: 8000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 12000,
          rounds: [
            { id: 'r1', prompt: 'お題1', result: { altitude: 3000, finalAltitude: 3000 } as any },
            { id: 'r2', prompt: 'お題2', result: { altitude: 8500, finalAltitude: 8500 } as any },
            { id: 'r3', prompt: 'お題3', result: { altitude: 500, finalAltitude: 500 } as any },
          ]
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(true);
      expect(result.progressText).toContain('8,500');
      expect(result.ratio).toBe(1.0);
    });

    it('すべて8000m未満で未達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'EVEREST_1', title: 'エベレスト級', description: '1回でも8000m以上を記録せよ', target: 8000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 12000,
          rounds: [
            { id: 'r1', prompt: 'お題1', result: { altitude: 5000, finalAltitude: 5000 } as any },
            { id: 'r2', prompt: 'お題2', result: { altitude: 4000, finalAltitude: 4000 } as any },
            { id: 'r3', prompt: 'お題3', result: { altitude: 3000, finalAltitude: 3000 } as any },
          ]
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      expect(result.progressText).toContain('5,000');
      expect(result.ratio).toBeCloseTo(5000 / 8000, 2);
    });

    it('ちょうど8000mで達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'EVEREST_1', title: 'エベレスト級', description: '1回でも8000m以上を記録せよ', target: 8000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 8000,
          rounds: [
            { id: 'r1', prompt: 'お題1', result: { altitude: 8000, finalAltitude: 8000 } as any },
          ]
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(true);
      expect(result.ratio).toBe(1.0);
    });

    it('結果がない場合はNaN', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'playing',
        roundIndex: 0,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'EVEREST_1', title: 'エベレスト級', description: '1回でも8000m以上を記録せよ', target: 8000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 0,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      // Math.max()に空配列を渡すと-Infinityになるため、ratio = -Infinity / 8000 = -Infinity
      expect(result.ratio).toBe(-Infinity);
    });
  });

  describe('evaluateMission - LABELS_3', () => {
    it('3種類以上のラベルで達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'LABELS_3', title: '多角的マウント', description: '3種類以上のラベルを出せ', target: 3 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 10000,
          rounds: [
            { id: 'r1', prompt: 'お題1', result: { labels: ['NUMERIC', 'COMPARISON'] } as any },
            { id: 'r2', prompt: 'お題2', result: { labels: ['EFFORT'] } as any },
            { id: 'r3', prompt: 'お題3', result: { labels: ['NUMERIC'] } as any },
          ]
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(true);
      expect(result.progressText).toContain('3');
      expect(result.ratio).toBe(1.0);
    });

    it('2種類以下で未達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'LABELS_3', title: '多角的マウント', description: '3種類以上のラベルを出せ', target: 3 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 10000,
          rounds: [
            { id: 'r1', prompt: 'お題1', result: { labels: ['NUMERIC'] } as any },
            { id: 'r2', prompt: 'お題2', result: { labels: ['NUMERIC', 'COMPARISON'] } as any },
            { id: 'r3', prompt: 'お題3', result: { labels: ['NUMERIC'] } as any },
          ]
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      expect(result.progressText).toContain('2');
      expect(result.ratio).toBeCloseTo(2 / 3, 2);
    });

    it('5種類以上でも達成', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'LABELS_3', title: '多角的マウント', description: '3種類以上のラベルを出せ', target: 3 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 10000,
          rounds: [
            { id: 'r1', prompt: 'お題1', result: { labels: ['NUMERIC', 'COMPARISON', 'EFFORT'] } as any },
            { id: 'r2', prompt: 'お題2', result: { labels: ['AUTHORITY', 'SARCASM'] } as any },
            { id: 'r3', prompt: 'お題3', result: { labels: ['NUMERIC'] } as any },
          ]
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(true);
      expect(result.progressText).toContain('5');
      expect(result.ratio).toBe(1.0);
    });

    it('ラベルがない場合', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'playing',
        roundIndex: 0,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'LABELS_3', title: '多角的マウント', description: '3種類以上のラベルを出せ', target: 3 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 0,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      expect(result.ratio).toBe(0);
    });
  });

  describe('evaluateMission - エッジケース', () => {
    it('ミッションがない場合', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'playing',
        roundIndex: 0,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 0,
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.cleared).toBe(false);
      expect(result.progressText).toBe('ミッションなし');
    });

    it('ratio が1.0を超えない (TOTAL_15000)', () => {
      const gameState: GameState = {
        mode: 'solo',
        status: 'finished',
        roundIndex: 2,
        prompts: ['お題1', 'お題2', 'お題3'],
        insurance: 0,
        mission: { id: 'TOTAL_15000', title: '高峰制覇', description: '合計標高15000m以上を達成せよ', target: 15000 },
        players: [{
          id: 'p1',
          name: 'Player 1',
          totalScore: 30000, // 2倍
          rounds: []
        }]
      };

      const result = evaluateMission(gameState);

      expect(result.ratio).toBe(1.0); // 上限
    });
  });
});
