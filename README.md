# Expo push notifications

Mobile application built with Expo and React Native to demonstrate a generic push notification flow and internal deep linking to a demo detail screen.

## Companion project

This mobile application can be used with
[expo-notifications-api](https://github.com/SabriBere/expo-notifications-api), a Node.js backend that
provides HTTP endpoints and Expo push-notification
delivery.

```text
expo-push-notifications (Expo / React Native)
              ↕
             HTTP
              ↕
expo-notifications-api (Node.js / Express / Prisma)
              ↓
       Expo Push Service
```

## Table of Contents

- [Companion project](#companion-project)
- [Project Goal](#project-goal)
- [Current Scope](#current-scope)
- [Project Stack](#project-stack)
- [Main Dependencies](#main-dependencies)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Accessing the Local Backend from Android](#accessing-the-local-backend-from-android)
- [Available Scripts](#available-scripts)
- [Prebuild and EAS Builds](#prebuild-and-eas-builds)
- [Workflows](#workflows)
- [Environments and Integration](#environments-and-integration)
- [Architecture](#architecture)
- [Notification Flow](#notification-flow)
- [Formatting Configuration](#formatting-configuration)
- [License](#license)

## Project Goal

The goal of this application is to provide a technical playground for:

- registering the device for Expo push notifications,
- triggering local notifications from those events,
- navigating to a detail screen with `expo-router`.

At the moment, the project works as an experimentation and technical validation environment for the full notification flow.

## Current Scope

The application currently includes:

- a tab-based navigation structure using `expo-router`,
- a settings or demo screen,
- a notifications list screen,
- a generic notification detail screen accessible through a dynamic route,
- push permission and token registration,
- initial backend integration to register the push token.

## Project Stack

The current stack used in the project is:

- **Language:** TypeScript
- **Main framework:** React Native
- **Runtime / tooling:** Expo
- **Navigation:** Expo Router
- **Async data state:** TanStack Query
- **Notifications:** Expo Notifications
- **Target platforms:** Android, iOS, and Web
- **Linting / formatting:** ESLint + Prettier

Relevant versions currently defined in the project:

- `expo`: `^57.0.9`
- `react`: `19.2.3`
- `react-native`: `0.86.2`
- `typescript`: `~6.0.3`

## Main Dependencies

Some of the most important dependencies in this repository are:

- **expo-router:** handles file-based navigation.
- **expo-notifications:** manages permissions, categories, actions, and local/push notifications.
- **@tanstack/react-query:** provides caching and async data updates.
- **expo-dev-client:** enables development builds closer to a real native environment.
- **react-native-reanimated:** supports animations and part of the Expo Router base stack.
- **expo-image:** optimized image rendering.

For the full dependency list, check `package.json`.

## Prerequisites

Before running the project locally, make sure you have:

- Node.js `>=22.12.0`
- npm installed
- Android Studio if you want to run the Android emulator
- Xcode if you want to run the iOS simulator
- Expo CLI available through `npx expo`
- a physical device to validate real push notification behavior

> **Important:** Expo Push Notifications do not fully work in simulators for every scenario. To validate the real push token and device notification flow, use a physical device.

## Environment Variables

The project uses environment variables defined in `.env`. A base example is available in `.env.example`.

Variables used by the project:

- `EXPO_PUBLIC_API_URL`: base HTTP backend URL.
- `EXPO_PUBLIC_EAS_PROJECT_ID`: EAS project identifier.
- `EXPO_OWNER`: Expo account or organization that owns the project.
- `IOS_BUNDLE_IDENTIFIER`: unique iOS application identifier used by Apple, EAS credentials, and APNs.
- `ANDROID_PACKAGE`: unique Android application identifier.
- `GOOGLE_SERVICES_JSON`: path to the `google-services.json` file.

For a basic local start, no environment variables are required. Expo falls back to
`com.example.testnotifications` for the native application identifiers and omits
the Expo owner. Configure the real values before using EAS builds, native push
credentials, or the backend-dependent screens.

Project-specific EAS metadata is intentionally not hardcoded in the repository.
Set `EXPO_PUBLIC_EAS_PROJECT_ID` in the local `.env` file and in each EAS
environment used for remote builds or workflows.

Example:

```env
EXPO_PUBLIC_EAS_PROJECT_ID=<eas-project-id>
EXPO_OWNER=<expo-account-or-organization>
IOS_BUNDLE_IDENTIFIER=<ios-bundle-identifier>
ANDROID_PACKAGE=<android-application-id>
GOOGLE_SERVICES_JSON=<path-to-google-services-json>
EXPO_PUBLIC_API_URL=<backend-base-url>
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd expo-push-notifications
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example` and fill in the values for your environment.

### 4. Start the application

```bash
npm run start
```

Expo will open the interactive development panel, from which you can run the app in:

- Android emulator
- iOS simulator
- development build
- Web

## Accessing the Local Backend from Android

The local backend exposes the HTTP API on port `8000`.

### Physical device connected through USB

Forward the HTTP port from the Android device to the development machine:

```bash
adb reverse tcp:8000 tcp:8000
adb reverse --list
```

Then configure the local API URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Port forwarding may need to be configured again after disconnecting or
restarting the device, or after restarting the ADB server.

### Physical device connected through Wi-Fi

Use the development machine's local network IP address and make sure both
devices are connected to the same network. For example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:8000
```

The backend must listen on `0.0.0.0`, and the local firewall must allow the
connection.

### Android emulator

The standard Android emulator reaches the host machine through `10.0.2.2`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

After changing an `EXPO_PUBLIC_` variable, restart the development server so
Expo rebuilds the JavaScript bundle with the new value:

```bash
npm run start:dev-client -- --clear
```

## Available Scripts

The scripts currently defined in `package.json` are:

### `npm run start`

Starts the Expo development server.

### `npm run start:dev-client`

Starts the Expo bundler in development-client mode. Use this when running a development APK created with EAS.

### `npm run android`

Starts the project directly on Android.

### `npm run ios`

Starts the project directly on iOS.

### `npm run web`

Starts the web version of the project.

### `npm run lint`

Runs the lint process configured by Expo.

### `npm run prebuild`

Generates the native `android/` and `ios/` folders from the Expo configuration.

### `npm run build:android:development`

Creates an Android development build in EAS using the `development` profile.

### `npm run build:android:preview`

Creates an Android internal preview build in EAS using the `preview` profile.

### `npm run build:android:production`

Creates an Android production build in EAS using the `production` profile.

### `npm run build:ios:development`

Creates an iOS development build in EAS using the `development` profile.

### `npm run build:ios:preview`

Creates an iOS internal preview build in EAS using the `preview` profile.

### `npm run build:ios:production`

Creates an iOS production build in EAS using the `production` profile.

### `npm run workflow:android:apk`

Runs the EAS workflow defined in `.eas/workflows/create-preview-builds.yml`.

## Prebuild and EAS Builds

If you need native Android or iOS folders generated locally, you can run:

```bash
npm run prebuild
```

This command generates the native `android/` and `ios/` projects from the Expo configuration.

If you want to create a cloud build with Expo Application Services, use EAS:

```bash
npm run build:android:development
```

You can also use the other profiles currently defined in `eas.json`:

```bash
npm run build:android:preview
npm run build:android:production
npm run build:ios:development
npm run build:ios:preview
npm run build:ios:production
```

## iOS Remote Push Notifications

The project is prepared for iOS remote push notifications at the Expo config level:

- `ios.bundleIdentifier` is configured through `IOS_BUNDLE_IDENTIFIER`.
- `android.package` is configured through `ANDROID_PACKAGE`.
- `expo-notifications` is included in the app config plugins.
- `UIBackgroundModes` includes `remote-notification` so the native iOS project generated by EAS is ready for remote notification background delivery.
- The app already requests notification permissions and gets the Expo Push Token in `utils/NotificationsUtils.ts`.

What is still required outside the repository:

- an active Apple Developer Program membership,
- access to the Apple team that owns the app,
- an App ID / Bundle ID matching `IOS_BUNDLE_IDENTIFIER`,
- Push Notifications enabled for that App ID,
- APNs credentials configured in EAS,
- a provisioning profile generated for that Bundle ID,
- a physical iPhone to test real remote push notifications.

The easiest setup path once the Apple account exists is:

```bash
npx eas-cli login
npx eas-cli credentials -p ios
npm run build:ios:development
```

During credential setup or the first iOS build, EAS can help create and store the iOS signing credentials and APNs key. Answer yes when EAS asks to configure push notifications for the project.

> **Important:** this configuration can be committed without paying Apple, but iOS remote push notifications will not work end to end until the Apple Developer Program membership and APNs credentials exist.

### Running the generated APK

Once the Android build finishes in EAS, Expo provides a download link for the generated artifact.

You can run the `.apk` in one of these ways:

- download it from the EAS build page and install it manually on an Android device,
- open the artifact link from the Android device and install it from there,
- download it locally and install it on an emulator or connected device with:

```bash
adb install path/to/your-app.apk
```

If the APK was created with the `development` profile, after installing it you should start the local bundler with:

```bash
npm run start:dev-client
```

Then open the installed development build on the device or emulator so it connects to the local Metro server.

> **Note:** the `development` and `preview` profiles are configured for internal distribution, which is the usual flow for testing APKs outside the stores.
>
> The project scripts use `npx eas-cli`, so a global `eas` installation is not required.

## Workflows

This project separates GitHub Actions validation from Expo/EAS builds to avoid duplicated build jobs.

Main flow:

1. Work branches are merged into `develop`.
2. `develop` is validated by GitHub Actions.
3. `develop` is merged into `main`.
4. A push to `main` triggers the Expo/EAS workflow.
5. EAS validates the project, runs the Android prebuild, and generates the APK.

Responsibilities:

- `.github/workflows/deploy.yml`: runs lint and TypeScript checks for PRs into `main` or `develop`, and pushes to `develop`.
- `.github/workflows/branch-modeling.yml`: enforces the `develop -> main` branch policy and removes merged temporary branches.
- `.eas/workflows/create-preview-builds.yml`: runs on pushes to `main`, validates the project, runs Android prebuild, and generates the APK with the `preview` profile.

For the full workflow details, see [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md).

## Branching and Deployment Model

The repository is intended to use a simple branch model:

- `feature/*`, `fix/*`, or similar short-lived branches are used for daily work.
- `develop` is the integration branch. Merge feature branches here when the work should be validated but not deployed.
- `main` is the deployment branch. Merging or pushing into `main` triggers the production build workflow.

Current EAS workflow behavior:

- Pull requests into `develop` run lint and TypeScript checks only.
- Pushes to `develop` run lint and TypeScript checks only.
- Pull requests into `main` run lint and TypeScript checks only.
- Pushes to `main` run lint, TypeScript checks, and then the Android build.

Suggested flow:

```bash
git checkout develop
git pull
git checkout -b feature/my-change

# Commit work, then open a PR into develop.
# When develop is ready to ship, open a PR from develop into main.
```

If `develop` does not exist yet, create it once from the current `main`:

```bash
git checkout main
git pull
git checkout -b develop
git push -u origin develop
```

## Environments and Integration

The application is currently prepared to integrate with two main external services:

- an HTTP backend to register the push token,
- Expo Push Notifications through the device and Expo services.

Current behavior:

- push token registration is sent to `EXPO_PUBLIC_API_URL` using the `/push-tokens/register` endpoint,
- the project includes EAS configuration in `eas.json`,
- Android can load `google-services.json` from the `GOOGLE_SERVICES_JSON` variable.

Build profiles currently defined in `eas.json`:

- `development`
- `preview`
- `production`

## Architecture

The main project structure is:

```text
app/
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── notifications.tsx
├── demo-items/
│   └── [id].tsx
├── _layout.tsx
└── modal.tsx

components/
└── ui/
utils/
assets/
constants/
hooks/
```

### General Description

- **`app/`**: contains the application routes defined with `expo-router`.
- **`app/_layout.tsx`**: root layout. Initializes theme, `QueryClientProvider`, and notification observers.
- **`app/(tabs)/_layout.tsx`**: defines tab navigation.
- **`app/(tabs)/index.tsx`**: settings/demo screen.
- **`app/(tabs)/notifications.tsx`**: notifications list screen.
- **`app/demo-items/[id].tsx`**: generic notification detail screen through a dynamic route.
- **`utils/NotificationsUtils.ts`**: centralizes permissions, categories, actions, and notification generation.
- **`components/`**: reusable UI components.
- **`components/ui/`**: reusable UI controls and icon helpers.
- **`constants/`**: theme and visual constants.

## Notification Flow

The notification flow currently implemented is:

1. The app requests notification permissions on startup.
2. If the device is physical and permissions are granted, it gets the Expo Push Token.
3. The token is registered in the backend with `POST /push-tokens/register`.
4. When a push notification reaches the device, Expo delivers the payload to the app.
5. If the user taps a notification, the app navigates to the demo detail route `/demo-items/[id]`.

The repository uses an intentionally generic demo payload with no
domain-specific or user-identifying fields:

```json
{
    "itemId": 101,
    "contextId": 1001,
    "url": "/demo-items/101"
}
```

Demo items returned by `GET /notifications` use the following model:

```ts
type DemoNotification = {
    itemId: number;
    contextId: number;
    title: string;
    sourceType: string;
    source: string;
    category: string;
    link: string;
};
```

There is also a notification action called `Mark as read`, already prepared to be extended with backend or local persistence logic.

## Formatting Configuration

The project includes basic code quality tools:

- **ESLint:** configured in `eslint.config.js`
- **Prettier:** configured in `.prettierrc`

It is recommended to run `npm run lint` before pushing changes.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).

## Useful References

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Notifications](https://docs.expo.dev/push-notifications/overview/)
- [React Native](https://reactnative.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
