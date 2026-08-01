import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/theme';
import { useAppStore } from '../context/AppStore';
import type { Role } from '../types/models';

export function OnboardingScreen() {
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState<0 | 1>(0);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRoleContinue = () => {
    if (!role) return;
    setStep(1);
  };

  const handleFinish = async () => {
    if (!name.trim() || !role) return;
    setSubmitting(true);
    await completeOnboarding({ name: name.trim(), role, relationship: relationship.trim() || undefined });
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.creamDeep, colors.background]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Logo size={104} />
        </View>
        <Text style={styles.appName}>Care Companion</Text>
        <Text style={styles.tagline}>Appointments &amp; medicine reminders, made simple and friendly.</Text>

        {step === 0 ? (
          <View style={styles.card}>
            <Text style={styles.question}>Who's using this app?</Text>
            <Text style={styles.helper}>This helps us tailor the experience for you.</Text>

            <RoleCard
              icon="person-circle-outline"
              title="I'm the patient"
              subtitle="Track my own appointments and medications"
              selected={role === 'patient'}
              onPress={() => setRole('patient')}
              color={colors.blue}
            />
            <RoleCard
              icon="heart-circle-outline"
              title="I'm a caregiver"
              subtitle="Help manage care for a family member or someone I support"
              selected={role === 'caregiver'}
              onPress={() => setRole('caregiver')}
              color={colors.pink}
            />

            <View style={{ marginTop: spacing.lg }}>
              <Button label="Continue" onPress={handleRoleContinue} disabled={!role} icon="arrow-forward" full />
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.question}>
              {role === 'patient' ? "What's your name?" : "Who are you caring for?"}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={role === 'patient' ? 'Your name' : "Their name"}
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              autoFocus
            />
            {role === 'caregiver' && (
              <>
                <Text style={[styles.helper, { marginTop: spacing.md }]}>Your relationship (optional)</Text>
                <TextInput
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="e.g. Mom, Dad, Spouse"
                  placeholderTextColor={colors.textFaint}
                  style={styles.input}
                />
              </>
            )}

            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <Button
                label="Get started"
                onPress={handleFinish}
                disabled={!name.trim()}
                loading={submitting}
                icon="checkmark"
                full
              />
              <Button label="Back" onPress={() => setStep(0)} variant="ghost" full />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: spacing.sm }}>
      <View
        style={[
          roleStyles.card,
          selected && { borderColor: color, backgroundColor: `${color}14` },
        ]}
      >
        <View style={[roleStyles.iconWrap, { backgroundColor: selected ? color : colors.background }]}>
          <Ionicons name={icon} size={24} color={selected ? '#fff' : color} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={roleStyles.title}>{title}</Text>
          <Text style={roleStyles.subtitle}>{subtitle}</Text>
        </View>
        {selected && <Ionicons name="checkmark-circle" size={24} color={color} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  logoWrap: {
    marginBottom: spacing.md,
  },
  appName: {
    ...(typography.display as any),
    color: colors.text,
  },
  tagline: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  question: {
    ...(typography.h2 as any),
    color: colors.text,
    marginBottom: 4,
  },
  helper: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
});

const roleStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
