FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
COPY src ./src
RUN chmod +x gradlew && ./gradlew clean bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Fuso horario do container. Sem isso o Alpine roda em UTC e o
# LocalDateTime.now() das entidades grava 3 horas a frente do horario de
# Brasilia. O tzdata e necessario para o Alpine resolver o nome da zona.
RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE}", "-jar", "app.jar"]
