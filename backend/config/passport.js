const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Utilisateur } = require('../models');
const config = require('./env');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
        const user = await Utilisateur.findByPk(jwt_payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
        } catch (error) {
        return done(error, false);
        }
    })
);

module.exports = passport;