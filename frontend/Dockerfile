FROM node:22-alpine

# Rattrape les correctifs de sécurité Alpine sortis depuis la publication de
# l'image de base (le tag "node:22-alpine" est un instantané figé) : un scan
# d'image (Snyk container test) ne remontera alors que les CVE non corrigées
# en amont, pas celles déjà patchées côté dépôt Alpine.
RUN apk update && apk upgrade --no-cache

# npm lui-même embarque ses propres dépendances (bundlées avec Node) ; celles
# de la version fournie par l'image de base peuvent être en retard sur les
# correctifs de sécurité. On la met à jour avant d'installer quoi que ce soit.
RUN npm install -g npm@latest

WORKDIR /app

# Cypress (devDependency, pour les tests e2e) ne tourne jamais dans ce
# conteneur : en pratique on le lance depuis l'hôte (`make cypress-run`),
# qui a un vrai navigateur. Sans cette variable, son script postinstall
# télécharge quand même le binaire du navigateur dans l'image (gros, inutile
# ici, et source de vulnérabilités remontées par un scan d'image).
ENV CYPRESS_INSTALL_BINARY=0

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173
