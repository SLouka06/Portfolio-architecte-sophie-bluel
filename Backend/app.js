const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocs = yaml.load('swagger.yaml');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de CSP avec Helmet
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://kit.fontawesome.com'],
      connectSrc: ["'self'", 'https://ton-service.onrender.com'],
      imgSrc: ["'self'", 'data:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://kit.fontawesome.com'],
      // Ajoute d'autres directives si nécessaire
    },
  },
}));

app.use('/images', express.static(path.join(__dirname, 'images')));

const db = require("./models");
const userRoutes = require('./routes/user.routes');
const categoriesRoutes = require('./routes/categories.routes');
const worksRoutes = require('./routes/works.routes');
db.sequelize.sync().then(() => console.log('db is ready'));

app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/works', worksRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd', 'index.html'));
});

module.exports = app;
