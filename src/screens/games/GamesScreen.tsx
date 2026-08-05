import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/ui';
import { colors, radii, shadow, spacing, typography } from '../../theme/theme';
import type { GamesStackParamList } from '../../navigation/types';
import { getBrainStats, type BrainStats } from '../../utils/brainStreak';

type Nav = NativeStackNavigationProp<GamesStackParamList>;

const GAMES: {
  key: keyof Omit<GamesStackParamList, 'Games'>;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
}[] = [
  {
    key: 'MemoryMatch',
    title: 'Memory\nMatch',
    subtitle: 'Find the pairs',
    icon: 'copy',
    gradient: [colors.blueLight, colors.blue],
  },
  {
    key: 'PatternRecall',
    title: 'Pattern\nRecall',
    subtitle: 'Repeat the colors',
    icon: 'color-palette',
    gradient: [colors.greenLight, colors.green],
  },
  {
    key: 'WordScramble',
    title: 'Word\nScramble',
    subtitle: 'Spin the letters',
    icon: 'text',
    gradient: [colors.orangeLight, colors.orange],
  },
  {
    key: 'Trivia',
    title: 'Trivia\nTime',
    subtitle: 'Test your smarts',
    icon: 'bulb',
    gradient: [colors.pinkLight, colors.pink],
  },
];

function GameTile({
  title,
  subtitle,
  icon,
  gradient,
  onPress,
  delay,
  iconSize,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  onPress: () => void;
  delay: number;
  iconSize: number;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay,
      speed: 12,
      bounciness: 9,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <Animated.View
      style={[
        styles.tileWrap,
        { opacity: enter, transform: [{ translateY: enterTranslate }, { scale: press }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(press, { toValue: 0.95, speed: 40, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(press, { toValue: 1, speed: 40, useNativeDriver: true }).start()
        }
        style={{ flex: 1 }}
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
          <View
            style={[
              styles.tileIcon,
              { width: iconSize, height: iconSize, borderRadius: iconSize / 2 },
            ]}
          >
            <Ionicons name={icon} size={iconSize * 0.58} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.tileTitle}>{title}</Text>
            <Text style={styles.tileSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.tilePlay}>
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function GamesScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  // Scale the game logo with the screen: ~19% of screen width, kept sensible on any phone
  const iconSize = Math.min(88, Math.max(64, Math.round(width * 0.19)));
  const [stats, setStats] = useState<BrainStats>({ streak: 0, lastPlayed: null, totalGames: 0 });

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getBrainStats().then((s) => {
        if (alive) setStats(s);
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={styles.header}>
          <Text style={typography.display as any}>Game Corner</Text>
          <Text style={styles.subtitle}>A little brain exercise, at your own pace</Text>
        </View>

        {/* Streak banner */}
        <View style={styles.streakCard}>
          <View style={styles.streakFlame}>
            <Ionicons name="flame" size={30} color={colors.orangeLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>
              {stats.streak > 0 ? `${stats.streak}-day streak!` : 'Start your streak'}
            </Text>
            <Text style={styles.streakSub}>
              {stats.totalGames > 0
                ? `${stats.totalGames} game${stats.totalGames === 1 ? '' : 's'} played — one a day keeps it alive`
                : 'Finish any game today to light the flame'}
            </Text>
          </View>
          {stats.streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{stats.streak}</Text>
            </View>
          )}
        </View>

        {/* Game tiles */}
        <View style={styles.grid}>
          {GAMES.map((g, i) => (
            <GameTile
              key={g.key}
              title={g.title}
              subtitle={g.subtitle}
              icon={g.icon}
              gradient={g.gradient}
              onPress={() => navigation.navigate(g.key)}
              delay={i * 90}
              iconSize={iconSize}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  streakFlame: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.navySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  streakTitle: {
    fontWeight: '800',
    fontSize: 17,
    color: colors.cream,
  },
  streakSub: {
    color: 'rgba(251,243,221,0.7)',
    fontSize: 12.5,
    marginTop: 2,
  },
  streakBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 8,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  tileWrap: {
    width: '48.5%',
    aspectRatio: 0.82,
  },
  tile: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  tileIcon: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  tileTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 19,
    lineHeight: 23,
    textAlign: 'center',
  },
  tileSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  tilePlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
