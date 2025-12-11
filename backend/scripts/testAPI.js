#!/usr/bin/env node

/**
 * SPaW API Testing Script
 * 
 * Tests all available endpoints to verify the backend is working correctly.
 * Run with: node scripts/testAPI.js
 * 
 * Tests:
 * - Health check (database connectivity)
 * - API status (version and uptime)
 * - User list (all registered users)
 * - Database connection details
 * - Echo endpoint (debugging)
 * - User registration (create new test user)
 * - User login (authenticate and get tokens)
 * - Token refresh (get new access token)
 */

const BASE_URL = "http://localhost:4000";
let accessToken = null;
let refreshToken = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n→ ${name}`, "cyan");
    await fn();
    log(`  ✓ ${name} passed`, "green");
  } catch (err) {
    log(`  ✗ ${name} failed: ${err.message}`, "red");
  }
}

async function request(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (accessToken) {
    options.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `${res.status} ${res.statusText}: ${data.message || JSON.stringify(data)}`
    );
  }

  return { status: res.status, data };
}

async function runTests() {
  log("\n╔════════════════════════════════════════╗", "blue");
  log("║     SPaW API Test Suite                ║", "blue");
  log("╚════════════════════════════════════════╝\n", "blue");

  // Health & Status Tests
  log("[ HEALTH & STATUS ]", "yellow");

  await test("GET /api/health (Database connectivity)", async () => {
    const { status, data } = await request("GET", "/api/health");
    if (status !== 200 || !data.db_connected) {
      throw new Error("Database not connected");
    }
    log(`    Status: ${data.status}, DB Connected: ${data.db_connected}`);
    log(`    Uptime: ${(data.uptime_ms / 1000).toFixed(2)}s`);
  });

  await test("GET /api/status (API Info)", async () => {
    const { status, data } = await request("GET", "/api/status");
    if (status !== 200) {
      throw new Error("Failed to get status");
    }
    log(`    Version: ${data.version}`);
    log(`    Environment: ${data.environment}`);
    log(`    Uptime: ${data.uptime_seconds}s`);
    log(`    Node: ${data.node_version}`);
  });

  // Database Tests
  log("\n[ DATABASE ]", "yellow");

  await test("POST /api/db-connection (Database Info)", async () => {
    const { status, data } = await request("POST", "/api/db-connection");
    if (status !== 200) {
      throw new Error("Database connection test failed");
    }
    log(`    Database: ${data.database}`);
    log(`    User: ${data.user}`);
    log(`    PostgreSQL Version: ${data.postgres_version}`);
  });

  // Test Data Tests
  log("\n[ TEST DATA ]", "yellow");

  await test("GET /api/test/users (List all users)", async () => {
    const { status, data } = await request("GET", "/api/test/users");
    if (status !== 200) {
      throw new Error("Failed to fetch users");
    }
    log(`    Total Users: ${data.count}`);
    if (data.users.length > 0) {
      data.users.slice(0, 3).forEach((user) => {
        log(`      • ${user.email} (${user.username})`);
      });
      if (data.count > 3) {
        log(`      ... and ${data.count - 3} more`);
      }
    }
  });

  await test("GET /api/echo?message=test (Echo endpoint)", async () => {
    const { status, data } = await request("GET", "/api/echo?message=hello");
    if (status !== 200 || data.message !== "hello") {
      throw new Error("Echo endpoint failed");
    }
    log(`    Echo: "${data.message}"`);
  });

  // Authentication Tests
  log("\n[ AUTHENTICATION ]", "yellow");

  const testUserEmail = `test_${Date.now()}@example.com`;
  const testUserPassword = "TestPass123!";

  await test("POST /api/auth/register (Register new user)", async () => {
    const { status, data } = await request("POST", "/api/auth/register", {
      email: testUserEmail,
      username: `testuser_${Date.now()}`,
      password: testUserPassword,
    });
    if (status !== 201) {
      throw new Error("Registration failed");
    }
    log(`    User Created: ${data.user.email}`);
    log(`    User ID: ${data.user.id}`);
  });

  await test("POST /api/auth/login (Login & get tokens)", async () => {
    const { status, data } = await request("POST", "/api/auth/login", {
      email: testUserEmail,
      password: testUserPassword,
    });
    if (status !== 200 || !data.accessToken) {
      throw new Error("Login failed");
    }
    accessToken = data.accessToken;
    log(`    User: ${data.user.email}`);
    log(`    Token: ${data.accessToken.substring(0, 20)}...`);
    log(`    Token Expires: 15 minutes`);
  });

  await test("POST /api/auth/refresh (Refresh access token)", async () => {
    const { status, data } = await request("POST", "/api/auth/refresh");
    if (status !== 200 || !data.accessToken) {
      throw new Error("Token refresh failed");
    }
    accessToken = data.accessToken; // Update token
    log(`    New Token: ${data.accessToken.substring(0, 20)}...`);
  });

  await test("POST /api/auth/logout (Logout user)", async () => {
    const { status, data } = await request("POST", "/api/auth/logout");
    if (status !== 200) {
      throw new Error("Logout failed");
    }
    log(`    Message: ${data.message}`);
    accessToken = null; // Clear token
  });

  // Test Existing User (example@gmail.com)
  log("\n[ EXISTING TEST USER ]", "yellow");

  await test("POST /api/auth/login (Test with example@gmail.com)", async () => {
    const { status, data } = await request("POST", "/api/auth/login", {
      email: "example@gmail.com",
      password: "MyTempPass123!",
    });
    if (status !== 200) {
      throw new Error("Login with test credentials failed");
    }
    log(`    User: ${data.user.email}`);
    log(`    Username: ${data.user.username}`);
    log(`    Access Token obtained: ${data.accessToken.substring(0, 20)}...`);
  });

  // Summary
  log("\n╔════════════════════════════════════════╗", "blue");
  log("║     All Tests Completed! ✓             ║", "blue");
  log("╚════════════════════════════════════════╝\n", "blue");

  log("Quick Reference:", "yellow");
  log(
    "  Base URL: " + BASE_URL,
    "cyan"
  );
  log(
    "  API Docs: See backend/README.md",
    "cyan"
  );
  log(
    "  Test User: example@gmail.com / MyTempPass123!",
    "cyan"
  );
}

// Run tests
runTests().catch((err) => {
  log(`\n✗ Test suite failed: ${err.message}`, "red");
  process.exit(1);
});
