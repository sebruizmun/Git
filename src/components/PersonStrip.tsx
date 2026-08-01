import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './ui';
import { colors, spacing } from '../theme/theme';
import { useAppStore } from '../context/AppStore';

export function PersonStrip({ onAddPerson }: { onAddPerson: () => void }) {
  const { state, setActivePersonId } = useAppStore();

  if (state.people.length <= 1) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
      {state.people.map((p) => {
        const active = p.id === state.activePersonId;
        return (
          <Pressable key={p.id} onPress={() => setActivePersonId(p.id)} style={styles.item}>
            <View style={[styles.avatarWrap, active && styles.avatarWrapActive]}>
              <Avatar name={p.name} color={p.color} size={40} />
            </View>
            <Text numberOfLines={1} style={[styles.name, active && { color: colors.text, fontWeight: '800' }]}>
              {p.name.split(' ')[0]}
            </Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onAddPerson} style={styles.item}>
        <View style={styles.addWrap}>
          <Ionicons name="add" size={20} color={colors.blue} />
        </View>
        <Text style={styles.name}>Add</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.sm,
  },
  item: {
    alignItems: 'center',
    width: 56,
  },
  avatarWrap: {
    borderRadius: 24,
    padding: 2,
  },
  avatarWrapActive: {
    backgroundColor: colors.creamDeep,
  },
  addWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
});
