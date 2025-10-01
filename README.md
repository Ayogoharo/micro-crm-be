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

## Project Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL database
docker compose up -d

# Run database migrations (after Task 1.4)
npm run migration:run
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database (Docker PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5434
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=micro_crm

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Note:** PostgreSQL runs on port **5434** to avoid conflicts with local instances.

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

## Database Commands

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# View logs
docker compose logs postgres

# Access database CLI
docker exec micro-crm-postgres psql -U postgres -d micro_crm

# Check container status
docker compose ps
```

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

## Current Progress

See `backend_todo.txt` for detailed task breakdown and progress tracking.

**Completed:**
- ✅ Task 1.1: Initialize NestJS project with TypeScript
- ✅ Task 1.2: Setup environment configuration
- ✅ Task 1.3: Configure Docker Compose

**Next:**
- Task 1.4: Setup TypeORM
- Task 1.5: Configure code quality tools
- Task 1.6: Create comprehensive README

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

UNLICENSED - Private project
