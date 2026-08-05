import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button, Card, Screen } from '../../components/ui';
import { colors, radii, shadow, spacing, typography } from '../../theme/theme';
import { recordGamePlayed } from '../../utils/brainStreak';
import { encouragement, getRecord, submitRecord } from '../../utils/gameRecords';
import { DifficultyPicker, type Difficulty } from './DifficultyPicker';
import { Confetti } from './Confetti';

type Question = { q: string; options: string[]; answer: number };

const EASY_QUESTIONS: Question[] = [
  { q: 'How many colors are in a rainbow?', options: ['Five', 'Six', 'Seven', 'Eight'], answer: 2 },
  { q: 'Which fruit is famous for keeping the doctor away?', options: ['Banana', 'Apple', 'Orange', 'Grape'], answer: 1 },
  { q: 'What do bees make?', options: ['Honey', 'Butter', 'Jam', 'Cheese'], answer: 0 },
  { q: 'Which season comes after summer?', options: ['Spring', 'Winter', 'Autumn', 'Summer again'], answer: 2 },
  { q: 'How many days are in a week?', options: ['Six', 'Seven', 'Eight', 'Five'], answer: 1 },
  { q: 'What instrument has 88 keys?', options: ['Guitar', 'Piano', 'Violin', 'Harp'], answer: 1 },
  { q: 'Which planet do we live on?', options: ['Mars', 'Earth', 'Venus', 'Jupiter'], answer: 1 },
  { q: 'What do you call frozen water?', options: ['Steam', 'Ice', 'Dew', 'Fog'], answer: 1 },
  { q: 'Which meal comes first in the day?', options: ['Breakfast', 'Lunch', 'Dinner', 'Supper'], answer: 0 },
  { q: 'What color do you get mixing blue and yellow?', options: ['Purple', 'Orange', 'Green', 'Brown'], answer: 2 },
  { q: 'How many legs does a spider have?', options: ['Six', 'Eight', 'Ten', 'Twelve'], answer: 1 },
  { q: 'Which bird is known for delivering babies in stories?', options: ['The stork', 'The owl', 'The robin', 'The pigeon'], answer: 0 },
  { q: 'What do caterpillars turn into?', options: ['Bees', 'Butterflies', 'Beetles', 'Dragonflies'], answer: 1 },
  { q: 'Which ocean animal has eight arms?', options: ['Jellyfish', 'Octopus', 'Starfish', 'Lobster'], answer: 1 },
  { q: 'What is a group of lions called?', options: ['A pack', 'A herd', 'A pride', 'A troop'], answer: 2 },
];

