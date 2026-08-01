import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { Button, Chip } from '../components/ui';
import { colors, personPalette, personColorOrder, radii, spacing, typography } from '../theme/theme';
import { formatTime, todayISO, WEEKDAY_LABELS } from '../utils/date';
import type { MedicationsStackParamList } from '../navigation/types';
import type { PersonColorKey } from '../theme/theme';
import type { RepeatFrequency } from '../types/models';

const FREQUENCIES: { label: string; value: RepeatFrequency }[] = [
  { label: 'Every day', value: 'daily' },
  { label: 'Certain days', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'One time', value: 'once' },
];

export function MedicationFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MedicationsStackParamList, 'MedicationForm'>>();
  const { activePerson, state, addMedication, updateMedication, deleteMedication } = useAppStore();
  const editing = route.params?.medicationId
    ? state.medications.find((m) => m.id === route.params?.medicationId)
    : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [dosage, setDosage] = useState(editing?.dosage ?? '');
  const [instructions, setInstructions] = useState(editing?.instructions ?? '');
  const [color, setColor] = useState<PersonColorKey>(editing?.color ?? 'blue');
  const [times, setTimes] = useState<string[]>(editing?.times ?? ['08:00']);
  const [frequency, setFrequency] = useState<RepeatFrequency>(editing?.frequency ?? 'daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(editing?.daysOfWeek ?? [1, 3, 5]);
  const [active, setActive] = useState(editing?.active ?? true);
  const [showTimePickerIndex, setShowTimePickerIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: number) => {
    setDaysOfWeek((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const addTime = () => setTimes((prev) => [...prev, '12:00']);
  const removeTime = (idx: number) => setTimes((prev) => prev.filter((_, i) => i !== idx));
  const updateTime = (idx: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === idx ? value : t)));

  const handleSave = async () => {
    if (!name.trim() || !activePerson || times.length === 0) return;
    setSaving(true);
    const payload = {
      personId: activePerson.id,
      name: name.trim(),
      dosage: dosage.trim() || undefined,
      instructions: instructions.trim() || undefined,
      color,
      times: [...times].sort(),
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      startDate: editing?.startDate ?? todayISO(),
      endDate: editing?.endDate ?? null,
      active,
    };
    if (editing) {
      await updateMedication(editing.id, payload);
    } else {
      await addMedication(payload);
    }
    setSaving(false);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editing) return;
    Alert.alert('Delete medication?', 'This will remove it and its dose history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMedication(editing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
        <Field label="Medication name">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Lisinopril"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </Field>

        <View style={styles.row}>
          <Field label="Dosage (optional)" style={{ flex: 1 }}>
            <TextInput
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g. 10mg"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          </Field>
        </View>

        <Field label="Instructions (optional)">
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Take with food"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </Field>

        <Field label="Color tag">
          <View style={styles.chipRow}>
            {personColorOrder.map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} style={styles.colorSwatchWrap}>
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: personPalette[c].main },
                    color === c && styles.colorSwatchSelected,
                  ]}
                >
                  {color === c && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Times per day">
          {times.map((t, idx) => (
            <View key={idx} style={styles.timeRow}>
              <Text style={styles.pickerButton} onPress={() => setShowTimePickerIndex(idx)}>
                {formatTime(t)}
              </Text>
              {times.length > 1 && (
                <Pressable onPress={() => removeTime(idx)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={22} color={colors.textFaint} />
                </Pressable>
              )}
              {showTimePickerIndex === idx && (
                <DateTimePicker
                  value={new Date(`${todayISO()}T${t}:00`)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selected) => {
                    setShowTimePickerIndex(Platform.OS === 'ios' ? idx : null);
                    if (selected) {
                      const h = String(selected.getHours()).padStart(2, '0');
                      const m = String(selected.getMinutes()).padStart(2, '0');
                      updateTime(idx, `${h}:${m}`);
                    }
                  }}
                />
              )}
            </View>
          ))}
          <Pressable onPress={addTime} style={styles.addTimeBtn}>
            <Ionicons name="add-circle-outline" size={18} color={colors.blue} />
            <Text style={styles.addTimeLabel}>Add another time</Text>
          </Pressable>
        </Field>

        <Field label="Repeats">
          <View style={styles.chipRow}>
            {FREQUENCIES.map((f) => (
              <Chip key={f.value} label={f.label} selected={frequency === f.value} onPress={() => setFrequency(f.value)} color={colors.blue} />
            ))}
          </View>
        </Field>

        {frequency === 'weekly' && (
          <Field label="On these days">
            <View style={styles.chipRow}>
              {WEEKDAY_LABELS.map((label, idx) => (
                <Chip key={label} label={label} selected={daysOfWeek.includes(idx)} onPress={() => toggleDay(idx)} color={colors.blue} />
              ))}
            </View>
          </Field>
        )}

        {editing && (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Active (send reminders)</Text>
            <Switch value={active} onValueChange={setActive} trackColor={{ true: colors.blue }} />
          </View>
        )}

        <Button
          label={editing ? 'Save Changes' : 'Add Medication'}
          onPress={handleSave}
          disabled={!name.trim() || times.length === 0}
          loading={saving}
          icon="checkmark"
          full
        />
        {editing && (
          <View style={{ marginTop: spacing.sm }}>
            <Button label="Delete Medication" onPress={handleDelete} variant="danger" icon="trash" full />
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
    flex: 1,
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
  colorSwatchWrap: {
    padding: 2,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: colors.navy,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  removeBtn: {
    padding: 4,
  },
  addTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  addTimeLabel: {
    color: colors.blue,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  switchLabel: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 15,
  },
});
