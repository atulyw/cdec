# build stage — compile the app and build one runnable JAR file
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -B

# final stage — only Java runtime + the JAR (no Maven, no source code)
FROM eclipse-temurin:21-jre-alpine AS final
WORKDIR /app
COPY --from=build /app/target/hello.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
