const crypto = require('crypto');

// Classe Transaction
class Transaction {
    constructor(sender, recipient, amount) {
        this.sender = sender;         // Adresse de l'expéditeur
        this.recipient = recipient;  // Adresse du destinataire
        this.amount = amount;        // Montant des tokens transferrés
    }
}

// Classe Block
class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;                    // Position du bloc (index)
        this.timestamp = timestamp;           // Date de création du bloc
        this.transactions = transactions;     // Transactions incluses dans le bloc
        this.previousHash = previousHash;     // Hash du bloc précédent
        this.hash = this.calculateHash();     // Hash actuel
        this.nonce = 0;                       // Nonce (utilisé dans la preuve de travail)
    }

    // Calculer le hash du bloc
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.index + this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce)
            .digest('hex');
    }

    // Preuve de travail pour miner le bloc
    mineBlock(difficulty) {
        while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Bloc miné : ${this.hash}`);
    }
}

// Classe Blockchain
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]; // Liste des "blocs", commence par le bloc génesis
        this.pendingTransactions = [];           // Liste de toutes les transactions en attente
        this.balances = {};                      // Cache des soldes utilisateurs
        this.difficulty = 2;                     // Difficulté pour le minage
        this.miningReward = 100;                 // Récompense pour le mineur
    }

    // Créer le bloc Genesis
    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    // Obtenir le dernier bloc de la chaîne
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Ajouter une transaction en attente
    addTransaction(transaction) {
        if (!transaction.sender || !transaction.recipient) {
            throw new Error("Les transactions doivent inclure un expéditeur et un destinataire.");
        }
        if (transaction.amount <= 0) {
            throw new Error("Le montant de la transaction doit être supérieur à 0.");
        }

        // Vérifier si l'expéditeur a suffisamment de solde
        if (transaction.sender !== null && this.getBalanceOfAddress(transaction.sender) < transaction.amount) {
            throw new Error("Solde insuffisant pour effectuer cette transaction.");
        }

        this.pendingTransactions.push(transaction);
        console.log("Transaction ajoutée :", transaction);
    }

    // Mettre à jour les soldes des utilisateurs
    updateBalances(transactions) {
        for (const transaction of transactions) {
            if (transaction.sender) {
                this.balances[transaction.sender] = (this.balances[transaction.sender] || 0) - transaction.amount;
            }
            if (transaction.recipient) {
                this.balances[transaction.recipient] = (this.balances[transaction.recipient] || 0) + transaction.amount;
            }
        }
    }

    // Miner les transactions en attente
    minePendingTransactions(minerAddress) {
        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );
        block.mineBlock(this.difficulty);

        console.log("Bloc ajouté avec succès !");
        this.chain.push(block);

        // Mettre à jour les soldes pour ce bloc
        this.updateBalances(this.pendingTransactions);

        // Récompense au mineur et réinitialisation des transactions en attente
        this.pendingTransactions = [
            new Transaction(null, minerAddress, this.miningReward)
        ];
        this.updateBalances(this.pendingTransactions); // Mise à jour du solde du mineur
    }

    // Obtenir le solde d'une adresse utilisateur
    getBalanceOfAddress(address) {
        return this.balances[address] || 0;
    }

    // Vérification de l'intégrité de la blockchain
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Vérification du hash du bloc actuel
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log(`Le hash du bloc ${currentBlock.index} est invalide.`);
                return false;
            }

            // Vérification du lien avec le bloc précédent
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Le hash précédent du bloc ${currentBlock.index} est invalide.`);
                return false;
            }
        }
        return true;
    }
}

// Exportation de la Blockchain et de la classe Transaction
module.exports = { Blockchain, Transaction };