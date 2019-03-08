const jwt = require('jsonwebtoken');

const { JWT_SECRET: jwtSecret } = process.env;

function auth(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    res
      .status(401)
      .json({ message: 'No token supplied, access denied' });
  } else {
    try {
      const userId = jwt.verify(token, jwtSecret);
      if (!userId) {
        res
          .status(401)
          .json({ message: 'Invalid token, access denied' });
      } else {
        req.user = userId;
        next();
      }
    } catch (e) {
      res
        .status(401)
        .json({ message: 'Failed to authenticate, permission denied.' });
    }
  }
}
module.exports = auth;
