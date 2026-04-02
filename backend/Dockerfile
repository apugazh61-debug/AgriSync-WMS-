# =================== BUILD STAGE ===================
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# =================== RUN STAGE ===================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S wmsgroup && adduser -S wmsuser -G wmsgroup
COPY --from=build /app/target/*.jar app.jar
RUN chown wmsuser:wmsgroup app.jar
USER wmsuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xmx512m", "-Xms256m", "app.jar"]
