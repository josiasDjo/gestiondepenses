const { Transaction, Compte } = require('../models');

// Créer une transaction
const createTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        
        // Mettre à jour le solde du compte
        const compte = await Compte.findByPk(transaction.id_compte);
        if (compte) {
        await compte.mettreAJourSolde(transaction.montant, transaction.type_flux);
        }
        
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir toutes les transactions d'un compte
const getTransactionsByCompte = async (req, res) => {
    try {
        const { id_compte } = req.params;
        const transactions = await Transaction.findAll({
        where: { id_compte },
        order: [['date_transaction', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les transactions par période
const getTransactionsByPeriode = async (req, res) => {
    try {
        const { date_debut, date_fin, id_compte } = req.query;
        const where = {};
        
        if (date_debut && date_fin) {
        where.date_transaction = {
            [Op.between]: [date_debut, date_fin]
        };
        }
        
        if (id_compte) {
        where.id_compte = id_compte;
        }
        
        const transactions = await Transaction.findAll({ where });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une transaction
const updateTransaction = async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const transaction = await Transaction.findByPk(id_transaction);
        
        if (!transaction) {
        return res.status(404).json({ message: 'Transaction non trouvée' });
        }
        
        const ancienMontant = transaction.montant;
        const ancienType = transaction.type_flux;
        
        await transaction.update(req.body);
        
        // Ajuster le solde du compte
        const compte = await Compte.findByPk(transaction.id_compte);
        if (compte && (ancienMontant !== transaction.montant || ancienType !== transaction.type_flux)) {
        // Annuler l'ancien effet
        await compte.mettreAJourSolde(ancienMontant, ancienType === 'Revenu' ? 'Depense' : 'Revenu');
        // Appliquer le nouvel effet
        await compte.mettreAJourSolde(transaction.montant, transaction.type_flux);
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const transaction = await Transaction.findByPk(id_transaction);
        
        if (!transaction) {
        return res.status(404).json({ message: 'Transaction non trouvée' });
        }
        
        // Annuler l'effet sur le solde du compte
        const compte = await Compte.findByPk(transaction.id_compte);
        if (compte) {
        await compte.mettreAJourSolde(transaction.montant, transaction.type_flux === 'Revenu' ? 'Depense' : 'Revenu');
        }
        
        await transaction.destroy();
        res.json({ message: 'Transaction supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Résumé des transactions
    const getTransactionSummary = async (req, res) => {
    try {
        const { id_compte, periode } = req.query;
        
        let dateCondition = {};
        if (periode === 'month') {
        dateCondition = {
            date_transaction: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        };
        } else if (periode === 'year') {
        dateCondition = {
            date_transaction: {
            [Op.gte]: new Date(new Date().getFullYear(), 0, 1)
            }
        };
        }
        
        const where = { ...dateCondition };
        if (id_compte) where.id_compte = id_compte;
        
        const revenus = await Transaction.sum('montant', {
        where: { ...where, type_flux: 'Revenu' }
        });
        
        const depenses = await Transaction.sum('montant', {
        where: { ...where, type_flux: 'Depense' }
        });
        
        const depensesParCategorie = await Transaction.findAll({
        attributes: ['categorie', [sequelize.fn('SUM', sequelize.col('montant')), 'total']],
        where: { ...where, type_flux: 'Depense' },
        group: ['categorie']
        });
        
        res.json({
        revenus: revenus || 0,
        depenses: depenses || 0,
        solde: (revenus || 0) - (depenses || 0),
        depensesParCategorie
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTransaction,
    getTransactionsByCompte,
    getTransactionsByPeriode,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
};