# Admin Dashboard

The Admin Dashboard is a web-based application built for administrators to manage the HomeCareHub ecosystem. It provides an interface to monitor platform statistics, manage users and connected devices, and broadcast real-time messages.

## Tech Stack

- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS / Predefined Design System
- **Routing**: React Router (if applicable)
- **Real-time**: WebSockets (Socket.io-client) for real-time updates and broadcasting

## Features

- **Dashboard Overview**: View platform statistics such as the number of active users, total devices, and system health.
- **User & Device Management**: Add, update, or remove users and their associated devices.
- **Admin Broadcasting**: Send real-time broadcast signals to all connected clients via WebSockets.
- **Authentication**: Secure admin login and session management.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy the `.env.example` file to `.env` and configure the necessary variables (e.g., API endpoint URL).
   ```bash
   cp .env.example .env
   ```

3. **Development Server**:
   Start the Vite development server:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```
