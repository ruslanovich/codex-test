# Codex-Powered Task Board: Detailed Specification

## 1. Project Overview
- **Goal:** Build a lightweight Kanban-style task management system with a React frontend, a Node.js backend, and CI/CD automation to practice Codex-assisted development across the stack.
- **Primary Users:** Individuals or small teams tracking tasks through "To Do", "In Progress", and "Done" stages.
- **Success Criteria:**
  - Users can create, view, update, reorder, and delete tasks through the web UI.
  - Backend exposes secure REST endpoints with validation and persistent storage.
  - CI/CD workflows automatically lint, test, and build both frontend and backend, with optional deployment preview.

## 2. Functional Requirements

### 2.1 Task Management
1. Users can add new tasks with title, description, status, assignee, priority, and due date.
2. Users can update task details and move tasks between columns via drag-and-drop.
3. Users can delete tasks.
4. Users can search/filter tasks by status, assignee, priority, or text query.
5. Optional: Users can mark tasks as archived to hide them from active columns.

### 2.2 Board Interface
1. Board displays three columns (To Do, In Progress, Done) with task cards.
2. Cards show key metadata (title, assignee initials/avatar, priority indicator, due date badge).
3. Clicking a card opens a modal with full details and edit capabilities.
4. Responsive layout adjusts columns for desktop, tablet, and mobile breakpoints.
5. Theme toggles (light/dark) stored in local preferences.

### 2.3 User Experience Enhancements
1. Drag-and-drop interactions provide visual feedback and persist ordering per column.
2. Inline validation messages surface when creating/updating tasks.
3. Snackbar/toast notifications confirm successful operations or errors.
4. Loading and empty states provide guidance when data is fetching or filters return zero results.

### 2.4 Backend API
1. Provide REST endpoints:
   - `GET /tasks` with query params for filtering/pagination.
   - `GET /tasks/:id`
   - `POST /tasks`
   - `PUT /tasks/:id`
   - `DELETE /tasks/:id`
2. Input validation using Zod or Joi ensures payload integrity.
3. Store tasks in SQLite through Prisma with migrations for schema evolution.
4. Seed script populates baseline data for development/testing.
5. Logging middleware captures request metadata; error handler returns standardized responses.
6. Optional: WebSocket or Server-Sent Events endpoint for real-time updates.

### 2.5 Authentication (Stretch Goal)
1. Simple email-based login backed by JWT, enabling per-user task ownership.
2. Role-based access (admin vs. member) controlling task deletion or board configuration.

## 3. Non-Functional Requirements
- **Performance:** API responses under 200ms for standard CRUD operations with up to 500 tasks.
- **Reliability:** Automated tests cover critical flows; CI ensures all checks pass before merge.
- **Security:** Input validation, sanitized outputs, and dotenv-managed secrets.
- **Accessibility:** Meet WCAG AA for color contrast, keyboard navigation, and aria labels.
- **Maintainability:** Code linted with ESLint/Prettier; consistent module boundaries for frontend and backend.

## 4. System Architecture
- **Frontend:** React + Vite + TypeScript, state managed via React Query (server state) and Zustand or Redux Toolkit (local UI state). UI library: Tailwind CSS or Chakra UI for rapid styling.
- **Backend:** Node.js + Fastify (preferred for performance) or Express. Prisma ORM with SQLite for local development; environment ready for swap to Postgres.
- **API Contract:** JSON over HTTPS. Document endpoints using OpenAPI via `@fastify/swagger`.
- **CI/CD:** GitHub Actions workflow with separate jobs for lint/test/build. Optional deployment to GitHub Pages (frontend) and Railway/Fly.io (backend).
- **Environment Management:** `.env` files for local development, GitHub Actions secrets for CI, containerized dev environment via Docker Compose (stretch).

## 5. Data Model
| Field        | Type          | Notes                                      |
|--------------|---------------|--------------------------------------------|
| id           | UUID          | Primary key                                |
| title        | String        | Required                                   |
| description  | Text          | Optional                                   |
| status       | Enum          | `TODO`, `IN_PROGRESS`, `DONE`              |
| priority     | Enum          | `LOW`, `MEDIUM`, `HIGH`                    |
| assignee     | String        | Optional display name or email             |
| dueDate      | DateTime      | Optional                                   |
| tags         | String[]      | Optional; stored as relation or JSON array |
| order        | Integer       | Column-specific ordering index              |
| createdAt    | DateTime      | Auto-generated                             |
| updatedAt    | DateTime      | Auto-updated                               |
| archived     | Boolean       | Defaults to false                          |

