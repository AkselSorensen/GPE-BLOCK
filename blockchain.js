const crypto = require('crypto');

// Classe pour représenter une transaction de token
class Transaction {
    constructor(sender, recipient, amount) {
        this.sender = sender;         // Adresse de l'expéditeur
        this.recipient = recipient;  // Adresse du destinataire
        this.amount = amount;        // Montant des tokens transférés
    }
}

// Classe pour représenter un bloc dans la blockchain
class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;          // Position du bloc
        this.timestamp = timestamp; // Horodatage du bloc
        this.transactions = transactions; // Transactions incluses dans le bloc
        this.previousHash = previousHash; // Hash du bloc précédent
        this.hash = this.calculateHash(); // Hash actuel
        this.nonce = 0;               // Nonce pour la preuve de travail
    }

    // Calculer le hash du bloc actuel
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.index + this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce)
            .digest('hex');
    }

    // Preuve de travail : Mine le bloc
    mineBlock(difficulty) {
        while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`Bloc miné : ${this.hash}`);
    }
}

// Classe principale pour gérer la blockchain
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]; // Initialisation de la chaîne avec le bloc Genesis
        this.difficulty = 2;                     // Définit la difficulté pour la preuve de travail
        this.pendingTransactions = [];           // Transactions en attente avant d'être incluses dans un bloc
        this.tokenSupply = 1000000;              // Nombre fixe de tokens disponibles
        this.miningReward = 100;                 // Récompense pour miner un bloc
    }

    // Créer le bloc Genesis
    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    // Récupérer le dernier bloc de la blockchain
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Ajouter une nouvelle transaction à la liste en attente
    addTransaction(transaction) {
        // Vérification des données de la transaction
        if (!transaction.sender || !transaction.recipient) {
            throw new Error("Transaction must include sender and recipient.");
        }

        if (transaction.amount <= 0) {
            throw new Error("Transaction amount must be greater than 0.");
        }

        // Enregistrer la transaction en attente
        this.pendingTransactions.push(transaction);
        console.log("Transaction ajoutée en attente :", transaction);
    }

    // Miner les transactions en attente dans un bloc
    minePendingTransactions(minerAddress) {
        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty); // Minage avec preuve de travail
        console.log("Bloc miné avec succès !");

        this.chain.push(block); // Ajouter le nouveau bloc à la chaîne

        // Récompenser le mineur avec des tokens
        this.pendingTransactions = [
            new Transaction(null, minerAddress, this.miningReward)
        ];
    }

    // Vérification de l'intégrité de la blockchain
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    // Calculer le solde total de jetons d'une adresse
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.sender === address) {
                    balance -= trans.amount;
                }

                if (trans.recipient === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
}

// Exportation des classes Blockchain et Transaction pour les utiliser dans d'autres fichiers
module.exports = { Blockchain, Transaction };