/**
 * ユーザー表示名関連のユーティリティ関数
 */

/**
 * デフォルト登山家名リスト
 * ユーザー名が未設定の場合に表示される親しみやすい名前
 */
const DEFAULT_CLIMBER_NAMES = [
  'ただの登山家',
  '迷える登山家',
  '駆け出し登山家',
  'ひっそり登山家',
  '名もなき登山家',
  '匿名の登山家',
  '静かなる登山家',
  '孤高の登山家',
] as const;

/**
 * プロフィール情報の型
 */
export interface ProfileDisplayInfo {
  id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

/**
 * ユーザーIDから一貫したハッシュ値を生成
 * 同じユーザーIDからは常に同じハッシュ値が生成される
 * 
 * @param userId - ユーザーID（UUID形式）
 * @returns ハッシュ値（0以上の整数）
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * プロフィール情報から表示名を取得
 * 優先順位: display_name > username > デフォルト名
 * 
 * @param profile - プロフィール情報
 * @returns 表示名（必ず文字列を返す）
 * 
 * @example
 * ```ts
 * const profile = { id: 'abc-123', display_name: '山田太郎' };
 * getDisplayName(profile); // => '山田太郎'
 * 
 * const anonymous = { id: 'def-456', display_name: null, username: null };
 * getDisplayName(anonymous); // => 'ただの登山家' (idから一貫して選ばれる)
 * ```
 */
export function getDisplayName(profile: ProfileDisplayInfo): string {
  // 1. display_name が設定されていればそれを使用
  if (profile.display_name && profile.display_name.trim() !== '') {
    return profile.display_name.trim();
  }

  // 2. username が設定されていればそれを使用
  if (profile.username && profile.username.trim() !== '') {
    return profile.username.trim();
  }

  // 3. どちらも未設定の場合、ユーザーIDから一貫したデフォルト名を選択
  const hash = hashUserId(profile.id);
  const index = hash % DEFAULT_CLIMBER_NAMES.length;
  return DEFAULT_CLIMBER_NAMES[index];
}

/**
 * 表示名が自動生成されたデフォルト名かどうかを判定
 * 
 * @param displayName - 判定する表示名
 * @returns デフォルト名の場合true
 */
export function isDefaultName(displayName: string): boolean {
  return DEFAULT_CLIMBER_NAMES.includes(displayName as typeof DEFAULT_CLIMBER_NAMES[number]);
}

/**
 * デフォルト名のリストを取得（テスト用）
 */
export function getDefaultNames(): readonly string[] {
  return DEFAULT_CLIMBER_NAMES;
}
