import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors, personPalette, radii, shadow, spacing, typography } from '../theme/theme';
import type { PersonColorKey } from '../theme/theme';

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle | (ViewStyle | false | undefined | null)[];
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.card, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.995 }] }]}>
      {content}
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  full,
  color,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  color?: string;
}) {
  const bg =
    variant === 'primary' ? color ?? colors.blue : variant === 'danger' ? colors.danger : 'transparent';
  const textColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : variant === 'secondary' ? colors.text : colors.blue;
  const borderColor = variant === 'secondary' ? colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyles.base,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'secondary' ? 1.5 : 0 },
        full && { alignSelf: 'stretch' },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={19} color={textColor} style={{ marginRight: 8 }} />}
          <Text style={[buttonStyles.label, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  bg = colors.surface,
  color = colors.text,
  size = 40,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  bg?: string;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  color = colors.blue,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View
        style={[
          chipStyles.base,
          selected
            ? { backgroundColor: color, borderColor: color }
            : { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[chipStyles.label, { color: selected ? '#fff' : colors.textMuted }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Avatar({ name, color, size = 44 }: { name: string; color: PersonColorKey; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const palette = personPalette[color];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.light,
        borderWidth: 2,
        borderColor: palette.main,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.navy, fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={typography.h2 as any}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textMuted, marginTop: 2 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconWrap}>
        <Ionicons name={icon} size={30} color={colors.blue} />
      </View>
      <Text style={emptyStyles.title}>{title}</Text>
      {subtitle ? <Text style={emptyStyles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.md }}>
          <Button label={actionLabel} onPress={onAction} icon="add" />
        </View>
      ) : null}
    </View>
  );
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 8,
  color = colors.green,
  label,
}: {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            fill="none"
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <Text style={{ fontWeight: '800', fontSize: size * 0.26, color: colors.text }}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
      {label ? <Text style={{ marginTop: 6, color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadow.card,
  },
});

const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});

const chipStyles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1.5,
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F7FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
