import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { Button, Card } from '../components/ui';
import { colors, personPalette, radii, spacing, typography } from '../theme/theme';
import { addDays, formatTime, relativeDayLabel, todayISO } from '../utils/date';
import { isMedicationActiveOnDate } from '../utils/schedule';
import type { MedicationsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MedicationsStackParamList>;

export function MedicationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<MedicationsStackParamList, 'MedicationDetail'>>();
  const { state, toggleDoseTaken, getDoseStatus } = useAppStore();
  const medication = state.medications.find((m) => m.id === route.params.medicationId);

  const history = useMemo(() => {
    if (!medication) return [];
    const today = todayISO();
    const days: { date: string; times: string[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, -i);
      if (isMedicationActiveOnDate(medication, date)) {
        days.push({ date, times: medication.times });
      }
    }
    return days;
  }, [medication, state.doseLogs]);

  const streak = useMemo(() => {
    if (!medication) return 0;
    let count = 0;
    let date = addDays(todayISO(), -1);
    for (let i = 0; i < 60; i++) {
      if (!isMedicationActiveOnDate(medication, date)) {
        date = addDays(date, -1);
        continue;
      }
      const allTaken = medication.times.every((t) => getDoseStatus(medication.id, date, t) === 'taken');
      if (!allTaken) break;
      count++;
      date = addDays(date, -1);
    }
    return count;
  }, [medication, state.doseLogs]);

  if (!medication) return null;
  const palette = personPalette[medication.color];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.dot, { backgroundColor: palette.main }]} />
          <Text style={[typography.h1 as any, { marginLeft: spacing.sm }]}>{medication.name}</Text>
        </View>
        {!!medication.dosage && <Text style={styles.dosage}>{medication.dosage}</Text>}
        {!!medication.instructions && <Text style={styles.instructions}>{medication.instructions}</Text>}

        <View style={styles.streakRow}>
          <Ionicons name="flame" size={20} color={colors.orange} />
          <Text style={styles.streakText}>{streak}-day streak</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Recent doses</Text>
      {history.map(({ date, times }) => (
        <Card key={date} style={{ marginBottom: spacing.sm }}>
          <Text style={styles.dayLabel}>{relativeDayLabel(date)}</Text>
          {times.map((time) => {
            const status = getDoseStatus(medication.id, date, time);
            const taken = status === 'taken';
            return (
              <View key={time} style={styles.doseRow}>
                <Text style={styles.doseTime}>{formatTime(time)}</Text>
                <Button
                  label={taken ? 'Taken' : 'Mark taken'}
                  onPress={() => toggleDoseTaken(medication.id, date, time)}
                  variant={taken ? 'secondary' : 'primary'}
                  color={palette.main}
                  icon={taken ? 'checkmark-circle' : 'checkmark'}
                />
              </View>
            );
          })}
        </Card>
      ))}

      <View style={{ marginTop: spacing.sm }}>
        <Button
          label="Edit Medication"
          onPress={() => navigation.navigate('MedicationForm', { medicationId: medication.id })}
          icon="create-outline"
          variant="secondary"
          full
        />
      </View>
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dosage: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontWeight: '700',
  },
  instructions: {
    marginTop: 4,
    color: colors.textMuted,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.creamDeep,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  streakText: {
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitle: {
    ...(typography.h3 as any),
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dayLabel: {
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  doseTime: {
    color: colors.textMuted,
    fontWeight: '700',
  },
});
