const express = require('express');
const jwt = require('jsonwebtoken');
const { Blockchain, Transaction } = require('./blockchain'); // Votre fichier blockchain.js

// Configuration
const app = express();
const PORT = 3000;
const SECRET_KEY = "votre_clé_secrète"; // Changez cette clé en production pour la sécuriser.

app.use(express.json());
const myBlockchain = new Blockchain(); // Instanciation de la blockchain

// Créer un Jeton JWT
function generateToken(user) {
    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
}

// Vérifier le Token JWT
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}

// Middleware pour vérifier le JWT
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).send('Un token est requis pour accéder à cette ressource.');
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).send('Token invalide ou expiré.');
    }
    req.user = user; // Inclure les informations de l'utilisateur dans la requête
    next();
}

// --- ROUTES EXISTANTES ---

// Route : Login pour générer un Token JWT
app.post('/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send("Nom d'utilisateur requis.");
    }
    const token = generateToken({ username });
    res.status(200).json({ token });
});

// Route : Voir la blockchain avec pagination
app.get('/blockchain', (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    res.status(200).json({
        totalBlocks: myBlockchain.chain.length,
        limit: Number(limit),
        offset: Number(offset),
        chain: myBlockchain.chain.slice(Number(offset), Number(offset) + Number(limit)),
    });
});

// Route : Ajouter une transaction
app.post('/transaction', authMiddleware, (req, res) => {
    const { sender, recipient, amount } = req.body;
    try {
        const transaction = new Transaction(sender, recipient, amount);
        myBlockchain.addTransaction(transaction);
        res.status(200).json({
            message: `Transaction ajoutée : ${amount} tokens transférés de ${sender} à ${recipient}`,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route : Miner les transactions en attente
app.post('/mine', authMiddleware, (req, res) => {
    const { minerAddress } = req.body;
    if (!minerAddress) {
        return res.status(400).json({ error: "Adresse du mineur requise." });
    }
    try {
        myBlockchain.minePendingTransactions(minerAddress);
        res.status(200).json({
            message: "Bloc miné avec succès !",
            reward: `${myBlockchain.miningReward} tokens attribués à ${minerAddress}`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route : Statistiques de la blockchain
app.get('/stats', (req, res) => {
    const totalBlocks = myBlockchain.chain.length;
    const totalTransactions = myBlockchain.chain.reduce(
        (total, block) => total + block.transactions.length,
        0
    );
    const richestUser = Object.entries(myBlockchain.balances).sort((a, b) => b[1] - a[1])[0] || ["Aucune", 0];
    res.status(200).json({
        totalBlocks,
        totalTransactions,
        richestUser: { address: richestUser[0], balance: richestUser[1] },
    });
});

// Route : Voir le solde d'une adresse
app.get('/balance/:address', (req, res) => {
    const { address } = req.params;
    const balance = myBlockchain.getBalanceOfAddress(address);
    res.status(200).json({ address, balance });
});

// Route : Vérifier intégrité de la blockchain
app.get('/validate', (req, res) => {
    if (myBlockchain.isChainValid()) {
        return res.status(200).json({ message: "La blockchain est valide." });
    }
    return res.status(500).json({ message: "La blockchain est corrompue." });
});

// --- ROUTES GOUVERNANCE ---
// Route : Créer une proposition (protegée par JWT)
app.post('/proposals', authMiddleware, (req, res) => {
    const { title, description } = req.body;
    const author = req.user.username; // Utilisateur courant (extrait de JWT)
    try {
        const proposal = myBlockchain.createProposal(title, description, author);
        res.status(200).json(proposal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route : Lister les propositions
app.get('/proposals', (req, res) => {
    const proposals = myBlockchain.listProposals();
    res.status(200).json(proposals);
});

// Route : Voter sur une proposition (Protéger par JWT)
app.post('/proposals/:id/vote', authMiddleware, (req, res) => {
    const proposalId = parseInt(req.params.id, 10);
    const { support } = req.body; // Support : true (Pour) ou false (Contre)
    const voterAddress = req.user.username; // Utilisateur courant comme votant
    try {
        myBlockchain.voteOnProposal(proposalId, voterAddress, support);
        res.status(200).json({ message: `Vote enregistré pour la proposition ID ${proposalId}.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route : Clôturer une proposition (Protéger par JWT)
app.post('/proposals/:id/close', authMiddleware, (req, res) => {
    const proposalId = parseInt(req.params.id, 10);
    try {
        myBlockchain.closeProposal(proposalId);
        res.status(200).json({ message: `Proposition ID ${proposalId} clôturée avec succès.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- ROUTES GAMEFI (Quêtes) ---

// Route : Ajouter une quête (admin ou protégé)
app.post('/quests', authMiddleware, (req, res) => {
    const { description, goal, reward, type } = req.body;
    try {
        const quest = myBlockchain.addQuest(description, goal, reward, type);
        res.status(201).json(quest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route : Lister les quêtes disponibles
app.get('/quests', (req, res) => {
    res.status(200).json(myBlockchain.quests);
});

// Route : Progresser dans une quête
app.post('/quests/progress', authMiddleware, (req, res) => {
    const { type, progress = 1 } = req.body;
    const user = req.user.username;
    try {
        myBlockchain.progressQuest(user, type, progress);
        res.status(200).json({ message: "Progression mise à jour avec succès." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});