import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { Avatar, Card, IconButton, Screen } from '../components/ui';
import { colors, spacing, typography } from '../theme/theme';
import type { FamilyStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<FamilyStackParamList>;

export function FamilyScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setActivePersonId, deletePerson } = useAppStore();

  const confirmDelete = (id: string, name: string) => {
    if (state.people.length === 1) {
      Alert.alert('Cannot remove', 'You need at least one profile in your Care Circle.');
      return;
    }
    Alert.alert(`Remove ${name}?`, 'Their appointments and medications will be deleted too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deletePerson(id) },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={typography.display as any}>Care Circle</Text>
          <Text style={styles.subtitle}>Everyone you're scheduling for</Text>
        </View>
        <IconButton icon="add" bg={colors.green} color="#fff" onPress={() => navigation.navigate('PersonForm', undefined)} />
      </View>

      <FlatList
        data={state.people}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const active = item.id === state.activePersonId;
          const apptCount = state.appointments.filter((a) => a.personId === item.id).length;
          const medCount = state.medications.filter((m) => m.personId === item.id).length;
          return (
            <Card style={[styles.card, active && styles.cardActive]} onPress={() => setActivePersonId(item.id)}>
              <Avatar name={item.name} color={item.color} size={52} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>
                  {item.role === 'patient' ? 'Patient' : `Caregiver${item.relationship ? ` · ${item.relationship}` : ''}`}
                </Text>
                <Text style={styles.stats}>
                  {apptCount} appointment{apptCount === 1 ? '' : 's'} · {medCount} medication{medCount === 1 ? '' : 's'}
                </Text>
              </View>
              {active && (
                <View style={styles.activeTag}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
              <IconButton
                icon="ellipsis-horizontal"
                bg="transparent"
                color={colors.textFaint}
                onPress={() =>
                  Alert.alert(item.name, undefined, [
                    { text: 'Edit', onPress: () => navigation.navigate('PersonForm', { personId: item.id }) },
                    { text: 'Remove', style: 'destructive', onPress: () => confirmDelete(item.id, item.name) },
                    { text: 'Cancel', style: 'cancel' },
                  ])
                }
              />
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: colors.blue,
  },
  name: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
  },
  role: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  stats: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 3,
  },
  activeTag: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
});
