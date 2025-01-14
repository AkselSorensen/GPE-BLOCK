// Importer les dépendances
const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Transaction } = require('./blockchain'); // Importer Blockchain et Transaction depuis blockchain.js

// Initialiser Express
const app = express();
const PORT = 3000;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Créer une instance de blockchain
const myBlockchain = new Blockchain();

// ---- Routes ----

// Route : Afficher la blockchain complète
app.get('/blockchain', (req, res) => {
    res.status(200).json({ chain: myBlockchain.chain });
});

// Route : Ajouter une transaction (récompenser une action éco-responsable ou transférer des tokens)
app.post('/transaction', (req, res) => {
    const { sender, recipient, amount } = req.body;

    try {
        const transaction = new Transaction(sender, recipient, amount);
        myBlockchain.addTransaction(transaction); // Ajouter la transaction à la blockchain (dans les transactions en attente)
        res.status(200).json({ message: `Transaction ajoutée avec succès : ${amount} tokens de ${sender} à ${recipient}` });
    } catch (error) {
        res.status(400).json({ error: error.message }); // Gérer les erreurs comme une transaction invalide
    }
});

// Route : Miner un bloc
app.post('/mine', (req, res) => {
    const { minerAddress } = req.body;

    if (!minerAddress) {
        return res.status(400).json({ error: "L'adresse du mineur (minerAddress) est requise." });
    }

    try {
        myBlockchain.minePendingTransactions(minerAddress); // Miner les transactions
        res.status(200).json({ 
            message: "Bloc miné avec succès !",
            reward: `${myBlockchain.miningReward} tokens attribués au mineur à l'adresse ${minerAddress}.`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route : Afficher le solde d'une adresse
app.get('/balance/:address', (req, res) => {
    const { address } = req.params;

    try {
        const balance = myBlockchain.getBalanceOfAddress(address); // Obtenir le solde de l'adresse
        res.status(200).json({ address, balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route : Vérifier l'intégrité de la blockchain
app.get('/validate', (req, res) => {
    const isValid = myBlockchain.isChainValid(); // Valider la chaîne
    if (isValid) {
        res.status(200).json({ message: "La blockchain est valide." });
    } else {
        res.status(500).json({ message: "La blockchain est corrompue !" });
    }
});

// ---- Lancer le serveur ----
app.listen(PORT, () => {
    console.log(`Microservice blockchain à l'écoute sur le port http://localhost:${PORT}`);
});