# HomeCareHub API Server

The API Server acts as the core backend and central hub for the HomeCareHub ecosystem. It handles all business logic, data persistence, user and device management, and real-time communications, bridging the mobile applications and the admin dashboard.

## Key Concepts and Purpose

The Server is built with Node.js and Express to provide a robust RESTful API and WebSocket connection point. Its primary responsibilities include:

- **Centralized Data Management**: Using PostgreSQL and Prisma ORM, it safely stores and manages relationships between `User`, `Device`, and `Person` (individuals recognized by devices).
- **Authentication & Authorization**: It secures all endpoints using JSON Web Tokens (JWT) and differentiates between regular users (who manage their home devices) and administrators (who manage the entire platform).
- **Real-time Communication**: Through `Socket.io`, it maintains persistent connections to broadcast live alerts, sensor data, and direct messages between the admin dashboard and mobile apps.
- **External Integration**: It delegates complex processing—such as handling image uploads (via Cloudinary) and validating/extracting facial embeddings (via the separate Django service).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **Real-Time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: CORS, Environment variable injection

## Directory Structure

- `controllers/`: Contains the logic for processing API requests.
- `routes/`: Express routers mapping HTTP methods and paths to controller functions.
- `middlewares/`: Custom logic for request filtering, notably `authMiddleware.ts` for security and `uploadMiddleware.ts` for handling multipart form-data.
- `services/`: Encapsulates interactions with external services (e.g., Cloudinary, Django facial recognition backend).
- `prisma/`: Contains `schema.prisma` which defines the database models and migrations.

## Database Schema Highlights

The database consists of three core models:
1. **User**: Represents a registered user. Can hold an `isAdmin` flag to grant platform-wide administrative privileges.
2. **Device**: Represents a physical HomeCareHub device installed in a home. It is linked to an owning `User`.
3. **Person**: Represents an individual known to a `Device`. Includes fields for a name, a photo URL (`facePhoto`), and a vector representing their facial structure (`faceEmbedding`) to be used by the facial recognition service. A person can also be toggled `isActive` to allow or block them.

## Security & Authentication

Security is primarily handled via the `authMiddleware.ts` which provides two levels of access control:

1. **`authenticate`**: Verifies the incoming Bearer JWT token from the `Authorization` header. Decodes the user ID and attaches the user object to the request. Required for most API actions.
2. **`authorizeAdmin`**: First authenticates the user, then specifically checks if `user.isAdmin` is true. If not, the request is rejected with a `403 Forbidden` status. Used for protecting administrative routes.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup`: Register a new user.
- `POST /login`: Authenticate a user and receive a JWT.
- `POST /reset-password`: Reset user password.
- `GET /me`: Retrieve the currently logged-in user's profile (Requires Authentication).

### Devices & Persons (`/api/devices`)
- `GET /userDevices`: List all devices owned by the authenticated user.
- `POST /:deviceId/assign`: Assign a device to the authenticated user.
- `DELETE /:deviceId/unassign`: Remove a device from the user's account.
- `POST /:deviceId/persons`: Add a new recognized person to a device (handles `facePhoto` upload).
- `GET /:deviceId/persons`: Get all persons associated with a specific device.
- `DELETE /:deviceId/persons/:personId`: Remove a person from a device.
- `PATCH /:deviceId/persons/:personId/block`: Temporarily disable a person's access/recognition.
- `PATCH /:deviceId/persons/:personId/unblock`: Re-enable a person's access.
- `POST /:deviceId/sensor-data`: Receive raw sensor data from the physical device.

### Admin Dashboard (`/api/admin`) - *Requires Admin Role*
- `POST /login`: Specialized login for the admin portal.
- `GET /dashboard`: Retrieve platform-wide metrics and stats.
- `GET /users`: List all registered users.
- `DELETE /users/:id`: Delete a specific user from the platform.
- `GET /devices`: List all registered devices.
- `DELETE /devices/:id`: Delete a specific device.
- `POST /message`: Send a system-wide or targeted message to users.

## Real-Time WebSockets (`Socket.io`)

The server initializes a WebSocket server that clients can connect to at the root URL.
- **Rooms**: Users join specific rooms identified by their User ID (`user_{userId}`). This allows the server to push private notifications regarding their specific devices.
- **Admin Communication**: Users can emit a `contact_admin` event, and administrators can broadcast messages to all users globally or directly reply.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   Provide `DATABASE_URL` (PostgreSQL), `JWT_SECRET`, `PORT`, and integration keys for Cloudinary.
3. Database Migration:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
4. Start Server:
   ```bash
   npm run dev
   ```
