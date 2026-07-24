# Smart Employee & Project Management System

Full stack employee and project management application built with ReactJS frontend and Spring Boot backend.

## Structure

- `backend/` - Spring Boot REST API, JWT auth, MySQL persistence
- `frontend/` - ReactJS SPA, Material UI, routing, Axios calls

## Backend

1. `mvn clean package`
2. Configure `backend/src/main/resources/application.yml`
3. Run `mvn spring-boot:run`

## Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Notes

- Java 17+
- Node 16+ / npm 10+
- MySQL database connection configured in `backend/src/main/resources/application.yml`
