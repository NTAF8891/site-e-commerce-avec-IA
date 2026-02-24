#!/bin/sh
# Convertir l'URL postgres:// (Render) en jdbc:postgresql:// (Spring Boot) si nécessaire
if echo "$DB_URL" | grep -q "^postgres://"; then
  export DB_URL="jdbc:postgresql://${DB_URL#postgres://}"
fi
# Lancer l'application
exec java -jar app.jar
