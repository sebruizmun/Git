import type { Appointment, Medication } from '../types/models';
import { weekdayIndex } from './date';

export function isMedicationActiveOnDate(med: Medication, dateISO: string): boolean {
  if (!med.active) return false;
  if (dateISO < med.startDate) return false;
  if (med.endDate && dateISO > med.endDate) return false;

  switch (med.frequency) {
    case 'once':
      return dateISO === med.startDate;
    case 'daily':
      return true;
    case 'weekly':
      if (!med.daysOfWeek || med.daysOfWeek.length === 0) return true;
      return med.daysOfWeek.includes(weekdayIndex(dateISO));
    case 'monthly': {
      const startDay = new Date(`${med.startDate}T00:00:00`).getDate();
      const day = new Date(`${dateISO}T00:00:00`).getDate();
      return startDay === day;
    }
    default:
      return false;
  }
}

export interface DueDose {
  medication: Medication;
  time: string;
}

export function medicationsDueOn(medications: Medication[], personId: string, dateISO: string): DueDose[] {
  return medications
    .filter((m) => m.personId === personId && isMedicationActiveOnDate(m, dateISO))
    .flatMap((m) => m.times.map((time) => ({ medication: m, time })))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function appointmentsOn(appointments: Appointment[], personId: string, dateISO: string): Appointment[] {
  return appointments
    .filter((a) => a.personId === personId && a.date === dateISO)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function upcomingAppointments(appointments: Appointment[], personId: string, fromDateISO: string): Appointment[] {
  return appointments
    .filter((a) => a.personId === personId && a.date >= fromDateISO)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
}

export function pastAppointments(appointments: Appointment[], personId: string, fromDateISO: string): Appointment[] {
  return appointments
    .filter((a) => a.personId === personId && a.date < fromDateISO)
    .sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)));
}
