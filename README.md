# SupportAI – AI-Powered Ticket Management and Customer Support System

SupportAI is a full-stack ticket management and customer support application designed to simplify customer support operations. It provides role-based access for Customers, Agents, and Administrators, with features for ticket creation, assignment, tracking, support management, and user account management.

The application is built using Spring Boot, React, and MySQL, with JWT-based authentication and Google OAuth2 integration.

## Features

### 1. Authentication and Authorization
- Customer registration and login using email and password.
- JWT-based authentication.
- Google OAuth2 authentication.
- Role-based access control for CUSTOMER, AGENT, and ADMIN.
- Secure password hashing using BCrypt.
- Forgot password and reset password functionality.

### 2. Customer Features
- Customer registration and login.
- Create support tickets.
- View personal tickets and ticket details.
- Track ticket status and priority.
- Access frequently asked questions (FAQs).
- Edit profile information.
- Create or change password according to account authentication type.

### 3. Agent Features
- Agent dashboard.
- View assigned support tickets.
- Manage ticket status and priority according to permissions.
- View ticket details.
- Update profile information.
- Manage account password.

### 4. Administrator Features
- Admin dashboard with ticket analytics.
- View and manage tickets.
- Manually assign and reassign tickets.
- Automatic ticket assignment during customer ticket creation.
- Manage ticket status and priority.
- Manage FAQs.
- View ticket assignment information.
- Manage administrator profile and password.

### 5. Ticket Management
- Create and track support tickets.
- Category-based ticket identification.
- Ticket status and priority management.
- Automatic ticket assignment to available agents.
- Manual assignment by administrators.
- Assignment history support.
- Resolved and closed ticket management.

### 6. Profile and Password Management
- Update user profile information.
- Change password for accounts with an existing local password.
- Google-authenticated accounts without a local password can create one.
- Google authentication remains available after creating a local password.

**Password management rules:**
- LOCAL accounts use their current password to change passwords.
- Google accounts without a local password use the Create Password flow.
- Google accounts with an existing local password can use Change Password.
- Google account passwords remain managed through Google for Google authentication.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, Vite |
| Styling | CSS, Tailwind CSS |
| Backend | Java 21, Spring Boot |
| Security | Spring Security, JWT, OAuth2 |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Build Tool | Maven |
| API Testing | Postman |
| Version Control | Git and GitHub |

## Project Architecture

SupportAI follows a layered backend architecture and a component-based React frontend.

```text
SupportAI/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── utils/
│
├── src/
│   └── main/
│       ├── java/com/example/tms/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── repository/
│       │   ├── security/
│       │   └── service/
│       │
│       └── resources/
│           └── application.properties
│
├── pom.xml
└── README.md
```

### Backend Request Flow

```text
React Frontend
      |
      v
REST Controller
      |
      v
Service Layer
      |
      v
Repository Layer
      |
      v
MySQL Database
```

## Prerequisites

Install the following before running the application:

- Java Development Kit (JDK) 21
- MySQL 8 or later
- Node.js and npm
- Git
- IntelliJ IDEA or Spring Tool Suite
- Postman (for API testing)

## Environment Configuration

Configure the following environment variables in your local development environment:

| Variable | Description |
|---|---|
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `APP_JWT_SECRET` | Secret used for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Keep actual credentials outside source control. Never commit passwords, API keys, OAuth secrets, or JWT secrets.

### Google OAuth Configuration

Configure the following authorized redirect URI in Google Cloud Console:

`http://localhost:8080/login/oauth2/code/google`

Google OAuth credentials must be configured in your local environment before testing Google sign-in.

## Database Setup

1. Install and start MySQL.
2. Open MySQL Workbench.
3. Create the SupportAI database:

```sql
CREATE DATABASE tms;
```

4. Configure your database credentials through environment variables.
5. Start the Spring Boot backend.

JPA/Hibernate should manage the entity mappings according to the project's database configuration.

## Running the Backend

Open a terminal in the project root.

Run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### Running Backend Tests

```powershell
.\mvnw.cmd test
```

## Running the Frontend

Open another terminal and navigate to the frontend:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend runs at:

`http://localhost:5173`

### Production Build

```powershell
npm run build
```

## API Authentication

SupportAI uses JWT bearer-token authentication for protected API endpoints.

After successful login, include the returned access token in subsequent requests:

```http
Authorization: Bearer <accessToken>
```

### Main Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register customer |
| POST | `/api/auth/login` | Login |
| PUT| `/api/auth/change-password` | Change password |
| POST | `/api/auth/create-password` | Create local password |

Check the corresponding controller for the exact HTTP method and endpoint path before integrating additional clients.

### Google Sign-In

Start Google authentication through:

`http://localhost:8080/oauth2/authorization/google`

The frontend handles the OAuth callback and establishes the authenticated application session.

## Testing

The application can be tested locally using:

- Postman for backend API testing.
- Browser for frontend functionality.
- MySQL Workbench for database verification.
- Maven for backend tests.
- npm build for frontend production-build verification.

Test authentication, authorization, ticket creation, assignment, ticket updates, profile management, and password workflows for the relevant user roles.

## Security Considerations

- Passwords are hashed using BCrypt.
- Protected endpoints require authentication.
- Role-based authorization restricts access to role-specific operations.
- Credentials and API secrets must remain outside Git.
- Production deployments should use HTTPS and secure token handling.

## Known Limitations and Pending Verification

- Admin Change Password has previously returned HTTP 400 and requires further diagnosis and verification. It should not be considered fully verified until successfully tested.
- Automatic assignment is implemented during customer ticket creation. Least-loaded distribution and administrator-triggered automatic reassignment still require complete verification.
- Global ticket history search with an administrator-controlled ON/OFF setting is planned.
- Production deployment and production-grade OAuth token exchange hardening remain future tasks.

## Future Enhancements

- AI-powered ticket categorization and response suggestions using OpenAI APIs.
- Global ticket history search with configurable availability.
- Advanced agent workload balancing.
- Email notifications and automated updates.
- Improved reporting and analytics.
- Production cloud deployment.
- Centralized authentication for future applications.

## Version Control

GitHub Repository:

https://github.com/AkheelShaik70/TMS

Main development branch: `main`

## Author

Developed as an internship project to demonstrate full-stack application development, REST API design, authentication, authorization, database integration, and modern frontend development.
