# Étape 1 : Utiliser une image Node.js officielle
FROM node:14

# Étape 2 : Définir le répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Étape 4 : Copier le reste des fichiers dans le conteneur
COPY . .

# Étape 5 : Exposer le port
EXPOSE 3000

# Étape 6 : Lancer l'application
CMD ["npm", "start"]