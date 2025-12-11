# SPaW Backend API Documentation

Professional REST API for SPaW (location weather app) with authentication, user management, and test endpoints.

---

## Quick Start

### Prerequisites
- Node.js v18+ and npm
- PostgreSQL 12+
- Environment variables (see `.env.example`)

### Setup
```bash
cd backend
npm install
# Configure .env with database credentials and JWT secrets
node src/server.js
```

Server runs on `http://localhost:4000` by default.

### Test the API
Run the comprehensive test suite to verify all endpoints:
```bash
node scripts/testAPI.js
```

This will test:
- ✓ Database connectivity
- ✓ API health and status
- ✓ User registration and login
- ✓ Token generation and refresh
- ✓ Test data endpoints

---

## Health & Status Endpoints

### `GET /api/health` — Server & DB Health Check
Check if the server and database are running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T12:30:45.123Z",
  "db_connected": true,
  "uptime_ms": 45000
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "timestamp": "2025-12-03T12:30:45.123Z",
  "db_connected": false,
  "error": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

---

### `GET /api/status` — API Version & Info
Get API version and environment details.

**Response (200 OK):**
```json
{
  "version": "1.0.0",
  "environment": "development",
  "uptime_seconds": 120,
  "node_version": "v22.0.0",
  "timestamp": "2025-12-03T12:30:45.123Z"
}
```

---

## Authentication Endpoints

### `POST /api/auth/register` — Register New User
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Email already registered"
}
```

---

### `POST /api/auth/login` — Login User
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

**Headers:** Refresh token set in `httpOnly` cookie
```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid email or password"
}
```

---

### `POST /api/auth/refresh` — Refresh Access Token
Get a new access token using the refresh token cookie.

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "No refresh token found"
}
```

---

### `POST /api/auth/logout` — Logout User
Clear refresh token and end session.

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Test/Debug Endpoints (Dev Only)

> ⚠️ **Warning:** These endpoints are for development and testing. Remove or restrict in production.

### `GET /api/test/users` — List All Users
Get a list of all registered users (with no sensitive data).

**Response (200 OK):**
```json
{
  "count": 2,
  "users": [
    {
      "id": 1,
      "email": "example@gmail.com",
      "username": "john_doe",
      "created_at": "2025-12-03T10:00:00.000Z"
    },
    {
      "id": 2,
      "email": "user@example.com",
      "username": "jane_doe",
      "created_at": "2025-12-03T11:30:00.000Z"
    }
  ]
}
```

---

### `POST /api/db-connection` — Test DB Connection
Verify database connectivity and version.

**Response (200 OK):**
```json
{
  "connected": true,
  "database": "spaw_db",
  "user": "postgres",
  "postgres_version": "PostgreSQL 14.2 on x86_64-pc-linux-gnu"
}
```

---

### `GET /api/echo?message=hello` — Echo Endpoint
Echo back request data for debugging.

**Response (200 OK):**
```json
{
  "message": "hello",
  "query": {
    "message": "hello"
  },
  "timestamp": "2025-12-03T12:30:45.123Z"
}
```

---

## Test Credentials

**Email:** `example@gmail.com`  
**Password:** `MyTempPass123!`

---

## Environment Variables

Create a `.env` file in the `backend/` folder:

```env
# Database
PGHOST=localhost
PGPORT=5432
PGDATABASE=spaw_db
PGUSER=postgres
PGPASSWORD=your_password

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Server
PORT=4000
NODE_ENV=development
```

---

## CORS Configuration

Frontend origins allowed (dev):
- `http://localhost:5173`
- `http://localhost:5174`

Credentials (cookies) are enabled for cross-origin requests.

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "User-friendly error message",
  "error": "Optional technical details"
}
```

Common HTTP status codes:
- `200 OK` — Request successful
- `201 Created` — Resource created
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing/invalid auth
- `500 Internal Server Error` — Server error
- `503 Service Unavailable` — Database unavailable

---

## Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Refresh tokens are stored in httpOnly cookies (secure, not accessible to JavaScript)
- CORS is enabled only for localhost dev ports
- In production, update `CORS origin` to your domain and use HTTPS

---

## Database Schema

### `users` table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

---

## Deployment Checklist

- [ ] Update `.env` with production secrets
- [ ] Change CORS `origin` to your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS in production
- [ ] Remove or restrict test endpoints (`/api/test/*`)
- [ ] Enable database SSL connections
- [ ] Set up process manager (PM2, systemd, Docker)
- [ ] Configure logging and monitoring

---

## Support

For issues or questions, open a GitHub issue or contact the development team.

