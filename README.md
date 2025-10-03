# Micro CRM for Local Services – Backend

A lightweight **Customer Relationship Management (CRM) system** designed for freelancers and small service providers (hairdressers, tutors, coaches, photographers, local repair services, etc.).

## Project Description

The platform provides an **easy-to-use web application** where users can:

- Manage their **clients** (contacts, notes, history)
- Schedule and track **appointments**
- Send **reminders** (emails/SMS)
- Generate **simple invoices**
- Monetize via a **freemium model**:
  - **FREE plan** → access with ads (Google AdSense)
  - **PRO plan** → subscription, ad-free, extra features

## Tech Stack

- **Frontend:** Next.js + Material UI
- **Backend:** NestJS + TypeORM + PostgreSQL (hosted on Railway/Render/Heroku)
- **Auth:** Google OAuth + email/password
- **Payments:** Stripe or Paddle (future sprint)
- **Notifications:** Transactional email (Google SMTP, Postmark, or Resend)

## High-Level Implementation Plan (MVP)

1. **Authentication & User Management**
   - Signup/login with Google or email/password
   - JWT-based sessions
   - User entity includes subscription plan (FREE, PRO)

2. **Clients Module**
   - Add/edit/delete/search clients
   - Notes, contact details

3. **Appointments Module**
   - Create/manage appointments
   - Status updates (scheduled, completed, cancelled)

4. **Reminders**
   - Email notifications for upcoming appointments

5. **Invoices (Basic)**
   - Generate PDF invoices per client

6. **Plans & Monetization**
   - Free plan → ads enabled
   - Paid plans → no ads, extra features

## Getting Started

### Prerequisites

- **Node.js** v18+ (use nvm for version management)
- **Docker** & Docker Compose v2+
- **Git**

### Quick Start

1. **Clone the repository** (if not already done)

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update values as needed (defaults work for local development)

4. **Start the PostgreSQL database**

   ```bash
   docker compose up -d
   ```

5. **Run database migrations**

   ```bash
   npm run migration:run
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## Environment Variables

All environment variables are **validated at startup** using `class-validator`. The application will refuse to start if any required variable is missing or invalid.

Copy `.env.example` to `.env` and configure:

| Variable            | Description             | Default                 | Required |
| ------------------- | ----------------------- | ----------------------- | -------- |
| `NODE_ENV`          | Application environment | `development`           | Yes      |
| `PORT`              | Application port        | `3000`                  | Yes      |
| `DATABASE_HOST`     | PostgreSQL host         | `localhost`             | Yes      |
| `DATABASE_PORT`     | PostgreSQL port         | `5434`                  | Yes      |
| `DATABASE_USER`     | Database username       | `postgres`              | Yes      |
| `DATABASE_PASSWORD` | Database password       | `postgres`              | Yes      |
| `DATABASE_NAME`     | Database name           | `micro_crm`             | Yes      |
| `JWT_SECRET`        | JWT signing secret      | -                       | Yes      |
| `JWT_EXPIRES_IN`    | JWT token expiration    | `7d`                    | Yes      |
| `CORS_ORIGIN`       | Allowed CORS origin     | `http://localhost:5173` | Yes      |

**Important Notes:**

- PostgreSQL runs on port **5434** (not default 5432) to avoid conflicts with local instances
- `JWT_SECRET` should be a strong random string in production
- Validation schema is defined in `src/config/env.validation.ts`

## Development

```bash
# Development mode with watch
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

## Building

```bash
# Build the project
npm run build
```

## Code Quality

```bash
# Run linter with auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Testing

### Automated Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Manual API Testing with Postman

**Postman Collection** is available in the `postman/` directory with automatic JWT token management.

📁 **Files:**

- `postman/Micro-CRM-Backend.postman_collection.json` - API collection
- `postman/Micro-CRM-Backend.postman_environment.json` - Environment variables
- `postman/README.md` - Detailed usage guide

**Quick Start:**

1. Import both JSON files into Postman
2. Select "Micro CRM Backend - Local" environment
3. Run "Auth / Login" request
4. JWT token is automatically saved and used for all protected endpoints

See [postman/README.md](postman/README.md) for detailed instructions.

**Available Endpoints:**

- ✅ `POST /auth/register` - Register new user
- ✅ `POST /auth/login` - Login and get JWT token
- ✅ `GET /auth/profile` - Get current user (protected)
- ⏳ Clients CRUD endpoints (coming in Phase 3)

## Database Management

### Docker Commands

```bash
# Start PostgreSQL container
docker compose up -d

# Stop and remove containers
docker compose down

# View PostgreSQL logs
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f postgres

# Check container status
docker compose ps

# Restart PostgreSQL
docker compose restart postgres
```

### Database Access

```bash
# Connect to PostgreSQL CLI
docker exec -it micro-crm-postgres psql -U postgres -d micro_crm

# Run SQL file
docker exec -i micro-crm-postgres psql -U postgres -d micro_crm < script.sql

# Create database backup
docker exec micro-crm-postgres pg_dump -U postgres micro_crm > backup.sql

# Restore database backup
docker exec -i micro-crm-postgres psql -U postgres -d micro_crm < backup.sql
```

### TypeORM Migrations

**Important:** Always use migrations (not `synchronize: true`) for database schema changes.

```bash
# Generate migration from entity changes
npm run migration:generate src/migrations/MigrationName

# Create empty migration file
npm run migration:create src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npx typeorm-ts-node-commonjs migration:show -d src/data-source.ts
```

