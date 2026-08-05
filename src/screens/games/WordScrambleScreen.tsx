import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button, Card, Screen } from '../../components/ui';
import { colors, radii, shadow, spacing, typography } from '../../theme/theme';
import { recordGamePlayed } from '../../utils/brainStreak';
import { encouragement, getRecord, submitRecord } from '../../utils/gameRecords';
import { DifficultyPicker, type Difficulty } from './DifficultyPicker';
import { Confetti } from './Confetti';

type WordEntry = { word: string; clue: string };

const WORD_POOLS: Record<Difficulty, WordEntry[]> = {
  easy: [
    { word: 'APPLE', clue: 'A crisp red or green fruit' },
    { word: 'BREAD', clue: 'Fresh from the bakery' },
    { word: 'SMILE', clue: 'You wear it when you’re happy' },
    { word: 'BEACH', clue: 'Sand, waves, and sunshine' },
    { word: 'HONEY', clue: 'Sweet, made by bees' },
    { word: 'CLOUD', clue: 'Floats in the sky' },
    { word: 'RIVER', clue: 'Water flowing to the sea' },
    { word: 'DANCE', clue: 'Moving to music' },
    { word: 'PEACH', clue: 'A fuzzy summer fruit' },
    { word: 'MUSIC', clue: 'Something you hum along to' },
  ],
  medium: [
    { word: 'GARDEN', clue: 'Where flowers and vegetables grow' },
    { word: 'COFFEE', clue: 'A warm morning drink' },
    { word: 'SUNSET', clue: 'The sky at the end of the day' },
    { word: 'FAMILY', clue: 'The people closest to you' },
    { word: 'PICNIC', clue: 'A meal outdoors on a blanket' },
    { word: 'MELODY', clue: 'A tune you can hum' },
    { word: 'SPRING', clue: 'The season of new blooms' },
    { word: 'BAKERY', clue: 'Where fresh bread comes from' },
    { word: 'LETTER', clue: 'Mail written by hand' },
    { word: 'CANDLE', clue: 'It glows on a birthday cake' },
    { word: 'WINDOW', clue: 'You look through it' },
    { word: 'FRIEND', clue: 'Someone you can always call' },
    { word: 'DINNER', clue: 'The evening meal' },
    { word: 'FLOWER', clue: 'A rose or a daisy' },
    { word: 'MARKET', clue: 'Where you shop for fresh food' },
  ],
  hard: [
    { word: 'MORNING', clue: 'The start of the day' },
    { word: 'RAINBOW', clue: 'Seven colors after the rain' },
    { word: 'BLANKET', clue: 'Keeps you cozy on the couch' },
    { word: 'KITCHEN', clue: 'Where the cooking happens' },
    { word: 'SUNSHINE', clue: 'What a clear day is full of' },
    { word: 'BIRTHDAY', clue: 'Cake, candles, and a song' },
    { word: 'SEASHELL', clue: 'A treasure found on the sand' },
    { word: 'LANTERN', clue: 'A light you can carry' },
    { word: 'HARVEST', clue: 'Gathering the autumn crops' },
    { word: 'WHISTLE', clue: 'A sharp little tune from your lips' },
  ],
};

const ROUND_LENGTH = 5;
const WHEEL_SIZE = 270;
const WHEEL_RADIUS = 100;

