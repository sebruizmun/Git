import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { PersonStrip } from '../components/PersonStrip';
import { Button, Card, EmptyState, ProgressRing, Screen } from '../components/ui';
import { colors, personPalette, radii, spacing, typography } from '../theme/theme';
import { formatDateLong, formatTime, todayISO } from '../utils/date';
import { appointmentsOn, medicationsDueOn } from '../utils/schedule';
import type { TodayStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<TodayStackParamList>;

export function TodayScreen() {
  const navigation = useNavigation<Nav>();
  const { state, activePerson, toggleDoseTaken, getDoseStatus } = useAppStore();
  const today = todayISO();

  const dueDoses = useMemo(
    () => (activePerson ? medicationsDueOn(state.medications, activePerson.id, today) : []),
    [state.medications, activePerson, today]
  );
  const todaysAppointments = useMemo(
    () => (activePerson ? appointmentsOn(state.appointments, activePerson.id, today) : []),
    [state.appointments, activePerson, today]
  );

  const takenCount = dueDoses.filter((d) => getDoseStatus(d.medication.id, today, d.time) === 'taken').length;
  const progress = dueDoses.length ? takenCount / dueDoses.length : 0;

  const greeting = getGreeting();

  if (!activePerson) return null;

  return (
    <Screen>
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.blue} />}
    >
      <PersonStrip onAddPerson={() => (navigation.getParent() as any)?.navigate('FamilyTab', { screen: 'PersonForm' })} />

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{activePerson.name} 👋</Text>
          <Text style={styles.date}>{formatDateLong(today)}</Text>
        </View>
        {dueDoses.length > 0 && (
          <ProgressRing progress={progress} size={68} color={personPalette[activePerson.color].main} label="doses" />
        )}
      </View>

      <View style={styles.quickRow}>
        <QuickAction
          icon="medkit"
          label="Add Medication"
          color={colors.blue}
          onPress={() => navigation.navigate('MedicationForm', undefined)}
        />
        <QuickAction
          icon="calendar"
          label="Add Appointment"
          color={colors.pink}
          onPress={() => navigation.navigate('AppointmentForm', { date: today })}
        />
      </View>

      <Text style={styles.sectionTitle}>Today's Medications</Text>
      {dueDoses.length === 0 ? (
        <Card style={{ marginBottom: spacing.md }}>
          <EmptyState icon="medkit-outline" title="No medications scheduled today" subtitle="Add a medication to start tracking doses." />
        </Card>
      ) : (
        dueDoses.map(({ medication, time }) => {
          const status = getDoseStatus(medication.id, today, time);
          const taken = status === 'taken';
          const palette = personPalette[medication.color];
          return (
            <Card key={`${medication.id}-${time}`} style={styles.doseCard}>
              <View style={[styles.colorBar, { backgroundColor: palette.main }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{medication.name}</Text>
                <Text style={styles.itemSubtitle}>
                  {medication.dosage ? `${medication.dosage} · ` : ''}
                  {formatTime(time)}
                </Text>
              </View>
              <Button
                label={taken ? 'Taken' : 'Mark taken'}
                onPress={() => toggleDoseTaken(medication.id, today, time)}
                variant={taken ? 'secondary' : 'primary'}
                color={palette.main}
                icon={taken ? 'checkmark-circle' : 'checkmark'}
              />
            </Card>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Today's Appointments</Text>
      {todaysAppointments.length === 0 ? (
        <Card>
          <EmptyState icon="calendar-outline" title="No appointments today" subtitle="Enjoy your day, or add an upcoming visit." />
        </Card>
      ) : (
        todaysAppointments.map((appt) => (
          <Card
            key={appt.id}
            style={styles.apptCard}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appt.id })}
          >
            <View style={styles.apptTimeWrap}>
              <Text style={styles.apptTime}>{formatTime(appt.time)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.itemTitle}>{appt.title}</Text>
              {!!appt.location && <Text style={styles.itemSubtitle}>{appt.location}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          </Card>
        ))
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
    </Screen>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Card style={styles.quickCard} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  name: {
    ...(typography.display as any),
    color: colors.text,
  },
  date: {
    color: colors.textMuted,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  sectionTitle: {
    ...(typography.h3 as any),
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
    borderRadius: 3,
    position: 'absolute',
    left: -16,
    top: -16,
    bottom: -16,
  },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  apptTimeWrap: {
    backgroundColor: colors.creamDeep,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 78,
    alignItems: 'center',
  },
  apptTime: {
    fontWeight: '800',
    fontSize: 13,
    color: colors.navy,
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  itemSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
