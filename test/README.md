# E2E Testing Documentation

## Overview

This directory contains comprehensive End-to-End (E2E) tests for the Micro CRM backend API. The tests validate authentication flows, client management CRUD operations, pagination, and search functionality using real database interactions.

## Test Files Structure

```
test/
├── auth.e2e-spec.ts                  # Authentication tests (16 test cases)
├── clients.e2e-spec.ts               # Client CRUD tests (28 test cases)
├── clients-pagination.e2e-spec.ts    # Pagination & search tests (27 test cases)
├── test-utils.ts                     # Shared test utilities and helpers
├── setup-e2e.ts                      # Global setup (creates test DB & runs migrations)
├── teardown-e2e.ts                   # Global teardown (cleans test data)
├── jest-e2e.json                     # Jest E2E configuration
└── README.md                         # This file
```

**Total Test Cases: 71+** covering success and failure scenarios

## Prerequisites

1. **PostgreSQL** running on port 5434 (or configured port)
2. **Node.js** v18+ installed
3. **Dependencies** installed: `npm install`
4. **Environment** configured: `.env.test` file exists

## Environment Configuration

The tests use a **separate test database** to avoid polluting development data.

### `.env.test` Configuration

```env
NODE_ENV=test
PORT=4001
DATABASE_HOST=localhost
DATABASE_PORT=5434
DATABASE_NAME=micro_crm_test    # Separate test database
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=test-secret-key-for-e2e-tests
JWT_EXPIRES_IN=7d
```

**Important:** The test database (`micro_crm_test`) is automatically created during setup if it doesn't exist.

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

This will:
1. ✅ Create test database if needed
2. ✅ Run migrations to set up schema
3. ✅ Execute all E2E test suites
4. ✅ Clean up test data after completion

### Run Specific Test Suite

```bash
# Authentication tests only
npm run test:e2e -- auth.e2e-spec.ts

# Client CRUD tests only
npm run test:e2e -- clients.e2e-spec.ts

# Pagination & search tests only
npm run test:e2e -- clients-pagination.e2e-spec.ts
```

### Run Tests in Watch Mode

```bash
npm run test:e2e -- --watch
```

### Run Tests with Coverage

```bash
npm run test:e2e -- --coverage
```

## Test Suites Overview

### 1. Authentication Tests (`auth.e2e-spec.ts`)

Tests the complete authentication flow with JWT token management.

**Success Cases:**
- ✅ Register new user with valid credentials
- ✅ Login with correct email/password
- ✅ Access protected routes with valid JWT token
- ✅ Multiple logins generate different tokens

**Failure Cases:**
- ❌ Register with duplicate email (409 Conflict)
- ❌ Register with invalid email format (400 Bad Request)
- ❌ Register with weak/missing password (400 Bad Request)
- ❌ Login with wrong password (401 Unauthorized)
- ❌ Login with non-existent email (401 Unauthorized)
- ❌ Access protected routes without token (401 Unauthorized)
- ❌ Access protected routes with invalid token (401 Unauthorized)

### 2. Client CRUD Tests (`clients.e2e-spec.ts`)

Tests all client management operations with multi-user isolation.

**Create Tests:**
- ✅ Create client with all fields
- ✅ Create client with only required field (name)
- ❌ Create without auth token (401)
- ❌ Create with invalid email (400)
- ❌ Create without name (400)

**Read Tests:**
- ✅ Get all clients for authenticated user
- ✅ Get specific client by ID
- ✅ Empty list for new users
- ❌ Get client of another user (404)
- ❌ Get non-existent client (404)
- ❌ Get client without auth (401)

**Update Tests:**
- ✅ Full update of client
- ✅ Partial update (only specified fields)
- ❌ Update client of another user (404)
- ❌ Update with invalid email (400)
- ❌ Update non-existent client (404)
- ❌ Update without auth (401)

**Delete Tests:**
- ✅ Delete client successfully
- ✅ Verify client is removed after deletion
- ❌ Delete client of another user (404)
- ❌ Delete non-existent client (404)
- ❌ Delete without auth (401)
- ❌ Delete already deleted client (404)

### 3. Pagination & Search Tests (`clients-pagination.e2e-spec.ts`)

Tests pagination, search functionality, and their combination.

**Pagination Tests:**
- ✅ Default limit (10 items per page)
- ✅ First, second, and third pages return different clients
- ✅ Custom limits (5, 25, 50 items per page)
- ✅ Page beyond available data returns empty array
- ✅ Total count consistent across pages
- ❌ Invalid page parameter (400)
- ❌ Invalid limit parameter (400)

**Search Tests:**
- ✅ Exact name match
- ✅ Case-insensitive search
- ✅ Partial name match
- ✅ Single character search
- ✅ No results returns empty array
- ✅ Special characters handled safely
- ✅ User isolation (only search own clients)

**Combined Tests:**
- ✅ Pagination works with search results
- ✅ Total count reflects search filter
- ✅ Custom limits with search
- ✅ Empty search returns all clients

## Test Utilities (`test-utils.ts`)

