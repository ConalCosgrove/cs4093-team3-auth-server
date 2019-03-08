const { compare } = require('bcryptjs');
const TypedError = require('error/typed');
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

  const promise = !email || !password
    ? Promise.reject(
      TypedError({
        message: 'missing email/password field(s)',
        statusCode: BAD_REQUEST,
      }),
    )
    : User.findOne({ email });

  promise
    .then((user) => {
      if (!user) {
        throw TypedError({
          message: 'user not found',
          statusCode: BAD_REQUEST,
        });
      }

      // Validate password
      compare(password, user.password)
        .then((isCorrect) => {
          if (!isCorrect) {
            throw TypedError({
              message: 'invalid login details',
              statusCode: BAD_REQUEST,
            });
          }

          // Convert `jwt.sign` callback into Promise
          return new Promise((resolve, reject) => {
            const payload = { id: user.id };
            const options = { expiresIn: tokenExpiryTime };
            const callback = (error, token) => {
              if (error) {
                reject(error);
              } else {
                resolve(token);
              }
            };

            // Create JWT, including how long until it expires
            sign(payload, jwtSecret, options, callback);
          });
        })
        .then((token) => {
          res.json({
            token,
            user: pick(user, ['email', 'userType']),
          });
        })
        .catch((error) => {
          // Since we're in a nested promise, we need to throw this error up
          throw error;
        });
    })
    .catch((error) => {
      const { message, statusCode } = error;

      // We only want to return our custom errors to the client
      if (statusCode) {
        res.status(statusCode).json({ message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).end();
        logger.error(error);
      }
    });
});

module.exports = router;
