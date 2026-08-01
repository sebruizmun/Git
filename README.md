# Care Companion

A friendly, easy-to-use scheduling app for patients and their caregivers — built for tracking appointments and medication reminders together, with a playful, accessible interface. Built with React Native (Expo) so it runs natively on both iOS and Android from a single codebase.

## Features

- **Onboarding** — pick "I'm the patient" or "I'm a caregiver" and set up a profile in seconds.
- **Today view** — a daily agenda of medications due and appointments, with one-tap "Mark taken" and a progress ring.
- **Medications** — add meds with dosage, instructions, a color tag, one or more daily times, and a repeat schedule (daily, certain weekdays, monthly, or one-time). Tracks dose history and a taken-streak.
- **Appointments** — add doctor visits with date, time, location, notes, and a configurable reminder (15 min to 1 day before).
- **Care Circle** — caregivers can manage multiple patient profiles and switch between them from anywhere in the app.
- **Local reminders** — medication and appointment reminders are scheduled as on-device notifications via `expo-notifications`.
- **Playful, accessible visuals** — a warm color palette drawn from the Care Companion logo, large touch targets, and a "Large Text" accessibility setting.

All data is stored locally on-device (`AsyncStorage`) — no account or backend required.

## Tech stack

- [Expo](https://expo.dev) + React Native + TypeScript
- [React Navigation](https://reactnavigation.org) (bottom tabs + native stacks)
- `@react-native-async-storage/async-storage` for local persistence
- `expo-notifications` for local medication/appointment reminders
- `react-native-svg` for the in-app logo and progress ring
- `@react-native-community/datetimepicker` for native date/time pickers

## Getting started

```bash
npm install
npm start
```

Then press `i` for the iOS simulator, `a` for the Android emulator, or scan the QR code with the Expo Go app on your phone.

## Project structure

```
App.tsx                  App root: providers + navigation
src/
  theme/                 Colors, spacing, typography
  types/                 Shared TypeScript models
  context/AppStore.tsx   App state, persistence, and CRUD operations
  data/seed.ts            Demo data seeded for a new profile
  utils/                 Date/schedule helpers, id generation, notifications
  components/            Reusable UI (Card, Button, Chip, Avatar, ProgressRing, Logo, ...)
  navigation/             Tab + stack navigators
  screens/                One file per screen
design/
  logo-art.svg            Source artwork for the app icon/logo
assets/                   Generated app icons, splash screen, favicon
```

## Design

The app icon and in-app logo are a recreation of the Care Companion heart mark — a four-color interlocking "C" motif (green, orange, blue, pink) representing connection between patients and the people who care for them. The color palette used throughout the app is drawn directly from the logo.
