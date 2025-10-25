# Changelog

All notable changes to this project are recorded below. This changelog covers commits from the initial monorepo commit through the current release.

The format follows Keep a Changelog and uses Semantic Versioning where appropriate.

## Table of Contents

- [v1.1.0 (back) / v0.2.0 (front) — 2025-10-25](#v110-back--v020-front--2025-10-25)
  - [Summary](#summary)
  - [Detailed commit-by-commit changes](#detailed-commit-by-commit-changes)
  - [Notes and implementation details](#notes-and-implementation-details)
  - [Security & Production guidance](#security--production-guidance)
  - [Files changed in this release](#files-changed-in-this-release)

---

## v1.1.0 (back) / v0.2.0 (front) — 2025-10-25

This release consolidates authentication, user-management, tests, documentation, and developer DX improvements introduced across the repository since the initial monorepo commit.

### Summary

🎯 **High-level changes:**

- **Backend**: authentication (JWT), user management (create/find/update/delete), role-based access control (RBAC), token services, password hashing, login logs, Prisma repository changes
- **Frontend**: API client, auth hooks, UI components, register/login flows, middleware protection and role-based routing
- **Tests**: large suite of unit tests for domain value objects, repositories, services, and presentation controllers
- **Infra & DX**: Docker Compose for MySQL + phpMyAdmin, Prisma schema & seed, improved environment files and documentation
- **Release**: Comprehensive changelog documentation and version bumping

👥 **Contributors**: Adrian Castellar, Jean Christopher

---

### Detailed commit-by-commit changes

*(newest → oldest)*

#### 📝 a196b6d — 2025-10-25 — docs(changelog): expanded changelog with detailed commit-by-commit entries

**Documentation**
- 📚 Created comprehensive CHANGELOG.md with detailed commit-by-commit breakdown
- 📋 Added implementation details, security guidance, and file change summaries
- 🏗️ Documented role model design, first-user bootstrapping, and production considerations
- 📖 Expanded changelog from basic version notes to full release documentation

---

#### 🚀 049cd99 — 2025-10-25 — chore(release): add CHANGELOG and bump package versions (back v1.1.0, front v0.2.0)

**Release Management**
- 📦 Bumped backend package version to v1.1.0
- 📦 Bumped frontend package version to v0.2.0
- 📝 Added initial CHANGELOG.md file with release summary
- 🚀 Prepared packages for production release

---

#### 🧪 ced595b — 2025-10-25 — Add unit tests for value objects, repositories, and services; implement authentication and user management features

**Tests**
- ✅ Added unit tests for Email and Password value objects (validation, creation, equality)
- 🔍 Created tests for UserRepository behavior and edge cases
- 🔐 Added tests for BcryptPasswordHasher and JwtTokenService to validate hashing and token lifecycle
- 🎮 Implemented AuthPresentationController tests for login, register, refresh, and logout flows
- ⚙️ Set up global test mocks and environment for reliable CI runs
- 🌐 Added frontend API client tests and auth/users hooks tests

**Code & Features**
- 🔄 Implemented token revocation checks in refresh token use case
- 🔧 Aligned service and repository mocks with Prisma schema (single `role` relation, `tokenHash` field)
- 🛠️ Fixed import paths and small API mismatches surfaced by tests
- ⚙️ Updated environment configuration files for both backend and frontend

**Docs & DX**
- 🐳 Added `docker-compose.yml` for MySQL + phpMyAdmin local development
- 📖 Updated README.md with setup and testing instructions
- 🔧 Improved environment configuration examples

---

#### 🏗️ d83d37c — 2025-10-24 — feat: Implement user authentication and management features

**Backend**
- 🔌 Added `IUserRepository` interface to standardize data access
- 📊 Implemented `LoginLogsService` to track login attempts and support rate-limiting/security
- 🔐 Implemented `BcryptPasswordHasher` (password hashing abstraction)
- 🎫 Implemented `JwtTokenService` (generation/verification, refresh handling)
- 📧 Created `Email` and `Password` value objects enforcing domain validation rules
- 🗄️ Created `PrismaService` wrapper for DB connection
- 👤 Implemented `UserRepository` using Prisma client with correct `role` relations
- 🔧 Introduced `InfrastructureModule` to wire up infra services via DI
- 🌐 Implemented `AuthPresentationController` and HTTP routes for authentication
- 🔑 Added comprehensive auth use-cases (login, logout, register, refresh-token)
- 👥 Added user management use-cases (create, update, delete, change-status)

**Frontend**
- 🌐 Added API client (axios wrapper) with token refresh interceptor and cookie support
- 🎣 Implemented `useAuth` and `useUsers` hooks for interacting with the backend
- 🎨 Built feature-based UI and components for authentication flows
- 📝 Added TypeScript types for API responses and requests

**Schema & Migrations**
- 🗃️ Prisma schema and migrations prepared to support users, roles, refresh tokens, login logs

---

#### 🎯 d2a2e68 — 2025-10-24 — Initial monorepo commit with front and back

**Project Setup**
- 📁 Created monorepo scaffolding with `front` (Next.js) and `back` (NestJS) applications
- 📋 Initial repository layout, build/test scripts, basic README
- ⚙️ Backend: Basic NestJS setup with auth module, users module, and Prisma integration
- 🎨 Frontend: Next.js setup with authentication pages, dashboard, and UI components
- 🗄️ Database: Prisma schema with initial migrations for users, roles, and authentication
- 🎨 Added comprehensive UI component library with Radix UI and Tailwind CSS
- 🔐 Implemented basic authentication flow and user management interface

---

### Notes and implementation details

- **Role model**: The project uses a single-role-per-user design (User.role) rather than many-to-many. Tests and code were aligned to that model.
- **First-user bootstrapping**: `users.service.createUser` now assigns `admin` role to the very first user (when DB contains zero users). This ensures a secure bootstrap without needing a seed in production.
- **Seed file**: `prisma/seed.ts` remains for development/testing convenience; it is explicitly documented to never be run in production.
- **API prefix**: Backend API is served under `/api/v1` (set in `back/src/main.ts`). Frontend and API client were updated to include `/api/v1` in `NEXT_PUBLIC_API_URL`.
- **CORS**: Backend enables CORS with `FRONTEND_URL` (default `http://localhost:3001`) and credentials support so the Next.js frontend can use HTTP-only cookies.
- **Docker**: `docker-compose.yml` spins up a MySQL 8.0 instance plus phpMyAdmin (optional) for local development. `.env` examples were updated accordingly.

---

### 🔒 Security & Production guidance

- ⚠️ **Do NOT run** `npx prisma db seed` in production. The seed contains test credentials.
- 🔑 Use strong JWT secrets and set `NODE_ENV=production` for production
- 🚪 Consider disabling public registration during initial production bootstrap or control it with an `ALLOW_PUBLIC_REGISTRATION` flag (docs include examples)

---

### 📁 Files changed in this release

**Representative list:**

- **back/**: authentication controllers, services, repositories, use-cases, tests, prisma schema/migrations, seed
- **front/**: auth pages/components, API client, hooks, middleware, env configs
- **Root**: `docker-compose.yml`, `README.md`, `CHANGELOG.md`
- **Packages**: `package.json` files (version bumps)

---
