# Étape 1 : Construction de l'application avec Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Télécharger les dépendances (mise en cache pour les builds suivants)
RUN mvn dependency:go-offline -B
COPY src ./src
# Compiler et packager l'application (skip tests pour gagner du temps)
RUN mvn clean package -DskipTests

# Étape 2 : Création de l'image finale légère
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Copier le JAR depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar
# Exposer le port 8080
EXPOSE 8080
# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]
