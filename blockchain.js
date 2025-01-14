const crypto = require("crypto");

class Transaction {
    constructor(sender, recipient, amount, type = "transfer") {
        this.sender = sender;         // Adresse de l'expéditeur
        this.recipient = recipient;   // Adresse du destinataire
        this.amount = amount;         // Montant des tokens transférés
        this.type = type;             // Type de transaction (transfer, reward, mint)
    }
}

class Block {
    constructor(index, timestamp, transactions, previousHash = "") {
        this.index = index;                     // Position du bloc
        this.timestamp = timestamp;             // Horodatage
        this.transactions = transactions;       // Transactions incluses dans le bloc
        this.previousHash = previousHash;       // Hash du bloc précédent
        this.hash = this.calculateHash();       // Hash actuel
        this.nonce = 0;                         // Nonce (utilisé dans la preuve de travail)
    }

    calculateHash() {
        return crypto
            .createHash("sha256")
            .update(this.index + this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce)
            .digest("hex");
    }

    mineBlock(difficulty) {
        const target = "0".repeat(difficulty);
        while (!this.hash.startsWith(target)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Bloc miné avec succès : ${this.hash}`);
    }
}

class Proposal {
    constructor(id, title, description, author) {
        this.id = id;               // Identifiant unique de la proposition
        this.title = title;         // Titre de la proposition
        this.description = description; // Description de la proposition
        this.author = author;       // Adresse de l'utilisateur ayant soumis la proposition
        this.votesFor = 0;          // Total des votes en faveur
        this.votesAgainst = 0;      // Total des votes contre
        this.voters = {};           // Liste des votants pour éviter les votes multiples
        this.active = true;         // Statut de la proposition (active ou terminée)
    }

    // Enregistrer un vote (positif ou négatif)
    castVote(voter, weight, support) {
        if (this.voters[voter]) {
            throw new Error("Utilisateur a déjà voté pour cette proposition.");
        }
        if (!this.active) {
            throw new Error("La proposition est déjà clôturée.");
        }

        // Ajouter le vote
        this.voters[voter] = true;
        if (support) {
            this.votesFor += weight;
        } else {
            this.votesAgainst += weight;
        }
    }

    // Terminer la proposition
    closeProposal() {
        this.active = false;
    }

    // Vérifier si la proposition est acceptée ou rejetée
    getStatus() {
        if (this.votesFor > this.votesAgainst) {
            return "Accepted";
        } else {
            return "Rejected";
        }
    }
}

// --- Ajout de la classe Quest pour GameFi ---
class Quest {
    constructor(id, description, goal, reward, type) {
        this.id = id;                  // Identifiant unique de la quête
        this.description = description; // Description de la quête
        this.goal = goal;              // Objectif à atteindre
        this.reward = reward;          // Récompense (en tokens ou autre)
        this.type = type;              // Type de quête (vote, recycle, etc.)
        this.completedUsers = [];      // Liste des utilisateurs ayant terminé la quête
    }

    markCompleted(user) {
        if (!this.completedUsers.includes(user)) {
            this.completedUsers.push(user);
        }
    }

    isCompletedBy(user) {
        return this.completedUsers.includes(user);
    }
}

class Blockchain {
    constructor() {
        this.chain = [];               // Initialisation correcte de la chaîne
        this.pendingTransactions = []; // Liste des transactions en attente
        this.balances = {};            // Solde des utilisateurs
        this.difficulty = 2;           // Niveau de difficulté par défaut
        this.miningReward = 100;       // Récompense du mineur
        this.tokenName = "RECYPHARMA"; // Nom du token
        this.tokenSymbol = "RPH";      // Symbole du token
        this.totalSupply = 1000000 * (10 ** 18); // Totalité des tokens disponibles
        this.proposals = [];           // Tableau des propositions
        this.quests = [];              // Liste des quêtes actives
        this.userProgress = {};        // Suivi des progrès des utilisateurs par quête
        this.createGenesisBlock();     // Génération du bloc génésis
    }

    // --- Blockchain traditionnelle ---
    createGenesisBlock() {
        const genesisTransaction = new Transaction(null, "admin_address", this.totalSupply, "mint");
        this.pendingTransactions.push(genesisTransaction);
        const genesisBlock = new Block(0, Date.now(), this.pendingTransactions, "0");

        genesisBlock.mineBlock(this.difficulty);
        this.chain.push(genesisBlock);

        this.updateBalances(genesisBlock.transactions);
        this.pendingTransactions = [];
        return genesisBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if (!transaction.sender || !transaction.recipient) {
            throw new Error("Les transactions doivent inclure un expéditeur et un destinataire.");
        }
        if (transaction.amount <= 0) {
            throw new Error("Le montant de la transaction doit être supérieur à 0.");
        }

        if (transaction.sender !== null && this.getBalanceOfAddress(transaction.sender) < transaction.amount) {
            throw new Error("Solde insuffisant pour effectuer cette transaction.");
        }

        this.pendingTransactions.push(transaction);
        console.log("Transaction ajoutée :", transaction);
    }

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

    minePendingTransactions(minerAddress) {
        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        this.chain.push(block);

        this.updateBalances(block.transactions);
        const rewardTransaction = new Transaction(null, minerAddress, this.miningReward, "reward");
        this.pendingTransactions = [rewardTransaction];
        this.updateBalances(this.pendingTransactions);
    }

    getBalanceOfAddress(address) {
        return this.balances[address] || 0;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash() ||
                currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    // --- GESTION DES QUÊTES ---
    addQuest(description, goal, reward, type) {
        const questId = this.quests.length + 1;
        const quest = new Quest(questId, description, goal, reward, type);
        this.quests.push(quest);
        return quest;
    }

    progressQuest(user, type, progress = 1) {
        if (!this.userProgress[user]) {
            this.userProgress[user] = {};
        }

        this.quests.forEach(quest => {
            if (quest.type === type && !quest.isCompletedBy(user)) {
                if (!this.userProgress[user][quest.id]) {
                    this.userProgress[user][quest.id] = 0;
                }
                this.userProgress[user][quest.id] += progress;

                if (this.userProgress[user][quest.id] >= quest.goal) {
                    quest.markCompleted(user);
                    this.rewardUserForQuest(user, quest);
                }
            }
        });
    }

    rewardUserForQuest(user, quest) {
        const { reward } = quest;
        if (typeof reward === "number") {
            this.balances[user] = (this.balances[user] || 0) + reward;
            console.log(`Utilisateur ${user} récompensé avec ${reward} tokens pour avoir complété ${quest.description}`);
        }
    }
}

module.exports = { Blockchain, Transaction, Proposal, Quest };