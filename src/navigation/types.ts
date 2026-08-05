export type TodayStackParamList = {
  Today: undefined;
  AppointmentForm: { appointmentId?: string; date?: string } | undefined;
  MedicationForm: { medicationId?: string } | undefined;
  AppointmentDetail: { appointmentId: string };
  MedicationDetail: { medicationId: string };
};

export type AppointmentsStackParamList = {
  Appointments: undefined;
  AppointmentForm: { appointmentId?: string; date?: string } | undefined;
  AppointmentDetail: { appointmentId: string };
};

export type MedicationsStackParamList = {
  Medications: undefined;
  MedicationForm: { medicationId?: string } | undefined;
  MedicationDetail: { medicationId: string };
};

export type FamilyStackParamList = {
  Family: undefined;
  PersonForm: { personId?: string } | undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type GamesStackParamList = {
  Games: undefined;
  MemoryMatch: undefined;
  PatternRecall: undefined;
  WordScramble: undefined;
  Trivia: undefined;
};
