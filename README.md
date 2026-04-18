# Task Manager — Atom Challenge

A fullstack task management application built with **Angular 17**, **Node.js + Express + TypeScript**, and **Firebase Firestore**, deployed on **Firebase Hosting** (frontend) and **Vercel** (backend).

---

## Table of Contents

1. [Live Demo](#live-demo)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#project-architecture)
4. [Technical Decisions](#technical-decisions)
5. [Why Not Firebase Functions](#why-not-firebase-functions)
6. [Local Setup](#local-setup)
7. [Deployment](#deployment)
8. [API Endpoints](#api-endpoints)
9. [Tests](#tests)
10. [Trade-offs](#trade-offs)
11. [What I Would Improve](#what-i-would-improve)

---

## Live Demo

| | URL |
|--|--|
| Frontend | https://atom-challenge-fullstack.web.app |
| Backend API | https://atom-challenge-delta.vercel.app |

---

## Tech Stack

### Frontend
- **Angular 17** — standalone components, signals, lazy loading
- **Angular Material** — UI components and responsive layout
- **RxJS** — async stream handling with `catchError` and `takeUntilDestroyed`
- **SCSS** — per-component styles

### Backend
- **Node.js + Express** — HTTP server
- **TypeScript** — strict typing throughout the codebase
- **@google-cloud/firestore** — direct Firestore access (no gRPC, REST-only)
- **Firebase Firestore** — NoSQL database
- **jsonwebtoken** — JWT authentication
- **uuid** — ID generation

### Infrastructure
- **Firebase Hosting** — frontend hosting (free Spark plan)
- **Vercel** — backend serverless deployment (free plan)
- **Firebase Firestore** — database (free Spark plan)

---

## Project Architecture

```
atom_challenge/
  backend/          # Express API with Clean Architecture
  frontend/         # Angular 17 feature-based architecture
  firebase.json     # Firebase Hosting configuration
  README.md
```

### Backend — Clean Architecture

```
backend/src/
  domain/
    entities/           # User.ts, Task.ts — pure types with no external dependencies
    repositories/       # IUserRepository.ts, ITaskRepository.ts — interfaces
  application/
    use-cases/
      users/            # GetUserByEmailUseCase, CreateUserUseCase
      tasks/            # GetTasksByUserId, CreateTask, UpdateTask, DeleteTask
  infrastructure/
    database/           # FirestoreUserRepository, FirestoreTaskRepository
    services/           # JwtService, FirebaseService
  interfaces/
    controllers/        # UserController, TaskController
    routes/             # userRoutes, taskRoutes
    middleware/         # authMiddleware, errorMiddleware
  shared/
    errors/             # AppError
    utils/              # validators
```

**Request flow:**
```
HTTP Request
  → Route
    → Auth Middleware (verifies JWT)
      → Controller (extracts request data)
        → Use Case (business logic)
          → Repository Interface (contract)
            → Firestore Implementation (persistence)
```

### Frontend — Feature-based Architecture

```
frontend/src/app/
  core/
    services/       # ApiService, AuthService, TaskService
    guards/         # authGuard — protects private routes
    interceptors/   # authInterceptor — attaches JWT to every request
  shared/
    components/     # ConfirmDialogComponent
    models/         # user.model.ts, task.model.ts
  features/
    auth/
      login/        # LoginComponent
    tasks/
      tasks-page/   # TasksPageComponent — main page
      task-item/    # TaskItemComponent — individual task card
```

---

## Technical Decisions

### Clean Architecture in the backend
Clean Architecture was chosen over a simple MVC approach because the challenge explicitly evaluates layer separation and SOLID principles. Concrete advantages:

- The **domain layer** imports nothing external — swapping Firestore for PostgreSQL only requires changing the infrastructure layer.
- **Use cases** are easily testable with mocks because they depend on interfaces, not implementations.
- **Controllers** are so thin they need almost no unit tests of their own.

### Manual Dependency Injection
Manual DI (no IoC container) was chosen because an IoC framework would be over-engineering for this project size. The composition root in `app.ts` is explicit, readable, and easy to follow.

### Signals instead of BehaviorSubject (Angular 17)
`signal()` was used for authenticated user state instead of the traditional `BehaviorSubject + asObservable()` pattern. Signals are the official direction since Angular 16 and produce simpler code with better change detection performance.

### Standalone Components
Angular 17 recommends standalone components over NgModules. This reduces boilerplate, improves tree-shaking, and makes lazy loading more straightforward with `loadComponent`.

### Functional Interceptor
`HttpInterceptorFn` (functional form, Angular 15+) was used instead of the class-based `HttpInterceptor`. Less code and no module required.

### catchError + takeUntilDestroyed
All observables in components include:
- `catchError` — handles errors inside the RxJS pipe rather than only in the `subscribe` callback
- `takeUntilDestroyed(destroyRef)` — automatically cancels subscriptions when the component is destroyed, preventing memory leaks

### JWT instead of Firebase Auth
A custom JWT system was implemented rather than Firebase Authentication because the challenge explicitly requires a JWT-based authentication system with custom middleware. This demonstrates protocol understanding rather than delegating everything to an external service.

---

## Why Not Firebase Functions

The original plan was to deploy the backend as **Firebase Cloud Functions**. However, Firebase Cloud Functions **requires the Blaze plan** (pay-as-you-go), which means linking a credit card and enabling Google Cloud billing.

For this challenge a completely free solution was adopted:

| Component | Original Plan | Adopted Solution | Cost |
|-----------|--------------|------------------|------|
| Backend | Firebase Functions (Blaze) | Vercel (serverless Express) | $0 |
| Database | Firebase Firestore | Firebase Firestore | $0 (Spark plan) |
| Frontend | Firebase Hosting | Firebase Hosting | $0 (Spark plan) |

**Why `@google-cloud/firestore` instead of `firebase-admin`:**

When deploying to Vercel (and Railway before that), `firebase-admin` uses gRPC under the hood, which requires native binaries that are not available in serverless environments. Switching to `@google-cloud/firestore` directly with `preferRest: true` and explicit credentials bypasses the gRPC dependency entirely, making the app work reliably on Vercel.

**Advantages of Vercel over Firebase Functions:**
- No cold start limitations on the free tier
- Direct TypeScript compilation — no special Functions format required
- Simple deployment via `vercel.json` rewrites
- Clear, real-time logs

**Trade-offs vs Firebase Functions:**
- No auto-scaling to zero (Functions scale automatically)
- Outside the native Firebase ecosystem
- Slightly higher latency to Firestore vs same-infrastructure deployment

This is a technically sound and pragmatic decision. In a real production environment with a budget, Firebase Functions would be the natural choice to keep everything within the same ecosystem.

---

## Local Setup

### Prerequisites
- Node.js >= 18
- Java (for the Firestore emulator): `brew install openjdk`
- Firebase CLI: `sudo npm install -g firebase-tools`

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd atom_challenge

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure backend environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=3000
JWT_SECRET=any-long-secret-string
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_PROJECT_ID=atom-challenge-fullstack
```

### 3. Run the full app (3 terminals)

**Terminal 1 — Firestore emulator:**
```bash
firebase emulators:start --only firestore
```

**Terminal 2 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 3 — Frontend:**
```bash
cd frontend && npm start
```

Open `http://localhost:4200`

The **Emulator UI** (to inspect Firestore data) is at `http://localhost:4001`

---

## Deployment

### Backend → Vercel

1. Create an account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Configure environment variables in Vercel:

```
JWT_SECRET=your-production-secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"atom-challenge-fullstack",...}
NODE_ENV=production
```

> To get `FIREBASE_SERVICE_ACCOUNT`: Firebase Console → Project Settings → Service Accounts → Generate new private key. Paste the full JSON as a single line.

5. Vercel automatically compiles `api/index.ts` and applies the rewrites from `vercel.json`

### Frontend → Firebase Hosting

1. Update `frontend/src/environments/environment.prod.ts` with your Vercel URL:
```ts
export const environment = {
  production: true,
  apiUrl: 'https://your-app.vercel.app',
};
```

2. Build and deploy:
```bash
cd frontend && npm run build && cd ..
firebase deploy --only hosting
```

---

## API Endpoints

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users?email=` | Find user by email. Returns `{user, token}` or 404 | No |
| POST | `/users` | Create user. Body: `{email}`. Returns `{user, token}` | No |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tasks` | List tasks for the authenticated user, ordered DESC by date | JWT |
| POST | `/tasks` | Create task. Body: `{title, description}` | JWT |
| PUT | `/tasks/:id` | Update task. Body: `{title?, description?, completed?}` | JWT |
| DELETE | `/tasks/:id` | Delete task | JWT |

**Error responses:**

| Code | Meaning |
|------|---------|
| 400 | Invalid input |
| 401 | Missing or invalid token |
| 403 | Attempt to modify another user's task |
| 404 | Resource not found |
| 409 | User already exists |
| 500 | Internal server error |

---

## Tests

```bash
# Backend — Jest
cd backend && npm test

# Frontend — Karma
cd frontend && npm test
```

### Backend coverage
- `CreateUserUseCase` — 4 tests (happy path, duplicate, invalid email, normalization)
- `FirestoreUserRepository` — 3 tests (not found, found, create)

---

## Trade-offs

| Decision | Advantage | Disadvantage |
|----------|-----------|--------------|
| Manual DI | Explicit, no magic | More code in `app.ts` as the project scales |
| Signals for state | Modern, less boilerplate | Reviewers less familiar with Angular 17 |
| JWT without refresh token | Simple to implement | 7-day token expires without automatic renewal |
| Vercel over Firebase Functions | Free, no gRPC issues | Outside the Firebase ecosystem |
| Firestore without explicit indexes | Fast setup | May require composite indexes in production at scale |

---

## What I Would Improve

1. **Refresh tokens** — short-lived access tokens + refresh token in an httpOnly cookie, removing JWT exposure from localStorage.
2. **Pagination** — cursor-based pagination on `GET /tasks` for users with many tasks.
3. **Optimistic updates** — update the signal immediately and roll back on error for a snappier UI.
4. **E2E tests with Cypress** — cover critical flows: login, create task, toggle, delete.
5. **CI/CD with GitHub Actions** — pipeline that runs lint + tests on every PR and auto-deploys to Vercel/Firebase on merge to main.
6. **Firestore indexes** — composite index on `(userId, createdAt DESC)` for the tasks query.
7. **Global error boundary** — Angular `ErrorHandler` that reports uncaught exceptions to an observability service (e.g., Sentry).
8. **Rate limiting** — `express-rate-limit` middleware on authentication endpoints to prevent brute-force attacks.
