import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'carecompanion.gameRecords.v1';

type Records = Record<string, number>;

async function load(): Promise<Records> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Records;
  } catch {
    // fall through
  }
  return {};
}

export async function getRecord(game: string, difficulty: string): Promise<number | null> {
  const records = await load();
  const v = records[`${game}:${difficulty}`];
  return typeof v === 'number' ? v : null;
}

/**
 * Submit a result. `better` says whether lower (e.g. moves) or higher
 * (e.g. steps remembered) counts as an improvement.
 * Returns the best value and whether this submission set a new record.
 */
export async function submitRecord(
  game: string,
  difficulty: string,
  value: number,
  better: 'lower' | 'higher'
): Promise<{ best: number; isNew: boolean }> {
  const records = await load();
  const key = `${game}:${difficulty}`;
  const prev = records[key];
  const isNew =
    typeof prev !== 'number' || (better === 'lower' ? value < prev : value > prev);
  const best = isNew ? value : prev;
  if (isNew) {
    records[key] = value;
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(records));
    } catch {
      // non-fatal
    }
  }
  return { best, isNew };
}

const WIN_MESSAGES = [
  'Sharp as ever! 🎉',
  'Your memory showed up today! ✨',
  'Beautifully done! 🌟',
  'You made that look easy! 🎉',
  'What a round! 👏',
  'Brilliant work! 🌻',
];

const GOOD_MESSAGES = [
  'Nicely done! 🎉',
  'Great effort! 👏',
  'Coming right along! 🌟',
  'That was a good one! ✨',
];

const OKAY_MESSAGES = [
  'Every round counts! 👏',
  'Good practice today! 🌱',
  'Nice try — the next round awaits! ✨',
  'Well played — keep at it! 🌟',
];

export function encouragement(tier: 'win' | 'good' | 'okay'): string {
  const pool = tier === 'win' ? WIN_MESSAGES : tier === 'good' ? GOOD_MESSAGES : OKAY_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}
