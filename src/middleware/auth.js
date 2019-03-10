const { config: loadEnv } = require('dotenv');
const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('http-status-codes');

loadEnv();
const { JWT_SECRET: jwtSecret } = process.env;

function auth(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    res
      .status(UNAUTHORIZED)
      .json({ message: 'no token supplied, access denied' });
  } else {
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) {
        res
          .status(UNAUTHORIZED)
          .json({ message: 'failed to authenticate, permission denied' });
      } else {
        req.user = decoded;
        next();
      }
    });
  }
}
module.exports = auth;
