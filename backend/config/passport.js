const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Utilisateur, Menage } = require('../models');
const membresMenageController = require('../controllers/membresMenageController');
const config = require('./env');

passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {

        // Vérifier si l'utilisateur existe déjà
        let user = await Utilisateur.findOne({ 
            where: { email: profile.emails[0].value }
        });
        
        if (!user) {
            
            // Créer le nouvel utilisateur
            user = await Utilisateur.create({
            nom: profile.displayName,
            email: profile.emails[0].value,
            google_id: profile.id,
            avatar: profile.photos[0]?.value,
            provider: 'google',
            email_verifie: true,
            mot_de_passe: null
            });       
            
            // Créer un ménage par défaut pour le nouvel utilisateur
            const menage = await Menage.create({ 
            nom_menage: `Ménage de ${profile.displayName}` 
            });
    
            // Associer l'utilisateur au ménage
            await membresMenageController.creerAssociation(
            user.id_utilisateur,
            menage.id_menage,
            'admin'
            );
        } else {           
            // Mettre à jour les informations
            if (!user.google_id) {
            await user.update({
                google_id: profile.id,
                avatar: profile.photos[0]?.value,
                provider: 'google'
            });
            console.log('Compte Google lié à l\'utilisateur existant');
            }
        }
        
        return done(null, user);
        
        } catch (error) {
        console.error('Erreur stratégie Google:', error);
        return done(error, null);
        }
    }
    ));

    passport.serializeUser((user, done) => {
    done(null, user.id_utilisateur);
    });

    passport.deserializeUser(async (id, done) => {
    try {
        const user = await Utilisateur.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;