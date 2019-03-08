// const dotenv = require('dotenv').config();
const express = require('express');
const { default: createLogger } = require('logging');
const mongoose = require('mongoose');

const user = require('./routes/user.route.js');
const login = require('./routes/login.route.js');

const { MONGO_DB_URI: dbUrl } = process.env;

const logger = createLogger('tt:app');

// Initialize our express app
const app = express();
app.use(express.json());

// Connect to mongo
mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .then(logger.debug('connected to DB 🎉'))
  .catch(err => logger.error(err));

// Use specified routes
app.use('/login', login);
app.use('/users', user);

module.exports = app;
