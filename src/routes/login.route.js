const { compare } = require('bcryptjs');
const { Router } = require('express');
const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const { sign } = require('jsonwebtoken');
const { pick } = require('lodash');
const { default: createLogger } = require('logging');

const User = require('../models/user.model');

const {
  JWT_SECRET: jwtSecret,
  TOKEN_EXPIRY_TIME: tokenExpiryTime = 3600,
} = process.env;

const logger = createLogger('tt:auth');
const router = Router();

router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(BAD_REQUEST).json({ message: 'missing email/password field(s)' });
  } else {
    User
      .findOne({ email })
      .then((user) => {
        if (!user) {
          res.status(BAD_REQUEST).json({ message: 'user not found' });
        } else {
          // Validate password
          compare(password, user.password)
            .then((isCorrect) => {
              if (!isCorrect) {
                res.status(BAD_REQUEST).json({ message: 'invalid login details' });
              } else {
                const payload = { id: user.id };
                const options = { expiresIn: tokenExpiryTime };
                const callback = (error, token) => {
                  if (error) {
                    throw error;
                  }

                  res.json({
                    token,
                    user: pick(user, ['email', 'userType']),
                  });
                };

                // Create JWT, including how long until it expires
                sign(payload, jwtSecret, options, callback);
              }
            });
        }
      }).catch((error) => {
        res.status(INTERNAL_SERVER_ERROR).end();
        logger.error(error);
      });
  }
});

module.exports = router;
