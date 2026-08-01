import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Appointment, Medication } from '../types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionRequested = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (permissionRequested && !current.canAskAgain) return false;
  permissionRequested = true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('care-companion', {
      name: 'Care Companion reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1FA6D6',
    });
  }
}

export async function cancelNotification(id?: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // notification may already be gone
  }
}

export async function scheduleMedicationReminder(
  medication: Medication,
  time: string,
  personName: string
): Promise<string | null> {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  const [hour, minute] = time.split(':').map(Number);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `💊 Time for ${medication.name}`,
      body: `${personName}: ${medication.dosage ? medication.dosage + ' — ' : ''}${
        medication.instructions ?? 'Take your medication'
      }`,
      sound: true,
      data: { type: 'medication', medicationId: medication.id, time },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function scheduleAppointmentReminder(
  appointment: Appointment,
  personName: string
): Promise<string | null> {
  if (appointment.reminderMinutesBefore == null) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const [hour, minute] = appointment.time.split(':').map(Number);
  const dt = new Date(`${appointment.date}T00:00:00`);
  dt.setHours(hour, minute, 0, 0);
  dt.setMinutes(dt.getMinutes() - appointment.reminderMinutesBefore);

  if (dt.getTime() <= Date.now()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `📅 Upcoming: ${appointment.title}`,
      body: `${personName} — ${appointment.location ?? 'Appointment'} at ${appointment.time}`,
      sound: true,
      data: { type: 'appointment', appointmentId: appointment.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dt,
    },
  });
  return id;
}
