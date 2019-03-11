const { config: loadEnv } = require('dotenv');
const express = require('express');
const { default: createLogger } = require('logging');
const mongoose = require('mongoose');

const user = require('./routes/user.route.js');
const login = require('./routes/login.route.js');

loadEnv();
const { MONGODB_URI: dbUrl } = process.env;

const logger = createLogger('tt:app');

// Initialize our express app
const app = express();
app.use(express.json());

// Connect to mongo
mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .then(logger.debug('connected to DB 🎉'))
  .catch(error => logger.error(error));

// Use specified routes
app.use('/login', login);
app.use('/users', user);

module.exports = app;
