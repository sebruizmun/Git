import { generateId } from '../utils/id';
import { addDays, todayISO } from '../utils/date';
import type { Appointment, Medication } from '../types/models';

export function seedDataForPerson(personId: string): { appointments: Appointment[]; medications: Medication[] } {
  const now = new Date().toISOString();
  const appointments: Appointment[] = [
    {
      id: generateId(),
      personId,
      title: 'Cardiology Checkup',
      doctor: 'Dr. Chen',
      location: 'Riverside Medical Center',
      date: addDays(todayISO(), 4),
      time: '10:30',
      notes: 'Bring recent blood pressure log',
      reminderMinutesBefore: 60,
      createdAt: now,
    },
    {
      id: generateId(),
      personId,
      title: 'Physical Therapy',
      doctor: 'Dana Reeves, PT',
      location: 'Sunny Hills Rehab',
      date: addDays(todayISO(), 1),
      time: '14:00',
      reminderMinutesBefore: 30,
      createdAt: now,
    },
  ];

  const medications: Medication[] = [
    {
      id: generateId(),
      personId,
      name: 'Lisinopril',
      dosage: '10mg',
      instructions: 'Take with a full glass of water',
      color: 'blue',
      times: ['08:00'],
      frequency: 'daily',
      startDate: todayISO(),
      active: true,
      createdAt: now,
    },
    {
      id: generateId(),
      personId,
      name: 'Metformin',
      dosage: '500mg',
      instructions: 'Take with food',
      color: 'orange',
      times: ['08:00', '19:00'],
      frequency: 'daily',
      startDate: todayISO(),
      active: true,
      createdAt: now,
    },
  ];

  return { appointments, medications };
}
