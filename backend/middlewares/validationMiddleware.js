const { body, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        res.status(400).json({
            message: 'Erreur de validation',
            errors: errors.array()
            });
    };
};

// Validateurs pour les transactions
const transactionValidators = [
    body('montant').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
    body('type_flux').isIn(['Revenu', 'Depense']).withMessage('Type de flux invalide'),
    body('categorie').optional().isString(),
    body('date_transaction').optional().isISO8601()
];

// Validateurs pour l'utilisateur
const userValidators = [
    body('nom').notEmpty().withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe trop court')
];

// Validateurs pour le compte
const compteValidators = [
    body('nom_compte').notEmpty().withMessage('Nom du compte requis'),
    body('type_compte').optional().isString(),
    body('solde').optional().isFloat()
];

module.exports = {
    validate,
    transactionValidators,
    userValidators,
    compteValidators
};