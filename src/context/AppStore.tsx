import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import type {
  AppState,
  Appointment,
  DoseLog,
  Medication,
  Person,
  Role,
} from '../types/models';
import { generateId } from '../utils/id';
import { personColorOrder } from '../theme/theme';
import { seedDataForPerson } from '../data/seed';
import {
  cancelNotification,
  scheduleAppointmentReminder,
  scheduleMedicationReminder,
  setupAndroidChannel,
} from '../utils/notifications';

const STORAGE_KEY = 'care-companion:v1';

const initialState: AppState = {
  people: [],
  activePersonId: null,
  appointments: [],
  medications: [],
  doseLogs: [],
  onboarded: false,
  settings: {
    notificationsEnabled: true,
    largeText: false,
  },
};

interface AppStoreValue {
  state: AppState;
  loading: boolean;
  activePerson: Person | null;
  addPerson: (input: { name: string; role: Role; relationship?: string; seedDemoData?: boolean }) => Promise<Person>;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  setActivePersonId: (id: string) => void;
  completeOnboarding: (input: { name: string; role: Role; relationship?: string }) => Promise<void>;

  addAppointment: (input: Omit<Appointment, 'id' | 'createdAt' | 'notificationId'>) => Promise<void>;
  updateAppointment: (id: string, patch: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  addMedication: (input: Omit<Medication, 'id' | 'createdAt' | 'notificationIds'>) => Promise<void>;
  updateMedication: (id: string, patch: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  getDoseStatus: (medicationId: string, date: string, time: string) => 'taken' | 'skipped' | 'pending';
  toggleDoseTaken: (medicationId: string, date: string, time: string) => void;

  updateSettings: (patch: Partial<AppState['settings']>) => void;
}

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        await setupAndroidChannel();
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          setState({ ...initialState, ...parsed, settings: { ...initialState.settings, ...parsed.settings } });
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      } finally {
        hydrated.current = true;
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('Failed to persist state', e)
    );
  }, [state]);

  const activePerson = useMemo(
    () => state.people.find((p) => p.id === state.activePersonId) ?? null,
    [state.people, state.activePersonId]
  );

  const addPerson: AppStoreValue['addPerson'] = async ({ name, role, relationship, seedDemoData }) => {
    const usedColors = new Set(state.people.map((p) => p.color));
    const color = personColorOrder.find((c) => !usedColors.has(c)) ?? personColorOrder[state.people.length % personColorOrder.length];
    const person: Person = {
      id: generateId(),
      name,
      role,
      color,
      relationship,
      createdAt: new Date().toISOString(),
    };

    let seededAppointments: Appointment[] = [];
    let seededMedications: Medication[] = [];
    if (seedDemoData) {
      const seed = seedDataForPerson(person.id);
      seededAppointments = seed.appointments;
      seededMedications = seed.medications;
    }

    setState((prev) => ({
      ...prev,
      people: [...prev.people, person],
      activePersonId: prev.activePersonId ?? person.id,
      appointments: [...prev.appointments, ...seededAppointments],
      medications: [...prev.medications, ...seededMedications],
    }));

    return person;
  };

  const completeOnboarding: AppStoreValue['completeOnboarding'] = async ({ name, role, relationship }) => {
    const person = await addPerson({ name, role, relationship, seedDemoData: true });
    setState((prev) => ({ ...prev, onboarded: true, activePersonId: person.id }));
  };

  const updatePerson: AppStoreValue['updatePerson'] = (id, patch) => {
    setState((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const deletePerson: AppStoreValue['deletePerson'] = (id) => {
    setState((prev) => {
      const remainingPeople = prev.people.filter((p) => p.id !== id);
      const remainingAppointments = prev.appointments.filter((a) => a.personId !== id);
      const remainingMedications = prev.medications.filter((m) => m.personId !== id);
      const remainingLogs = prev.doseLogs.filter((l) => l.personId !== id);
      const wasActive = prev.activePersonId === id;
      return {
        ...prev,
        people: remainingPeople,
        appointments: remainingAppointments,
        medications: remainingMedications,
        doseLogs: remainingLogs,
        activePersonId: wasActive ? remainingPeople[0]?.id ?? null : prev.activePersonId,
      };
    });
  };

  const setActivePersonId: AppStoreValue['setActivePersonId'] = (id) => {
    setState((prev) => ({ ...prev, activePersonId: id }));
  };

  const addAppointment: AppStoreValue['addAppointment'] = async (input) => {
    const id = generateId();
    const person = state.people.find((p) => p.id === input.personId);
    const notificationId = person ? await scheduleAppointmentReminder({ ...input, id } as Appointment, person.name) : null;
    const appointment: Appointment = { ...input, id, createdAt: new Date().toISOString(), notificationId };
    setState((prev) => ({ ...prev, appointments: [...prev.appointments, appointment] }));
  };

  const updateAppointment: AppStoreValue['updateAppointment'] = async (id, patch) => {
    const existing = state.appointments.find((a) => a.id === id);
    if (!existing) return;
    await cancelNotification(existing.notificationId);
    const merged = { ...existing, ...patch };
    const person = state.people.find((p) => p.id === merged.personId);
    const notificationId = person ? await scheduleAppointmentReminder(merged, person.name) : null;
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === id ? { ...merged, notificationId } : a)),
    }));
  };

  const deleteAppointment: AppStoreValue['deleteAppointment'] = async (id) => {
    const existing = state.appointments.find((a) => a.id === id);
    if (existing) await cancelNotification(existing.notificationId);
    setState((prev) => ({ ...prev, appointments: prev.appointments.filter((a) => a.id !== id) }));
  };

  const addMedication: AppStoreValue['addMedication'] = async (input) => {
    const id = generateId();
    const person = state.people.find((p) => p.id === input.personId);
    const notificationIds: Record<string, string> = {};
    if (person) {
      for (const time of input.times) {
        const nid = await scheduleMedicationReminder({ ...input, id } as Medication, time, person.name);
        if (nid) notificationIds[time] = nid;
      }
    }
    const medication: Medication = { ...input, id, createdAt: new Date().toISOString(), notificationIds };
    setState((prev) => ({ ...prev, medications: [...prev.medications, medication] }));
  };

  const updateMedication: AppStoreValue['updateMedication'] = async (id, patch) => {
    const existing = state.medications.find((m) => m.id === id);
    if (!existing) return;
    for (const nid of Object.values(existing.notificationIds ?? {})) {
      await cancelNotification(nid);
    }
    const merged = { ...existing, ...patch };
    const person = state.people.find((p) => p.id === merged.personId);
    const notificationIds: Record<string, string> = {};
    if (person && merged.active) {
      for (const time of merged.times) {
        const nid = await scheduleMedicationReminder(merged, time, person.name);
        if (nid) notificationIds[time] = nid;
      }
    }
    setState((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => (m.id === id ? { ...merged, notificationIds } : m)),
    }));
  };

  const deleteMedication: AppStoreValue['deleteMedication'] = async (id) => {
    const existing = state.medications.find((m) => m.id === id);
    if (existing) {
      for (const nid of Object.values(existing.notificationIds ?? {})) {
        await cancelNotification(nid);
      }
    }
    setState((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
      doseLogs: prev.doseLogs.filter((l) => l.medicationId !== id),
    }));
  };

  const getDoseStatus: AppStoreValue['getDoseStatus'] = (medicationId, date, time) => {
    const log = state.doseLogs.find(
      (l) => l.medicationId === medicationId && l.scheduledDate === date && l.scheduledTime === time
    );
    return log?.status ?? 'pending';
  };

  const toggleDoseTaken: AppStoreValue['toggleDoseTaken'] = (medicationId, date, time) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setState((prev) => {
      const existing = prev.doseLogs.find(
        (l) => l.medicationId === medicationId && l.scheduledDate === date && l.scheduledTime === time
      );
      const medication = prev.medications.find((m) => m.id === medicationId);
      if (!medication) return prev;
      if (existing) {
        if (existing.status === 'taken') {
          return { ...prev, doseLogs: prev.doseLogs.filter((l) => l.id !== existing.id) };
        }
        return {
          ...prev,
          doseLogs: prev.doseLogs.map((l) =>
            l.id === existing.id ? { ...l, status: 'taken', takenAt: new Date().toISOString() } : l
          ),
        };
      }
      const newLog: DoseLog = {
        id: generateId(),
        medicationId,
        personId: medication.personId,
        scheduledDate: date,
        scheduledTime: time,
        status: 'taken',
        takenAt: new Date().toISOString(),
      };
      return { ...prev, doseLogs: [...prev.doseLogs, newLog] };
    });
  };

  const updateSettings: AppStoreValue['updateSettings'] = (patch) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  const value: AppStoreValue = {
    state,
    loading,
    activePerson,
    addPerson,
    updatePerson,
    deletePerson,
    setActivePersonId,
    completeOnboarding,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addMedication,
    updateMedication,
    deleteMedication,
    getDoseStatus,
    toggleDoseTaken,
    updateSettings,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
