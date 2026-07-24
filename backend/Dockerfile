# syntax=docker/dockerfile:1.4

# -----------------------------------------------------------
# Smart Employee Management System – Backend Dockerfile
# Multi‑stage build: compile with Maven, run with lightweight JRE
# -----------------------------------------------------------

# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the JAR (skip tests for speed)
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Create a non‑root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install MySQL client (useful for scripts / health checks)
RUN apk add --no-cache mysql-client

# Copy the built JAR from the build stage
COPY --from=build /app/target/sempms-*.jar /app/app.jar

# Default Spring profile (can be overridden at runtime) and DB connection vars
ENV SPRING_PROFILES_ACTIVE=dev \
    SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/smart_employee_mgmt \
    SPRING_DATASOURCE_USERNAME=root \
    SPRING_DATASOURCE_PASSWORD=example

# Optional external configuration mount point
VOLUME ["/app/config"]
ENV SPRING_CONFIG_LOCATION=classpath:/,file:/app/config/

EXPOSE 8080

# Health‑check (requires Spring Actuator dependency)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

USER appuser
ENTRYPOINT ["java","-jar","/app/app.jar"]