type Tile = { id: number; letter: string; used: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrambleTiles(word: string): Tile[] {
  let letters = shuffle(word.split(''));
  // Make sure the scramble isn't accidentally the word itself
  if (letters.join('') === word) letters = shuffle(letters);
  return letters.map((letter, id) => ({ id, letter, used: false }));
}

export function WordScrambleScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const round = useMemo(() => shuffle(WORD_POOLS.easy).slice(0, ROUND_LENGTH), []);
  const [roundWords, setRoundWords] = useState(round);
  const [index, setIndex] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() => scrambleTiles(round[0].word));
  const [picked, setPicked] = useState<Tile[]>([]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const [hintFree, setHintFree] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');

  const current = roundWords[index];

  useEffect(() => {
    getRecord('scramble', difficulty).then(setBest);
  }, [difficulty]);

  const loadWord = useCallback((words: WordEntry[], i: number) => {
    setTiles(scrambleTiles(words[i].word));
    setPicked([]);
    setSolved(false);
    setWrong(false);
    setShowHint(false);
  }, []);

  const onTile = (tile: Tile) => {
    if (tile.used || solved) return;
    setWrong(false);
    const nextPicked = [...picked, tile];
    setTiles((ts) => ts.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
    setPicked(nextPicked);

    if (nextPicked.length === current.word.length) {
      const guess = nextPicked.map((t) => t.letter).join('');
      if (guess === current.word) {
        setSolved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const newHintFree = hintFree + (showHint ? 0 : 1);
        setHintFree(newHintFree);
        if (index === roundWords.length - 1) {
          setDone(true);
          setDoneMsg(encouragement('win'));
          recordGamePlayed();
          submitRecord('scramble', difficulty, newHintFree, 'higher').then(({ best: b, isNew }) => {
            setBest(b);
            setIsNewBest(isNew);
          });
        }
      } else {
        setWrong(true);
      }
    }
  };

  const undo = () => {
    if (picked.length === 0 || solved) return;
    const last = picked[picked.length - 1];
    setPicked((p) => p.slice(0, -1));
    setTiles((ts) => ts.map((t) => (t.id === last.id ? { ...t, used: false } : t)));
    setWrong(false);
  };

  const clear = () => {
    if (solved) return;
    setPicked([]);
    setTiles((ts) => ts.map((t) => ({ ...t, used: false })));
    setWrong(false);
  };

  const next = () => {
    const i = index + 1;
    setIndex(i);
    loadWord(roundWords, i);
  };

  const newRound = (d: Difficulty) => {
    const fresh = shuffle(WORD_POOLS[d]).slice(0, ROUND_LENGTH);
    setRoundWords(fresh);
    setIndex(0);
    setDone(false);
    setHintFree(0);
    setIsNewBest(false);
    loadWord(fresh, 0);
  };

  const playAgain = () => newRound(difficulty);

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    newRound(d);
  };

  return (
    <Screen style={{ paddingTop: 0 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <DifficultyPicker value={difficulty} onChange={changeDifficulty} color={colors.orange} />
        <Text style={styles.progress}>
          Word {index + 1} of {roundWords.length}
        </Text>
        <Text style={styles.instructions}>Tap the letters in order to spell the word.</Text>

        <Card style={styles.clueCard}>
          <Text style={styles.clueLabel}>Clue</Text>
          <Text style={styles.clue}>{current.clue}</Text>
          {showHint && !solved && (
            <Text style={styles.hint}>Starts with “{current.word[0]}”</Text>
          )}
        </Card>

        {/* Answer slots */}
        <View style={styles.slotRow}>
          {current.word.split('').map((_, i) => (
            <View
              key={i}
              style={[
                styles.slot,
                current.word.length > 6 && { width: 36, height: 44 },
                solved && styles.slotSolved,
                wrong && styles.slotWrong,
              ]}
            >
              <Text style={styles.slotLetter}>{picked[i]?.letter ?? ''}</Text>
            </View>
          ))}
        </View>

        {wrong && <Text style={styles.wrongText}>Not quite — give it another go!</Text>}
        {solved && !done && <Text style={styles.solvedText}>That’s it! 🎉</Text>}

        {/* Letter wheel (word-puzzle style) */}
        <View style={styles.wheel}>
          {tiles.map((tile, i) => {
            const btn = tiles.length > 6 ? 50 : 56;
            const angle = (2 * Math.PI * i) / tiles.length - Math.PI / 2;
            const left = WHEEL_SIZE / 2 + WHEEL_RADIUS * Math.cos(angle) - btn / 2;
            const top = WHEEL_SIZE / 2 + WHEEL_RADIUS * Math.sin(angle) - btn / 2;
            return (
              <Pressable
                key={tile.id}
                onPress={() => onTile(tile)}
                disabled={tile.used || solved}
                style={({ pressed }) => [
                  styles.wheelLetter,
                  { left, top, width: btn, height: btn, borderRadius: btn / 2 },
                  tile.used && styles.wheelLetterUsed,
                  pressed && !tile.used && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Text style={[styles.tileLetter, tile.used && { color: colors.textFaint }]}>
                  {tile.letter}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setTiles((ts) => shuffle(ts))}
            disabled={solved}
            style={({ pressed }) => [styles.shuffleBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.shuffleIcon}>⟳</Text>
          </Pressable>
        </View>

        {!solved && (
          <View style={styles.actionRow}>
            <Button label="Undo" onPress={undo} variant="secondary" icon="arrow-undo" />
            <Button label="Clear" onPress={clear} variant="secondary" icon="close" />
            {!showHint && (
              <Button label="Hint" onPress={() => setShowHint(true)} variant="secondary" icon="bulb" />
            )}
          </View>
        )}

        {solved && !done && (
          <View style={{ marginTop: spacing.lg }}>
            <Button label="Next word" onPress={next} icon="arrow-forward" color={colors.orange} full />
          </View>
        )}

        {done && (
          <Card style={styles.doneCard}>
            <Text style={styles.doneTitle}>{doneMsg}</Text>
            {isNewBest && <Text style={styles.newBest}>New personal best!</Text>}
            <Text style={styles.doneSub}>
              All five solved — {hintFree} without hints.
              {best != null ? ` Best: ${best}.` : ''}
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <Button label="Play again" onPress={playAgain} icon="refresh" color={colors.orange} />
            </View>
          </Card>
        )}
      </ScrollView>
      {done && <Confetti />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    ...typography.caption,
    color: colors.textFaint,
    textAlign: 'center',
  },
  instructions: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  clueCard: {
    marginBottom: spacing.lg,
  },
  clueLabel: {
    ...typography.tiny,
    color: colors.orange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clue: {
    ...typography.bodyLarge,
    color: colors.text,
    marginTop: 4,
  },
  hint: {
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  slot: {
    width: 44,
    height: 52,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSolved: {
    borderColor: colors.green,
    backgroundColor: '#EFF7E4',
  },
  slotWrong: {
    borderColor: colors.danger,
  },
  slotLetter: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  wrongText: {
    color: colors.danger,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  solvedText: {
    color: colors.green,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: colors.creamDeep,
    alignSelf: 'center',
    marginTop: spacing.md,
    ...shadow.soft,
  },
  wheelLetter: {
    position: 'absolute',
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  wheelLetterUsed: {
    backgroundColor: colors.surface,
  },
  tileLetter: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shuffleBtn: {
    position: 'absolute',
    left: WHEEL_SIZE / 2 - 24,
    top: WHEEL_SIZE / 2 - 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  shuffleIcon: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.orange,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
  doneCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  doneTitle: {
    ...typography.h2,
    color: colors.text,
  },
  doneSub: {
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  newBest: {
    color: colors.orange,
    fontWeight: '800',
    marginTop: 4,
  },
});
