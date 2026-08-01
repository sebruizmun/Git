import type { PersonColorKey } from '../theme/theme';

export type Role = 'patient' | 'caregiver';

export interface Person {
  id: string;
  name: string;
  role: Role;
  color: PersonColorKey;
  relationship?: string; // e.g. "Mom", "Dad", "Myself"
  createdAt: string;
}

export type RepeatFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface Appointment {
  id: string;
  personId: string;
  title: string;
  doctor?: string;
  location?: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // HH:mm 24h
  notes?: string;
  reminderMinutesBefore: number | null; // null = no reminder
  notificationId?: string | null;
  createdAt: string;
}

export type MedicationColor = 'green' | 'orange' | 'blue' | 'pink' | 'rust';

export interface Medication {
  id: string;
  personId: string;
  name: string;
  dosage?: string; // e.g. "10mg"
  instructions?: string; // e.g. "Take with food"
  color: MedicationColor;
  times: string[]; // HH:mm 24h, one or more per day
  frequency: RepeatFrequency;
  daysOfWeek?: number[]; // 0=Sun..6=Sat, used when frequency === 'weekly'
  startDate: string; // ISO date
  endDate?: string | null;
  active: boolean;
  notificationIds?: Record<string, string>; // time -> notificationId
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  personId: string;
  scheduledDate: string; // ISO date
  scheduledTime: string; // HH:mm
  status: 'taken' | 'skipped' | 'pending';
  takenAt?: string; // ISO datetime
}

export interface AppState {
  people: Person[];
  activePersonId: string | null;
  appointments: Appointment[];
  medications: Medication[];
  doseLogs: DoseLog[];
  onboarded: boolean;
  settings: {
    notificationsEnabled: boolean;
    largeText: boolean;
  };
}
