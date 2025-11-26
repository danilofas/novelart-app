# NovelArt App

A React Native mobile application for the NovelArt platform - a written novels platform available at https://novelart.com.br

## Features

- 📚 Browse and read novels
- 🔍 Search for novels and authors
- 📖 Chapter reader with customizable settings (font size, theme)
- 👤 User authentication (Email, Google, Apple Sign-In)
- 📚 Personal library management
- 🔔 Push notifications for new chapters
- 📱 Support for Android SDK 35 (16KB pages) and iOS

## Tech Stack

- React Native 0.82.1
- React 19.1.1
- TypeScript
- Firebase Authentication
- Firebase Cloud Messaging
- React Navigation

## Prerequisites

- Node.js >= 20
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- Firebase project configured

## Installation

1. Clone the repository:
```bash
git clone https://github.com/danilofas/novelart-app.git
cd novelart-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password, Google, Apple)
   - Enable Cloud Messaging
   - Download `google-services.json` and place it in `android/app/`
   - Download `GoogleService-Info.plist` and place it in `ios/NovelArtApp/`
   - Update the Google Sign-In web client ID in `src/services/firebaseAuth.ts`

4. iOS Setup:
```bash
cd ios && pod install && cd ..
```

5. Run the app:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration
├── screens/        # App screens
│   ├── auth/       # Authentication screens
│   └── main/       # Main app screens
├── services/       # API and external services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## API Integration

This app integrates with the NovelArt API. Documentation available at:
https://novelart.com.br/api/docs

## Configuration

### Android (SDK 35 / 16KB Pages)

The app is configured to target Android SDK 35 with 16KB page size support:
- `targetSdkVersion`: 35
- `compileSdkVersion`: 35
- JNI libraries are configured for 16KB page alignment

### iOS

The app supports the minimum iOS version as defined by React Native (iOS 15.1+).

## License

This project is proprietary software for NovelArt.

## Contact

For questions or support, visit https://novelart.com.br
