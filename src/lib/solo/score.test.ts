import { describe, it, expect } from 'vitest';
import { computeFinalAltitude } from './score';
import type { ScoreInput } from './score';

describe('computeFinalAltitude', () => {
  describe('基本的なスコア計算', () => {
    it('NORMALルートで基本計算が正しいこと', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(5000);
      expect(result.didFall).toBe(false);
      expect(result.weatherApplied).toBe(false);
      expect(result.insuranceUsed).toBe(false);
    });

    it('SAFEルートで0.8倍になること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'SAFE',
        routeMultiplier: 0.8,
        bonusAltitude: 0,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(4000); // 5000 * 0.8
      expect(result.didFall).toBe(false);
    });

    it('RISKYルートで1.5倍になること（滑落しない場合）', () => {
      const input: ScoreInput = {
        baseAltitude: 4000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        rng: () => 0.6, // 50%以上なので滑落しない
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(6000); // 4000 * 1.5
      expect(result.didFall).toBe(false);
    });

    it('ボーナスが正しく加算されること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 500,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(5500);
    });
  });

  describe('滑落判定', () => {
    it('RISKYルートで滑落判定が動作すること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        rng: () => 0.3, // 50%未満なので滑落
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(0);
      expect(result.didFall).toBe(true);
      expect(result.fallReason).toBe('滑落！');
      expect(result.weatherApplied).toBe(false);
      expect(result.insuranceUsed).toBe(false);
    });

    it('ちょうど50%未満で滑落すること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        rng: () => 0.49,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.didFall).toBe(true);
    });

    it('ちょうど50%以上で滑落しないこと', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        rng: () => 0.5,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.didFall).toBe(false);
    });

    it('SAFEルートでは滑落しないこと', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'SAFE',
        routeMultiplier: 0.8,
        bonusAltitude: 0,
        rng: () => 0.1, // どんな値でも滑落しない
      };
      const result = computeFinalAltitude(input);
      
      expect(result.didFall).toBe(false);
    });

    it('NORMALルートでは滑落しないこと', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
        rng: () => 0.1,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.didFall).toBe(false);
    });
  });

  describe('保険システム', () => {
    it('保険があれば滑落を無効化すること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        insurance: 1,
        rng: () => 0.3, // 滑落判定だが保険で無効化
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBeGreaterThan(0);
      expect(result.finalAltitude).toBe(7500); // 5000 * 1.5
      expect(result.didFall).toBe(false);
      expect(result.insuranceUsed).toBe(true);
    });

    it('保険がない場合は通常通り滑落すること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        insurance: 0,
        rng: () => 0.3,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(0);
      expect(result.didFall).toBe(true);
      expect(result.insuranceUsed).toBe(false);
    });

    it('滑落しない場合は保険を使わないこと', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        insurance: 1,
        rng: () => 0.6, // 滑落しない
      };
      const result = computeFinalAltitude(input);
      
      expect(result.didFall).toBe(false);
      expect(result.insuranceUsed).toBe(false); // 保険は使わない
    });
  });

  describe('天候システム', () => {
    it('天候ボーナスが適用されること（SUNNY + NUMERIC）', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
        weatherId: 'SUNNY',
        labels: ['NUMERIC'],
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(6000); // 5000 * 1.2
      expect(result.weatherApplied).toBe(true);
      expect(result.weatherMultiplier).toBe(1.2);
      expect(result.weatherBoostLabel).toBe('NUMERIC');
    });

    it('天候ラベルが合わない場合はボーナスなし', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
        weatherId: 'SUNNY',
        labels: ['COMPARISON'], // SUNNYはNUMERIC必要
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(5000);
      expect(result.weatherApplied).toBe(false);
    });

    it('天候なしの場合はボーナスなし', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
        labels: ['NUMERIC'],
        // weatherIdなし
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(5000);
      expect(result.weatherApplied).toBe(false);
    });

    it('天候ボーナスとルート倍率が両方適用されること', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        weatherId: 'SUNNY',
        labels: ['NUMERIC'],
        rng: () => 0.6, // 滑落しない
      };
      const result = computeFinalAltitude(input);
      
      // (5000 * 1.5) * 1.2 = 9000
      expect(result.finalAltitude).toBe(9000);
      expect(result.weatherApplied).toBe(true);
    });
  });

  describe('標高上限（SAFE/NORMAL）', () => {
    it('NORMALルートで7900mを超える場合は上限適用', () => {
      const input: ScoreInput = {
        baseAltitude: 8000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(7900);
    });

    it('SAFEルートで7900mを超える場合は上限適用', () => {
      const input: ScoreInput = {
        baseAltitude: 10000,
        routeId: 'SAFE',
        routeMultiplier: 0.8,
        bonusAltitude: 1000,
      };
      const result = computeFinalAltitude(input);
      
      // (10000 * 0.8) + 1000 = 9000 -> 7900に制限
      expect(result.finalAltitude).toBe(7900);
    });

    it('RISKYルートでは上限が適用されないこと', () => {
      const input: ScoreInput = {
        baseAltitude: 6000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        rng: () => 0.6,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(9000); // 上限なし
    });

    it('7900m以下の場合は上限が影響しないこと', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(5000);
    });
  });

  describe('複合シナリオ', () => {
    it('すべての要素が組み合わさったケース', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 500,
        weatherId: 'SUNNY',
        labels: ['NUMERIC', 'COMPARISON'],
      };
      const result = computeFinalAltitude(input);
      
      // (5000 * 1.0 * 1.2) + 500 = 6500
      expect(result.finalAltitude).toBe(6500);
      expect(result.weatherApplied).toBe(true);
    });

    it('天候ボーナス＋ラベルボーナスで上限を超えるケース', () => {
      const input: ScoreInput = {
        baseAltitude: 6500,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 1000,
        weatherId: 'SUNNY',
        labels: ['NUMERIC'],
      };
      const result = computeFinalAltitude(input);
      
      // (6500 * 1.2) + 1000 = 8800 -> 7900に制限
      expect(result.finalAltitude).toBe(7900);
    });

    it('保険使用＋天候ボーナス適用のケース', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'RISKY',
        routeMultiplier: 1.5,
        bonusAltitude: 0,
        weatherId: 'SUNNY',
        labels: ['NUMERIC'],
        insurance: 1,
        rng: () => 0.3, // 滑落判定だが保険で無効化
      };
      const result = computeFinalAltitude(input);
      
      // (5000 * 1.5) * 1.2 = 9000
      expect(result.finalAltitude).toBe(9000);
      expect(result.insuranceUsed).toBe(true);
      expect(result.weatherApplied).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('baseAltitudeが0の場合', () => {
      const input: ScoreInput = {
        baseAltitude: 0,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(0);
      expect(result.didFall).toBe(false);
    });

    it('bonusAltitudeのみで標高が発生する場合', () => {
      const input: ScoreInput = {
        baseAltitude: 0,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 500,
      };
      const result = computeFinalAltitude(input);
      
      expect(result.finalAltitude).toBe(500);
    });

    it('ラベルが空配列の場合', () => {
      const input: ScoreInput = {
        baseAltitude: 5000,
        routeId: 'NORMAL',
        routeMultiplier: 1.0,
        bonusAltitude: 0,
        weatherId: 'SUNNY',
        labels: [],
      };
      const result = computeFinalAltitude(input);
      
      expect(result.weatherApplied).toBe(false);
    });
  });
});