const MEDIUM_QUESTIONS: Question[] = [
  { q: 'Which country is famous for the Eiffel Tower?', options: ['Italy', 'France', 'Spain', 'Germany'], answer: 1 },
  { q: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 2 },
  { q: 'Which month sometimes has 29 days?', options: ['February', 'April', 'June', 'March'], answer: 0 },
  { q: 'How many sides does a hexagon have?', options: ['Five', 'Six', 'Eight', 'Seven'], answer: 1 },
  { q: 'What is the capital of Italy?', options: ['Venice', 'Milan', 'Rome', 'Florence'], answer: 2 },
  { q: 'Which planet is known as the Red Planet?', options: ['Mars', 'Jupiter', 'Saturn', 'Venus'], answer: 0 },
  { q: 'How many strings does a standard violin have?', options: ['Four', 'Five', 'Six', 'Seven'], answer: 0 },
  { q: 'What gas do plants take in from the air?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], answer: 1 },
  { q: 'How many players are on a soccer team on the field?', options: ['Nine', 'Ten', 'Eleven', 'Twelve'], answer: 2 },
  { q: 'Which animal is the tallest in the world?', options: ['Elephant', 'Giraffe', 'Ostrich', 'Camel'], answer: 1 },
  { q: 'What do you call a shape with three sides?', options: ['Square', 'Triangle', 'Circle', 'Rectangle'], answer: 1 },
  { q: 'Which sea creature has a shell and walks sideways?', options: ['Crab', 'Squid', 'Eel', 'Shrimp'], answer: 0 },
];

const HARD_QUESTIONS: Question[] = [
  { q: 'What is the smallest prime number?', options: ['One', 'Two', 'Three', 'Zero'], answer: 1 },
  { q: 'Roughly how many bones are in the adult human body?', options: ['106', '206', '306', '156'], answer: 1 },
  { q: 'Which element has the symbol Fe?', options: ['Iron', 'Lead', 'Fluorine', 'Tin'], answer: 0 },
  { q: 'In which country did the ancient Olympic Games begin?', options: ['Italy', 'Egypt', 'Greece', 'Turkey'], answer: 2 },
  { q: 'Which ocean holds the deepest point on Earth?', options: ['Atlantic', 'Pacific', 'Indian', 'Southern'], answer: 1 },
  { q: 'What is the largest hot desert in the world?', options: ['Gobi', 'Sahara', 'Mojave', 'Kalahari'], answer: 1 },
  { q: 'Which language has the most native speakers?', options: ['English', 'Spanish', 'Mandarin', 'Hindi'], answer: 2 },
  { q: 'How many keys does a full-size piano have?', options: ['76', '88', '96', '92'], answer: 1 },
  { q: 'Which planet has the most moons discovered so far?', options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'], answer: 1 },
  { q: 'What is the longest river in the world often said to be?', options: ['The Amazon', 'The Nile', 'The Yangtze', 'The Mississippi'], answer: 1 },
  { q: 'What is a group of crows called?', options: ['A murder', 'A flock', 'A gaggle', 'A parliament'], answer: 0 },
  { q: 'Which vitamin do we mainly get from sunlight?', options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin B12'], answer: 2 },
];

const POOLS: Record<Difficulty, Question[]> = {
  easy: EASY_QUESTIONS,
  medium: MEDIUM_QUESTIONS,
  hard: HARD_QUESTIONS,
};

const ROUND_LENGTH = 5;

// Quiz-show style answer colors + shapes
const ANSWER_COLORS = ['#E21B3C', '#1368CE', '#D89E00', '#26890C'];
const ANSWER_ICONS: (keyof typeof Ionicons.glyphMap)[] = ['triangle', 'ellipse', 'square', 'star'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TriviaScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [round, setRound] = useState<Question[]>(() => shuffle(EASY_QUESTIONS).slice(0, ROUND_LENGTH));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [endMessage, setEndMessage] = useState('');

  const current = round[index];

  useEffect(() => {
    getRecord('trivia', difficulty).then(setBest);
  }, [difficulty]);
  const answered = selected !== null;

  const onSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === current.answer) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const next = () => {
    if (index === round.length - 1) {
      setDone(true);
      setEndMessage(encouragement(score === ROUND_LENGTH ? 'win' : score >= 3 ? 'good' : 'okay'));
      recordGamePlayed();
      submitRecord('trivia', difficulty, score, 'higher').then(({ best: b, isNew }) => {
        setBest(b);
        setIsNewBest(isNew);
      });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const newRound = (d: Difficulty) => {
    setRound(shuffle(POOLS[d]).slice(0, ROUND_LENGTH));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setIsNewBest(false);
  };

  const playAgain = () => newRound(difficulty);

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    newRound(d);
  };

  if (done) {
    return (
      <Screen style={{ paddingTop: 0 }}>
        <View style={{ padding: spacing.lg }}>
          <Card style={styles.doneCard}>
            <Text style={styles.doneTitle}>{endMessage}</Text>
            {isNewBest && <Text style={styles.newBest}>New personal best!</Text>}
            <Text style={styles.doneSub}>
              You got {score} of {ROUND_LENGTH} right.
              {best != null ? ` Best: ${best}/${ROUND_LENGTH}.` : ''}
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <Button label="Play again" onPress={playAgain} icon="refresh" color={colors.pink} />
            </View>
          </Card>
        </View>
        {score >= 3 && <Confetti />}
      </Screen>
    );
  }

  return (
    <Screen style={{ paddingTop: 0 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <DifficultyPicker value={difficulty} onChange={changeDifficulty} color={colors.pink} />
        <Text style={styles.progress}>
          Question {index + 1} of {round.length} · Score {score}
        </Text>

        {/* Progress bar (quiz-show style) */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((index + (answered ? 1 : 0)) / round.length) * 100}%` }]} />
        </View>

        <Card style={styles.questionCard}>
          <Text style={styles.question}>{current.q}</Text>
        </Card>

        {/* Colored answer grid with shape icons */}
        <View style={styles.answerGrid}>
          {current.options.map((opt, i) => {
            const isCorrect = answered && i === current.answer;
            const isWrongPick = answered && selected === i && i !== current.answer;
            const dimmed = answered && !isCorrect && !isWrongPick;
            return (
              <Pressable
                key={i}
                onPress={() => onSelect(i)}
                disabled={answered}
                style={({ pressed }) => [
                  styles.answerBtn,
                  { backgroundColor: ANSWER_COLORS[i % ANSWER_COLORS.length] },
                  dimmed && { opacity: 0.35 },
                  pressed && !answered && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <Ionicons name={ANSWER_ICONS[i % ANSWER_ICONS.length]} size={20} color="#FFFFFF" />
                <Text style={styles.answerText}>{opt}</Text>
                {isCorrect && <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />}
                {isWrongPick && <Ionicons name="close-circle" size={24} color="#FFFFFF" />}
              </Pressable>
            );
          })}
        </View>

        {answered && (
          <View style={{ marginTop: spacing.lg }}>
            <Button
              label={index === round.length - 1 ? 'See results' : 'Next question'}
              onPress={next}
              icon="arrow-forward"
              color={colors.pink}
              full
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    ...typography.caption,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  questionCard: {
    marginBottom: spacing.lg,
  },
  question: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.creamDeep,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pink,
  },
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  answerBtn: {
    width: '48%',
    minHeight: 96,
    borderRadius: radii.md,
    padding: spacing.sm,
    justifyContent: 'space-between',
    ...shadow.soft,
  },
  answerText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '800',
    flexShrink: 1,
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
