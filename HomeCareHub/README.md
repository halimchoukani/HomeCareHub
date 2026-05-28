# HomeCareHub Mobile Application

This is the mobile application for the HomeCareHub project, built using React Native and Expo. It allows users to monitor their home devices, receive real-time alerts, and manage their profiles.

## Tech Stack

- **Framework**: React Native
- **Toolchain**: Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based routing under `app/`)
- **Real-time**: WebSockets for live notifications and admin broadcasts

## Project Structure

- `app/`: Expo Router file-based routing. Contains screens like `home`, `login`, and device management.
- `components/`: Reusable React components.
- `contexts/`: React Contexts for global state management (e.g., `SocketContext`, `AuthContext`).
- `hooks/`: Custom React hooks for shared logic.
- `constants/`: Global constants, theme colors, and configuration settings.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Set up your environment variables if needed (e.g., API URLs, Socket URLs).

3. **Run Development Server**:
   Start the Expo Metro bundler:
   ```bash
   npx expo start
   ```

4. **Running on Device/Emulator**:
   - Press `a` in the terminal to run on an Android emulator.
   - Press `i` to run on an iOS simulator.
   - Scan the QR code with the Expo Go app on your physical device.
