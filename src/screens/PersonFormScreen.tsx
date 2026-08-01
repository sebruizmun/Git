import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppStore } from '../context/AppStore';
import { Button, Chip } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/theme';
import type { FamilyStackParamList } from '../navigation/types';
import type { Role } from '../types/models';

export function PersonFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<FamilyStackParamList, 'PersonForm'>>();
  const { state, addPerson, updatePerson, setActivePersonId } = useAppStore();
  const editing = route.params?.personId ? state.people.find((p) => p.id === route.params?.personId) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [role, setRole] = useState<Role>(editing?.role ?? 'patient');
  const [relationship, setRelationship] = useState(editing?.relationship ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    if (editing) {
      updatePerson(editing.id, { name: name.trim(), role, relationship: relationship.trim() || undefined });
    } else {
      const person = await addPerson({
        name: name.trim(),
        role,
        relationship: relationship.trim() || undefined,
        seedDemoData: false,
      });
      setActivePersonId(person.id);
    }
    setSaving(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
        <Field label="Name">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Grandma Joan"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoFocus={!editing}
          />
        </Field>

        <Field label="Role">
          <View style={styles.chipRow}>
            <Chip label="Patient" selected={role === 'patient'} onPress={() => setRole('patient')} color={colors.blue} />
            <Chip label="Caregiver" selected={role === 'caregiver'} onPress={() => setRole('caregiver')} color={colors.pink} />
          </View>
        </Field>

        <Field label="Relationship to you (optional)">
          <TextInput
            value={relationship}
            onChangeText={setRelationship}
            placeholder="e.g. Mom, Dad, Myself"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </Field>

        <Button label={editing ? 'Save Changes' : 'Add to Care Circle'} onPress={handleSave} disabled={!name.trim()} loading={saving} icon="checkmark" full />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
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
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
