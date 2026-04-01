# build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn clean package -DskipTests

# final stage
FROM eclipse-temurin:21-jre-alpine AS final

WORKDIR /app

COPY --from=build /app/target/student-app-backend.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