**Migration Workflow:**

1. Create/modify entities in `src/**/*.entity.ts`
2. Generate migration: `npm run migration:generate src/migrations/AddUserTable`
3. Review generated migration file
4. Run migration: `npm run migration:run`
5. Commit migration file to git

## Sprint 1: Foundation + Auth + Clients

**Goal:** Deliver a working backend skeleton with authentication and client management.

### Day 1 (Backend Setup & Auth)

**Tasks:**

- ✅ Init NestJS project with TypeORM + Postgres (2h)
  - Setup configuration with `.env`
  - Migrations ready
- [ ] Create `User` entity + authentication module (2.5h)
  - Fields: id, email, password hash, provider, plan
  - JWT strategy + guard
  - Endpoints: `POST /auth/register`, `POST /auth/login`
- ✅ Project setup & linting (2h)
  - ESLint, Prettier, Husky pre-commit hook
  - Docker Compose for Postgres
  - Update `README.md`

**Acceptance Criteria (Day 1):**

- ✅ Can run backend + DB with `docker-compose up`
- [ ] Auth endpoints return JWT on successful login
- ✅ Project follows linting & formatting rules

### Day 2 (Clients Module)

**Tasks:**

- [ ] Create `Client` entity with relation to `User` (2h)
  - Fields: id, name, email, phone, notes, createdAt, updatedAt
- [ ] Implement CRUD endpoints for clients (3h)
  - `POST /clients` → create client
  - `GET /clients` → list user's clients with pagination
  - `PATCH /clients/:id` → update client
  - `DELETE /clients/:id` → remove client
  - All secured with JWT
- [ ] Add validation + Swagger docs (2h)
  - Class-validator decorators
  - Swagger docs at `/api` for auth & clients

**Acceptance Criteria (Day 2):**

- [ ] Authenticated users can CRUD their clients
- [ ] Swagger docs available and up-to-date
- [ ] Errors return clear validation messages

### Phase 1: Project Setup & Infrastructure ✅

- ✅ Task 1.1: Initialize NestJS project with TypeScript
- ✅ Task 1.2: Setup environment configuration with validation
- ✅ Task 1.3: Configure Docker Compose with PostgreSQL
- ✅ Task 1.4: Setup TypeORM with migrations
- ✅ Task 1.5: Configure code quality tools (ESLint, Prettier, Husky)
- ✅ Task 1.6: Create comprehensive README

### Phase 2: Authentication System ✅

- ✅ Task 2.1: Create User entity
- ✅ Task 2.2: Generate and run User migration
- ✅ Task 2.3: Create Auth module structure
- ✅ Task 2.4: Implement password hashing
- ✅ Task 2.5: Setup JWT strategy
- ✅ Task 2.6: Implement registration endpoint
- ✅ Task 2.7: Implement login endpoint
- ✅ Task 2.8: Create authentication guard
- ✅ Task 2.9: Add error handling

### Next Phase: Clients Module

- Task 3.1: Create Client entity
- Task 3.2: Generate and run Client migration
- Task 3.3-3.10: Implement Clients CRUD endpoints

## Project Structure

```
micro-crm-be/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/              # Data transfer objects
│   │   ├── guards/           # JWT auth guard
│   │   ├── decorators/       # Custom decorators (@CurrentUser)
│   │   ├── strategies/       # Passport JWT strategy
│   │   ├── interfaces/       # JWT payload interface
│   │   └── utils/            # Password hashing utilities
│   ├── users/                # Users module
│   │   ├── entities/         # User entity
│   │   ├── enums/            # AuthProvider, SubscriptionPlan
│   │   └── users.service.ts  # Users service
│   ├── common/               # Shared resources
│   │   └── filters/          # Exception filters
│   ├── config/               # Configuration files
│   │   └── env.validation.ts # Environment variable validation
│   ├── migrations/           # TypeORM migrations
│   ├── app.module.ts         # Root application module
│   ├── main.ts               # Application entry point
│   └── data-source.ts        # TypeORM DataSource configuration
├── postman/                  # Postman collection for API testing
│   ├── Micro-CRM-Backend.postman_collection.json
│   ├── Micro-CRM-Backend.postman_environment.json
│   └── README.md
├── docs/                     # Documentation
│   └── roadmap.md            # Project roadmap (private)
├── test/                     # E2E tests
├── .husky/                   # Git hooks
├── docker-compose.yml        # PostgreSQL container configuration
├── .env.example              # Environment variables template
├── AUTHENTICATION_SUMMARY.md # Authentication implementation details
└── README.md                 # This file
```

## Code Quality & Git Hooks

This project enforces code quality standards with:

- **ESLint**: TypeScript linting with recommended rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Runs linters only on staged files

**Pre-commit hook automatically:**

1. Runs ESLint with auto-fix on staged `.ts` files
2. Formats code with Prettier
3. Blocks commit if there are errors

## Troubleshooting

### Port 5434 already in use

```bash
# Find process using the port
lsof -i :5434

# Change port in docker-compose.yml and .env
# Update DATABASE_PORT in both files
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker compose ps

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Migration errors

```bash
# Check migration status
npx typeorm-ts-node-commonjs migration:show -d src/data-source.ts

# Revert last migration if needed
npm run migration:revert
```

### Husky hooks not working

```bash
# Reinstall Husky
npm run prepare
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Husky Documentation](https://typicode.github.io/husky/)

## License

UNLICENSED - Private project
