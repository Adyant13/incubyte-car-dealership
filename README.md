# Motorstock — Car Dealership Inventory System

Motorstock is a full-stack car dealership inventory management application built with React, TypeScript, Node.js, Express, and PostgreSQL. It supports authenticated users, vehicle inventory management, stock purchasing, and administrator-only operations.

## Features

### Authentication and Authorization
- User registration and login.
- Password hashing using bcrypt.
- JSON Web Token (JWT) authentication.
- Protected inventory endpoints.
- Role-based access control for administrative operations.

### Vehicle Inventory
- Create and list vehicles.
- Search the inventory.
- Purchase vehicles while validating available stock.
- Update stock through an administrator-only restocking operation.
- Delete vehicles through an administrator-only operation.
- Validate vehicle data and prevent invalid stock quantities.

### Frontend
- React and TypeScript single-page application.
- API integration using Axios.
- Registration and login interfaces.
- Vehicle inventory and search interface.
- Vehicle creation and purchase workflows.
- Administrative inventory controls.
- Responsive CSS styling.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Axios, CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Development tools | npm, Git |

## Project Structure

```text
incubyte-car-dealership/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── auth.ts
│   │   ├── authMiddleware.ts
│   │   ├── db.ts
│   │   ├── server.ts
│   │   └── vehicles.ts
│   ├── tests/
│   │   ├── auth.test.ts
│   │   └── vehicles.test.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── PROMPTS.md
└── README.md
```

The `.env` file is local configuration and must not be committed to version control.

## Prerequisites

Install the following before running the project:

- Node.js and npm.
- PostgreSQL.
- Git.

## Local Setup

### 1. Clone or open the project

```bash
git clone <your-repository-url>
cd incubyte-car-dealership
```

If you are already working in the project directory, skip the clone step.

### 2. Configure PostgreSQL

Create a PostgreSQL database named `dealership_db`.

For example, in PostgreSQL:

```sql
CREATE DATABASE dealership_db;
```

Configure the backend environment variables in `backend/.env` using the variable names expected by the database connection code.

The configuration must include the PostgreSQL connection details and a strong, private JWT secret.

Example configuration, assuming the backend uses these variable names:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dealership_db
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

Replace the example values with your local configuration. Do not commit real credentials or secrets.

The backend initializes the required database tables when the server starts.

### 3. Start the backend

Open a terminal in the project root:

```bash
cd backend
npm install
npm run dev
```

The backend is expected to run at:

```text
http://localhost:5000
```

Keep this terminal running.

### 4. Start the frontend

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

Keep both development servers running while using the application.

## API Reference

The backend API is mounted under `/api`.

Protected endpoints require a valid JWT in the authorization header:

```http
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user and obtain a token |

### Vehicles

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/vehicles` | List vehicles | Authenticated |
| POST | `/api/vehicles` | Create a vehicle | Authenticated |
| GET | `/api/vehicles/search` | Search vehicles | Authenticated |
| POST | `/api/vehicles/:id/purchase` | Purchase a vehicle and reduce stock | Authenticated |
| PATCH | `/api/vehicles/:id/restock` | Restock a vehicle | Admin only |
| DELETE | `/api/vehicles/:id` | Delete a vehicle | Admin only |

Check `backend/src/vehicles.ts` for the exact search parameters and request-body fields implemented in this version.

### Vehicle Data

The vehicle model includes:

- `make`
- `model`
- `year`
- `price`
- `quantity`

The backend validates vehicle data and prevents invalid values, including negative prices and stock quantities. Purchases must respect available stock.

## Administrator Access

Administrative operations are protected by role-based authorization.

To promote a local development account to administrator, you can update its role directly in your own PostgreSQL database after registering:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-local-account@example.com';
```

Replace the email with the account you registered locally.

This is a development setup procedure, not a public administrator-registration feature. In a production deployment, administrator privileges should be assigned through a secure, controlled process.

## Testing

Run the backend tests:

```bash
cd backend
npm test
```

Build the backend:

```bash
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

### Verification Results

During development:

- The backend test suite reported **11 passing tests** across authentication and vehicle tests.
- The backend TypeScript build completed successfully.
- The frontend production build completed successfully.
- Registration, login, vehicle creation, and vehicle purchasing were manually exercised in the local application.

Administrative restocking and deletion should also be verified with an administrator account before treating those workflows as fully tested.

## Test-Driven Development

The backend was developed with automated tests covering authentication and vehicle inventory behavior. The test suite was run as functionality was implemented and updated.

The implementation was also checked with TypeScript production builds. Git commit history records development changes.

## AI Usage

ChatGPT was used as a development assistant for project setup, implementation guidance, debugging, test development, and documentation.

The AI usage log and shared conversation reference are available in [`PROMPTS.md`](PROMPTS.md).

AI-generated suggestions were reviewed and tested locally. The developer remains responsible for understanding and validating the submitted code.

## Security Notes

- Never commit `.env` files or production secrets.
- Use a strong, unique JWT secret.
- Use HTTPS and secure configuration in production.
- Keep dependencies updated.
- Restrict administrative privileges to authorized users.
- Configure production database credentials and access controls appropriately.

## Future Improvements

Potential extensions include:

- Pagination and sorting for larger inventories.
- More comprehensive integration tests.
- Audit logging for inventory changes.
- Improved deployment configuration.
- Automated continuous integration.

## License

This project was created as an assignment for the Incubyte TDD Kata: Car Dealership Inventory System.