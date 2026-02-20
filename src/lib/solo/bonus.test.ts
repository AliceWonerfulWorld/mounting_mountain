import { describe, it, expect } from 'vitest';
import { computeBonus } from './bonus';
import type { LabelId } from '@/lib/labels';

describe('computeBonus', () => {
  describe('ラベル数ボーナス', () => {
    it('ラベルなしの場合はボーナス0', () => {
      const result = computeBonus([]);
      
      expect(result.bonusAltitude).toBe(0);
      expect(result.reasons).toHaveLength(0);
    });

    it('1つのラベルの場合はボーナスなし', () => {
      const labels: LabelId[] = ['NUMERIC'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(0);
      expect(result.reasons).toHaveLength(0);
    });

    it('2つのラベルで+300m', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(300);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('複合マウント');
      expect(result.reasons[0]).toContain('2種複合');
      expect(result.reasons[0]).toContain('+300m');
    });

    it('3つのラベルで+700m', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON', 'EFFORT'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(700);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('多角的なマウント');
      expect(result.reasons[0]).toContain('3種複合');
      expect(result.reasons[0]).toContain('+700m');
    });

    it('4つのラベルで+1200m', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON', 'EFFORT', 'AUTHORITY'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(1200);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('深みのあるマウント');
      expect(result.reasons[0]).toContain('4種複合');
      expect(result.reasons[0]).toContain('+1200m');
    });

    it('5つのラベルでも+1200m（上限）', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON', 'EFFORT', 'AUTHORITY', 'SARCASM'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(1200);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('4種複合');
    });

    it('6つのラベルでも+1200m（上限）', () => {
      const labels: LabelId[] = [
        'NUMERIC',
        'COMPARISON',
        'EFFORT',
        'AUTHORITY',
        'SARCASM',
        'CONDESCENDING'
      ];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(1200);
    });

    it('8つすべてのラベルでも+1200m', () => {
      const labels: LabelId[] = [
        'NUMERIC',
        'COMPARISON',
        'EFFORT',
        'AUTHORITY',
        'SARCASM',
        'CONDESCENDING',
        'BACKHANDED',
        'GATEKEEP'
      ];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(1200);
    });
  });

  describe('重複ラベルの処理', () => {
    it('同じラベルが重複している場合はユニークとして扱う（2つ）', () => {
      const labels: LabelId[] = ['NUMERIC', 'NUMERIC', 'COMPARISON'];
      const result = computeBonus(labels);
      
      // ユニーク数は2つ
      expect(result.bonusAltitude).toBe(300);
      expect(result.reasons[0]).toContain('2種複合');
    });

    it('同じラベルが重複している場合はユニークとして扱う（3つ）', () => {
      const labels: LabelId[] = ['NUMERIC', 'NUMERIC', 'COMPARISON', 'COMPARISON', 'EFFORT'];
      const result = computeBonus(labels);
      
      // ユニーク数は3つ
      expect(result.bonusAltitude).toBe(700);
      expect(result.reasons[0]).toContain('3種複合');
    });

    it('すべて同じラベルの場合はボーナスなし', () => {
      const labels: LabelId[] = ['NUMERIC', 'NUMERIC', 'NUMERIC'];
      const result = computeBonus(labels);
      
      // ユニーク数は1つ
      expect(result.bonusAltitude).toBe(0);
      expect(result.reasons).toHaveLength(0);
    });
  });

  describe('ボーナス境界値のテスト', () => {
    it('ちょうど2種類でボーナス発生', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(300);
    });

    it('ちょうど3種類でボーナス増加', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON', 'EFFORT'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(700);
    });

    it('ちょうど4種類で最大ボーナス', () => {
      const labels: LabelId[] = ['NUMERIC', 'COMPARISON', 'EFFORT', 'AUTHORITY'];
      const result = computeBonus(labels);
      
      expect(result.bonusAltitude).toBe(1200);
    });
  });

  describe('すべての有効なラベル組み合わせ', () => {
    it('NUMERIC + COMPARISON', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON']);
      expect(result.bonusAltitude).toBe(300);
    });

    it('EFFORT + AUTHORITY', () => {
      const result = computeBonus(['EFFORT', 'AUTHORITY']);
      expect(result.bonusAltitude).toBe(300);
    });

    it('SARCASM + CONDESCENDING + BACKHANDED', () => {
      const result = computeBonus(['SARCASM', 'CONDESCENDING', 'BACKHANDED']);
      expect(result.bonusAltitude).toBe(700);
    });

    it('NUMERIC + COMPARISON + EFFORT + AUTHORITY', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON', 'EFFORT', 'AUTHORITY']);
      expect(result.bonusAltitude).toBe(1200);
    });

    it('GATEKEEP + BACKHANDED + SARCASM + CONDESCENDING', () => {
      const result = computeBonus(['GATEKEEP', 'BACKHANDED', 'SARCASM', 'CONDESCENDING']);
      expect(result.bonusAltitude).toBe(1200);
    });
  });

  describe('reasons配列の内容', () => {
    it('理由配列が正しいフォーマットであること（2種）', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON']);
      
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toBe('複合マウント（2種複合） +300m');
    });

    it('理由配列が正しいフォーマットであること（3種）', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON', 'EFFORT']);
      
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toBe('多角的なマウント（3種複合） +700m');
    });

    it('理由配列が正しいフォーマットであること（4種）', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON', 'EFFORT', 'AUTHORITY']);
      
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toBe('深みのあるマウント（4種複合） +1200m');
    });

    it('ボーナスなしの場合は理由が空配列', () => {
      const result = computeBonus(['NUMERIC']);
      
      expect(result.reasons).toEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('空配列を渡した場合', () => {
      const result = computeBonus([]);
      
      expect(result.bonusAltitude).toBe(0);
      expect(result.reasons).toEqual([]);
    });

    it('配列の順序が異なっても同じ結果', () => {
      const result1 = computeBonus(['NUMERIC', 'COMPARISON']);
      const result2 = computeBonus(['COMPARISON', 'NUMERIC']);
      
      expect(result1.bonusAltitude).toBe(result2.bonusAltitude);
      expect(result1.bonusAltitude).toBe(300);
    });

    it('大量の重複があっても正しく計算される', () => {
      const labels: LabelId[] = [
        'NUMERIC', 'NUMERIC', 'NUMERIC',
        'COMPARISON', 'COMPARISON',
        'EFFORT'
      ];
      const result = computeBonus(labels);
      
      // ユニーク数は3つ
      expect(result.bonusAltitude).toBe(700);
    });
  });

  describe('戻り値の型チェック', () => {
    it('bonusAltitudeは数値型', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON']);
      
      expect(typeof result.bonusAltitude).toBe('number');
    });

    it('reasonsは配列型', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON']);
      
      expect(Array.isArray(result.reasons)).toBe(true);
    });

    it('reasonsの各要素は文字列型', () => {
      const result = computeBonus(['NUMERIC', 'COMPARISON', 'EFFORT']);
      
      result.reasons.forEach(reason => {
        expect(typeof reason).toBe('string');
      });
    });
  });
});
