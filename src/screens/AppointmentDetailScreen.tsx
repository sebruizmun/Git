import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { Button, Card } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/theme';
import { formatDateLong, formatTime } from '../utils/date';
import type { AppointmentsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList>;

export function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AppointmentsStackParamList, 'AppointmentDetail'>>();
  const { state } = useAppStore();
  const appt = state.appointments.find((a) => a.id === route.params.appointmentId);

  if (!appt) return null;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Card>
        <Text style={typography.h1 as any}>{appt.title}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.pink} />
          <Text style={styles.infoText}>{formatDateLong(appt.date)} at {formatTime(appt.time)}</Text>
        </View>
        {!!appt.doctor && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={colors.pink} />
            <Text style={styles.infoText}>{appt.doctor}</Text>
          </View>
        )}
        {!!appt.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.pink} />
            <Text style={styles.infoText}>{appt.location}</Text>
          </View>
        )}
        {appt.reminderMinutesBefore != null && (
          <View style={styles.infoRow}>
            <Ionicons name="notifications-outline" size={18} color={colors.pink} />
            <Text style={styles.infoText}>Reminder {formatReminder(appt.reminderMinutesBefore)} before</Text>
          </View>
        )}
        {!!appt.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{appt.notes}</Text>
          </View>
        )}
      </Card>

      <View style={{ marginTop: spacing.md }}>
        <Button
          label="Edit Appointment"
          onPress={() => navigation.navigate('AppointmentForm', { appointmentId: appt.id })}
          icon="create-outline"
          variant="secondary"
          full
        />
      </View>
    </ScrollView>
  );
}

function formatReminder(min: number) {
  if (min >= 1440) return `${min / 1440} day${min / 1440 > 1 ? 's' : ''}`;
  if (min >= 60) return `${min / 60} hour${min / 60 > 1 ? 's' : ''}`;
  return `${min} minutes`;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  notesBox: {
    marginTop: spacing.md,
    backgroundColor: colors.creamDeep,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  notesLabel: {
    ...(typography.caption as any),
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  notesText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
