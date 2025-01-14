# 🌟 Blockchain Tokens App 🌍

Bienvenue dans **Blockchain Tokens App**, une application blockchain légère et intuitive qui permet de :
- 📊 Gérer une **blockchain personnelle**.
- 💎 Effectuer des **transactions sécurisées** de tokens entre utilisateurs.
- 🎯 Récompenser des actions éco-responsables comme **planter un arbre** ou **recycler**.
- 🚀 Fournir une API REST pratique pour interagir avec la blockchain.

---

## 🌍 Objectif du Projet

Ce projet vise à offrir un système blockchain qui génère des **tokens non minables** obtenus uniquement via des actions spécifiques (planter un arbre, recycler, actions personnalisées). La blockchain est sécurisée, traçable grâce au hash SHA-256 et extensible avec des fonctionnalités avancées.

---

## 📑 Fonctionnalités Principales

### 🔑 Blockchain
- Création et gestion de blocs sécurisés avec une **preuve de travail (SHA-256)**.
- 💸 Gestion des transactions tokenisées entre utilisateurs.
- 🤖 Validation et vérification de l’intégrité de la blockchain.

### 🌟 Tokens
- 🎁 Récompenses spécifiques pour des actions éco-responsables.
- **Exemple :**
- Planter un arbre = 100 tokens.
- Recycler = 50 tokens.
- 🔒 Émissions limitées. Suivi des soldes à jour en temps réel.

### 📊 API REST fonctionnant avec Express.js
- Votre projet propose une **API REST complète**, qui permet de gérer :
- 📜 La consultation des blocs.
- 💸 Les transferts de tokens.
- ⛏️ Le minage (création d’un bloc à partir des transactions en attente).
- 🔒 Authentification avec JSON Web Tokens (**JWT**) pour protéger les APIs sensibles.

---

## 🛠️ Technologies Utilisées

| Technologie         | Version    | Description                                   |
|---------------------|------------|-----------------------------------------------|
| **Node.js**         | 14+        | Moteur principal pour exécuter le backend.    |
| **Express.js**      | 4.18+      | Framework minimaliste pour l'API REST.        |
| **JSON Web Token**  | 8.5+       | Authentification sécurisée via JWT.           |
| **Docker**          | 20+        | Conteneurisation pour un environnement isolé. |

---

## 📂 Structure du Projet

/project-directory/
│
├── blockchain.js         # Classe Blockchain et Transaction
├── app.js                # Serveur API REST
├── package.json          # Dépendances Node.js
├── Dockerfile            # Dockerfile pour exécuter le projet
├── docker-compose.yml    # Orchestrateur Docker
└── README.md             # Documentation du projet

---

## 🚀 Installation et Démarrage

### **Installation rapide avec Docker**

#### 1️⃣ Étape 1 : Construire et exécuter le conteneur
Exécutez la commande suivante dans le répertoire du projet :
docker-compose up --build

L’application s’exécutera à l’adresse suivante :
http://localhost:3000

#### 2️⃣ Étape 2 : Arrêter les services
Quand vous voulez arrêter l’application :
docker-compose down

---

## 🔥 Fonctionnalités disponibles via l'API REST

| **Méthode** | **Endpoint**          | **Description**                                                                                     | **JWT Requis** |
|-------------|-----------------------|-----------------------------------------------------------------------------------------------------|----------------|
| `POST`      | `/login`              | Génère un token JWT unique pour authentifier un utilisateur.                                        | ❌             |
| `GET`       | `/blockchain`         | Retourne la blockchain complète (pagination possible via `?limit` et `?offset`).                   | ❌             |
| `POST`      | `/transaction`        | Ajoute une nouvelle transaction (`sender` → `recipient`).                                           | ✅             |
| `POST`      | `/mine`               | Mine un bloc avec les transactions en attente et attribue une récompense au mineur.                | ✅             |
| `POST`      | `/reward`             | Attribue une récompense personnalisée pour une action spécifique (planter un arbre, recycler).     | ✅             |
| `GET`       | `/stats`              | Renvoie des statistiques globales (total de blocs, transactions, adresse la plus riche).           | ❌             |
| `GET`       | `/balance/:address`   | Retourne le solde de tokens d'une adresse utilisateur.                                              | ❌             |
| `GET`       | `/validate`           | Vérifie que la blockchain est valide et non modifiée.                                               | ❌             |

