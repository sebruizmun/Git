import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '../../components/ui';
import { spacing } from '../../theme/theme';

export type Difficulty = 'easy' | 'medium' | 'hard';

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function DifficultyPicker({
  value,
  onChange,
  color,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  color: string;
}) {
  return (
    <View style={styles.row}>
      {(Object.keys(LABELS) as Difficulty[]).map((d) => (
        <Chip key={d} label={LABELS[d]} selected={value === d} onPress={() => onChange(d)} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
});
