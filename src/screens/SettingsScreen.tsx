import React from 'react';
import { Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { Logo } from '../components/Logo';
import { Card, Screen } from '../components/ui';
import { colors, spacing, typography } from '../theme/theme';
import { ensureNotificationPermission } from '../utils/notifications';

export function SettingsScreen() {
  const { state, activePerson, updateSettings } = useAppStore();

  return (
    <Screen>
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={typography.display as any}>Settings</Text>

      <Card style={{ marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl }}>
        <Logo size={72} />
        <Text style={styles.appName}>Care Companion</Text>
        <Text style={styles.tagline}>Caring made simple, together.</Text>
      </Card>

      <SettingsSection title="Preferences">
        <SettingsRow
          icon="notifications-outline"
          label="Reminders & Notifications"
          right={
            <Switch
              value={state.settings.notificationsEnabled}
              onValueChange={async (val) => {
                if (val) await ensureNotificationPermission();
                updateSettings({ notificationsEnabled: val });
              }}
              trackColor={{ true: colors.blue }}
            />
          }
        />
        <SettingsRow
          icon="text-outline"
          label="Large Text"
          right={
            <Switch
              value={state.settings.largeText}
              onValueChange={(val) => updateSettings({ largeText: val })}
              trackColor={{ true: colors.blue }}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Current Profile">
        <SettingsRow icon="person-outline" label={activePerson?.name ?? '—'} subtitle={activePerson?.role === 'patient' ? 'Patient' : 'Caregiver'} />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow icon="information-circle-outline" label="Version" subtitle="1.0.0" />
        <SettingsRow
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => Linking.openURL('mailto:support@carecompanion.app')}
        />
      </SettingsSection>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
    </Screen>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card>{children}</Card>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  right,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row} onTouchEnd={onPress}>
      <Ionicons name={icon} size={20} color={colors.blue} style={{ marginRight: spacing.sm }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  tagline: {
    color: colors.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    ...(typography.caption as any),
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 1,
  },
});
