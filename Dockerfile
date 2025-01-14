# Dockerfile

# Étape 1 : Utiliser une image Node.js officielle (version LTS)
FROM node:14

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installer les dépendances définies dans package.json
RUN npm install

# Étape 5 : Copier le reste des fichiers du projet dans le conteneur
COPY . .

# Étape 6 : Exposer le port utilisé par l'application (par défaut, 3000)
EXPOSE 3000

# Étape 7 : Commande pour démarrer l'application
CMD ["npm", "start"]