Reusable helper functions for tests:

### User Management
```typescript
generateUniqueEmail()                    // Generate unique test email
generateTestUser(customData?)            // Generate test user data
registerUser(app, userData?)             // Register user via API
loginUser(app, email, password)          // Login and get JWT token
createAuthenticatedUser(app, userData?)  // Register + get token (convenience)
getAuthHeaders(token)                    // Create Bearer token headers
```

### Client Management
```typescript
generateTestClient(customData?)          // Generate test client data
createClient(app, token, clientData?)    // Create client via API
createMultipleClients(app, token, count) // Create N clients
getClients(app, token, params?)          // Get clients with pagination/search
getClientById(app, token, clientId)      // Get specific client
updateClient(app, token, clientId, data) // Update client
deleteClient(app, token, clientId)       // Delete client
```

## Database Management

### Test Database Lifecycle

**Setup (before all tests):**
1. Connect to PostgreSQL
2. Create `micro_crm_test` database (if not exists)
3. Run migrations to create schema
4. ✅ Ready for testing

**Execution (during tests):**
- Each test suite creates its own test users
- Tests use real PostgreSQL database (no mocks)
- Data is isolated per user (JWT authentication)

**Teardown (after all tests):**
1. Truncate all tables (except migrations)
2. Keep database and schema for next run
3. ✅ Clean slate for next test run

### Manual Database Cleanup

If you need to manually reset the test database:

```bash
# Drop and recreate test database
psql -h localhost -p 5434 -U postgres -c "DROP DATABASE IF EXISTS micro_crm_test;"
psql -h localhost -p 5434 -U postgres -c "CREATE DATABASE micro_crm_test;"

# Run migrations
cd micro-crm-be
npm run migration:run
```

### Inspect Test Database

```bash
# Connect to test database
psql -h localhost -p 5434 -U postgres -d micro_crm_test

# View tables
\dt

# View data
SELECT * FROM users;
SELECT * FROM clients;
```

## JWT Token Management

Tests properly handle JWT authentication:

1. **User Registration** → Receives JWT token
2. **Token Storage** → Saved in test user object
3. **API Requests** → Include `Authorization: Bearer {token}` header
4. **Multi-User Tests** → Each user has separate token
5. **Isolation Verified** → User A cannot access User B's data

## Best Practices

### ✅ Do's

- **Run tests before commits** to catch regressions
- **Use test utilities** for consistency
- **Create unique users per test** to avoid conflicts
- **Test both success and failure cases**
- **Verify response structure** with `toHaveProperty()`
- **Clean up created data** or use teardown

### ❌ Don'ts

- **Don't use production database** for tests
- **Don't share test users** between test suites
- **Don't hardcode IDs** (use generated UUIDs)
- **Don't skip authentication** tests
- **Don't mock database** (use real DB for E2E)

## Troubleshooting

### Tests Fail with "Connection Refused"

**Problem:** PostgreSQL not running or wrong port

**Solution:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Start if needed
cd micro-crm-be
docker compose up -d
```

### Tests Fail with "Database does not exist"

**Problem:** Test database not created

**Solution:** The global setup should create it automatically. If not:
```bash
npm run test:e2e
# Or manually create:
psql -h localhost -p 5434 -U postgres -c "CREATE DATABASE micro_crm_test;"
```

### Tests Timeout

**Problem:** Tests taking too long (> 30 seconds)

**Solution:**
- Check database connection is fast
- Reduce number of test clients created
- Increase timeout in `jest-e2e.json`: `"testTimeout": 60000`

### Tests Pass Locally but Fail in CI

**Problem:** Environment differences

**Solution:**
- Ensure `.env.test` is committed or created in CI
- Verify PostgreSQL is available in CI environment
- Check port configuration matches CI setup

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5434:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
```

## Test Coverage

Current test coverage:

| Module          | Test Cases | Coverage |
|-----------------|------------|----------|
| Authentication  | 16         | ✅ 100%  |
| Client CRUD     | 28         | ✅ 100%  |
| Pagination      | 14         | ✅ 100%  |
| Search          | 9          | ✅ 100%  |
| Combined        | 4          | ✅ 100%  |
| **Total**       | **71+**    | **✅ 100%** |

## Adding New Tests

### 1. Create New Test File

```typescript
// test/new-feature.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { registerUser, getAuthHeaders } from './test-utils';

describe('New Feature (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Test Case: Your test description
   * Name: test_case_name
   * Description: What this test verifies
   */
  it('should do something', async () => {
    const user = await registerUser(app);

    const response = await request(app.getHttpServer())
      .get('/your-endpoint')
      .set(getAuthHeaders(user.token!))
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### 2. Run New Tests

```bash
npm run test:e2e -- new-feature.e2e-spec.ts
```

### 3. Add to Documentation

Update this README with new test cases.

## Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeORM Testing](https://typeorm.io/testing)

## Support

For issues or questions:
1. Check this README first
2. Review test examples in existing files
3. Consult project documentation in `micro-crm-be/README.md`
4. Create an issue in the repository
