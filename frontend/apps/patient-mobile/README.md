# IthalaMed — Patient Mobile App (Expo)

This folder contains the React Native (Expo) mobile application skeleton for the Patient slice: Registration, OTP verification, and Dashboard.

Included:
- package.json (dependencies)
- app.json (Expo config)
- App.tsx (entry)
- Navigation (React Navigation)
- Screens: RegisterScreen, VerifyOtpScreen, DashboardScreen
- Shared components (TextInput)
- RTK Query service for API calls (patientApi)
- Zod schemas for client-side validation
- Instructions to run locally, test, and security notes

Quickstart (local)
1. Prerequisites:
   - Node 18+
   - Yarn or npm
   - Expo CLI: `npm install -g expo-cli` (optional; `npx expo` works)
   - A running backend (NestJS patient-service) exposing API at an address reachable by device or emulator.

2. Install:
   cd frontend/apps/patient-mobile
   npm install
   # or
   yarn install

3. Configure API base (for local dev)
   - Create a file `.env` in this folder with:
     NEXT_PUBLIC_API_BASE_URL=http://10.0.2.2:3001/api/v1
     # Use 10.0.2.2 for Android emulator (maps to localhost)
     # For iOS simulator, use http://localhost:3001/api/v1
   - The app reads `process.env.NEXT_PUBLIC_API_BASE_URL` via Metro; if not present it falls back to http://localhost:3001/api/v1

4. Run the app:
   npx expo start
   # open on Android emulator, iOS simulator, or Expo Go on device (ensure network reachable)

Biometrics & secure storage
- The app uses `expo-local-authentication` for biometric enrollment and `expo-secure-store` to persist tokens securely.
- Ensure to test biometric flows on a real device or simulator that supports biometrics.

Testing
- Unit tests: Jest (skeleton). Run `npm test` in the folder (you may need extra config).
- E2E: Recommend using Detox or Cypress (for web).

Notes
- The registration OTP flow is simulated to match the starter backend: the tempRegistrationId returned by `/patients/register` is a base64-encoded JSON payload for local testing. In production replace this with a secure OTP delivery flow and persistent `temp_registrations` table.
- Replace `APP_ENCRYPTION_KEY` and other secrets with KMS/secure store in production.

If you want, I can:
- Add a demo `e2e` script for Detox.
- Add Storybook for the mobile components.
- Extend screens with full form fields, validations, and styles.
