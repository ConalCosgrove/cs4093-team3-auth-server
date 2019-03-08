const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('http-status-codes');

const { JWT_SECRET: jwtSecret } = process.env;

function auth(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    res
      .status(UNAUTHORIZED)
      .json({ message: 'No token supplied, access denied' });
  } else {
    try {
      const userId = jwt.verify(token, jwtSecret);
      if (!userId) {
        res
          .status(UNAUTHORIZED)
          .json({ message: 'Invalid token, access denied' });
      } else {
        req.user = userId;
        next();
      }
    } catch (e) {
      res
        .status(UNAUTHORIZED)
        .json({ message: 'Failed to authenticate, permission denied.' });
    }
  }
}
module.exports = auth;
