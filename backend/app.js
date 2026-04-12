const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const sequelize = require('./config/database');
const sessionMiddleware = require('./config/session');
const { PORT } = require('./config/env');
require('./config/passport'); // Initialiser Passport

const app = express();
const port = process.env.PORT
// Middlewares de base
app.use(helmet());
const corsOption = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors(corsOption));
// Session (nécessaire pour OAuth)
app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

app.listen(port,() => {
  console.log(`✅ App is listening on port ${port}`)
})

// Synchronisation avec MySQL
sequelize.sync({ force: false })
    .then(() => console.log('✅ Base de données synchronisée avec Sequelize !'))
    .catch(err => console.error('❌ Erreur de synchronisation de la BDD :', err));


module.exports = app;