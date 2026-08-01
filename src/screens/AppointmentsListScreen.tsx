import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { PersonStrip } from '../components/PersonStrip';
import { Card, EmptyState, IconButton } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/theme';
import { formatTime, relativeDayLabel, todayISO } from '../utils/date';
import { pastAppointments, upcomingAppointments } from '../utils/schedule';
import type { AppointmentsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList>;

export function AppointmentsListScreen() {
  const navigation = useNavigation<Nav>();
  const { state, activePerson } = useAppStore();
  const today = todayISO();

  const sections = useMemo(() => {
    if (!activePerson) return [];
    const upcoming = upcomingAppointments(state.appointments, activePerson.id, today);
    const past = pastAppointments(state.appointments, activePerson.id, today);
    const grouped: Record<string, typeof upcoming> = {};
    for (const appt of upcoming) {
      grouped[appt.date] = grouped[appt.date] ?? [];
      grouped[appt.date].push(appt);
    }
    const upcomingSections = Object.entries(grouped).map(([date, data]) => ({
      title: relativeDayLabel(date),
      data,
    }));
    const result = [...upcomingSections];
    if (past.length) {
      result.push({ title: 'Past', data: past.slice(0, 20) });
    }
    return result;
  }, [state.appointments, activePerson, today]);

  if (!activePerson) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PersonStrip onAddPerson={() => (navigation.getParent() as any)?.navigate('FamilyTab', { screen: 'PersonForm' })} />
      <View style={styles.header}>
        <Text style={typography.display as any}>Appointments</Text>
        <IconButton icon="add" bg={colors.pink} color="#fff" onPress={() => navigation.navigate('AppointmentForm', undefined)} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        ListEmptyComponent={
          <Card>
            <EmptyState
              icon="calendar-outline"
              title="No appointments yet"
              subtitle="Add your first appointment to keep track of visits."
              actionLabel="Add Appointment"
              onAction={() => navigation.navigate('AppointmentForm', undefined)}
            />
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}>
            <View style={styles.timeWrap}>
              <Text style={styles.time}>{formatTime(item.time)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.title}>{item.title}</Text>
              {!!item.doctor && <Text style={styles.subtitle}>{item.doctor}</Text>}
              {!!item.location && <Text style={styles.subtitle}>{item.location}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...(typography.h3 as any),
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeWrap: {
    backgroundColor: colors.creamDeep,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 78,
    alignItems: 'center',
  },
  time: {
    fontWeight: '800',
    fontSize: 13,
    color: colors.navy,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
