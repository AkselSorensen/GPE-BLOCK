# 1. Utilisez une image Node.js officielle
FROM node:18

# 2. Définissez le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# 3. Copiez les fichiers package*.json pour installer les dépendances
COPY package*.json ./

# 4. Installez les dépendances Node.js
RUN npm install

# 5. Copiez tout le contenu du projet
COPY . .

# 6. Exposez le port utilisé par l'application
EXPOSE 3000

# 7. Commande pour exécuter l'application
CMD ["node", "app.js"]