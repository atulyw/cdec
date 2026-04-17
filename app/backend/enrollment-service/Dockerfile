# ---------- Stage 1: Build ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first (better caching)
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build jar
RUN mvn clean package -DskipTests


# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy only the built jar from builder stage
COPY --from=builder /app/target/enrollment-service-1.0.0.jar app.jar

EXPOSE 8083

CMD ["java", "-jar", "app.jar"]