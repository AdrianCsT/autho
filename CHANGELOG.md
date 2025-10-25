# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### 2025-10-25 — v1.1.0 (Back) / v0.2.0 (Front)

#### Added
- Implemented authentication and user management features (login, register, refresh token, logout) — ced595b by Adrian Castellar
- Unit tests added for value objects, repositories, and services — ced595b by Adrian Castellar
- Initial role-based access control (admin, user), middleware and guards — d83d37c by Adrian Castellar

#### Changed
- First registered user now becomes `admin` automatically (production-friendly bootstrap) — code and docs updated
- Frontend default API base URL updated to include `/api/v1` prefix; frontend runs on port 3001 in dev
- Docker Compose added for MySQL + phpMyAdmin; backend `.env` updated to use local Docker credentials

#### Fixed
- Various test and mock fixes to align with Prisma schema changes (roles -> role single relation, token hash field, import path fixes) — ced595b

#### Notes
- The `prisma/seed.ts` file remains for development/testing only and is documented accordingly. Do NOT run the seed in production.

## 2025-10-24 — d83d37c

- feat: Implement user authentication and management features

## 2025-10-24 — d2a2e68

- Initial monorepo commit with `front` and `back` applications

---

Released-by: Adrian Castellar
