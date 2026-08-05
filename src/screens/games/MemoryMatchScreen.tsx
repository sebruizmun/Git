import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button, Card, Screen } from '../../components/ui';
import { colors, radii, shadow, spacing, typography } from '../../theme/theme';
import { recordGamePlayed } from '../../utils/brainStreak';
import { encouragement, getRecord, submitRecord } from '../../utils/gameRecords';
import { DifficultyPicker, type Difficulty } from './DifficultyPicker';
import { CardArt, CardBack, ART_KINDS, type ArtKind } from './CardArt';
import { Confetti } from './Confetti';

const CONFIG: Record<Difficulty, { pairs: number; cardWidth: `${number}%`; widthFraction: number }> = {
  easy: { pairs: 4, cardWidth: '29%', widthFraction: 0.29 },
  medium: { pairs: 6, cardWidth: '29%', widthFraction: 0.29 },
  hard: { pairs: 8, cardWidth: '22%', widthFraction: 0.22 },
};

type CardState = {
  id: number;
  kind: ArtKind;
  matched: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDeck(pairs: number): CardState[] {
  const kinds = shuffle(ART_KINDS).slice(0, pairs);
  return shuffle([...kinds, ...kinds]).map((kind, id) => ({ id, kind, matched: false }));
}

function FlipCard({
  faceUp,
  matched,
  kind,
  onPress,
  width,
  artSize,
  dealDelay,
}: {
  faceUp: boolean;
  matched: boolean;
  kind: ArtKind;
  onPress: () => void;
  width: `${number}%`;
  artSize: number;
  dealDelay: number;
}) {
  const anim = useRef(new Animated.Value(faceUp ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const deal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(deal, {
      toValue: 1,
      duration: 340,
      delay: dealDelay,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: faceUp ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [faceUp, anim]);

  useEffect(() => {
    if (matched) {
      Animated.sequence([
        Animated.spring(pop, { toValue: 1.14, speed: 40, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, speed: 30, useNativeDriver: true }),
      ]).start();
    }
  }, [matched, pop]);

  const backRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const dealTranslate = deal.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Animated.View style={[styles.cardWrap, { width, opacity: deal, transform: [{ translateY: dealTranslate }] }]}>
      <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
      {/* Back (face down) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardDown,
          { transform: [{ perspective: 800 }, { rotateY: backRotate }] },
        ]}
      >
        <CardBack />
      </Animated.View>
      {/* Front (face up) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardUp,
          matched && styles.cardMatched,
          { transform: [{ perspective: 800 }, { rotateY: frontRotate }, { scale: pop }] },
        ]}
      >
        <CardArt kind={kind} size={artSize} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function MemoryMatchScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [deck, setDeck] = useState<CardState[]>(() => makeDeck(CONFIG.easy.pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    getRecord('memory', difficulty).then(setBest);
  }, [difficulty]);

  const reset = useCallback((d: Difficulty) => {
    if (timer.current) clearTimeout(timer.current);
    setDeck(makeDeck(CONFIG[d].pairs));
    setFlipped([]);
    setMoves(0);
    setDone(false);
    setIsNewBest(false);
    setRound((r) => r + 1);
  }, []);

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    reset(d);
  };

  const onCard = (id: number) => {
    if (done) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.matched || flipped.includes(id) || flipped.length === 2) return;

    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => deck.find((c) => c.id === i)!);
      if (a.kind === b.kind) {
        const newDeck = deck.map((c) =>
          c.id === a.id || c.id === b.id ? { ...c, matched: true } : c
        );
        setDeck(newDeck);
        setFlipped([]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        if (newDeck.every((c) => c.matched)) {
          const finalMoves = moves + 1;
          setDone(true);
          setDoneMsg(encouragement('win'));
          recordGamePlayed();
          submitRecord('memory', difficulty, finalMoves, 'lower').then(({ best: b, isNew }) => {
            setBest(b);
            setIsNewBest(isNew);
          });
        }
      } else {
        timer.current = setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const { width: screenWidth } = useWindowDimensions();
  const { pairs, cardWidth, widthFraction } = CONFIG[difficulty];
  // Art fills ~85% of the card's width, whatever screen it's on
  const cardPx = (screenWidth - spacing.lg * 2) * widthFraction;
  const artSize = Math.round(cardPx * 0.85);

  return (
    <Screen style={{ paddingTop: 0 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <DifficultyPicker value={difficulty} onChange={changeDifficulty} color={colors.blue} />
        <Text style={styles.instructions}>
          Tap two cards to flip them. Find all {pairs} matching pairs — take your time.
        </Text>
        <Text style={styles.moves}>
          Moves: {moves}
          {best != null ? `  ·  Best: ${best}` : ''}
        </Text>

        <View style={styles.grid}>
          {deck.map((card, i) => (
            <FlipCard
              key={`${difficulty}-${round}-${card.id}`}
              faceUp={card.matched || flipped.includes(card.id)}
              matched={card.matched}
              kind={card.kind}
              onPress={() => onCard(card.id)}
              width={cardWidth}
              artSize={artSize}
              dealDelay={i * 55}
            />
          ))}
        </View>

        {done && (
          <Card style={styles.doneCard}>
            <Text style={styles.doneTitle}>{doneMsg}</Text>
            {isNewBest && <Text style={styles.newBest}>New personal best!</Text>}
            <Text style={styles.doneSub}>
              You found every pair in {moves} moves.
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <Button label="Play again" onPress={() => reset(difficulty)} icon="refresh" color={colors.blue} />
            </View>
          </Card>
        )}
      </ScrollView>
      {done && <Confetti />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  instructions: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  moves: {
    ...typography.caption,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cardWrap: {
    aspectRatio: 0.8,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    ...shadow.soft,
  },
  cardDown: {
    backgroundColor: colors.blue,
  },
  cardUp: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardMatched: {
    borderColor: colors.green,
    backgroundColor: '#F6FBF0',
  },
  cardBack: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.85,
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
