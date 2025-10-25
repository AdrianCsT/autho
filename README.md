<div align="center">
  <h1>🔐 Autho</h1>
  
  <p>
    A modern, full-stack authentication system with enterprise-grade security
  </p>

<!-- Badges -->
<p>
  <a href="https://github.com/Jchnc/autho/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/Jchnc/autho" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/Jchnc/autho" alt="last update" />
  </a>
  <a href="https://github.com/Jchnc/autho/network/members">
    <img src="https://img.shields.io/github/forks/Jchnc/autho" alt="forks" />
  </a>
  <a href="https://github.com/Jchnc/autho/stargazers">
    <img src="https://img.shields.io/github/stars/Jchnc/autho" alt="stars" />
  </a>
  <a href="https://github.com/Jchnc/autho/issues/">
    <img src="https://img.shields.io/github/issues/Jchnc/autho" alt="open issues" />
  </a>
  <a href="https://github.com/Jchnc/autho/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Jchnc/autho.svg" alt="license" />
  </a>
</p>
   
<h4>
    <a href="https://github.com/Jchnc/autho">View Demo</a>
  <span> · </span>
    <a href="https://github.com/Jchnc/autho">Documentation</a>
  <span> · </span>
    <a href="https://github.com/Jchnc/autho/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/Jchnc/autho/issues/">Request Feature</a>
  </h4>
</div>

<br />


