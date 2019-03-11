const { config: loadEnv } = require('dotenv');
const jwt = require('jsonwebtoken');
const { BAD_REQUEST } = require('http-status-codes');

const { BAD_TOKEN, MISSING_TOKEN } = require('../constants/errors');

loadEnv();
const { JWT_SECRET: jwtSecret } = process.env;

const auth = (req, res, next) => {
  const token = req.get('Authorization');

  if (!token) {
    res.status(BAD_REQUEST).json({ message: MISSING_TOKEN });
  } else {
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) {
        res.status(BAD_REQUEST).json({ message: BAD_TOKEN });
      } else {
        req.user = decoded;
        next();
      }
    });
  }
};

module.exports = auth;
