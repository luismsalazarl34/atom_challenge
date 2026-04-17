# Task Manager — Atom Challenge

Aplicación fullstack de gestión de tareas construida con **Angular 17**, **Node.js + Express + TypeScript** y **Firebase Firestore**, desplegada con **Firebase Hosting** (frontend) y **Railway** (backend).

---

## Tabla de contenidos

1. [Demo en vivo](#demo-en-vivo)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Arquitectura del proyecto](#arquitectura-del-proyecto)
4. [Decisiones técnicas](#decisiones-técnicas)
5. [Por qué no usamos Firebase Functions](#por-qué-no-usamos-firebase-functions)
6. [Configuración local](#configuración-local)
7. [Cómo desplegar](#cómo-desplegar)
8. [Endpoints del API](#endpoints-del-api)
9. [Tests](#tests)
10. [Trade-offs](#trade-offs)
11. [Qué mejoraría con más tiempo](#qué-mejoraría-con-más-tiempo)

---

## Demo en vivo

| | URL |
|--|--|
| Frontend | https://atom-challenge-fullstack.web.app |
| Backend API | https://atom-challenge-backend.up.railway.app |

---

## Tecnologías utilizadas

### Frontend
- **Angular 17** — standalone components, signals, lazy loading
- **Angular Material** — UI components y diseño responsive
- **RxJS** — manejo de streams asíncronos con `catchError` y `takeUntilDestroyed`
- **SCSS** — estilos con separación por componente

### Backend
- **Node.js + Express** — servidor HTTP
- **TypeScript** — tipado estricto en toda la codebase
- **Firebase Admin SDK** — acceso a Firestore
- **Firebase Firestore** — base de datos NoSQL
- **jsonwebtoken** — autenticación JWT
- **uuid** — generación de IDs

### Infraestructura
- **Firebase Hosting** — hosting del frontend (plan Spark gratuito)
- **Railway** — hosting del backend Express (plan gratuito)
- **Firebase Firestore** — base de datos (plan Spark gratuito)

---

## Arquitectura del proyecto

```
atom_challenge/
  backend/          # API Express con Clean Architecture
  frontend/         # Angular 17 con arquitectura por features
  firebase.json     # Configuración de Firebase Hosting
  README.md
```

### Backend — Clean Architecture

```
backend/src/
  domain/
    entities/           # User.ts, Task.ts — tipos puros sin dependencias
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

**Flujo de una petición:**
```
HTTP Request
  → Route
    → Auth Middleware (verifica JWT)
      → Controller (extrae datos del request)
        → Use Case (lógica de negocio)
          → Repository Interface (contrato)
            → Firestore Implementation (persistencia)
```

### Frontend — Feature-based Architecture

```
frontend/src/app/
  core/
    services/       # ApiService, AuthService, TaskService
    guards/         # authGuard — protege rutas privadas
    interceptors/   # authInterceptor — agrega JWT a cada request
  shared/
    components/     # ConfirmDialogComponent
    models/         # user.model.ts, task.model.ts
  features/
    auth/
      login/        # LoginComponent
    tasks/
      tasks-page/   # TasksPageComponent — página principal
      task-item/    # TaskItemComponent — card de tarea individual
```

---

## Decisiones técnicas

### Clean Architecture en el backend
Se optó por Clean Architecture sobre una arquitectura MVC simple porque el desafío evalúa explícitamente la separación de capas y los principios SOLID. Las ventajas concretas:

- El **domain layer** no importa nada externo — si mañana cambiamos Firestore por PostgreSQL, solo cambia la capa de infraestructura.
- Los **use cases** son fácilmente testeables con mocks porque dependen de interfaces, no de implementaciones.
- Los **controllers** son tan delgados que prácticamente no necesitan tests propios.

### Dependency Injection manual
Se eligió DI manual (sin framework de IoC) porque para este tamaño de proyecto un contenedor de DI sería sobreingeniería. El composition root en `app.ts` es explícito, legible y fácil de seguir.

### Signals en lugar de BehaviorSubject (Angular 17)
Para el estado del usuario autenticado se usaron `signal()` en lugar del patrón tradicional `BehaviorSubject` + `asObservable()`. Los signals son la dirección oficial del framework desde Angular 16 y producen código más simple y con mejor rendimiento en change detection.

### Standalone Components
Angular 17 recomienda componentes standalone sobre NgModules. Reduce el boilerplate, mejora el tree-shaking y hace el lazy loading más directo con `loadComponent`.

### Interceptor funcional
Se usó `HttpInterceptorFn` (forma funcional, Angular 15+) en lugar de la clase `HttpInterceptor`. Es menos código y no requiere ser proveído en un módulo.

### catchError + takeUntilDestroyed
Todos los observables en componentes incluyen:
- `catchError` — maneja errores dentro del pipe RxJS en lugar de solo en el callback de `subscribe`
- `takeUntilDestroyed(destroyRef)` — cancela automáticamente subscripciones cuando el componente se destruye, evitando memory leaks

### JWT en lugar de Firebase Auth
Se implementó JWT propio en lugar de Firebase Authentication porque el challenge pide explícitamente un sistema de autenticación basado en JWT con middleware propio. Esto demuestra comprensión del protocolo en lugar de delegar todo a un servicio externo.

---

## Por qué no usamos Firebase Functions

El plan original era desplegar el backend como **Firebase Cloud Functions**. Sin embargo, Firebase Cloud Functions **requiere el plan Blaze** (pay-as-you-go), lo cual implica vincular una tarjeta de crédito y habilitar facturación en Google Cloud.

Para este challenge se optó por una solución completamente gratuita:

| Componente | Plan original | Solución adoptada | Costo |
|------------|--------------|-------------------|-------|
| Backend | Firebase Functions (Blaze) | Railway (Express directo) | $0 |
| Base de datos | Firebase Firestore | Firebase Firestore | $0 (plan Spark) |
| Frontend | Firebase Hosting | Firebase Hosting | $0 (plan Spark) |

**Ventajas adicionales de Railway sobre Firebase Functions:**
- Sin cold starts en el tier gratuito
- Logs más claros y directos
- Deploy más simple (push a GitHub)
- No requiere compilar a un formato específico de Functions

**Lo que se pierde vs Firebase Functions:**
- Escalado automático (Firebase Functions escala a cero)
- Integración nativa con el ecosistema Firebase
- Menor latencia al estar en la misma infraestructura que Firestore

Esta decisión es técnicamente válida y pragmática. En producción real con presupuesto, Firebase Functions sería la opción natural para mantener todo en el mismo ecosistema.

---

## Configuración local

### Prerrequisitos
- Node.js >= 18
- Java (para el emulador de Firestore): `brew install openjdk`
- Firebase CLI: `sudo npm install -g firebase-tools`

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd atom_challenge

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env`:
```
PORT=3000
JWT_SECRET=cualquier-string-secreto-largo
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_PROJECT_ID=atom-challenge-fullstack
```

### 3. Correr la app completa (3 terminales)

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

Abre `http://localhost:4200`

El **Emulator UI** (para ver datos en Firestore) está en `http://localhost:4001`

---

## Cómo desplegar

### Backend → Railway

1. Crea cuenta en [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Selecciona la carpeta `backend` como root directory
4. Configura las variables de entorno en Railway:

```
JWT_SECRET=tu-secret-de-produccion
FIREBASE_PROJECT_ID=atom-challenge-fullstack
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"atom-challenge-fullstack",...}
NODE_ENV=production
```

> Para obtener `FIREBASE_SERVICE_ACCOUNT`: Firebase Console → Project Settings → Service Accounts → Generate new private key. Copia el contenido del JSON como una sola línea.

5. Railway detecta automáticamente el `Procfile` y corre `npm start`

### Frontend → Firebase Hosting

1. Actualiza `frontend/src/environments/environment.prod.ts` con la URL de Railway:
```ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-app.up.railway.app',
};
```

2. Build y deploy:
```bash
cd frontend && npm run build && cd ..
firebase deploy --only hosting
```

---

## Endpoints del API

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/users?email=` | Busca usuario por email. Retorna `{user, token}` o 404 | No |
| POST | `/users` | Crea usuario. Body: `{email}`. Retorna `{user, token}` | No |

### Tareas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/tasks` | Lista tareas del usuario autenticado, orden DESC por fecha | JWT |
| POST | `/tasks` | Crea tarea. Body: `{title, description}` | JWT |
| PUT | `/tasks/:id` | Actualiza tarea. Body: `{title?, description?, completed?}` | JWT |
| DELETE | `/tasks/:id` | Elimina tarea | JWT |

**Respuestas de error:**

| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos |
| 401 | Token ausente o inválido |
| 403 | Intento de modificar tarea de otro usuario |
| 404 | Recurso no encontrado |
| 409 | Usuario ya existe |
| 500 | Error interno del servidor |

---

## Tests

```bash
# Backend — Jest
cd backend && npm test

# Frontend — Karma
cd frontend && npm test
```

### Cobertura backend
- `CreateUserUseCase` — 4 tests (happy path, duplicado, email inválido, normalización)
- `FirestoreUserRepository` — 3 tests (not found, found, create)

---

## Trade-offs

| Decisión | Ventaja | Desventaja |
|----------|---------|------------|
| Manual DI | Explícito, sin magia | Más código en `app.ts` al escalar |
| Signals para estado | Moderno, menos boilerplate | Evaluadores menos familiarizados con Angular 17 |
| JWT sin refresh token | Simple de implementar | Token de 7 días expira sin renovación automática |
| Railway sobre Firebase Functions | Gratuito, sin cold starts | Fuera del ecosistema Firebase |
| Firestore sin índices explícitos | Setup rápido | Puede requerir índices en producción con muchos datos |

---

## Qué mejoraría con más tiempo

1. **Refresh tokens** — tokens de acceso de corta duración + refresh token en httpOnly cookie, eliminando la exposición del JWT en localStorage.
2. **Paginación** — cursor-based pagination en `GET /tasks` para usuarios con muchas tareas.
3. **Optimistic updates** — actualizar el signal inmediatamente y revertir en caso de error, haciendo la UI más rápida.
4. **E2E tests con Cypress** — cubrir los flujos críticos: login, crear tarea, toggle, eliminar.
5. **CI/CD con GitHub Actions** — pipeline que corra lint + tests en cada PR y deploy automático a Railway/Firebase en merge a main.
6. **Firestore indexes** — índice compuesto en `(userId, createdAt DESC)` para la query de tareas.
7. **Error boundary global** — Angular `ErrorHandler` que reporte excepciones no capturadas a un servicio de observabilidad (ej. Sentry).
8. **Rate limiting** — middleware `express-rate-limit` en los endpoints de autenticación para prevenir fuerza bruta.
