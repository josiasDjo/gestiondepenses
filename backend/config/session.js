const session = require('express-session');
const config = require('./env');

const sessionConfig = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.NODE_ENV === 'production', // HTTPS en production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 jours
    }
};

module.exports = session(sessionConfig);