// const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const user = require('./routes/user.route.js');
const login = require('./routes/login.route.js');

const { MONGO_DB_URI: dbUrl } = process.env;

// Initialize our express app
const app = express();
app.use(express.json());

// Connect to mongo
mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .then(console.log('Connected to DB 🎉'))
  .catch(err => console.log(err));

// Use specified routes
app.use('/login', login);
app.use('/users', user);

module.exports = app;
