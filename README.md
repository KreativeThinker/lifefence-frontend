# LifeFence Frontend

This repository contains the frontend for the LifeFence project, a mobile-based faculty attendance management system utilizing geofencing. The frontend is built using **Flutter** and provides a user-friendly interface for faculty members to track their attendance.

## Features

- **Geolocation Services**: Automatically track faculty entry and exit from designated geofenced areas.
- **Attendance View**: Display attendance records, upcoming schedules, and notifications.
- **User Authentication**: Secure login for faculty members.
- **Map Integration**: Display geofenced areas using OpenMaps API.
- **Push Notifications**: Alerts and updates on attendance status and geofence events.

## Installation

### Prerequisites

Ensure you have the following installed:

- Flutter SDK (latest stable version)
- Android Studio or Xcode (for iOS) with proper device emulators
- Supabase API key for backend communication

### Frontend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/lifefence-frontend.git
   cd lifefence-frontend
   ```

2. **Install Flutter Dependencies**
   Run the following command to install necessary dependencies:
   ```bash
   flutter pub get
   ```

3. **Configure API Endpoints**
   Create an environment configuration file `lib/config/env.dart` and define the backend API URL and other necessary configurations:
   ```dart
   class Env {
     static const String apiUrl = "http://your-backend-url";
     static const String supabaseKey = "your-supabase-api-key";
   }
   ```

4. **Run the App**
   To run the app in development mode:
   ```bash
   flutter run
   ```

   This will launch the app on your connected emulator or device.

### Running on Different Platforms

- For **iOS**, ensure you have Xcode installed and configured.
- For **Android**, ensure you have Android Studio and the appropriate emulators set up.

### Testing the Application

To run the Flutter tests, use:
```bash
flutter test
```

This will execute the unit tests for the project.

### Deployment

For production builds:

- **Android**:
  ```bash
  flutter build apk --release
  ```
- **iOS**:
  ```bash
  flutter build ios --release
  ```

Check the [Flutter documentation](https://flutter.dev/docs) for more information on deploying the app to stores.

## Project Structure

```
lifefence-frontend/
├── lib/
│   ├── api/               # Backend API integration
│   ├── models/            # Data models
│   ├── screens/           # UI screens for the app
│   ├── services/          # Business logic and geofencing
│   ├── widgets/           # Reusable UI components
│   └── main.dart          # App entry point
├── test/                  # Unit tests
├── pubspec.yaml           # Flutter dependencies
└── README.md              # This file
```

## Contributing

We welcome contributions! To contribute to this repository:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for more details.