import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '../context/AppStore';
import { Button, Chip } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/theme';
import { formatDateLong, formatTime, toISODate, todayISO } from '../utils/date';
import type { AppointmentsStackParamList } from '../navigation/types';

const REMINDER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'None', value: null },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 60 * 24 },
];

export function AppointmentFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AppointmentsStackParamList, 'AppointmentForm'>>();
  const { activePerson, state, addAppointment, updateAppointment, deleteAppointment } = useAppStore();
  const editing = route.params?.appointmentId
    ? state.appointments.find((a) => a.id === route.params?.appointmentId)
    : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [doctor, setDoctor] = useState(editing?.doctor ?? '');
  const [location, setLocation] = useState(editing?.location ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [date, setDate] = useState(editing?.date ?? route.params?.date ?? todayISO());
  const [time, setTime] = useState(editing?.time ?? '09:00');
  const [reminder, setReminder] = useState<number | null>(
    editing ? editing.reminderMinutesBefore : 60
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const dateObj = useMemo(() => new Date(`${date}T${time}:00`), [date, time]);

  const handleSave = async () => {
    if (!title.trim() || !activePerson) return;
    setSaving(true);
    const payload = {
      personId: activePerson.id,
      title: title.trim(),
      doctor: doctor.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      date,
      time,
      reminderMinutesBefore: reminder,
    };
    if (editing) {
      await updateAppointment(editing.id, payload);
    } else {
      await addAppointment(payload);
    }
    setSaving(false);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editing) return;
    Alert.alert('Delete appointment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAppointment(editing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
        <Field label="Title">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Cardiology Checkup"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </Field>

        <Field label="Doctor (optional)">
          <TextInput
            value={doctor}
            onChangeText={setDoctor}
            placeholder="e.g. Dr. Chen"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </Field>

        <Field label="Location (optional)">
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Riverside Medical Center"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </Field>

        <View style={styles.row}>
          <Field label="Date" style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              {formatDateLong(date)}
            </Text>
          </Field>
          <Field label="Time" style={{ flex: 1 }}>
            <Text style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
              {formatTime(time)}
            </Text>
          </Field>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setDate(toISODate(selected));
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={dateObj}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selected) {
                const h = String(selected.getHours()).padStart(2, '0');
                const m = String(selected.getMinutes()).padStart(2, '0');
                setTime(`${h}:${m}`);
              }
            }}
          />
        )}

        <Field label="Remind me before">
          <View style={styles.chipRow}>
            {REMINDER_OPTIONS.map((opt) => (
              <Chip
                key={opt.label}
                label={opt.label}
                selected={reminder === opt.value}
                onPress={() => setReminder(opt.value)}
                color={colors.pink}
              />
            ))}
          </View>
        </Field>

        <Field label="Notes (optional)">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything to remember for this visit"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            multiline
          />
        </Field>

        <Button label={editing ? 'Save Changes' : 'Add Appointment'} onPress={handleSave} disabled={!title.trim()} loading={saving} icon="checkmark" full />
        {editing && (
          <View style={{ marginTop: spacing.sm }}>
            <Button label="Delete Appointment" onPress={handleDelete} variant="danger" icon="trash" full />
          </View>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  label: {
    ...(typography.caption as any),
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  pickerButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
