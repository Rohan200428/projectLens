# ProjectLens

ProjectLens is an AI-assisted project idea evaluator for trainers.

## Technology stack

- Backend: Java 17, Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA, Bean Validation
- Database: MySQL 8+
- Frontend: Angular 22
- Build: Maven for backend, npm/Angular CLI for frontend
- Package: `com.mfrp.plens`

Spring Boot 4.1.1 and Angular 22 are used because they are current stable releases as of September 2026.

## Important scope note

The supplied FRD defines the functional behavior but does not provide the trainer's final AI API prompt/endpoint. Therefore the backend contains a clean `ProjectEvaluationEngine` abstraction and a deterministic `RuleBasedEvaluationEngine` implementation. When the trainer provides the AI API prompt/contract, the implementation can be replaced with an HTTP-based AI engine without changing the controller, repository, entity, or Angular layers.

The FRD states that cohort theme, learning objectives and evaluation criteria are predefined/hardcoded; ideas below 70% are returned for revision, while ideas at or above 70% proceed to trainer review. It also requires overlap detection and three trainer decisions: Approved, Needs Revision, Rejected.

## Backend structure

```text
backend/
└── src/main/java/com/mfrp/plens/
    ├── PlensApplication.java
    ├── config/
    ├── controller/
    ├── dto/
    ├── exception/
    ├── model/
    ├── repository/
    └── service/
        └── evaluation/
```

## Frontend structure

```text
frontend/
└── src/
    ├── app/
    │   ├── core/
    │   ├── features/
    │   │   ├── dashboard/
    │   │   ├── submissions/
    │   │   ├── reviews/
    │   │   └── notifications/
    │   ├── layout/
    │   ├── models/
    │   └── app.routes.ts
    └── styles.css
```

## MySQL setup

Create the database:

```sql
CREATE DATABASE projectlens
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Update `backend/src/main/resources/application.properties` if your MySQL username/password differs.

The application uses `ddl-auto=update` for development. For a production deployment, use versioned migrations such as Flyway.

## Run backend

```bash
cd backend
mvn clean spring-boot:run
```

Backend:
`http://localhost:8080`

Health:
`http://localhost:8080/api/health`

## Run frontend

```bash
cd frontend
npm install
npm start
```

Frontend:
`http://localhost:4200`

The Angular development server proxies `/api` requests to Spring Boot.

## Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Trainer dashboard summary |
| GET | `/api/criteria` | Active predefined cohort criteria |
| GET | `/api/submissions` | List submissions with optional filters |
| GET | `/api/submissions/{id}` | Detailed submission/evaluation/decision |
| POST | `/api/submissions` | Submit a project idea |
| PUT | `/api/submissions/{id}` | Revise/reupload a project idea |
| POST | `/api/submissions/{id}/decision` | Trainer decision |
| GET | `/api/notifications` | Notifications |

## Suggested next implementation

Once the trainer gives the ProjectLens AI API prompt/contract, implement:

```text
AiProjectEvaluationEngine
        |
        v
ProjectEvaluationEngine
        |
        v
SubmissionService
```

Only the evaluation-engine implementation should need to change if the API contract remains compatible.