<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
  * [Tech Stack](#space_invader-tech-stack)
  * [Features](#dart-features)
  * [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
  * [Prerequisites](#bangbang-prerequisites)
  * [Installation](#gear-installation)
  * [Run Locally](#running-run-locally)
  * [Database Setup](#floppy_disk-database-setup)
- [Usage](#eyes-usage)
- [API Documentation](#book-api-documentation)
- [Roadmap](#compass-roadmap)
- [Contributing](#wave-contributing)
- [License](#warning-license)
- [Contact](#handshake-contact)
- [Acknowledgements](#gem-acknowledgements)

<!-- About the Project -->
## :star2: About the Project

# Autho - Authentication Boilerplate

A production-ready authentication system built with NestJS, Next.js, and Clean Architecture principles.

## ✨ Key Features

- **🔐 Complete Authentication:** Login, Register, Logout, Token Refresh, Session Management
- **👥 Role-Based Access Control (RBAC):** Admin, User, and custom roles
- **🏗️ Clean Architecture:** Domain-driven design with clear separation of concerns
- **🛡️ Security First:** JWT tokens, HTTP-only cookies, password hashing, rate limiting
- **📝 Auto-Admin:** First registered user automatically becomes admin
- **🧪 100% Test Coverage:** Comprehensive test suite with Jest
- **📚 API Documentation:** Interactive Swagger/OpenAPI docs
- **🐳 Docker Ready:** MySQL database with Docker Compose
- **🎨 Modern UI:** Next.js 15 with Radix UI components and TailwindCSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop

### Setup (5 minutes)

```bash
# 1. Start database
docker-compose up -d

# 2. Setup backend
cd back
npm install
npm run prisma:generate
npx prisma migrate dev
npx prisma db seed  # Optional: creates test accounts

# 3. Setup frontend  
cd ../front
npm install

# 4. Start both servers (in separate terminals)
cd back && npm run start:dev
cd front && npm run dev
```

**Access:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- Database UI: http://localhost:8080 (phpMyAdmin)

### First User Setup

**Development:** Run `npx prisma db seed` to create test accounts:
- Admin: `admin` / `admin123`
- User: `user` / `user123`

**Production:** The first user to register through the UI automatically becomes admin. See `PRODUCTION_DEPLOYMENT.md`.

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)** - How to test all features manually
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Production deployment guide
- **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Architecture improvements and technical decisions

Built as a monorepo with a **NestJS** backend and **Next.js** frontend, Autho demonstrates how to implement secure authentication flows, role-based access control, and comprehensive API documentation in a full-stack TypeScript application.

<!-- TechStack -->
### :space_invader: Tech Stack

<details>
  <summary>Client</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">TypeScript</a></li>
    <li><a href="https://nextjs.org/">Next.js 15</a></li>
    <li><a href="https://reactjs.org/">React 19</a></li>
    <li><a href="https://tailwindcss.com/">TailwindCSS 4</a></li>
    <li><a href="https://ui.shadcn.com/">Radix UI</a></li>
    <li><a href="https://react-hook-form.com/">React Hook Form</a></li>
    <li><a href="https://axios-http.com/">Axios</a></li>
    <li><a href="https://sonner.emilkowal.ski/">Sonner</a></li>
  </ul>
</details>

<details>
  <summary>Server</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">TypeScript</a></li>
    <li><a href="https://nestjs.com/">NestJS 11</a></li>
    <li><a href="https://www.passportjs.org/">Passport.js</a></li>
    <li><a href="https://jwt.io/">JWT</a></li>
    <li><a href="https://github.com/kelektiv/node.bcrypt.js">Bcryptjs</a></li>
    <li><a href="https://github.com/jquense/yup">Class Validator</a></li>
  </ul>
</details>

<details>
<summary>Database</summary>
  <ul>
    <li><a href="https://www.mysql.com/">MySQL</a></li>
    <li><a href="https://www.prisma.io/">Prisma ORM</a></li>
  </ul>
</details>

<!-- Features -->
### :dart: Features

#### Authentication & Security
- **Dual-Token JWT Authentication**: Short-lived access tokens + long-lived refresh tokens
- **HTTP-Only Cookies**: Secure token storage preventing XSS attacks
- **Automatic Token Rotation**: Enhanced security with refresh token rotation
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Login Activity Tracking**: Detailed logs with IP address and user agent tracking
- **Account Status Management**: Support for ACTIVE, INACTIVE, SUSPENDED, and PENDING states

#### Authorization
- **Role-Based Access Control (RBAC)**: Flexible multi-role system
- **Protected Routes**: JWT and role-based guards for API endpoints
- **Admin Dashboard**: Dedicated admin authentication and management endpoints
- **Fine-Grained Permissions**: Decorator-based route protection

#### User Management
- **Complete CRUD Operations**: Full user lifecycle management
- **User Profile Management**: Update profiles with conflict detection
- **Bulk Operations**: Paginated user listing with advanced filtering
- **Status Control**: Dynamic account status management

#### API & Documentation
- **OpenAPI/Swagger Integration**: Auto-generated API documentation
- **Scalar API Reference**: Modern, interactive documentation UI
- **Environment-Aware**: Documentation enabled in dev, secured in production
- **Comprehensive Examples**: Detailed request/response examples

#### Developer Experience
- **Full TypeScript**: End-to-end type safety
- **Hot Module Replacement**: Fast development with automatic reload
- **Database Migrations**: Versioned schema management with Prisma
- **Database Seeding**: Pre-configured test data for development
- **Validation**: Request validation with class-validator
- **Error Handling**: Structured, consistent error responses

<!-- Env Variables -->
### :key: Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files

#### Backend (`back/.env`)

```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost/autho"

# JWT Secrets (Generate secure secrets for production!)
JWT_ACCESS_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost
PROTOCOL=http

# API Documentation
DOCS_ENABLED=true
DOCS_PATH=/api/docs
```

#### Frontend (`front/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL=http://localhost:3001

# Environment
NODE_ENV=development
NEXT_PUBLIC_NODE_ENV=development
```

> **💡 Pro Tip**: Generate secure secrets using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

<!-- Getting Started -->
## 	:toolbox: Getting Started

<!-- Prerequisites -->
### :bangbang: Prerequisites

This project requires the following to be installed on your system:

- **Node.js** (>= 18.x)
- **MySQL** (>= 8.x)
- **npm** or **yarn** or **pnpm**

```bash
# Verify Node.js installation
node --version

# Verify MySQL installation
mysql --version
```

<!-- Installation -->
### :gear: Installation

1. **Clone the repository**

```bash
git clone https://github.com/Jchnc/autho.git
cd autho
```

2. **Install backend dependencies**

```bash
cd back
npm install
```

3. **Install frontend dependencies**

```bash
cd ../front
npm install
```

<!-- Run Locally -->
### :running: Run Locally

#### 1. Configure Environment Variables

Create `.env` files in both `back/` and `front/` directories using the provided examples:

```bash
# Backend
cd back
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../front
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

#### 2. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE autho;
```

Run Prisma migrations:

```bash
cd back
npx prisma migrate dev
npx prisma generate
```

(Optional) Seed the database with test data:

```bash
npx prisma db seed
```

#### 3. Start the Development Servers

**Backend Server** (Terminal 1):

```bash
cd back
npm run start:dev
```

The backend will run on `http://localhost:3000`

**Frontend Server** (Terminal 2):

```bash
cd front
npm run dev
```

The frontend will run on `http://localhost:3001`

#### 4. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

### :floppy_disk: Database Setup

#### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ Deletes all data!)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio
```

<!-- Usage -->
## :eyes: Usage

### Authentication Flow

1. **Register a new user**
   - Navigate to `/auth` and create an account
   - Default role: `user`

2. **Login**
   - Use credentials to receive access and refresh tokens
   - Tokens are stored securely in HTTP-only cookies

3. **Access Protected Routes**
   - Access token is automatically sent with requests
   - Token refresh happens automatically when expired

4. **Admin Features**
   - Admin users can manage all users
   - Create, update, delete users
   - View login logs and activity

### API Examples

#### Register a User

```typescript
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login

```typescript
POST /auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get User Profile

```typescript
GET /users/profile
Authorization: Bearer <access_token>
```

<!-- API Documentation -->
## :book: API Documentation

Autho includes comprehensive API documentation powered by OpenAPI/Swagger and Scalar.

**Access the interactive API documentation at:**
- `http://localhost:3000/api/docs` (Development)

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive tokens
- `POST /auth/logout` - Logout and revoke tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/verify` - Verify access token validity

#### Admin Authentication
- `POST /admin/auth/register` - Register admin user
- `POST /admin/auth/create-user` - Create new user (admin only)

#### User Management
- `GET /users` - Get all users (paginated, admin only)
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user information
- `DELETE /users/:id` - Delete user (admin only)

<!-- Roadmap -->
## :compass: Roadmap

- [x] JWT Authentication with refresh tokens
- [x] Role-based access control (RBAC)
- [x] User management CRUD operations
- [x] Login activity tracking
- [x] API documentation with Swagger/Scalar
- [ ] Email verification system
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Password reset functionality
- [ ] Rate limiting and throttling
- [ ] Session management dashboard
- [ ] Audit logs for admin actions
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Unit and E2E tests

See the [open issues](https://github.com/Jchnc/autho/issues) for a full list of proposed features (and known issues).

<!-- Contributing -->
## :wave: Contributing

<a href="https://github.com/Jchnc/autho/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jchnc/autho" />
</a>

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- License -->
## :warning: License

Distributed under the ISC License. See `LICENSE` for more information.

<!-- Contact -->
## :handshake: Contact

**Jchnc** - [@Jchnc](https://github.com/Jchnc)

Project Link: [https://github.com/Jchnc/autho](https://github.com/Jchnc/autho)

<!-- Acknowledgments -->
## :gem: Acknowledgements

This project was built using amazing open-source technologies and resources:

- [NestJS](https://nestjs.com/) - A progressive Node.js framework
- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js & TypeScript
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for React
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Passport.js](https://www.passportjs.org/) - Simple, unobtrusive authentication for Node.js
- [React Hook Form](https://react-hook-form.com/) - Performant, flexible forms with easy validation
- [Shields.io](https://shields.io/) - Quality metadata badges for open source projects
- [Awesome README Template](https://github.com/Louis3797/awesome-readme-template) - README template inspiration

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Jchnc">Jchnc</a></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>

