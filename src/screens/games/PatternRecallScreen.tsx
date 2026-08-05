import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Button, Card, Screen } from '../../components/ui';
import { colors, spacing, typography } from '../../theme/theme';
import { recordGamePlayed } from '../../utils/brainStreak';
import { encouragement, getRecord, submitRecord } from '../../utils/gameRecords';
import { DifficultyPicker, type Difficulty } from './DifficultyPicker';

// Classic four-color wheel palette (Simon-style)
const PADS = [
  { key: 0, color: '#00A74A', lit: '#4CE87F' }, // green — top left
  { key: 1, color: '#B31E24', lit: '#FF5A5A' }, // red — top right
  { key: 2, color: '#CCA707', lit: '#FFE24D' }, // yellow — bottom left
  { key: 3, color: '#0F5BB5', lit: '#4DA6FF' }, // blue — bottom right
];

// Quadrant angle ranges (degrees; 0° = right, clockwise, small gaps between)
const QUADRANT_ANGLES: [number, number][] = [
  [-176, -94], // top left
  [-86, -4], // top right
  [94, 176], // bottom left
  [4, 86], // bottom right
];

const rad = (deg: number) => (deg * Math.PI) / 180;

function arcPoint(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
}

function sectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number
): string {
  const [x0, y0] = arcPoint(cx, cy, rOuter, a0);
  const [x1, y1] = arcPoint(cx, cy, rOuter, a1);
  const [x2, y2] = arcPoint(cx, cy, rInner, a1);
  const [x3, y3] = arcPoint(cx, cy, rInner, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M${x0.toFixed(2)} ${y0.toFixed(2)}`,
    `A${rOuter} ${rOuter} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `L${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `A${rInner} ${rInner} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    'Z',
  ].join(' ');
}

const CONFIG: Record<Difficulty, { start: number; stepMs: number }> = {
  easy: { start: 1, stepMs: 700 },
  medium: { start: 2, stepMs: 550 },
  hard: { start: 3, stepMs: 420 },
};

type Phase = 'idle' | 'countdown' | 'showing' | 'your-turn' | 'over';

export function PatternRecallScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [litPad, setLitPad] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [allTimeBest, setAllTimeBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [overMsg, setOverMsg] = useState('');
  const [count, setCount] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    getRecord('pattern', difficulty).then(setAllTimeBest);
  }, [difficulty]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const playSequence = useCallback((seq: number[], d: Difficulty) => {
    const { stepMs } = CONFIG[d];
    setPhase('showing');
    setProgress(0);
    seq.forEach((pad, i) => {
      later(() => setLitPad(pad), stepMs * i + 400);
      later(() => setLitPad(null), stepMs * i + 400 + stepMs * 0.7);
    });
    later(() => setPhase('your-turn'), stepMs * seq.length + 500);
  }, []);

  const randomPad = () => Math.floor(Math.random() * 4);

  const start = useCallback(
    (d: Difficulty) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setIsNewBest(false);
      const first = Array.from({ length: CONFIG[d].start }, randomPad);
      setSequence(first);
      setPhase('countdown');
      setCount(3);
      later(() => setCount(2), 700);
      later(() => setCount(1), 1400);
      later(() => playSequence(first, d), 2100);
    },
    [playSequence]
  );

  const stopAndReset = (d: Difficulty) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDifficulty(d);
    setSequence([]);
    setPhase('idle');
    setLitPad(null);
    setProgress(0);
  };

  const onPad = (pad: number) => {
    if (phase !== 'your-turn') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLitPad(pad);
    later(() => setLitPad(null), 250);

    if (pad === sequence[progress]) {
      const nextProgress = progress + 1;
      if (nextProgress === sequence.length) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const nextSeq = [...sequence, randomPad()];
        setSequence(nextSeq);
        later(() => playSequence(nextSeq, difficulty), 700);
        setPhase('idle');
      } else {
        setProgress(nextProgress);
      }
    } else {
      const reached = sequence.length - 1;
      setOverMsg(encouragement(reached >= 5 ? 'win' : reached >= 3 ? 'good' : 'okay'));
      setPhase('over');
      recordGamePlayed();
      submitRecord('pattern', difficulty, reached, 'higher').then(({ best: b, isNew }) => {
        setAllTimeBest(b);
        setIsNewBest(isNew);
      });
    }
  };

  const reached = sequence.length - 1;

  const centerLabel =
    phase === 'countdown'
      ? String(count)
      : phase === 'your-turn' || phase === 'showing' || (phase === 'idle' && sequence.length > 0)
        ? String(sequence.length)
        : '●';

  return (
    <Screen style={{ paddingTop: 0 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <DifficultyPicker value={difficulty} onChange={stopAndReset} color={colors.green} />
        <Text style={styles.instructions}>
          Watch the colors light up, then tap them back in the same order.
        </Text>

        <Text style={styles.status}>
          {phase === 'idle' && sequence.length === 0 && 'Press Start when you’re ready'}
          {phase === 'idle' && sequence.length > 0 && 'Nice! Watch closely…'}
          {phase === 'countdown' && `Ready… ${count}`}
          {phase === 'showing' && 'Watch closely…'}
          {phase === 'your-turn' && `Your turn — ${sequence.length} step${sequence.length === 1 ? '' : 's'}`}
          {phase === 'over' && ' '}
        </Text>
        {allTimeBest != null && phase !== 'over' && (
          <Text style={styles.bestLine}>Best: {allTimeBest} steps</Text>
        )}

        {sequence.length === 0 && phase !== 'countdown' && (
          <View style={{ marginBottom: spacing.lg }}>
            <Button label="Start" onPress={() => start(difficulty)} icon="play" color={colors.green} full />
          </View>
        )}

        {/* Classic circular four-color wheel */}
        <View style={styles.wheelWrap}>
          <Svg width={300} height={300} viewBox="0 0 200 200">
            {/* Outer casing */}
            <Circle cx={100} cy={100} r={99} fill={colors.navy} />
            {PADS.map((p, i) => {
              const [a0, a1] = QUADRANT_ANGLES[i];
              return (
                <Path
                  key={p.key}
                  d={sectorPath(100, 100, 92, 42, a0, a1)}
                  fill={litPad === p.key ? p.lit : p.color}
                  stroke={colors.navy}
                  strokeWidth={2}
                  onPress={() => onPad(p.key)}
                />
              );
            })}
            {/* Center hub */}
            <Circle cx={100} cy={100} r={36} fill={colors.navy} />
            <Circle cx={100} cy={100} r={33} fill={colors.navySoft} />
            <SvgText
              x={100}
              y={109}
              fontSize={centerLabel === '●' ? 14 : 26}
              fontWeight="800"
              fill={colors.cream}
              textAnchor="middle"
            >
              {centerLabel}
            </SvgText>
          </Svg>
        </View>

        {phase === 'over' && (
          <Card style={styles.doneCard}>
            <Text style={styles.doneTitle}>{overMsg}</Text>
            {isNewBest && <Text style={styles.newBest}>New personal best!</Text>}
            <Text style={styles.doneSub}>
              You remembered {reached} step{reached === 1 ? '' : 's'}.
              {allTimeBest != null ? ` All-time best: ${allTimeBest}.` : ''}
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <Button label="Play again" onPress={() => start(difficulty)} icon="refresh" color={colors.green} />
            </View>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  instructions: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  status: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    minHeight: 24,
  },
  bestLine: {
    ...typography.caption,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  wheelWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
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
