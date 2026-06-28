FROM node:20-alpine AS frontend-build
WORKDIR /frontend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /backend
COPY backend/pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
COPY --from=frontend-build /frontend/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=backend-build /backend/target/*.jar app.jar
RUN chown -R app:app /app
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
