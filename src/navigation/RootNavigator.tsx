import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../context/AppStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { AppointmentsListScreen } from '../screens/AppointmentsListScreen';
import { AppointmentFormScreen } from '../screens/AppointmentFormScreen';
import { AppointmentDetailScreen } from '../screens/AppointmentDetailScreen';
import { MedicationsScreen } from '../screens/MedicationsScreen';
import { MedicationFormScreen } from '../screens/MedicationFormScreen';
import { MedicationDetailScreen } from '../screens/MedicationDetailScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import { PersonFormScreen } from '../screens/PersonFormScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const TodayStack = createNativeStackNavigator();
const AppointmentsStack = createNativeStackNavigator();
const MedicationsStack = createNativeStackNavigator();
const FamilyStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTitleStyle: { color: colors.text, fontWeight: '800' as const },
  headerTintColor: colors.blue,
  contentStyle: { backgroundColor: colors.background },
};

function TodayNavigator() {
  return (
    <TodayStack.Navigator screenOptions={screenOptions}>
      <TodayStack.Screen name="Today" component={TodayScreen} options={{ headerShown: false }} />
      <TodayStack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Appointment', presentation: 'modal' }} />
      <TodayStack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'Medication', presentation: 'modal' }} />
      <TodayStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Details' }} />
      <TodayStack.Screen name="MedicationDetail" component={MedicationDetailScreen} options={{ title: 'Details' }} />
    </TodayStack.Navigator>
  );
}

function AppointmentsNavigator() {
  return (
    <AppointmentsStack.Navigator screenOptions={screenOptions}>
      <AppointmentsStack.Screen name="Appointments" component={AppointmentsListScreen} options={{ headerShown: false }} />
      <AppointmentsStack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Appointment', presentation: 'modal' }} />
      <AppointmentsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Details' }} />
    </AppointmentsStack.Navigator>
  );
}

function MedicationsNavigator() {
  return (
    <MedicationsStack.Navigator screenOptions={screenOptions}>
      <MedicationsStack.Screen name="Medications" component={MedicationsScreen} options={{ headerShown: false }} />
      <MedicationsStack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'Medication', presentation: 'modal' }} />
      <MedicationsStack.Screen name="MedicationDetail" component={MedicationDetailScreen} options={{ title: 'Details' }} />
    </MedicationsStack.Navigator>
  );
}

function FamilyNavigator() {
  return (
    <FamilyStack.Navigator screenOptions={screenOptions}>
      <FamilyStack.Screen name="Family" component={FamilyScreen} options={{ headerShown: false }} />
      <FamilyStack.Screen name="PersonForm" component={PersonFormScreen} options={{ title: 'Care Circle', presentation: 'modal' }} />
    </FamilyStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={screenOptions}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    </SettingsStack.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.blue,
    text: colors.text,
    border: colors.border,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            TodayTab: focused ? 'home' : 'home-outline',
            AppointmentsTab: focused ? 'calendar' : 'calendar-outline',
            MedicationsTab: focused ? 'medkit' : 'medkit-outline',
            FamilyTab: focused ? 'people' : 'people-outline',
            SettingsTab: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TodayTab" component={TodayNavigator} options={{ title: 'Today' }} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsNavigator} options={{ title: 'Visits' }} />
      <Tab.Screen name="MedicationsTab" component={MedicationsNavigator} options={{ title: 'Meds' }} />
      <Tab.Screen name="FamilyTab" component={FamilyNavigator} options={{ title: 'Family' }} />
      <Tab.Screen name="SettingsTab" component={SettingsNavigator} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { state, loading } = useAppStore();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {state.onboarded ? <MainTabs /> : <OnboardingScreen />}
    </NavigationContainer>
  );
}
