# SupportAI — Authentication, Authorization & Google Authentication

This repository contains the initial Spring Boot security module for the SupportAI ticket-management backend.

## Included
- BCrypt password hashing.
- Customer registration and email/password login.
- Signed HS256 JWT access tokens (60-minute default).
- Stateless API authentication using Spring Security Resource Server.
- Role initialization for CUSTOMER, AGENT and ADMIN.
- URL-level role rules and method-security support.
- Google OAuth2/OIDC login, mapped to a SupportAI user and SupportAI JWT.
- Google accounts are created as CUSTOMER accounts. Existing LOCAL accounts are not silently linked to Google.

## Requirements
- Java 21 (LTS)
- Maven
- MySQL 8+
- Google OAuth client credentials for Google sign-in

## Configuration
Copy `src/main/resources/application.properties.example` to `application.properties` locally (do not commit the real file), then set environment variables:

- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_JWT_SECRET` — at least 32 UTF-8 bytes, random and private
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

In Google Cloud Console, configure the authorized redirect URI:
`http://localhost:8080/login/oauth2/code/google`

## API
### Register customer
`POST /api/auth/register`
```json
{"name":"Test Customer","email":"customer@example.com","password":"ChangeMe123!"}
```

### Login
`POST /api/auth/login`
```json
{"email":"customer@example.com","password":"ChangeMe123!"}
```

Both return an access token. Send it to protected endpoints as:
`Authorization: Bearer <accessToken>`

### Google sign-in
Open `GET /oauth2/authorization/google`. After successful Google authentication, the backend responds with a JSON body containing the SupportAI JWT.

## Authorization rules
- `/api/admin/**`: ADMIN
- `/api/agents/**`: ADMIN or AGENT
- Other non-public endpoints: authenticated user
- Public customer registration is the only self-service role assignment. The API never accepts a role from the registration request.

Use `@PreAuthorize("hasRole('ADMIN')")` on sensitive service/controller methods as an additional boundary.

## Important integration notes
1. This is a starter implementation based on the previously discussed `com.example.tms` package and User/Role schema. Reconcile it with the actual local project before merging if your files have changed.
2. The project must have the matching Spring Boot parent/dependency versions. Verify the configured Spring Boot 4.1.2 artifacts and Spring Security APIs with Maven in your local environment.
3. Do not expose the Google client secret or JWT secret in source control.
4. No default ADMIN password is seeded. Provision the first administrator through a controlled, one-time database/bootstrap procedure; never make public registration accept ADMIN or AGENT.
5. For production, add email verification, rate limiting, refresh-token rotation/revocation, CORS allow-listing, audit logging and HTTPS.
6. Google OAuth success currently returns the JWT as JSON. A frontend should handle the OAuth callback flow and store the token securely; avoid placing tokens in query parameters or browser URLs.