## 6. Frontend Feature Breakdown
1. **Layout & Navigation**
   - App shell with header (logo, search input, theme toggle) and board area.
   - Settings drawer for user preferences and board metadata.
2. **Task Board**
   - Column components fetch tasks filtered by status.
   - Drag-and-drop using `@dnd-kit` or `react-beautiful-dnd` with optimistic updates.
3. **Task Modal**
   - Form with controlled inputs, validation feedback, and activity log.
   - Comment section (stretch) using backend endpoint `/tasks/:id/comments`.
4. **Filters & Search**
   - Query builder allowing combination filters (assignee + priority + text).
   - Persist filter state in URL query parameters for shareable views.
5. **Testing**
   - Component tests with Vitest + Testing Library.
   - End-to-end tests with Playwright or Cypress covering create/edit/delete flows.

## 7. Backend Feature Breakdown
1. **Routing & Controllers**
   - Fastify route definitions, referencing service layer for business logic.
2. **Services**
   - TaskService handles CRUD with Prisma, ensures column ordering logic.
3. **Validation**
   - Shared schema definitions for request/response payloads.
4. **Persistence**
   - Prisma migrations, seed script, and test database setup.
5. **Testing**
   - Unit tests (Jest/Vitest) for services and helpers.
   - Integration tests spinning up in-memory database (SQLite) for API endpoints.
6. **Tooling**
   - ESLint + Prettier configuration, Husky pre-commit hooks for lint/test (optional).

## 8. CI/CD Pipeline
1. **Workflow: `ci.yml`**
   - Trigger on `pull_request` and `push` to `main`.
   - Jobs:
     - `setup`: install Node LTS, cache dependencies.
     - `lint`: run `npm run lint` for both packages.
     - `test`: run unit/integration tests (parallel matrix for frontend/backend).
     - `build`: ensure production builds succeed (`npm run build` for each package).
2. **Workflow: `deploy.yml` (optional)**
   - Trigger on release or manual dispatch.
   - Builds frontend, deploys to GitHub Pages via `peaceiris/actions-gh-pages`.
   - Deploy backend to chosen host with environment secrets.
3. **Dependabot**
   - Configure weekly updates for `npm` ecosystems in both `/frontend` and `/backend` directories.
4. **Code Quality Gates**
   - Require CI success before merge.
   - Optionally integrate Codecov for coverage thresholds.

## 9. Development Roadmap
1. **Milestone 1: Project Setup**
   - Initialize monorepo structure (`/frontend`, `/backend`).
   - Configure shared tooling (ESLint, Prettier, lint-staged).
   - Set up GitHub Actions `ci.yml` with placeholder steps.
   - Rely on package-level npm scripts; defer introducing a Makefile until build workflows stabilize.
2. **Milestone 2: Backend MVP**
   - Scaffold Fastify server with CRUD endpoints and in-memory store.
   - Add Prisma, migrate to SQLite persistence.
   - Implement validation and error handling.
   - Write integration tests.
3. **Milestone 3: Frontend MVP**
   - Create Vite + React project, implement board layout with static data.
   - Integrate API calls via React Query.
   - Add drag-and-drop and task modal.
   - Write component tests.
4. **Milestone 4: Refinements & Enhancements**
   - Add filters, search, and notifications.
   - Implement theme toggle and responsive polish.
   - Introduce authentication (if prioritized).
5. **Milestone 5: CI/CD & Deployment**
   - Finalize GitHub Actions steps, add deployment workflow.
   - Configure Dependabot and optional coverage reporting.

## 10. Risks & Mitigations
- **Drag-and-drop complexity:** Use well-supported libraries and start with basic interactions before layering optimizations.
- **Database migrations:** Automate with Prisma `migrate` commands and add CI checks to validate schema.
- **Test flakiness:** Run tests in isolated environments, seed deterministic data.
- **Scope creep:** Prioritize MVP features; defer stretch goals to later milestones.

## 11. Documentation & Developer Experience
- Maintain `docs/` directory with API reference and architecture diagrams.
- Provide onboarding script `npm run dev:setup` to install dependencies and seed database.
- Add `.env.example` files for frontend and backend.
- Keep changelog updated to track feature additions.

## 12. Acceptance Criteria Checklist
- [ ] Users can manage tasks end-to-end via UI backed by REST API.
- [ ] Unit and integration tests reach >80% coverage for critical paths.
- [ ] CI pipeline blocks merges on lint/test/build failures.
- [ ] Documentation guides new contributors through setup and architecture.
- [ ] Optional deployment demonstrates continuous delivery capability.

