const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config.js');
const user = require('./routes/user.route.js');
const login = require('./routes/login.route.js');

const { port } = config;

// initialize our express app
const app = express();
app.use(express.json());

// connect to mongo
mongoose
  .connect(config.dbUrl, { useNewUrlParser: true })
  .then(console.log('Connected to DB 🎉'))
  .catch((err) => {
    console.log(err);
  });

// use specified routes
app.use('/login', login);
app.use('/users', user);

// start server listening
app.listen(port, () => {
  console.log(`Server is up and running on port number ${port}`);
});
