# Multi-stage Dockerfile for SmartHire AI Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app

# Copy POM and download dependencies for caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Add non-root system user for security
RUN groupadd -r smarthire && useradd -r -g smarthire smarthire

# Copy built artifact from build stage
COPY --from=build /app/target/smarthire-backend-1.0.0-SNAPSHOT.jar app.jar

# Set ownership
RUN chown -R smarthire:smarthire /app

USER smarthire

# Default environment variables
ENV PORT=10000
ENV SERVER_PORT=10000
ENV SPRING_PROFILES_ACTIVE=prod
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/smarthire_ai_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root

EXPOSE 10000 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
