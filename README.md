# Codex Test Repository

This repository is intended for experimenting with Codex integrations. Before the project can be used within Codex, ensure that the Git repository is fully initialized:

1. Create the repository locally and run `git init`.
2. Add an initial commit (for example, a README file like this one).
3. Create and push the `work` branch so Codex can operate on it.

Once these steps are complete, Codex can check out the `work` branch and proceed with any requested changes.

## Codex practice project idea: Task Board

To exercise Codex across frontend, backend, and CI/CD workflows, consider building a lightweight **"Codex-powered Task Board"**. The goal is to maintain a Kanban-style task tracker that exposes a small REST API and a simple web UI.

### Frontend scope
- Build a React + Vite single-page application with columns for "To Do," "In Progress," and "Done."
- Implement interactive features such as drag-and-drop task cards, a task detail modal, and a filter/search bar.
- Ensure the layout is responsive so the board is usable on different screen sizes.
- Add unit tests for UI components (e.g., Vitest + Testing Library) to give Codex opportunities to generate and refine tests.

### Backend scope
- Create a Node.js API using Express or Fastify with CRUD endpoints for tasks.
- Start with an in-memory data store, then expand to a lightweight database layer (e.g., SQLite with Prisma) to practice migrations.
- Include input validation with a library like Zod or Joi, plus basic request logging middleware.
- Provide a seed script that populates sample tasks for local development and frontend testing.

### CI/CD exercises
- Configure a GitHub Actions workflow that runs linting, tests, and production builds for both frontend and backend packages.
- Optionally add a deployment job that publishes the frontend to GitHub Pages (or Netlify) and runs API smoke tests against a preview deployment.
- Introduce Dependabot configuration so Codex can assist with automated dependency update pull requests.

This scoped project creates clear, incremental tasks on each layer—UI components, API routes, data modeling, and automation pipelines—making it ideal for exploring how Codex can help across the stack.