---

## 🌟 Exemples d'Utilisation

### 1️⃣ **Générer un Token JWT**
- **URL** : `POST /login`
- **Corps de la requête (Body)** :
```json
    {
    "username": "votre_nom_utilisateur"
    }
```

## 1️⃣ Obtenir un token JWT

**URL :** `POST /login`

**Corps de la requête (Body) :**
```json
    {
    "username": "votre_nom_utilisateur",
    "password": "votre_mot_de_passe"
    }
```
**Réponse attendue :**
```json
    {
    "token": "votre_token_jwt"
    }
```


## 2️⃣ Consulter la blockchain

**URL :** `GET /blockchain`

**Query (Optionnel) :**

`?limit=5&offset=0`

**Réponse attendue :**
```json
    {
    "totalBlocks": 2,
    "chain": [
        {
        "index": 0,
        "timestamp": "2025-01-14T15:00:00.000Z",
        "transactions": "Genesis Block",
        "previousHash": "0",
        "hash": "0000abc1234..."
        },
        {
        "index": 1,
        "timestamp": "2025-01-14T15:30:00.000Z",
        "transactions": [
            {
            "sender": "address1",
            "recipient": "address2",
            "amount": 50
            }
        ],
        "previousHash": "0000abc1234...",
        "hash": "0000bcd5678..."
        }
    ]
    }
```


## 3️⃣ Ajouter une transaction

**URL :** `POST /transaction`

**Headers :**

`Authorization: Bearer votre_token_jwt`

**Corps de la requête (Body) :**
```json
    {
    "sender": "expediteur_adresse",
    "recipient": "destinataire_adresse",
    "amount": 50
    }
```


**Réponse attendue :**
```json
    {
    "message": "Transaction ajoutée : 50 tokens de address1 à address2"
    }
```


## 4️⃣ Miner un bloc

**URL :** `POST /mine`

**Headers :**

`Authorization: Bearer votre_token_jwt`

**Corps de la requête (Body) :**
```json
    {
    "minerAddress": "adresse_du_mineur"
    }
```

**Réponse attendue :**
```json
    {
    "message": "Bloc miné avec succès !",
    "reward": "100 tokens attribués à adresse_du_mineur"
    }
```


## 5️⃣ Récompenser une action spécifique

**URL :** `POST /reward`

**Headers :**

`Authorization: Bearer votre_token_jwt`

**Corps de la requête (Body) :**
```json
    {
    "recipient": "adresse_utilisateur",
    "action": "plant_tree"
    }
```    



**Réponse attendue :**
```json
    {
    "message": "100 tokens attribués à adresse_utilisateur pour l'action : plant_tree"
    }
```


## 🏆 Prochaines Étapes Possibles

### 🔹 🎨 Développement d'un frontend interactif

Utilisez React.js ou Vue.js pour afficher des informations comme :

*   Les blocs (visualisation graphique des hash, transactions, etc.).
*   Les soldes des utilisateurs.
*   Un formulaire interactif pour ajouter des transactions.

### 🔹 🌐 Déploiement avancé

Hébergez votre microservice blockchain sur une plateforme comme Heroku, AWS, ou GCP pour rendre votre application globale.

### 🔹 🤝 Multi-nœuds et réseau P2P

Étendez votre projet pour prendre en charge plusieurs nœuds Blockchain synchronisés pour une décentralisation totale.

## 🧙‍♂️ Contributions Bienvenues

Vous êtes intéressé par ce projet ? Participez ! Créez une issue ou un pull request sur GitHub.



