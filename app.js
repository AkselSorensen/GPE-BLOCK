// Importer les dépendances
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Blockchain, Transaction } = require('./blockchain');

// Configuration
const SECRET_KEY = "Votre_Secret_Key"; // Changez pour un environnement de production
const app = express();
const PORT = 3000;

// Initialisation de l'application et de la blockchain
app.use(bodyParser.json());
const myBlockchain = new Blockchain();

// Middleware pour vérifier l'authentification JWT
function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send("Un token est requis pour accéder à cette route.");
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Token invalide.");
    }
    next();
}

// Route : Générer un token d'authentification (Login)
app.post('/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Nom d'utilisateur requis." });
    }
    // Générer un token avec un temps d'expiration de 1 heure
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ token });
});

// Route : Afficher la blockchain (avec pagination)
app.get('/blockchain', (req, res) => {
    const { limit = 10, offset = 0 } = req.query; // Paramètres de pagination
    const paginatedChain = myBlockchain.chain.slice(offset, +offset + +limit);
    res.status(200).json({ 
        totalBlocks: myBlockchain.chain.length,
        chain: paginatedChain
    });
});

// Route : Ajouter une transaction
app.post('/transaction', authMiddleware, (req, res) => {
    const { sender, recipient, amount } = req.body;
    try {
        const transaction = new Transaction(sender, recipient, amount);
        myBlockchain.addTransaction(transaction);
        res.status(200).json({ 
            message: `Transaction ajoutée : ${amount} tokens de ${sender} à ${recipient}`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route : Miner les blocs de transactions en attente
app.post('/mine', authMiddleware, (req, res) => {
    const { minerAddress } = req.body;
    if (!minerAddress) {
        return res.status(400).json({ error: "L'adresse du mineur est requise." });
    }
    try {
        myBlockchain.minePendingTransactions(minerAddress);
        res.status(200).json({ 
            message: "Bloc miné avec succès !",
            reward: `${myBlockchain.miningReward} tokens attribués à ${minerAddress}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route : Récompenser une action spécifique
app.post('/reward', authMiddleware, (req, res) => {
    const { recipient, action } = req.body;
    const rewards = { 
        "plant_tree": 100, // Récompense pour planter un arbre
        "recycle": 50      // Récompense pour recycler
    };
    if (!rewards[action]) {
        return res.status(400).json({ error: "Action non reconnue." });
    }
    const rewardAmount = rewards[action];
    const transaction = new Transaction(null, recipient, rewardAmount); // Récompense (depuis "SYSTEM")
    myBlockchain.addTransaction(transaction);
    res.status(200).json({ 
        message: `${rewardAmount} tokens attribués à ${recipient} pour l'action : ${action}`
    });
});

// Route : Consulter les statistiques sur la blockchain
app.get('/stats', (req, res) => {
    const totalBlocks = myBlockchain.chain.length;
    const totalTransactions = myBlockchain.chain.reduce(
        (sum, block) => sum + block.transactions.length,
        0
    );
    const richestAddress = Object.entries(myBlockchain.balances)
        .sort((a, b) => b[1] - a[1])[0] || ["Aucune", 0]; // Adresse avec le plus de tokens
    res.status(200).json({
        totalBlocks,
        totalTransactions,
        richestAddress: { 
            address: richestAddress[0], 
            balance: richestAddress[1] 
        }
    });
});

// Route : Vérifier le solde d'une adresse utilisateur
app.get('/balance/:address', (req, res) => {
    const { address } = req.params;
    try {
        const balance = myBlockchain.getBalanceOfAddress(address);
        res.status(200).json({ address, balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route : Valider l'intégrité de la blockchain
app.get('/validate', (req, res) => {
    if (myBlockchain.isChainValid()) {
        res.status(200).json({ message: "La blockchain est valide." });
    } else {
        res.status(500).json({ message: "La blockchain est corrompue." });
    }
});

// Lancer le serveur Express
app.listen(PORT, () => {
    console.log(`Microservice blockchain à l'écoute sur http://localhost:${PORT}`);
});