const dotenv = require('dotenv').config()
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Utilisateur, Menage } = require('../models');
const config = require('./env');

// ========== JWT Strategy (pour l'authentification classique) ==========
const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET
};

passport.use(
    new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
        try {
        const user = await Utilisateur.findByPk(jwt_payload.id, {
            attributes: { exclude: ['mot_de_passe'] }
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
        } catch (error) {
        return done(error, false);
        }
    })
);

// ========== Google OAuth Strategy ==========
passport.use(
    new GoogleStrategy(
        {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
        try {
            // Vérifier si l'utilisateur existe déjà avec google_id
            let user = await Utilisateur.findOne({
            where: { google_id: profile.id }
            });

            if (!user) {
            // Vérifier si un utilisateur avec le même email existe
            user = await Utilisateur.findOne({
                where: { email: profile.emails[0].value }
            });

            if (user) {
                // Lier le compte Google au compte existant
                user.google_id = profile.id;
                user.avatar = profile.photos[0]?.value;
                user.provider = 'google';
                user.email_verifie = true;
                await user.save();
            } else {
                // Créer un nouvel utilisateur
                user = await Utilisateur.create({
                nom: profile.displayName,
                email: profile.emails[0].value,
                google_id: profile.id,
                avatar: profile.photos[0]?.value,
                provider: 'google',
                email_verifie: true,
                mot_de_passe: null // Pas de mot de passe pour Google
                });

                // Créer un ménage par défaut
                const menage = await Menage.create({
                nom_menage: `Ménage de ${profile.displayName}`
                });

                // Associer l'utilisateur au ménage
                await user.addMenage(menage);
            }
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
        }
    )
);

// Sérialisation pour session (nécessaire pour OAuth)
passport.serializeUser((user, done) => {
    done(null, user.id_utilisateur);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Utilisateur.findByPk(id, {
        attributes: { exclude: ['mot_de_passe'] }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;