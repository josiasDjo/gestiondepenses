const { Alerte, Budget, Transaction } = require('../models');
const { Op } = require('sequelize');
const { getUserFromToken } = require('../utils/auth')

// Vérifier les budgets et créer des alertes
const verifierBudgets = async (id_menage) => {
    const budgets = await Budget.findAll({ where: { id_menage } });
    const debutMois = new Date();
    debutMois.setDate(1);
    
    for (const budget of budgets) {
        const depenses = await Transaction.sum('montant', {
        where: {
            id_compte: { [Op.in]: sequelize.literal(`(SELECT id_compte FROM comptes WHERE id_menage = ${id_menage})`) },
            type_flux: 'Depense',
            categorie: budget.categorie,
            date_transaction: { [Op.gte]: debutMois }
        }
        });
        
        const pourcentage = (depenses / budget.limite_montant) * 100;
        
        if (pourcentage >= 90 && pourcentage < 100) {
        await Alerte.create({
            message: `Attention : Vous avez utilisé ${pourcentage.toFixed(0)}% de votre budget "${budget.categorie}"`,
            type: 'budget',
            id_budget: budget.id_budget,
            id_menage
        });
        } else if (pourcentage >= 100) {
        await Alerte.create({
            message: `Dépassement : Vous avez dépassé votre budget "${budget.categorie}" !`,
            type: 'budget',
            id_budget: budget.id_budget,
            id_menage
        });
        }
    }
    };

    // Récupérer les alertes non lues
    const getAlertesNonLues = async (req, res) => {
    try {
        const user = await getUserFromToken(req);
        const menageIds = await getMenagesByUser(user.id_utilisateur);
        
        const alertes = await Alerte.findAll({
        where: { id_menage: menageIds, est_lue: false },
        order: [['date_creation', 'DESC']]
        });
        
        res.json(alertes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Marquer une alerte comme lue
    const marquerCommeLue = async (req, res) => {
    try {
        const { id } = req.params;
        await Alerte.update({ est_lue: true }, { where: { id_alerte: id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { verifierBudgets, getAlertesNonLues, marquerCommeLue };