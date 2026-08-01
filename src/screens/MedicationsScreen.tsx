import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { PersonStrip } from '../components/PersonStrip';
import { Card, EmptyState, IconButton } from '../components/ui';
import { colors, personPalette, spacing, typography } from '../theme/theme';
import { formatTime } from '../utils/date';
import type { MedicationsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MedicationsStackParamList>;

export function MedicationsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, activePerson } = useAppStore();

  const medications = useMemo(
    () => state.medications.filter((m) => m.personId === activePerson?.id).sort((a, b) => a.name.localeCompare(b.name)),
    [state.medications, activePerson]
  );

  if (!activePerson) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PersonStrip onAddPerson={() => (navigation.getParent() as any)?.navigate('FamilyTab', { screen: 'PersonForm' })} />
      <View style={styles.header}>
        <Text style={typography.display as any}>Medications</Text>
        <IconButton icon="add" bg={colors.blue} color="#fff" onPress={() => navigation.navigate('MedicationForm', undefined)} />
      </View>

      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <Card>
            <EmptyState
              icon="medkit-outline"
              title="No medications yet"
              subtitle="Add a medication and we'll remind you when it's time."
              actionLabel="Add Medication"
              onAction={() => navigation.navigate('MedicationForm', undefined)}
            />
          </Card>
        }
        renderItem={({ item }) => {
          const palette = personPalette[item.color];
          return (
            <Card style={styles.card} onPress={() => navigation.navigate('MedicationDetail', { medicationId: item.id })}>
              <View style={[styles.dot, { backgroundColor: palette.main }]} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.title}>{item.name}</Text>
                  {!item.active && <Text style={styles.pausedTag}>Paused</Text>}
                </View>
                <Text style={styles.subtitle}>
                  {item.dosage ? `${item.dosage} · ` : ''}
                  {item.times.map(formatTime).join(', ')}
                </Text>
                <Text style={styles.frequency}>{frequencyLabel(item.frequency)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
            </Card>
          );
        }}
      />
    </View>
  );
}

function frequencyLabel(freq: string) {
  switch (freq) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return 'One time';
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
  },
  pausedTag: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.creamDeep,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  frequency: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
