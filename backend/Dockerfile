# ===================================================
# Multi-Stage Dockerfile for Render Deployment
# Runtime: Java 21 (Eclipse Temurin)
# Build Tool: Maven 3.9.9
# ===================================================

# 1. Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile production JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-privileged user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JAR from build stage
COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

# Switch to non-root user
USER appuser

# Render dynamically injects PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Execute Spring Boot fat JAR
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
