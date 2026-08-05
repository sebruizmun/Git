import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'carecompanion.brainStreak.v1';

export type BrainStats = {
  streak: number;
  lastPlayed: string | null; // YYYY-MM-DD
  totalGames: number;
};

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayKey = () => dateKey(new Date());

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};

export async function getBrainStats(): Promise<BrainStats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as BrainStats;
  } catch {
    // ignore and fall through to defaults
  }
  return { streak: 0, lastPlayed: null, totalGames: 0 };
}

/** Call when a game round is finished. Returns the updated stats. */
export async function recordGamePlayed(): Promise<BrainStats> {
  const stats = await getBrainStats();
  const today = todayKey();
  let streak = stats.streak;
  if (stats.lastPlayed !== today) {
    streak = stats.lastPlayed === yesterdayKey() ? streak + 1 : 1;
  }
  const next: BrainStats = { streak, lastPlayed: today, totalGames: stats.totalGames + 1 };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // non-fatal
  }
  return next;
}
